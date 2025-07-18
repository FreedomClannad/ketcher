/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  FormatterFactory,
  SGroup,
  identifyStructFormat,
  Struct,
  SupportedFormat,
  notifyRequestCompleted,
  Editor,
  KetcherLogger,
  SettingsManager,
  MULTITAIL_ARROW_KEY,
  IMAGE_KEY,
} from 'ketcher-core';

import { supportedSGroupTypes } from './constants';
import { setAnalyzingFile } from './request';
import tools from '../action/tools';
import { isNumber } from 'lodash';

export function onAction(action) {
  if (action && action.dialog) {
    return {
      type: 'MODAL_OPEN',
      data: { name: action.dialog, prop: action.prop },
    };
  }
  if (action && action.thunk) {
    return action.thunk;
  }

  return {
    type: 'ACTION',
    action,
  };
}

export function loadStruct(struct) {
  return (_dispatch, getState) => {
    const editor = getState().editor;
    editor.struct(struct);
  };
}

export function parseStruct(
  struct: string | Struct,
  server,
  options?,
): Promise<Struct> {
  if (typeof struct === 'string') {
    options = options || {};
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      rescale,
      fragment,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...formatterOptions
    } = options;

    const format = identifyStructFormat(struct);
    if (format === SupportedFormat.cdx) {
      struct = `base64::${struct.replace(/\s/g, '')}`;
    }
    const factory = new FormatterFactory(server);
    const queryPropertiesAreUsed = format === 'mol' && struct.includes('MRV'); // temporary check if query properties are used
    const service = factory.create(
      format,
      formatterOptions,
      queryPropertiesAreUsed,
    );
    return service.getStructureFromStringAsync(struct);
  } else {
    return Promise.resolve(struct);
  }
}

// Removing from what should be saved - structure, which was added to paste tool,
// but not yet rendered on canvas
export function removeStructAction(): {
  type: string;
  action?: Record<string, unknown>;
} {
  const savedSelectedTool = SettingsManager.selectionTool;

  return onAction(savedSelectedTool || tools['select-rectangle'].action);
}

export const getSelectionFromStruct = (struct) => {
  const selection = {};
  [
    'atoms',
    'bonds',
    'enhancedFlags',
    'rxnPluses',
    'rxnArrows',
    'texts',
    'rgroupAttachmentPoints',
    'simpleObjects',
    IMAGE_KEY,
    MULTITAIL_ARROW_KEY,
  ].forEach((selectionEntity) => {
    if (struct && struct[selectionEntity]) {
      const selected: number[] = [];
      struct[selectionEntity].forEach((value, key) => {
        if (
          typeof value.getInitiallySelected === 'function' &&
          value.getInitiallySelected()
        ) {
          selected.push(key);
        }
      });
      selection[selectionEntity] = selected;
    }
  });
  return selection;
};

export function load(struct: Struct, options?) {
  return async (dispatch, getState) => {
    const state = getState();
    const editor = state.editor as Editor;
    const server = state.server;
    const serverSettings = state.options.getServerSettings();
    const errorHandler = editor.errorHandler;
    options = options || {};
    let { isPaste, method, ...otherOptions } = options;
    otherOptions = {
      ...serverSettings,
      ...otherOptions,
    };

    dispatch(setAnalyzingFile(true));

    try {
      const parsedStruct = await parseStruct(struct, server, otherOptions);
      const { fragment } = otherOptions;
      const hasUnsupportedGroups = parsedStruct.sgroups.some(
        (sGroup) => !supportedSGroupTypes[sGroup.type],
      );
      const hasMoleculeToMonomerConnections = parsedStruct.bonds.find(
        (_, bond) => {
          return (
            isNumber(bond.beginSuperatomAttachmentPointNumber) ||
            isNumber(bond.endSuperatomAttachmentPointNumber)
          );
        },
      );

      if (hasUnsupportedGroups) {
        await editor.event.confirm.dispatch();
        parsedStruct.sgroups = parsedStruct.sgroups.filter(
          (_key, sGroup) => supportedSGroupTypes[sGroup.type],
        );
      }

      // scaling works bad with molecule-to-monomer connections
      if (!hasMoleculeToMonomerConnections) {
        parsedStruct.rescale(); // TODO: move out parsing?
      }

      if (editor.struct().atoms.size) {
        // NB: reset id
        const oldStruct = editor.struct().clone();
        parsedStruct.sgroups.forEach((sg, sgId) => {
          const sgroup = oldStruct.sgroups.get(sgId);
          const offset = sgroup ? SGroup.getOffset(sgroup) : null;
          SGroup.bracketPos(sg, parsedStruct);
          if (offset) sg.updateOffset(offset);
        });
      }

      parsedStruct.findConnectedComponents();
      parsedStruct.setImplicitHydrogen();
      parsedStruct.setStereoLabelsToAtoms();
      parsedStruct.markFragments();
      parsedStruct.applyMonomersTransformations();

      if (fragment) {
        if (parsedStruct.isBlank()) {
          dispatch(removeStructAction());
        } else {
          dispatch(onAction({ tool: 'paste', opts: parsedStruct }));
        }
      } else {
        editor.struct(parsedStruct, method === 'layout');
      }

      editor.zoomAccordingContent(parsedStruct);

      const isIndigoFunctionCalled = !!method;
      if (!isPaste && !isIndigoFunctionCalled) {
        editor.centerStruct();
      }
      if (!fragment) {
        // do not update selection if fragment is added
        editor.selection(getSelectionFromStruct(editor.struct()));
      }
      editor.struct().disableInitiallySelected();
      dispatch(setAnalyzingFile(false));
      dispatch({ type: 'MODAL_CLOSE' });
    } catch (e: any) {
      KetcherLogger.error('shared.ts::load', e);
      dispatch(setAnalyzingFile(false));
      e && errorHandler && errorHandler(e.message);
    } finally {
      notifyRequestCompleted();
    }
  };
}

export function openInfoModal(command: 'Paste' | 'Copy' | 'Cut'): {
  type: 'MODAL_OPEN';
  data: { name: 'info-modal'; prop: { message: 'Paste' | 'Copy' | 'Cut' } };
} {
  return {
    type: 'MODAL_OPEN',
    data: { name: 'info-modal', prop: { message: command } },
  };
}

export function openInfoModalWithCustomMessage(message: string): {
  type: 'MODAL_OPEN';
  data: { name: 'info-modal'; prop: { customText: string } };
} {
  return {
    type: 'MODAL_OPEN',
    data: { name: 'info-modal', prop: { customText: message } },
  };
}
