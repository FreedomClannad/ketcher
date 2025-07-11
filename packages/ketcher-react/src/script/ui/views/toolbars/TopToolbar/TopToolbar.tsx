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

import styled from '@emotion/styled';

import { useAppContext, useResizeObserver } from 'src/hooks';
import { FileControls } from './FileControls';
import { ClipboardControls } from './ClipboardControls';
import { UndoRedo } from './UndoRedo';
import { ZoomControls } from './ZoomControls';

import { SystemControls } from './SystemControls';
import { ExternalFuncControls } from './ExternalFuncControls';
import { Divider } from './Divider';
import { TopToolbarIconButton } from './TopToolbarIconButton';
import { CustomButtons } from './CustomButtons';
import { ketcherProvider } from 'ketcher-core';
import { useCallback, useMemo } from 'react';
import { CustomButton } from '../../../../builders/ketcher/CustomButtons';

type VoidFunction = () => void;

export interface PanelProps {
  className: string;
  disabledButtons: string[];
  indigoVerification: boolean;
  hiddenButtons: string[];
  shortcuts: { [key in string]: string };
  onClear: VoidFunction;
  onFileOpen: VoidFunction;
  onSave: VoidFunction;
  onUndo: VoidFunction;
  onRedo: VoidFunction;
  onCopy: VoidFunction;
  onCopyMol: VoidFunction;
  onCopyKet: VoidFunction;
  onCopyImage: VoidFunction;
  onCut: VoidFunction;
  onPaste: VoidFunction;
  currentZoom: number | undefined;
  onZoom: (zoom: number) => void;
  onZoomIn: VoidFunction;
  onZoomOut: VoidFunction;
  onSettingsOpen: VoidFunction;
  onLayout: VoidFunction;
  onClean: VoidFunction;
  onAromatize: VoidFunction;
  onDearomatize: VoidFunction;
  onCalculate: VoidFunction;
  onCheck: VoidFunction;
  onAnalyse: VoidFunction;
  onMiew: VoidFunction;
  onToggleExplicitHydrogens: VoidFunction;
  onFullscreen: VoidFunction;
  onAbout: VoidFunction;
  onHelp: VoidFunction;
  togglerComponent?: JSX.Element;
  customButtons: Array<CustomButton>;
}

const collapseLimit = 650;
const CUSTOM_BUTTON_ADDITIONAL_WIDTH = 40;

const ControlsPanel = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  height: 36px;
  padding: 0px 22px;
  background-color: #ffffff;
  box-shadow: 0px 2px 5px rgba(103, 104, 132, 0.15);

  .group {
    display: flex;
    flex-direction: row;
    gap: 0px;
  }

  & * {
    box-sizing: border-box;
  }

  @media only screen {
    @container (min-width: 1024px) {
      height: 40px;
      gap: 0px;
      padding-bottom: 0;
      .group {
        gap: 4px;
      }
    }
  }

  @media only screen {
    @container (min-width: 1920px) {
      height: 64px;
      gap: 12px;
    }
  }
`;

const BtnsWpapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

export const TopToolbar = ({
  className,
  disabledButtons,
  indigoVerification,
  hiddenButtons,
  shortcuts,
  onClear,
  onFileOpen,
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onCopyMol,
  onCopyKet,
  onCopyImage,
  onCut,
  onPaste,
  currentZoom,
  onZoom,
  onZoomIn,
  onZoomOut,
  onSettingsOpen,
  onLayout,
  onClean,
  onAromatize,
  onDearomatize,
  onCalculate,
  onCheck,
  onAnalyse,
  onMiew,
  onToggleExplicitHydrogens,
  onFullscreen,
  onAbout,
  onHelp,
  togglerComponent,
  customButtons,
}: PanelProps) => {
  const { ref: resizeRef, width = 50 } = useResizeObserver<HTMLDivElement>();
  const { ketcherId } = useAppContext();
  const ketcher = useMemo(
    () => ketcherProvider.getKetcher(ketcherId),
    [ketcherId],
  );

  const onCustomAction = useCallback(
    (name: string) => ketcher.sendCustomAction(name),
    [ketcher],
  );

  const collapseLimitWithCustomButtons = useMemo(() => {
    return (
      collapseLimit + customButtons.length * CUSTOM_BUTTON_ADDITIONAL_WIDTH
    );
  }, [customButtons.length]);

  const isCollapsed = width < collapseLimitWithCustomButtons;

  return (
    <ControlsPanel
      className={className}
      ref={resizeRef}
      data-testid="top-toolbar"
    >
      <BtnsWpapper>
        <TopToolbarIconButton
          title="Clear Canvas"
          onClick={onClear}
          iconName="clear"
          shortcut={shortcuts.clear}
          isHidden={hiddenButtons.includes('clear')}
          disabled={disabledButtons.includes('clear')}
          testId="clear-canvas"
        />
        <FileControls
          onFileOpen={onFileOpen}
          onSave={onSave}
          shortcuts={shortcuts}
          hiddenButtons={hiddenButtons}
        />
        <ClipboardControls
          onCopy={onCopy}
          onCopyMol={onCopyMol}
          onCopyKet={onCopyKet}
          onCopyImage={onCopyImage}
          onPaste={onPaste}
          onCut={onCut}
          shortcuts={shortcuts}
          disabledButtons={disabledButtons}
          hiddenButtons={hiddenButtons}
        />
        <UndoRedo
          onUndo={onUndo}
          onRedo={onRedo}
          disabledButtons={disabledButtons}
          hiddenButtons={hiddenButtons}
          shortcuts={shortcuts}
        />
        <ExternalFuncControls
          onLayout={onLayout}
          onClean={onClean}
          onAromatize={onAromatize}
          onDearomatize={onDearomatize}
          onCalculate={onCalculate}
          onCheck={onCheck}
          onAnalyse={onAnalyse}
          onMiew={onMiew}
          onToggleExplicitHydrogens={onToggleExplicitHydrogens}
          disabledButtons={disabledButtons}
          hiddenButtons={hiddenButtons}
          shortcuts={shortcuts}
          indigoVerification={indigoVerification}
          isCollapsed={isCollapsed}
        />
        <CustomButtons
          isCollapsed={isCollapsed}
          customButtons={customButtons}
          onCustomAction={onCustomAction}
        />
      </BtnsWpapper>
      <BtnsWpapper>
        {togglerComponent}
        {togglerComponent && <Divider />}

        <SystemControls
          onHistoryClick={() => {
            console.log('History button clicked'); // @TODO Implement handler when History log is ready
          }}
          onSettingsOpen={onSettingsOpen}
          onFullscreen={onFullscreen}
          onHelp={onHelp}
          onAboutOpen={onAbout}
          disabledButtons={disabledButtons}
          hiddenButtons={hiddenButtons}
        />
        <Divider />
        {!hiddenButtons.includes('zoom-list') && (
          <ZoomControls
            currentZoom={currentZoom || 1}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoom={onZoom}
            shortcuts={shortcuts}
            disabledButtons={disabledButtons}
            hiddenButtons={hiddenButtons}
          />
        )}
      </BtnsWpapper>
    </ControlsPanel>
  );
};
