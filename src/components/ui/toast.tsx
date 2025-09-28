import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, Wifi, WifiOff } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'offline';
  message: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#E8F5E8',
          borderColor: '#2E7D32',
          color: '#2E7D32'
        };
      case 'error':
        return {
          backgroundColor: '#FFF3E0',
          borderColor: '#E65100',
          color: '#E65100'
        };
      case 'info':
        return {
          backgroundColor: '#E3F2FD',
          borderColor: '#039BE5',
          color: '#039BE5'
        };
      case 'offline':
        return {
          backgroundColor: '#FFF8E1',
          borderColor: '#F9A825',
          color: '#F9A825'
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          borderColor: '#9E9E9E',
          color: '#9E9E9E'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'offline':
        return <WifiOff className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mobile-container">
      <div 
        className="rounded-lg p-4 shadow-lg border flex items-center gap-3 animate-in slide-in-from-top duration-300"
        style={styles}
      >
        {getIcon()}
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="tap-target p-1 rounded hover:bg-black/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast context and hook
interface ToastContextType {
  showToast: (type: ToastProps['type'], message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastProps['type']; message: string; duration?: number }>>([]);

  const showToast = (type: ToastProps['type'], message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};