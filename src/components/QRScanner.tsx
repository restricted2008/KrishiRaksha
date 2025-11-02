import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../pages/ui/button';
import { validateQRData, FarmerQRData, formatQRDataForDisplay } from '../utils/qrUtils';
import { InvalidQRModal } from './InvalidQRModal';
import { useEscapeKey } from '../hooks/useKeyboardNavigation';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: FarmerQRData) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FarmerQRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidError, setInvalidError] = useState<{
    type: 'TAMPERED' | 'EXPIRED' | 'INVALID_FORMAT' | 'MISSING_SIGNATURE';
    message: string;
  } | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  useEscapeKey(() => handleClose(), isOpen);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check camera permission
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        
        permissionStatus.addEventListener('change', () => {
          setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        });
      }

      const scanner = new Html5Qrcode('qr-scanner-region');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanError
      );
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permission in your browser settings.');
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText: string) => {
    // Validate the scanned QR code
    const validation = validateQRData(decodedText);

    if (validation.isValid && validation.data) {
      setScanResult(validation.data);
      stopScanning();
    } else {
      // Show invalid QR modal
      setInvalidError({
        type: validation.errorType || 'INVALID_FORMAT',
        message: validation.error || 'Invalid QR code'
      });
      setShowInvalidModal(true);
      stopScanning();
    }
  };

  const onScanError = (errorMessage: string) => {
    // Don't show errors for failed scan attempts, only log them
    console.debug('Scan error:', errorMessage);
  };

  const handleClose = () => {
    stopScanning();
    setScanResult(null);
    setError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (scanResult) {
      onScanSuccess(scanResult);
      handleClose();
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError(null);
    setShowInvalidModal(false);
    setInvalidError(null);
    startScanning();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-scanner-title"
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="safe-area flex items-center justify-between p-4">
            <h2 id="qr-scanner-title" className="text-white font-semibold text-lg">
              Scan QR Code
            </h2>
            <Button
              onClick={handleClose}
              aria-label="Close scanner"
              className="tap-target p-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <X className="w-6 h-6 text-white" aria-hidden="true" />
            </Button>
          </div>

          {/* Scanner Area */}
          <div className="flex-1 flex items-center justify-center p-4">
            {!scanResult && !error && (
              <div className="relative w-full max-w-md">
                <div 
                  id="qr-scanner-region" 
                  ref={scannerDivRef}
                  className="rounded-lg overflow-hidden"
                  style={{ width: '100%', minHeight: '300px' }}
                />
                
                {/* Scanning indicator */}
                {isScanning && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 animate-pulse" aria-hidden="true" />
                    <span>Scanning...</span>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-4 text-center text-white">
                  <p className="text-sm opacity-80">
                    Position the QR code within the frame
                  </p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {scanResult && (
              <div 
                className="w-full max-w-md rounded-xl p-6 text-center"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#E8F5E8' }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} aria-hidden="true" />
                </div>
                
                <h3 className="text-xl font-bold mb-2" style={{ color: '#2E7D32' }}>
                  Valid QR Code
                </h3>
                
                <p className="text-sm mb-6" style={{ color: '#616161' }}>
                  QR code verified successfully
                </p>

                <div 
                  className="text-left p-4 rounded-lg mb-6"
                  style={{ backgroundColor: '#F5F5F5' }}
                >
                  {formatQRDataForDisplay(scanResult).map((line, index) => (
                    <p key={index} className="text-sm py-1" style={{ color: '#212121' }}>
                      {line}
                    </p>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRetry}
                    className="flex-1 tap-target rounded-lg"
                    style={{ 
                      backgroundColor: '#F5F5F5',
                      color: '#616161'
                    }}
                  >
                    Scan Another
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 tap-target rounded-lg"
                    style={{ 
                      backgroundColor: '#2E7D32',
                      color: 'white'
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div 
                className="w-full max-w-md rounded-xl p-6 text-center"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <Camera className="w-12 h-12 mx-auto mb-4" style={{ color: '#9E9E9E' }} aria-hidden="true" />
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#212121' }}>
                  Camera Error
                </h3>
                <p className="text-sm mb-6" style={{ color: '#616161' }}>
                  {error}
                </p>
                
                {cameraPermission === 'denied' && (
                  <div 
                    className="p-3 rounded-lg mb-4 text-sm text-left"
                    style={{ backgroundColor: '#FFF3E0' }}
                  >
                    <p className="font-medium mb-1" style={{ color: '#E65100' }}>
                      How to enable camera:
                    </p>
                    <ol className="list-decimal list-inside space-y-1" style={{ color: '#616161' }}>
                      <li>Click the lock icon in your browser's address bar</li>
                      <li>Find "Camera" permissions</li>
                      <li>Change to "Allow"</li>
                      <li>Reload the page</li>
                    </ol>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleClose}
                    className="flex-1 tap-target rounded-lg"
                    style={{ 
                      backgroundColor: '#F5F5F5',
                      color: '#616161'
                    }}
                  >
                    Close
                  </Button>
                  {cameraPermission !== 'denied' && (
                    <Button
                      onClick={handleRetry}
                      className="flex-1 tap-target rounded-lg"
                      style={{ 
                        backgroundColor: '#2E7D32',
                        color: 'white'
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invalid QR Modal */}
      {showInvalidModal && invalidError && (
        <InvalidQRModal
          isOpen={showInvalidModal}
          onClose={() => {
            setShowInvalidModal(false);
            handleRetry();
          }}
          errorType={invalidError.type}
          errorMessage={invalidError.message}
        />
      )}
    </>
  );
};
