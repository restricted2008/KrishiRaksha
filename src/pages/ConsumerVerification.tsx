import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CameraModal } from "../components/CameraModal";
import { QrCode, Search, ShoppingCart, LogOut, MapPin, Calendar, User, CheckCircle, Truck, Store } from 'lucide-react';
import { useBlockchainTransaction } from '../hooks/useBlockchainTransaction';
import { BlockchainTransactionFeedback } from '../components/BlockchainTransactionFeedback';

// Mock product data
const mockProducts = [
  {
    id: 'KR1697123456',
    cropType: 'Tomato',
    variety: 'Organic Roma',
    farmer: 'राम कुमार',
    farmName: 'Green Valley Farm',
    location: 'Punjab, India',
    harvestDate: '2024-01-15',
    status: 'In Store',
    organicCertified: true,
    journey: [
      { stage: 'Harvested', date: '2024-01-15', location: 'Punjab Farm', actor: 'राम कुमार' },
      { stage: 'Packaged', date: '2024-01-16', location: 'Punjab Facility', actor: 'राम कुमार' },
      { stage: 'Shipped', date: '2024-01-17', location: 'Transport Hub', actor: 'Fresh Logistics' },
      { stage: 'In Store', date: '2024-01-18', location: 'Delhi Market', actor: 'Fresh Mart' }
    ],
    quality: {
      pesticidesUsed: 'None (Organic)',
      fertilizer: 'Organic Compost',
      certifications: ['Organic India', 'Fair Trade']
    },
    price: {
      farmGate: 45,
      wholesale: 55,
      retail: 65
    }
  }
];

