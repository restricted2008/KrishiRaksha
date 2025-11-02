import { test, expect } from '@playwright/test';
import { generateSecureQRData } from '../src/utils/qrUtils';

test.describe('QR Scanner E2E Tests', () => {
  const validQRData = {
    batchId: 'KR12345',
    cropType: 'rice',
    farmer: 'Test Farmer',
    harvestDate: '2024-01-15',
    location: 'Test Location',
    quantity: 100,
    unit: 'kg',
    organicCertified: true
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Assume user is logged in (adjust based on your auth flow)
    // You may need to perform login steps here
  });

  test('should open QR scanner when scan button is clicked', async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera']);
    
    // Navigate to a page with QR scanner (adjust selector based on your app)
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Check if scanner modal is visible
    await expect(page.locator('text=Scan QR Code')).toBeVisible();
    
    // Check if camera region is present
    await expect(page.locator('#qr-scanner-region')).toBeVisible();
  });

  test('should display scanning indicator when camera is active', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Wait for scanning indicator
    await expect(page.locator('text=Scanning...')).toBeVisible({ timeout: 5000 });
  });

  test('should close scanner when close button is clicked', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    await expect(page.locator('text=Scan QR Code')).toBeVisible();
    
    // Click close button
    await page.click('[aria-label="Close scanner"]');
    
    // Scanner should be closed
    await expect(page.locator('text=Scan QR Code')).not.toBeVisible();
  });

  test('should display error when camera permission is denied', async ({ page, context }) => {
    // Block camera permissions
    await context.clearPermissions();
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Check for camera error message
    await expect(page.locator('text=Camera Error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/camera.*denied/i')).toBeVisible();
  });

  test('should display instructions for enabling camera when denied', async ({ page, context }) => {
    await context.clearPermissions();
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Wait for error state
    await expect(page.locator('text=Camera Error')).toBeVisible({ timeout: 5000 });
    
    // Check for instructions
    await expect(page.locator('text=How to enable camera:')).toBeVisible();
    await expect(page.locator('text=/lock icon/i')).toBeVisible();
  });

  test('should validate and display valid QR code data', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    // Generate valid QR code
    const validQRString = generateSecureQRData(validQRData);
    
    // Open scanner
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Simulate scanning by triggering the scan success callback
    // Note: This requires injecting the QR data into the page
    await page.evaluate((qrData) => {
      // Trigger scan success event (this is a simulation)
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, validQRString);
    
    // Check for success state
    await expect(page.locator('text=Valid QR Code')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=QR code verified successfully')).toBeVisible();
    
    // Check that data is displayed
    await expect(page.locator('text=Batch ID: KR12345')).toBeVisible();
    await expect(page.locator('text=Crop: rice')).toBeVisible();
    await expect(page.locator('text=Farmer: Test Farmer')).toBeVisible();
  });

  test('should show InvalidQRModal for tampered QR code', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    // Create tampered QR data
    const tamperedQR = JSON.stringify({
      data: validQRData,
      signature: 'fake-signature-12345'
    });
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Simulate scanning tampered QR
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, tamperedQR);
    
    // Check for InvalidQRModal
    await expect(page.locator('text=Security Warning')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/tampered/i')).toBeVisible();
  });

  test('should show InvalidQRModal for expired QR code', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    // Generate QR with old timestamp (31 days ago)
    const expiredData = {
      ...validQRData
    };
    
    const validQRString = generateSecureQRData(expiredData);
    const payload = JSON.parse(validQRString);
    
    // Manually set expired timestamp
    payload.data.timestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
    
    const expiredQR = JSON.stringify(payload);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, expiredQR);
    
    // Check for expired error
    await expect(page.locator('text=/expired/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow scanning another QR after successful scan', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    const validQRString = generateSecureQRData(validQRData);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, validQRString);
    
    // Wait for success state
    await expect(page.locator('text=Valid QR Code')).toBeVisible();
    
    // Click "Scan Another"
    await page.click('button:has-text("Scan Another")');
    
    // Scanner should be active again
    await expect(page.locator('text=Scanning...')).toBeVisible({ timeout: 5000 });
  });

  test('should confirm and close scanner on valid scan', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    const validQRString = generateSecureQRData(validQRData);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, validQRString);
    
    await expect(page.locator('text=Valid QR Code')).toBeVisible();
    
    // Click confirm
    await page.click('button:has-text("Confirm")');
    
    // Scanner should be closed
    await expect(page.locator('text=Scan QR Code')).not.toBeVisible();
  });

  test('should display security badge on valid QR scan', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    const validQRString = generateSecureQRData(validQRData);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, validQRString);
    
    // Check for all expected data fields
    await expect(page.locator('text=Batch ID:')).toBeVisible();
    await expect(page.locator('text=Crop:')).toBeVisible();
    await expect(page.locator('text=Farmer:')).toBeVisible();
    await expect(page.locator('text=Location:')).toBeVisible();
    await expect(page.locator('text=Quantity:')).toBeVisible();
    await expect(page.locator('text=✓ Organic Certified')).toBeVisible();
  });

  test('should close InvalidQRModal and retry scanning', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    const tamperedQR = JSON.stringify({
      data: validQRData,
      signature: 'fake-signature'
    });
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    await page.evaluate((qrData) => {
      window.dispatchEvent(new CustomEvent('qr-scan-success', { detail: qrData }));
    }, tamperedQR);
    
    await expect(page.locator('text=Security Warning')).toBeVisible();
    
    // Close modal (which should retry scanning)
    await page.click('button:has-text("Understood")');
    
    // Scanner should be active again
    await expect(page.locator('text=Scanning...')).toBeVisible({ timeout: 5000 });
  });

  test('should handle keyboard navigation (ESC key closes scanner)', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    await expect(page.locator('text=Scan QR Code')).toBeVisible();
    
    // Press ESC key
    await page.keyboard.press('Escape');
    
    // Scanner should be closed
    await expect(page.locator('text=Scan QR Code')).not.toBeVisible();
  });

  test('should display appropriate ARIA labels for accessibility', async ({ page, context }) => {
    await context.grantPermissions(['camera']);
    
    await page.click('[aria-label*="scan" i], [data-testid="scan-qr-button"]');
    
    // Check for ARIA attributes
    const dialog = page.locator('role=dialog[aria-modal="true"]');
    await expect(dialog).toBeVisible();
    
    // Check for labeled heading
    await expect(page.locator('[id="qr-scanner-title"]')).toBeVisible();
    
    // Check close button has aria-label
    const closeButton = page.locator('[aria-label="Close scanner"]');
    await expect(closeButton).toBeVisible();
  });
});
