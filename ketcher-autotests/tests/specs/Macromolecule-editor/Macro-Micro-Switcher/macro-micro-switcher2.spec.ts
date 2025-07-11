/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/*
Tests below moved here from macro-micro-switcher since they are designed to be executed in isolated environment 
and can't be executed in "clear canvas way"
*/
import { waitForMonomerPreview } from '@utils/macromolecules';
import { test, Page } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  clickInTheMiddleOfTheScreen,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  clickOnCanvas,
  pasteFromClipboardByKeyboard,
  copyToClipboardByIcon,
  resetCurrentTool,
  selectAllStructuresOnCanvas,
  screenshotBetweenUndoRedo,
  screenshotBetweenUndoRedoInMacro,
  copyAndPaste,
  copyToClipboardByKeyboard,
  takePageScreenshot,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  takeTopToolbarScreenshot,
  selectSequenceTypeMode,
  MacroFileType,
  MolFileFormat,
} from '@utils';
import { selectSnakeLayoutModeTool } from '@utils/canvas/tools';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Chem } from '@constants/monomers/Chem';
import { Bases } from '@constants/monomers/Bases';
import { Phosphates } from '@constants/monomers/Phosphates';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  switchToDNAMode,
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { Library } from '@tests/pages/macromolecules/Library';

export async function doubleClickOnAtom(page: Page, atomText: string) {
  const atomLocator = page
    .locator('g', { hasText: new RegExp(`^${atomText}$`) })
    .locator('rect')
    .first();
  await atomLocator.dblclick();
}

