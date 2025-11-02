import React from 'react';

export const QRCodeGenerator = ({ data, value, size = 100 }) => {
  // Handle both legacy 'value' prop and new 'data' prop
  const qrValue = React.useMemo(() => {
    if (data) {
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
    return value || '';
  }, [data, value]);

  // Create a simple QR code-like pattern using CSS
  // In a real implementation, you would use a QR code library
  const pattern = React.useMemo(() => {
    if (!qrValue) {
      // Return empty pattern for empty value
      return Array(8).fill().map(() => Array(8).fill(false));
    }
    
    const hash = qrValue.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const grid = [];
    for (let i = 0; i < 8; i++) {
      const row = [];
      for (let j = 0; j < 8; j++) {
        const cellHash = (hash + i * 8 + j) % 100;
        row.push(cellHash > 40);
      }
      grid.push(row);
    }
    return grid;
  }, [qrValue]);

  return (
    <div className="inline-block bg-white p-2 rounded-lg border shadow-sm">
      <div 
        className="grid grid-cols-8 gap-0 border-2 border-black"
        style={{ 
          width: size, 
          height: size,
          gridTemplateRows: 'repeat(8, 1fr)'
        }}
      >
        {pattern.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={cell ? 'bg-black' : 'bg-white'}
            />
          ))
        )}
      </div>
      <p className="text-xs text-center mt-1 font-mono">{qrValue}</p>
    </div>
  );
};

export const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = React.useState(false);
  const [manualInput, setManualInput] = React.useState('');

  const handleManualScan = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Scan QR Code</h3>
        <p className="text-sm text-gray-600">Point your camera at the QR code or enter manually</p>
      </div>

      {/* Camera placeholder */}
      <div className="relative mb-6">
        <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {scanning ? (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-32 h-32 border-4 border-green-600 rounded-lg mx-auto mb-4"></div>
              </div>
              <p className="text-sm text-gray-600">Scanning for QR code...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <button
                onClick={() => setScanning(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start Camera
              </button>
            </div>
          )}
        </div>
        
        {/* Scan frame overlay */}
        {scanning && (
          <div className="absolute inset-4 border-2 border-green-600 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-600"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-600"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-600"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-600"></div>
          </div>
        )}
      </div>

      {/* Manual input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or enter QR code manually:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Enter QR code (e.g., KR1234567890)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={handleManualScan}
            disabled={!manualInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Scan
          </button>
        </div>
      </div>

      {/* Sample QR codes for demo */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Demo QR Codes:</p>
        <div className="flex flex-wrap gap-2">
          {['KR1727565123456', 'KR1727565123457', 'KR1727565123458'].map(code => (
            <button
              key={code}
              onClick={() => onScan(code)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border hover:bg-gray-200"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        {scanning && (
          <button
            onClick={() => setScanning(false)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};