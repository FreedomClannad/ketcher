/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pressButton,
  resetCurrentTool,
  BondType,
  copyAndPaste,
  cutAndPaste,
  clickOnAtom,
  clickOnBond,
  fillFieldByLabel,
  screenshotBetweenUndoRedo,
  AttachmentPoint,
  setAttachmentPoints,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  MolFileFormat,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroBondOption } from '@tests/pages/constants/contextMenu/Constants';
import { getBondByIndex } from '@utils/canvas/bonds';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 500;

async function selectMultipleGroup(
  page: Page,
  text: string,
  dataName: string,
  valueRepeatCount: string,
  buttonToClick?: 'Apply' | 'Cancel',
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Repeat count').fill(valueRepeatCount);
  if (buttonToClick === 'Apply') {
    await pressButton(page, 'Apply');
  } else if (buttonToClick === 'Cancel') {
    await pressButton(page, 'Cancel');
  }
}

async function changeRepeatCountValue(page: Page, value: string) {
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).sGroup();
  await page.getByTestId('s-group-type-input-span').click();
  await page.getByTestId('Multiple group-option').click();
  await page.getByTestId('mul-input').fill(value);
}

test.describe('Multiple S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 3);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole s-group structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1506
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole s-group structure even with attachment points', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1520
      Description: User is able to edit the Multiple S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await ContextMenu(page, point).click(MicroBondOption.EditSGroup);
    await fillFieldByLabel(page, 'Repeat count', '99');
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to add atom on structure with Multiple S-group.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 3);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo atom on Chain with Multiple S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to delete and undo/redo atom on structure with Multiple S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete whole Chain with Multiple S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to delete whole Chain with Multiple S-Group and undo/redo.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with Multiple S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1521
      Description: User is able to add R-Group Label and Undo/Redo on structure with Multiple S-group.
    */
    const rGroupName = 'R8';
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 3);
    await page.getByRole('button', { name: rGroupName }).click();
    await pressButton(page, 'Apply');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste structure with Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1522
      Description: User is able to copy and paste structure with Multiple S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste structure with Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1522
      Description: User is able to cut and paste structure with Multiple S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group.ket');
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save/Open Multiple S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1523
      Description: User is able to save and open structure with Multiple S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/multiple-group-data.ket');

    await verifyFileExport(
      page,
      'Molfiles-V2000/multiple-group-data-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Limit on minimum count', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16891
      Description: The fragment we previously clicked on is highlighted with two 
      square brackets and displayed next to bracket 1
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '1', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Limit on maximum count', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16892
      Description: The fragment we previously clicked on is highlighted with two 
      square brackets and displayed next to bracket 200
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '200', 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Check validations on limitation (Try add 0 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: 0 is displayed and warning message "must be >=1" on the right under the highlighted red "Repeat count" field
      The field "Repeat count" is empty and is lit in gray, the "Apply" button is not active
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '0');
    await takeEditorScreenshot(page);
  });

  test('Check validations on limitation (Try add 201 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: 201 is displayed and warning message "must be <=200" on the right under the highlighted red "Repeat count" field
      The field "Repeat count" is empty and is lit in gray
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '201');
    await takeEditorScreenshot(page);
  });

  test('Check validations on limitation (Try add -1 in Repeat count)', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-16893
      Description: -1 is displayed and warning message "must be >=1" on the right under the highlighted red "Repeat count" field
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '-1');
    await takeEditorScreenshot(page);
  });

  test('Attachment point inside S-Group brackets', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16938
      Description: Attachment points should be inside of S-Group
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '200', 'Apply');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
      'Apply',
    );
    await takeEditorScreenshot(page);
  });

  test('Multiple Group - Limit on minimum count', async ({ page }) => {
    // Test case: EPMLSOPKET-18027
    // Verify minimum value of the Repeat count field
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await changeRepeatCountValue(page, '1');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Multiple Group - Limit on maximum count', async ({ page }) => {
    // Test case: EPMLSOPKET- EPMLSOPKET-18028
    // Verify maximum value of the Repeat count field
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await changeRepeatCountValue(page, '200');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Multiple Group - Limit higher than maximum count', async ({ page }) => {
    // Test case: EPMLSOPKET-18028
    // Verify system answer after putting a number higher than limit
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await changeRepeatCountValue(page, '201');
    await takeEditorScreenshot(page);
  });

  test('Multiple Group - Value in the valid range', async ({ page }) => {
    // Test case: EPMLSOPKET-18029
    // Verify value in the valid range
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/templates.mol');
    await changeRepeatCountValue(page, '50');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Add S-Group properties to structure and atom', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3949
      Description: S-Group added to the structure and represent in .ket file.
      The test is currently not functioning correctly as the bug has not been fixed.
    */
    await openFileAndAddToCanvas(page, 'KET/cyclopropane-and-h2o.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await selectMultipleGroup(page, 'Data', 'Multiple group', '8', 'Apply');
    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-multiple-expected.ket',
      FileType.KET,
    );

    await takeEditorScreenshot(page);
  });
});
