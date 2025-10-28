import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { useToast } from "./ui/toast";
import { validateRequired, validateNumber, validateDate } from "./utils/validation";
import { Sprout, Plus, Package, TrendingUp, LogOut, User, Calendar, Wifi, WifiOff, QrCode, IndianRupee, AlertCircle } from 'lucide-react';

// Mock batch data
const createBatch = (data) => ({
  id: `KR${Date.now()}`,
  qrCode: `KR${Date.now()}`,
  ...data,
  createdAt: new Date().toISOString(),
  status: 'Harvested',
  blockchainHash: `0x${Math.random().toString(36).substr(2, 9)}`,
});

export const FarmerDashboard = ({ user, onLogout }) => {
  const [batches, setBatches] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showQRCode, setShowQRCode] = useState(null);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();
  const [newBatch, setNewBatch] = useState({
    cropType: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    expectedPrice: '',
    organicCertified: false,
    description: ''
  });

  // Load saved batches and setup online/offline detection
  useEffect(() => {
    const savedBatches = localStorage.getItem('krishiraksha_farmer_batches');
    if (savedBatches) {
      setBatches(JSON.parse(savedBatches));
    }

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      showToast('info', 'Back online. Data will sync automatically.');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showToast('offline', 'You are offline. Data will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Save batches to localStorage
  const saveBatches = (newBatches) => {
    setBatches(newBatches);
    localStorage.setItem('krishiraksha_farmer_batches', JSON.stringify(newBatches));
  };

  const validateBatchForm = () => {
    const newErrors = {};
    
    const cropValidation = validateRequired(newBatch.cropType, 'Crop type');
    if (!cropValidation.isValid) newErrors.cropType = cropValidation.error;
    
    const quantityValidation = validateNumber(newBatch.quantity, 'Quantity', 0.1);
    if (!quantityValidation.isValid) newErrors.quantity = quantityValidation.error;
    
    const dateValidation = validateDate(newBatch.harvestDate, true); // Allow past dates for harvest
    if (!dateValidation.isValid) newErrors.harvestDate = dateValidation.error;
    
    if (newBatch.expectedPrice) {
      const priceValidation = validateNumber(newBatch.expectedPrice, 'Expected price', 0);
      if (!priceValidation.isValid) newErrors.expectedPrice = priceValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBatch = () => {
    if (!validateBatchForm()) {
      showToast('error', 'Please fix the errors in the form before submitting.');
      return;
    }

    const batch = createBatch(newBatch);
    const updatedBatches = [batch, ...batches];
    saveBatches(updatedBatches);
    
    // Show appropriate toast based on online status
    if (isOnline) {
      showToast('success', 'Batch created successfully and synced to blockchain!');
    } else {
      showToast('offline', 'Batch saved locally. Will sync when online.');
    }
    
    setNewBatch({
      cropType: '',
      variety: '',
      quantity: '',
      unit: 'kg', 
      harvestDate: '',
      expectedPrice: '',
      organicCertified: false,
      description: ''
    });
    setErrors({});
    setShowAddBatch(false);
  };

  const handleInputChange = useCallback((field, value) => {
    setNewBatch(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const isFormValid = () => {
    return newBatch.cropType && newBatch.quantity && newBatch.harvestDate && 
           Object.keys(errors).length === 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTotalValue = () => {
    return batches.reduce((sum, batch) => {
      return sum + (parseFloat(batch.expectedPrice) * parseFloat(batch.quantity) || 0);
    }, 0);
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <div 
      className="app-bar-height safe-area flex items-center justify-between px-4 shadow-sm"
      style={{ backgroundColor: '#2E7D32' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{user.name || 'Farmer'}</h3>
          <p className="text-xs text-white/80">{user.farmName || 'Farm'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-white/80" />
        ) : (
          <WifiOff className="w-5 h-5" style={{ color: '#F9A825' }} />
        )}
        <Button
          onClick={onLogout}
          className="tap-target p-2"
          style={{ backgroundColor: 'transparent' }}
        >
          <LogOut className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );

  // Stats Cards Component
  const StatsCards = () => (
    <div className="safe-area px-4 py-4 grid grid-cols-2 gap-3">
      <div 
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5" style={{ color: '#2E7D32' }} />
          <p className="caption" style={{ color: '#9E9E9E' }}>Total Batches</p>
        </div>
        <h2 className="font-semibold" style={{ color: '#212121' }}>{batches.length}</h2>
      </div>
      
      <div 
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee className="w-5 h-5" style={{ color: '#F9A825' }} />
          <p className="caption" style={{ color: '#9E9E9E' }}>Expected Value</p>
        </div>
        <h2 className="font-semibold" style={{ color: '#212121' }}>
          {formatPrice(getTotalValue())}
        </h2>
      </div>
    </div>
  );

  // Batch List Component
  const BatchList = () => (
    <div className="safe-area px-4 pb-20"> {/* Added bottom padding for FAB */}
      <div className="flex items-center justify-between mb-4">
        <h3>Recent Batches</h3>
      </div>

      {batches.length === 0 ? (
        <div 
          className="rounded-lg p-8 text-center"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#9E9E9E' }} />
          <h3 className="mb-2" style={{ color: '#212121' }}>No Batches Yet</h3>
          <p className="caption mb-4">Create your first crop batch to get started</p>
          <Button
            onClick={() => setShowAddBatch(true)}
            className="tap-target rounded-lg"
            style={{ backgroundColor: '#2E7D32', color: 'white' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Batch
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.slice(0, 5).map((batch) => (
            <div 
              key={batch.id}
              className="card-item rounded-lg p-4 shadow-sm"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium" style={{ color: '#212121' }}>
                      {batch.cropType}
                    </h4>
                    {batch.organicCertified && (
                      <div 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: '#E8F5E8', color: '#2E7D32' }}
                      >
                        Organic
                      </div>
                    )}
                  </div>
                  <p className="caption" style={{ color: '#9E9E9E' }}>
                    {batch.quantity} {batch.unit} • {formatPrice(batch.expectedPrice)}
                  </p>
                  <p className="caption" style={{ color: '#9E9E9E' }}>
                    {new Date(batch.harvestDate).toLocaleDateString()}
                  </p>
                </div>
                
                <Button
                  onClick={() => setShowQRCode(batch)}
                  className="tap-target p-2 rounded-lg"
                  style={{ backgroundColor: '#F5F5F5' }}
                >
                  <QrCode className="w-5 h-5" style={{ color: '#2E7D32' }} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Add Batch Form
  const AddBatchForm = () => (
    <div 
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div 
        className="w-full rounded-t-xl max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <div className="safe-area p-4">
          <div className="flex items-center justify-between mb-6">
            <h2>Add New Batch</h2>
            <Button
              onClick={() => setShowAddBatch(false)}
              className="tap-target p-2"
              style={{ backgroundColor: 'transparent' }}
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Crop Type *</Label>
              <Select value={newBatch.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
                <SelectTrigger 
                  className="tap-target rounded-lg"
                  style={useMemo(() => ({
                    borderColor: errors.cropType ? '#E65100' : '#E0E0E0'
                  }), [errors.cropType])}
                >
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Rice (चावल)</SelectItem>
                  <SelectItem value="wheat">Wheat (गेहूं)</SelectItem>
                  <SelectItem value="tomato">Tomato (टमाटर)</SelectItem>
                  <SelectItem value="potato">Potato (आलू)</SelectItem>
                  <SelectItem value="onion">Onion (प्याज)</SelectItem>
                  <SelectItem value="corn">Corn (मक्का)</SelectItem>
                </SelectContent>
              </Select>
              {errors.cropType && (
                <div className="flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.cropType}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block mb-2">Quantity *</Label>
                <Input
                  key="batch-quantity"
                  type="number"
                  value={newBatch.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="100"
                  className="tap-target rounded-lg"
                  style={useMemo(() => ({
                    borderColor: errors.quantity ? '#E65100' : '#E0E0E0'
                  }), [errors.quantity])}
                />
                {errors.quantity && (
                  <div className="flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
                    <p className="caption" style={{ color: '#E65100' }}>{errors.quantity}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="block mb-2">Unit</Label>
                <Select value={newBatch.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger className="tap-target rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="quintal">Quintal</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block mb-2">Harvest Date *</Label>
              <Input
                key="batch-harvest-date"
                type="date"
                value={newBatch.harvestDate}
                onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                className="tap-target rounded-lg"
                style={useMemo(() => ({
                  borderColor: errors.harvestDate ? '#E65100' : '#E0E0E0'
                }), [errors.harvestDate])}
              />
              {errors.harvestDate && (
                <div className="flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.harvestDate}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2">Expected Price (₹ per {newBatch.unit})</Label>
              <Input
                key="batch-expected-price"
                type="number"
                value={newBatch.expectedPrice}
                onChange={(e) => handleInputChange('expectedPrice', e.target.value)}
                placeholder="2500"
                className="tap-target rounded-lg"
                style={useMemo(() => ({
                  borderColor: errors.expectedPrice ? '#E65100' : '#E0E0E0'
                }), [errors.expectedPrice])}
              />
              {errors.expectedPrice && (
                <div className="flex items-start gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.expectedPrice}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-2">Additional Notes</Label>
              <Textarea
                key="batch-description"
                value={newBatch.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Any additional information about this batch..."
                className="rounded-lg h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAddBatch(false)}
                className="flex-1 tap-target rounded-lg"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0E0E0',
                  borderWidth: '1px',
                  color: '#9E9E9E'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBatch}
                disabled={!isFormValid()}
                className="flex-1 tap-target rounded-lg"
                style={{
                  backgroundColor: !isFormValid() ? '#9E9E9E' : '#2E7D32',
                  color: 'white'
                }}
              >
                Create Batch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // QR Code Modal
  const QRCodeModal = () => (
    showQRCode && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div 
          className="w-full max-w-sm rounded-xl p-6 text-center"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <h3 className="mb-4">QR Code</h3>
          <div className="mb-4">
            <QRCodeGenerator 
              data={JSON.stringify({
                batchId: showQRCode.id,
                cropType: showQRCode.cropType,
                farmer: user.name,
                harvestDate: showQRCode.harvestDate,
                location: user.location
              })}
              size={200}
            />
          </div>
          <p className="caption mb-4" style={{ color: '#9E9E9E' }}>
            Batch ID: {showQRCode.id}
          </p>
          <Button
            onClick={() => setShowQRCode(null)}
            className="w-full tap-target rounded-lg"
            style={{ backgroundColor: '#2E7D32', color: 'white' }}
          >
            Close
          </Button>
        </div>
      </div>
    )
  );

  // Floating Action Button
  const FloatingActionButton = () => (
    <Button
      onClick={() => setShowAddBatch(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-10"
      style={{
        backgroundColor: '#2E7D32',
        color: 'white',
        maxWidth: '360px',
        transform: 'translateX(-24px)' // Offset to account for mobile container
      }}
    >
      <Plus className="w-6 h-6" />
    </Button>
  );

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <MobileHeader />
      <StatsCards />
      <BatchList />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {showAddBatch && <AddBatchForm />}
      <QRCodeModal />
    </div>
  );
};