import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { setACSSettings } from '@tests/pages/molecules/canvas/SettingsDialog';

test.describe('Saving in .svg files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Verify it is possible to export the simple schema with retrosynthetic arrow to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with retrosynthetic, angel arrows and plus to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with vertical retrosynthetic arrow to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with two retrosynthetic arrows to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-two-retrosynthetic-arrows.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema with diagonaly retrosynthetic arrow to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test(`Verify it is possible to export the schema reverse retrosynthetic arrow and pluses to SVG`, async ({
    page,
  }) => {
    /*
    Test case: #2096
    Description: Validate that schema with retrosynthetic arrow could be saved to SVG
    */
    await openFileAndAddToCanvas(
      page,
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to SVG', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  */
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setACSSettings(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });
});
