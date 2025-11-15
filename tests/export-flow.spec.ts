import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';

test.describe('CabKit3D export flow', () => {
  test('generates SKU JSON + BOM/GLB downloads', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'CabKit3D' })).toBeVisible();

    await page.getByLabel('Width').fill('820');
    await page.getByLabel('Height').fill('860');
    const shelvesInput = page.getByLabel('Shelves').or(page.getByLabel(/Shelf/i));
    await shelvesInput.fill('2');

    await page.getByRole('button', { name: 'Copy link' }).waitFor({ state: 'visible' });

    const downloadButton = page.getByRole('button', { name: 'Download BOM (CSV + GLB)' });
    await expect(downloadButton).toBeEnabled({ timeout: 15000 });
    const archiveDownloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const archiveDownload = await archiveDownloadPromise;
    const archiveName = archiveDownload.suggestedFilename().toLowerCase();
    expect(archiveName).toContain('bom');
    expect(archiveName).toContain('.zip');
    const archivePath = await archiveDownload.path();
    expect(archivePath).toBeTruthy();
    if (archivePath) {
      const archiveBuffer = await fs.readFile(archivePath);
      const zip = await JSZip.loadAsync(archiveBuffer);
      const fileNames = Object.keys(zip.files).map((name) => name.toLowerCase());
      expect(fileNames.some((name) => name.endsWith('bom.csv'))).toBeTruthy();
      expect(fileNames.some((name) => name.endsWith('.glb'))).toBeTruthy();
    }
    await archiveDownload.delete();

    await page.waitForTimeout(1000);

    const skuBadge = page.getByTestId('sku-indicator');
    await expect(skuBadge).toContainText('CAB-', { timeout: 2000 });
  });
});