test.describe('Macro-Micro-Switcher2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Add to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs then Hide Library and switch to Micro mode and back', async ({
    page,
  }) => {
    /* 
      Test case: Macro-Micro-Switcher
      Description: Added to Favorites section Peptides, Sugars, Bases, Phosphates and CHEMs 
      when Hide Library and switching from Macro mode to Micro mode and back to Macro is saved
      */
    test.slow();
    await Library(page).addMonomersToFavorites([
      Peptides.bAla,
      Peptides.Phe4Me,
      Peptides.meM,
      Sugars._25R,
      Bases.baA,
      Phosphates.bP,
      Chem.Test_6_Ch,
    ]);
    await Library(page).hideLibrary();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).showLibrary();
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);
  });

  const cases = [
    {
      fileName: 'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
      description: 'DNA with modified monomer',
    },
    {
      fileName: 'Molfiles-V3000/rna-mod-phosphate-mod-base-example.mol',
      description: 'RNA with modified monomer',
    },
  ];

  for (const testInfo of cases) {
    test(`Check that switching between Macro and Micro mode not crash application when opened ${testInfo.description} with modyfied monomer`, async ({
      page,
    }) => {
      /* 
        Test case: Macro-Micro-Switcher/#3747
        Description: Switching between Macro and Micro mode not crash application when opened DNA/RNA with modyfied monomer
        */
      await openFileAndAddToCanvasMacro(
        page,
        testInfo.fileName,
        MacroFileType.MOLv3000,
      );
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await selectSnakeLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('Macro-Micro-Switcher2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that AP label selection works but not saves to KET', async ({
    page,
  }) => {
    /*
      Test case: Macro-Micro-Switcher/#4530
      Description: AP label selection works but not saves to KET.
      */
    await openFileAndAddToCanvas(
      page,
      'KET/structure-with-two-attachment-points.ket',
    );
    await page.keyboard.down('Shift');
    await page.getByText('R1').click();
    await page.getByText('R2').click();
    await page.keyboard.up('Shift');

    await verifyFileExport(
      page,
      'KET/structure-with-two-attachment-points-expected.ket',
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/structure-with-two-attachment-points-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Check that attachment points and leaving groups are correctly represented in KET format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: Attachment points and leaving groups are correctly represented in KET format.
      */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );

    await verifyFileExport(
      page,
      'KET/one-attachment-point-added-in-micro-mode-expected.ket',
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/one-attachment-point-added-in-micro-mode-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that we can save bond between micro and macro structures to Mol V3000 format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: We can save bond between micro and macro structures to Mol V3000 format.
      */
    await openFileAndAddToCanvas(
      page,
      'KET/chem-connected-to-micro-structure.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/chem-connected-to-micro-structure-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });

  test('Check that attachment points and leaving groups are correctly represented in Mol V3000 format', async ({
    page,
  }) => {
    /*
      Test case: #4530
      Description: Attachment points and leaving groups are correctly represented in Mol V3000 format.
      */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/one-attachment-point-added-in-micro-mode-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/one-attachment-point-added-in-micro-mode-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Connection one molecule to another one by drugging one over another - result indicate existence of AP label and it remain back after delete connection', async ({
    page,
  }) => {
    /*
        Test case: Macro-Micro-Switcher/#4530
        Description: We can connect molecule to attachment point and when delete bond attachment point remains.
      */
    await openFileAndAddToCanvas(
      page,
      'KET/one-attachment-point-with-oxygen.ket',
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByTestId('canvas').getByText('O').click();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.F1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that it is possible to save micro-macro connection to mol v3000 file', async ({
    page,
  }) => {
    /*
      Test case: #4532
      Description: It is possible to save micro-macro connection to mol v3000 file.
      */
    await openFileAndAddToCanvas(page, 'KET/micro-macro-structure.ket');
    await verifyFileExport(
      page,
      'Molfiles-V3000/micro-macro-structure-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/micro-macro-structure-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro,
     * verify that Arrows are not presented on the Canvas after switching to Macro mode, Clear Canvas, switch back to Micro mode,
     * verify that arrows are presented after returning to Micro mode.
     *
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/three-different-multi-tail-arrows.ket',
    );
    await LeftToolbar(page).selectArrowTool(ArrowType.MultiTailedArrow);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows are not presented in Macro mode,  Clear Canvas, switch back to Micro mode', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows aren't presented in Macro mode,
     * Clear Canvas, switch back to Micro mode, verify that arrows are presented in Micro mode.
     *
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/three-different-multi-tail-arrows.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Copy to Clipboard" icon appears in the export window in molecules mode', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5854
      Description: The "Copy to Clipboard" icon appears in the export window in molecules mode
      */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.KetFormat,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Copy to Clipboard" icon appears in the export window in macromolecules mode', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5854
      Description: The "Copy to Clipboard" icon appears in the export window in macromolecules mode
      */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Ket,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Copy to Clipboard" icon disappears after clicking on the preview section and appears when hovering again', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5854
      Description: The "Copy to Clipboard" icon disappears after clicking on the preview section and appears when hovering again
      */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.KetFormat,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 100, 100);
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that clicking on the "Copy to Clipboard" icon copies all exportable information to the clipboard', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5854
      Description: Clicking on the "Copy to Clipboard" icon copies all exportable information to the clipboard
      */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.KetFormat,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await copyToClipboardByIcon(page);
    await closeErrorAndInfoModals(page);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
  });

  test('Verify that single atom properties are preserved when switching from molecules mode to macromolecules mode', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Single atom properties such as alias, charge, isotope, valence, and radical are displayed correctly in macromolecules mode.
      Case:
      1. Add file with atom properties in Micro mode.
      2. Switch to Macro mode.
      3. Check that atom properties are preserved.
      Expected: Atom properties are preserved.
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Verify that the property of an atom is non-editable in macromolecules mode', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: The property of an atom is non-editable in macromolecules mode.
      Case:
      1. Add file with atom properties in Micro mode.
      2. Switch to Macro mode.
      3. Try to edit atom properties.
      Expected: Atom properties are non-editable.
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await doubleClickOnAtom(page, 'Zn');
    await takeEditorScreenshot(page);
  });

  test('Verify that structures with single atom properties can be saved/load in macro mode in KET format', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: The structures with single atom properties can be saved/load in macro mode in KET format.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Save and load the file.
      Expected: The file is saved and loaded correctly.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await verifyFileExport(
      page,
      'KET/single-atom-properties-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that structures with single atom properties can be saved/load in macro mode in MOL V3000 format', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: The structures with single atom properties can be saved/load in macro mode in MOL V3000 format.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Save and load the file.
      Expected: The file is saved and loaded correctly.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/single-atom-properties-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/single-atom-properties-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that structures with single atom properties can be saved/load in macro mode in SVG format', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: The structures with single atom properties can be saved/load in macro mode in SVG format.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Save as SVG file.
      3. Look at the SVG preview.
      Expected: The SVG preview is correct.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that single atom properties are correctly displayed in different zoom levels in macromolecules mode', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Single atom properties are correctly displayed in different zoom levels in macromolecules mode.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Zoom in and out.
      3. Check that atom properties are displayed correctly.
      Expected: Atom properties are displayed correctly.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).setZoomInputValue('120');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).setZoomInputValue('150');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that the transition from macromolecules mode back to molecules mode does not alter the single atom properties', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: The transition from macromolecules mode back to molecules mode does not alter the single atom properties.
      Case:
      1. Add file with atom properties in Micro mode.
      2. Switch to Macro mode.
      3. Switch back to Micro mode.
      Expected: Atom properties are preserved.
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Verify that undo and redo actions correctly preserve changes to single atom properties in both molecules and macromolecules modes', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Undo and redo actions correctly preserve changes to single atom properties in both molecules and macromolecules modes.
      Case:
      1. Add file with atom properties in Micro mode.
      2. Delete atom with properties.
      3. Undo and redo actions.
      4. Switch to Macro mode.
      5. Delete atom with properties.
      6. Undo and redo actions.
      Expected: Undo and redo actions correctly preserve changes to single atom properties.
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedoInMacro(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that copying and pasting a structure with single atom properties preserves the properties in both modes', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Copying and pasting a structure with single atom properties preserves the properties in both modes.
      Case:
      1. Add file with atom properties in Micro mode.
      2. Copy and paste the structure.
      3. Switch to Macro mode.
      4. Copy and paste the structure.
      Expected: Atom properties are preserved.
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, 400, 400);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await clickOnCanvas(page, 600, 100);
    await pasteFromClipboardByKeyboard(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify saving a structure with single atom properties in macromolecules mode and opening it in molecules mode KET', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Saving a structure with single atom properties in macromolecules mode and opening it in molecules mode KET.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Save in KET format.
      3. Open the file in Micro mode.
      Expected: The file is saved and loaded correctly.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await verifyFileExport(
      page,
      'KET/single-atom-properties-saved-in-macro-expected.ket',
      FileType.KET,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties-saved-in-macro-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify saving a structure with single atom properties in macromolecules mode and opening it in molecules mode MOL V3000', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6027
      Description: Saving a structure with single atom properties in macromolecules mode and opening it in molecules mode MOL V3000.
      Case:
      1. Add file with atom properties in Macro mode.
      2. Save in MOL V3000 format.
      3. Open the file in Micro mode.
      Expected: The file is saved and loaded correctly.
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/single-atom-properties.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/single-atom-properties-saved-in-macro-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/single-atom-properties-saved-in-macro-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that flex mode is opened by default when a user enters macromolecules mode for the first time and there is a drawing on the canvas', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/6029
      Description: Flex mode is opened by default when a user enters macromolecules mode for the first time and there is a drawing on the canvas
      Case: 
      1. Open KET file with drawing in Micro mode
      2. Switch to Macromolecules mode
      3. Verify that Flex mode is opened
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-ring-with-two-atoms.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await takePageScreenshot(page);
  });

  test('Verify that flex mode is not opened by default if the user previously entered macromolecules mode change macro mode to (Snake, Sequence) and re-entering it from Micro mode', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/6029
      Description: Flex mode is not opened by default if the user previously entered macromolecules mode change 
      macro mode to (Snake, Sequence) and re-entering it from Micro mode
      Case: 
      1. Switch to Macromolecules mode
      2. Change macro mode to Snake
      3. Switch to Micro mode
      4. Switch to Macromolecules mode
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSnakeLayoutModeTool(page);
    await takePageScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await takePageScreenshot(page);
  });

  test('Verify that flex mode is not triggered if the canvas is empty when the user enters macromolecules mode for the first time (Sequence mode by default)', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/6029
      Description: Flex mode is not triggered if the canvas is empty when the user enters 
      macromolecules mode for the first time (Sequence mode by default)
      Case: 
      1. Switch to Macromolecules mode
      2. Verify that Sequence mode is opened
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await takePageScreenshot(page);
  });

  test('Verify the default tab in the library is set to RNA when the macromolecules mode is opened', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Default tab in the library is set to RNA when the macromolecules mode is opened
      Case:
      1. Open macromolecules mode
      2. Check the default tab in the library
      3. Default tab should be RNA
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await takeTopToolbarScreenshot(page);
  });

  test('Verify that changing the typing type to PEP switches the library tab to Peptide', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Changing the typing type to PEP switches the library tab to Peptide
      Case:
      1. Open macromolecules mode
      2. Change typing type to PEP
      3. Changing typing type to PEP switches the library tab to Peptide
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSequenceTypeMode(page, 'PEPTIDE');
    await takePageScreenshot(page);
  });

  test('Verify that changing the typing type to RNA switches the library tab to RNA', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Changing the typing type to RNA switches the library tab to RNA
      Case:
      1. Open macromolecules mode
      2. Change typing type to PEP
      3. Change typing type to RNA
      4. Changing typing type to RNA switches the library tab to RNA
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSequenceTypeMode(page, 'PEPTIDE');
    await selectSequenceTypeMode(page, 'RNA');
    await takePageScreenshot(page);
  });

  test('Verify that changing the typing type to DNA switches the library tab to RNA', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Changing the typing type to DNA switches the library tab to RNA
      Case:
      1. Open macromolecules mode
      2. Change typing type to DNA
      3. Changing typing type to DNA switches the library tab to RNA
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSequenceTypeMode(page, 'DNA');
    await takePageScreenshot(page);
  });

  test('Verify that changing the typing type from RNA to DNA and viceversa does not affect the library tab', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Changing the typing type from RNA to DNA and viceversa does not affect the library tab
      Case:
      1. Open macromolecules mode
      2. Change typing type to DNA
      3. Change typing type to RNA
      4. Changing typing type from RNA to DNA and viceversa does not affect the library tab
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectSequenceTypeMode(page, 'DNA');
    await takePageScreenshot(page);
    await selectSequenceTypeMode(page, 'RNA');
    await takePageScreenshot(page);
  });

  test('Verify that switching the typing type using hotkeys updates the library tab accordingly', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Switching the typing type using hotkeys updates the library tab accordingly
      Case:
      1. Open macromolecules mode
      2. Press Ctrl+Alt+D for DNA
      3. Press Ctrl+Alt+P for Peptides
      4. Press Ctrl+Alt+R for RNA
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });

    // waiting appearance of empty seqeunce in edit mode appearence
    // (otherwise - keyboard shortcuts doesn't work)
    await page.getByTestId(`sequence-item`).first().waitFor({
      state: 'attached',
    });
    await keyboardPressOnCanvas(page, 'Control+Alt+D');
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Control+Alt+P');
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Control+Alt+R');
    await takePageScreenshot(page);
  });

  test('Verify that switching the typing type consecutively (e.g., RNA → DNA → PEP) updates the library tab correctly at each step', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Switching the typing type consecutively (e.g., RNA → DNA → PEP) updates the library tab correctly at each step
      Case:
      1. Open macromolecules mode
      2. Start typing type RNA
      3. Change typing type to DNA
      4. Start typing type DNA
      5. Change typing type to PEP
      6. Start typing type PEP
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await takePageScreenshot(page);
  });

  test('Verify that the library tab remains consistent with the typing type after switching to another mode and returning to sequence mode', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/5995
      Description: Library tab remains consistent with the typing type after switching to another mode and returning to sequence mode
      Case:
      1. Open macromolecules mode
      2. Start typing type RNA
      3. Change typing type to DNA
      4. Start typing type DNA
      5. Change typing type to PEP
      6. Start typing type PEP
      7. Switch to Flex mode and back to Sequence mode
      */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    // await switchToRNAMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'CCC');
    await takePageScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takePageScreenshot(page);
  });

  test('Verify the behavior when the user manually switches to sequence mode after flex mode and then switches to micro and back to macro (Sequence should be by default)', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/6029
      Description: Behavior when the user manually switches to sequence mode after flex mode and 
      then switches to micro and back to macro (Sequence should be by default)
      Case: 
      1. Switch to Macromolecules mode
      2. Change macro mode to Flex
      3. Change macro mode to Sequence
      4. Switch to Micro mode
      5. Switch to Macromolecules mode
    */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await selectFlexLayoutModeTool(page);
    await selectSequenceLayoutModeTool(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await takePageScreenshot(page);
  });

  test('Verify undo/redo functionality when entering macromolecules mode for the first time and modifying a drawing in flex mode (undo/redo not changes layout modes)', async ({
    page,
  }) => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/6029
      Description: Undo/redo functionality when entering macromolecules mode for the first time and 
      modifying a drawing in flex mode (undo/redo not changes layout modes)
      Case: 
      1. Switch to Macromolecules mode
      2. Modify drawing in Flex mode
      3. Undo/redo
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-ring-with-two-atoms.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
    await CommonTopLeftToolbar(page).clearCanvas();
    await CommonTopLeftToolbar(page).undo();
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takePageScreenshot(page);
  });
});
