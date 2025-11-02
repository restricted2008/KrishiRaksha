import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Camera, Upload, X, ScanLine } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const handleCameraScan = () => {
    setIsScanning(true);
    
    // Simulate camera scanning process
    setTimeout(() => {
      // Mock QR scan result
      const mockQRData = 'KR1697123456';
      onScanResult(mockQRData);
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file must be less than 5MB');
      return;
    }
    
    // Simulate QR code detection from image
    setTimeout(() => {
      // Mock successful QR detection
      const mockQRData = 'KR1697123456';
      onScanResult(mockQRData);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="safe-area flex items-center justify-between p-4 text-white">
        <h3 className="font-semibold">Scan QR Code</h3>
        <Button
          onClick={onClose}
          className="tap-target p-2"
          style={{ backgroundColor: 'transparent' }}
        >
          <X className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative">
        {isScanning ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="w-48 h-48 border-2 border-white rounded-lg relative mx-auto mb-4">
                <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse">
                  <ScanLine className="w-full h-6 text-green-400 animate-bounce" />
                </div>
              </div>
              <p className="text-lg font-medium">Scanning...</p>
              <p className="text-sm text-gray-300 mt-2">Hold steady and align QR code in frame</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            {/* Mock camera viewfinder */}
            <div className="w-64 h-64 border-2 border-white rounded-lg relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-white"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-white"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-white"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-white"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">Position QR code within frame</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="safe-area p-4 space-y-4">
        {/* Scan Button */}
        <Button
          onClick={handleCameraScan}
          disabled={isScanning}
          className="w-full tap-target rounded-lg font-medium"
          style={{
            backgroundColor: isScanning ? '#9E9E9E' : '#039BE5',
            color: 'white'
          }}
        >
          {isScanning ? 'Scanning...' : 'Tap to Scan'}
        </Button>

        {/* Upload Option */}
        <div className="text-center">
          <p className="text-white text-sm mb-3">Or upload image from gallery</p>
          
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              as="span"
              className="tap-target rounded-lg font-medium cursor-pointer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: '1px',
                color: 'white'
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </label>
          
          {uploadError && (
            <p className="text-red-400 text-sm mt-2">{uploadError}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-400 text-xs space-y-1">
          <p>• Make sure QR code is clearly visible</p>
          <p>• Avoid shadows and reflections</p>
          <p>• Hold device steady while scanning</p>
        </div>
      </div>
    </div>
  );
};