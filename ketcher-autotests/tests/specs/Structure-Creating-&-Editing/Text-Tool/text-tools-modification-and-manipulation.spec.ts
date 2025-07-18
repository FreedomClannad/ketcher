import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  pressButton,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  waitForRender,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
} from '@utils';
import { addTextBoxToCanvas } from '@utils/selectors/addTextBoxToCanvas';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

async function selectStructureWithSelectionTool(page: Page) {
  const point = { x: 97, y: 79 };
  const point1 = { x: 943, y: 114 };
  const point2 = { x: 844, y: 579 };
  const point3 = { x: 66, y: 611 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point1.x, point1.y);
  await page.mouse.move(point2.x, point2.y);
  await page.mouse.move(point3.x, point3.y);
  await page.mouse.up();
}

async function moveStructureToNewPosition(page: Page) {
  const point = { x: 656, y: 359 };
  const point1 = { x: 906, y: 245 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await dragMouseTo(point1.x, point1.y, page);
  await page.mouse.up();
}

async function performUndoRedo(page: Page) {
  await CommonTopLeftToolbar(page).undo();
  await CommonTopLeftToolbar(page).redo();
  await CommonTopLeftToolbar(page).undo();
}

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Modify the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2228
    // Verify if possible is modify created text object by adding some extra symbols
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByText('TEST').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click();
    await page.getByRole('dialog').getByRole('textbox').fill('TEST123');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test(' Delete the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2229
    // Delte created text object with Erase tool
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('TEST');
    await pressButton(page, 'Apply');
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('TEST').click();
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  // Delete created text object with and Lasso Selection Tool and 'Delete' button on a keyboard
  test(' Delete created text object with Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/text-object-for-test.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await page.getByText('TEXT').hover();
    await page.getByText('TEXT').click();
    await page.keyboard.press('Delete');
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  // Delete created text object in the text editor field
  test(' Delete created text object in the text editor field', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/test-text-object.ket');
    await page.getByText('TEST').dblclick();
    await pressButton(page, 'Cancel');
    await page.getByText('TEST').dblclick();
    await page.getByRole('dialog').getByText('TEST').dblclick();
    await page.keyboard.press('Delete');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Create a single text object by pasting text', async ({ page }) => {
    // Test case: EPMLSOPKET-2230
    // Verify if possible is create text object by pasting text
    await addTextBoxToCanvas(page);
    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill(
        'Ketcher is a tool to draw molecular structures and chemical reactions',
      );
    await pressButton(page, 'Cancel');
    await page.getByTestId('text').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByRole('dialog').getByRole('textbox').click();
    await clickInTheMiddleOfTheScreen(page);
    const pasteText =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.getByRole('dialog').getByRole('textbox').fill(pasteText);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Create several text objects and modifited them', async ({ page }) => {
    const x = 150;
    const y = 145;
    // Test case: EPMLSOPKET-2231 & EPMLSOPKET-2232
    // Verify if possible is created few text object and modify them
    await addTextBoxToCanvas(page);
    await page.keyboard.type('&&&');
    await pressButton(page, 'Cancel');
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.type('+++');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, x, y);
    await page.getByRole('dialog').getByRole('textbox').click();
    const text1 =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await page.keyboard.type(text1);
    await pressButton(page, 'Apply');

    await page.getByText('+++').dblclick();
    await page.keyboard.type('123');
    await pressButton(page, 'Cancel');
    await page.getByText('+++').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click;
    await waitForRender(page, async () => {
      await page.keyboard.type('Test');
    });
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
    await page.getByText('Ketcher is').dblclick();
    await page.getByRole('dialog').getByRole('textbox').fill('123');
    await pressButton(page, 'Cancel');
    await page.getByText('Ketcher is').dblclick();
    await page.getByRole('dialog').getByRole('textbox').click;
    await waitForRender(page, async () => {
      await page.keyboard.type('Super');
    });
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test(' Delete several created text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2233
    // Delete several created ealier text objects with hotkey (Delete) and  'Erase' tool.
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('&&&');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await page.getByTestId('canvas').click({ position: { x: 100, y: 100 } });
    await page.getByRole('dialog').getByRole('textbox').click();
    const text2 = 'Ketcher is a coool tool';
    await page.getByRole('dialog').getByRole('textbox').fill(text2);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Text tool - Delete with Erase tool', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('&&&').hover();
    await page.getByText('&&&').click();
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete with and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    const text2 = 'Ketcher is a cool tool';
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await page.getByText(text2).hover();
    await page.getByText(text2).click();
    await page.keyboard.press('Delete');
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test(' Delete two objects with Erase and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await page
      .getByTestId('erase')
      .filter({ has: page.locator(':visible') })
      .click();
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectStructureWithSelectionTool(page);
    await page.keyboard.press('Delete');
    await performUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test(' Manipulations with the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2234
    // Verify if possible is to modify created ealier text object and moving it with use Selection Tool
    await addTextBoxToCanvas(page);
    const text3 = 'Test123';
    await page.getByRole('dialog').getByRole('textbox').fill(text3);
    await pressButton(page, 'Apply');
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await selectAllStructuresOnCanvas(page);
    await page.getByText(text3).hover();
    await waitForRender(page, async () => {
      await moveStructureToNewPosition(page);
    });
    await takeEditorScreenshot(page);
  });

  test(' Manipulations with the another created text object', async ({
    page,
  }) => {
    // Verify if possible is perform different manipulations with text objects using different tools (zoom)
    const numberOfPressZoomOut = 2;
    const numberOfPressZoomIn = 2;
    const text4 = 'ABC123';
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill(text4);
    await pressButton(page, 'Apply');
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await selectAllStructuresOnCanvas(page);
    await page.getByText(text4).click();
    await moveStructureToNewPosition(page);
    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await ZoomInByKeyboard(page);
    }

    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await ZoomOutByKeyboard(page);
      });
    }
    await takeEditorScreenshot(page);
  });

  test(' Selection of a text object and a structure', async ({ page }) => {
    const x = 500;
    const y = 250;
    // Test case: EPMLSOPKET-2236
    // Verify if all created and selected elements are moved together
    await addTextBoxToCanvas(page);
    await page.getByRole('dialog').getByRole('textbox').fill('OneTwoThree');
    await pressButton(page, 'Apply');
    await selectRingButton(page, RingButton.Benzene);
    await waitForRender(page, async () => {
      await page.getByTestId('canvas').click({ position: { x, y } });
    });
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectStructureWithSelectionTool(page);
    await waitForRender(page, async () => {
      await moveStructureToNewPosition(page);
    });
    await takeEditorScreenshot(page);
  });
});
