// QR Code service for generation and scanning
import { apiService } from './api';

export interface QRCodeData {
  productId: string;
  farmerId: string;
  batchNumber: string;
  harvestDate: string;
  [key: string]: any;
}

class QRService {
  /**
   * Generate QR code data string from product information
   */
  generateQRData(data: QRCodeData): string {
    return JSON.stringify(data);
  }

  /**
   * Parse QR code data string back to object
   */
  parseQRData(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);
      return data;
    } catch (error) {
      console.error('Failed to parse QR data:', error);
      return null;
    }
  }

  /**
   * Generate QR code URL for display (using a QR code generation API)
   */
  generateQRCodeURL(data: QRCodeData, size: number = 300): string {
    const qrData = this.generateQRData(data);
    const encodedData = encodeURIComponent(qrData);
    // Using a public QR code API - you can replace with your own
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
  }

  /**
   * Verify product information from QR code
   */
  async verifyQRCode(qrString: string) {
    const data = this.parseQRData(qrString);
    if (!data) {
      return {
        success: false,
        error: 'Invalid QR code data',
      };
    }

    try {
      // Verify with backend
      const result = await apiService.verifyProduct(data.productId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify product',
      };
    }
  }

  /**
   * Scan QR code from camera/file
   * This is a placeholder - implement with actual QR scanning library
   */
  async scanQRCode(imageData: string | Blob): Promise<string | null> {
    try {
      // Implement actual QR code scanning logic here
      // You might use libraries like jsQR or html5-qrcode
      console.log('Scanning QR code from image:', imageData);
      
      // Placeholder: return mock data
      return null;
    } catch (error) {
      console.error('QR code scanning failed:', error);
      return null;
    }
  }

  /**
   * Download QR code as image
   */
  downloadQRCode(qrCodeURL: string, filename: string = 'qrcode.png') {
    const link = document.createElement('a');
    link.href = qrCodeURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const qrService = new QRService();
export default qrService;
