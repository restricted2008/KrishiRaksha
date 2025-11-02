import React, { useRef } from 'react';
import { AlertTriangle, X, ShieldAlert, Clock, FileWarning, Shield } from 'lucide-react';
import { Button } from '../pages/ui/button';
import { useEscapeKey, useFocusTrap, useRestoreFocus } from '../hooks/useKeyboardNavigation';

interface InvalidQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'TAMPERED' | 'EXPIRED' | 'INVALID_FORMAT' | 'MISSING_SIGNATURE';
  errorMessage: string;
}

const ERROR_CONFIG = {
  TAMPERED: {
    icon: ShieldAlert,
    title: 'Security Warning',
    color: '#C62828',
    bgColor: '#FFEBEE',
    description: 'This QR code has been tampered with or modified. Do not proceed with this transaction.',
    recommendation: 'Request a new QR code from the farmer or verify the source.'
  },
  EXPIRED: {
    icon: Clock,
    title: 'QR Code Expired',
    color: '#F9A825',
    bgColor: '#FFF3E0',
    description: 'This QR code has exceeded its validity period (30 days).',
    recommendation: 'Request an updated QR code from the farmer.'
  },
  INVALID_FORMAT: {
    icon: FileWarning,
    title: 'Invalid QR Code',
    color: '#E65100',
    bgColor: '#FFF3E0',
    description: 'This QR code format is not recognized or is corrupted.',
    recommendation: 'Ensure you are scanning a valid Krishiraksha QR code.'
  },
  MISSING_SIGNATURE: {
    icon: Shield,
    title: 'Unsigned QR Code',
    color: '#C62828',
    bgColor: '#FFEBEE',
    description: 'This QR code is missing required security verification.',
    recommendation: 'This may be a counterfeit. Do not proceed with this transaction.'
  }
};

export const InvalidQRModal: React.FC<InvalidQRModalProps> = ({ 
  isOpen, 
  onClose, 
  errorType, 
  errorMessage 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = ERROR_CONFIG[errorType];
  const Icon = config.icon;

  useEscapeKey(onClose, isOpen);
  useFocusTrap(modalRef, isOpen);
  useRestoreFocus(isOpen);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="invalid-qr-title"
      aria-describedby="invalid-qr-description"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-xl shadow-2xl animate-scale-in"
        style={{ 
          backgroundColor: '#FFFFFF',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        {/* Header with Icon */}
        <div 
          className="flex flex-col items-center p-6 rounded-t-xl"
          style={{ backgroundColor: config.bgColor }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: config.color }}
          >
            <Icon className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h2 
            id="invalid-qr-title"
            className="text-xl font-bold text-center"
            style={{ color: config.color }}
          >
            {config.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div 
            id="invalid-qr-description"
            className="space-y-3"
          >
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{ 
                borderColor: config.color,
                backgroundColor: '#F5F5F5'
              }}
            >
              <p className="font-medium mb-2" style={{ color: '#212121' }}>
                {config.description}
              </p>
              <p className="text-sm" style={{ color: '#616161' }}>
                {errorMessage}
              </p>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle 
                  className="w-5 h-5 mt-0.5 flex-shrink-0" 
                  style={{ color: '#1976D2' }}
                  aria-hidden="true" 
                />
                <div>
                  <p className="font-medium mb-1" style={{ color: '#1976D2' }}>
                    Recommendation
                  </p>
                  <p className="text-sm" style={{ color: '#424242' }}>
                    {config.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          {(errorType === 'TAMPERED' || errorType === 'MISSING_SIGNATURE') && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: '#FFEBEE',
                border: `1px solid ${config.color}`
              }}
            >
              <p className="font-medium" style={{ color: config.color }}>
                ⚠️ Security Alert
              </p>
              <p className="mt-1" style={{ color: '#616161' }}>
                Report this incident if you suspect fraudulent activity.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              className="flex-1 tap-target rounded-lg"
              style={{ 
                backgroundColor: config.color,
                color: 'white',
                minHeight: '44px'
              }}
              aria-label="Close and return"
            >
              Understood
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 tap-target p-2 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" style={{ color: '#616161' }} aria-hidden="true" />
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