export const ConsumerApp = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');
  const [showBlockchainFeedback, setShowBlockchainFeedback] = useState(false);
  const [verificationAction, setVerificationAction] = useState<(() => Promise<string>) | null>(null);
  
  // Determine if this is a retailer or consumer view
  const isRetailer = user?.type === 'Retailer' || user?.role === 'retailer';
  
  const blockchainTx = useBlockchainTransaction({
    onSuccess: (txHash) => {
      console.log('Verification recorded on blockchain:', txHash);
    },
    onError: (error) => {
      console.error('Blockchain verification failed:', error.message);
    },
    requiredConfirmations: 2,
    maxRetries: 3
  });

  const handleScan = async (qrData) => {
    // Show blockchain verification feedback
    setShowBlockchainFeedback(true);
    
    // Create blockchain verification transaction
    const verifyTransaction = async () => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          // 85% success rate for simulation
          if (Math.random() > 0.15) {
            const txHash = `0x${Math.random().toString(16).substring(2, 42)}`;
            
            // Set product after blockchain verification
            const product = mockProducts[0];
            setScannedProduct(product);
            setShowScanner(false);
            
            resolve(txHash);
          } else {
            reject(new Error('Blockchain verification failed: Network timeout'));
          }
        }, 1000);
      });
    };
    
    setVerificationAction(() => verifyTransaction);
    await blockchainTx.executeTransaction(verifyTransaction);
  };
  
  const handleRetryVerification = async () => {
    if (verificationAction) {
      await blockchainTx.retry(verificationAction);
    }
  };
  
  const handleCloseVerification = () => {
    setShowBlockchainFeedback(false);
    blockchainTx.reset();
    setVerificationAction(null);
  };

  const simulateScan = () => {
    handleScan('KR1697123456');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Harvested': return '#2E7D32';
      case 'Packaged': return '#F9A825';
      case 'Shipped': return '#039BE5';
      case 'In Store': return '#2E7D32';
      default: return '#9E9E9E';
    }
  };

  // Mobile Header
  const MobileHeader = () => (
    <div 
      className="app-bar-height safe-area flex items-center justify-between px-4 shadow-sm"
      style={{ backgroundColor: '#039BE5' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{isRetailer ? 'Retailer Portal' : 'Consumer App'}</h3>
          <p className="text-xs text-white/80">{isRetailer ? 'Verify & sell products' : 'Track your food journey'}</p>
        </div>
      </div>
      
      <Button
        onClick={onLogout}
        className="tap-target p-2"
        style={{ backgroundColor: 'transparent' }}
      >
        <LogOut className="w-5 h-5 text-white" />
      </Button>
    </div>
  );

  // QR Scanner Section
  const ScannerSection = () => (
    <div className="safe-area px-4 py-6">
      <div className="text-center mb-8">
        <h2 className="mb-2" style={{ color: '#212121' }}>Scan Product QR Code</h2>
        <p className="caption" style={{ color: '#9E9E9E' }}>
          Discover the complete journey of your food
        </p>
      </div>

      <div 
        className="rounded-xl p-8 text-center mb-6 border-2 border-dashed"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#039BE5'
        }}
      >
        <QrCode className="w-16 h-16 mx-auto mb-4" style={{ color: '#039BE5' }} />
        <h3 className="mb-2" style={{ color: '#212121' }}>Ready to Scan</h3>
        <p className="caption mb-6" style={{ color: '#9E9E9E' }}>
          Point your camera at the QR code on the product
        </p>
        
        {/* Scan Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowScanner(true)}
            className="w-full tap-target rounded-lg font-medium"
            style={{ backgroundColor: '#039BE5', color: 'white' }}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Open Camera Scanner
          </Button>
          
          <Button
            onClick={simulateScan}
            className="w-full tap-target rounded-lg font-medium"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: '#039BE5',
              borderWidth: '1px',
              color: '#039BE5'
            }}
          >
            Demo Scan (No Camera)
          </Button>
        </div>
      </div>

      {/* Manual Search */}
      <div 
        className="rounded-lg p-4"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-3" style={{ color: '#212121' }}>Or Search Manually</h4>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter batch ID (e.g., KR1697123456)"
            className="flex-1 tap-target rounded-lg"
          />
          <Button
            onClick={() => handleScan(searchQuery)}
            disabled={!searchQuery}
            className="tap-target rounded-lg"
            style={{ 
              backgroundColor: !searchQuery ? '#9E9E9E' : '#039BE5',
              color: 'white'
            }}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Product Details
  const ProductDetails = ({ product }) => (
    <div className="safe-area px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2>Product Details</h2>
        <Button
          onClick={() => setScannedProduct(null)}
          className="tap-target rounded-lg"
          style={{ backgroundColor: '#F5F5F5', color: '#9E9E9E' }}
        >
          New Scan
        </Button>
      </div>

      {/* Product Info Card */}
      <div 
        className="rounded-lg p-4 mb-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="mb-1" style={{ color: '#212121' }}>{product.cropType}</h3>
            <p className="caption" style={{ color: '#9E9E9E' }}>{product.variety}</p>
          </div>
          {product.organicCertified && (
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#E8F5E8', color: '#2E7D32' }}
            >
              🌿 Organic
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#9E9E9E' }} />
            <div>
              <p className="caption" style={{ color: '#9E9E9E' }}>Farmer</p>
              <p className="text-sm font-medium" style={{ color: '#212121' }}>{product.farmer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: '#9E9E9E' }} />
            <div>
              <p className="caption" style={{ color: '#9E9E9E' }}>Harvested</p>
              <p className="text-sm font-medium" style={{ color: '#212121' }}>
                {new Date(product.harvestDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: '#9E9E9E' }} />
          <p className="text-sm" style={{ color: '#212121' }}>{product.location}</p>
        </div>
      </div>

      {/* Price Transparency */}
      <div 
        className="rounded-lg p-4 mb-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-3" style={{ color: '#212121' }}>Price Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#9E9E9E' }}>Farm Gate Price</span>
            <span className="font-medium" style={{ color: '#2E7D32' }}>
              {formatPrice(product.price.farmGate)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#9E9E9E' }}>Wholesale Price</span>
            <span className="font-medium" style={{ color: '#F9A825' }}>
              {formatPrice(product.price.wholesale)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#9E9E9E' }}>Retail Price</span>
            <span className="font-medium" style={{ color: '#212121' }}>
              {formatPrice(product.price.retail)}
            </span>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div 
        className="rounded-lg p-4 mb-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-4" style={{ color: '#212121' }}>Journey Timeline</h4>
        <div className="space-y-4">
          {product.journey.map((step, index) => {
            const isLast = index === product.journey.length - 1;
            const stepColor = getStatusColor(step.stage);
            
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stepColor }}
                  />
                  {!isLast && (
                    <div 
                      className="w-0.5 h-6 mt-1"
                      style={{ backgroundColor: '#E0E0E0' }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium" style={{ color: '#212121' }}>{step.stage}</h5>
                    {step.stage === product.status && (
                      <CheckCircle className="w-4 h-4" style={{ color: stepColor }} />
                    )}
                  </div>
                  <p className="caption" style={{ color: '#9E9E9E' }}>
                    {new Date(step.date).toLocaleDateString()} • {step.location}
                  </p>
                  <p className="caption" style={{ color: '#9E9E9E' }}>
                    By: {step.actor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality Info */}
      <div 
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-3" style={{ color: '#212121' }}>Quality Information</h4>
        <div className="space-y-3">
          <div>
            <p className="caption" style={{ color: '#9E9E9E' }}>Pesticides Used</p>
            <p className="text-sm font-medium" style={{ color: '#212121' }}>
              {product.quality.pesticidesUsed}
            </p>
          </div>
          <div>
            <p className="caption" style={{ color: '#9E9E9E' }}>Fertilizer</p>
            <p className="text-sm font-medium" style={{ color: '#212121' }}>
              {product.quality.fertilizer}
            </p>
          </div>
          <div>
            <p className="caption" style={{ color: '#9E9E9E' }}>Certifications</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {product.quality.certifications.map((cert, index) => (
                <div 
                  key={index}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: '#E3F2FD', color: '#039BE5' }}
                >
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <MobileHeader />
      
      {scannedProduct ? (
        <ProductDetails product={scannedProduct} />
      ) : (
        <ScannerSection />
      )}
      
      {/* Camera Modal */}
      <CameraModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={handleScan}
      />
      
      {/* Blockchain Verification Feedback Modal */}
      {showBlockchainFeedback && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blockchain-verification-title"
        >
          <div className="w-full max-w-md">
            <BlockchainTransactionFeedback
              state={blockchainTx.state}
              onRetry={handleRetryVerification}
              canRetry={blockchainTx.canRetry}
              retryCount={blockchainTx.retryCount}
              maxRetries={blockchainTx.maxRetries}
              onClose={handleCloseVerification}
              showExplorerLink={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
