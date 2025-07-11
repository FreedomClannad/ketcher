import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  FILE_TEST_DATA,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

test.describe('Reagents CDXML format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Detection molecule as reagent and write reagent information in "CDXML" format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule NH3 above arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4719
    Description: System detect molecule HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test(`Detection text above arrow as reagent
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text NH3 as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(page, 'KET/reagent-nh3-text-above-arrow.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test(`Detection text as reagent below arrow 
  and write reagent information in "CDXML" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4720
    Description: System detect text HCl below arrow as reagent and write reagent in 'CDXML' format in "Preview" tab
    */
    await openFileAndAddToCanvas(page, 'KET/reagent-hcl-text-below-arrow.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDXML,
    );
    await takeEditorScreenshot(page);
  });

  test('File saves in "CDXML" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4721
    Description: File saved in format (e.g. "ketcher.cdxml")
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.CDXML,
    );
    await SaveStructureDialog(page).save();
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "CDXML" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4722
      Description: Reagent 'NH3' displays above reaction arrow
      */
    // await pasteCDXML(page, FILE_TEST_DATA.benzeneArrowBenzeneReagentNh3);
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentNh3,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open File CDXML with reagent NH3 above arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent NH3 on top of the arrow
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Open File CDXML with reagent HCl below arrow', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4723
      Description: File opens with the reagent HCl below the arrow
    */
    await openFileAndAddToCanvas(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Open File CDXML with molecules above and below one arrow', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-5255
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas(
      page,
      'CDXML/molecules-above-and-below-arrow.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Open File CDXML with multistep reactions', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-5256
      Description: The structure opens as it was saved with all structural elements: 
      plus and two reaction arrows NH3 molecule above first arrow and HCl below second arrow
    */
    await openFileAndAddToCanvas(page, 'CDXML/cdxml-multistep.cdxml');
    await takeEditorScreenshot(page);
  });
});
