import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../components/ui/toast";
import { Truck, LogOut, Package, Clock, CheckCircle, AlertCircle, QrCode, Search, MapPin, Loader2 } from 'lucide-react';
import { useBlockchainTransaction } from '../hooks/useBlockchainTransaction';
import { BlockchainTransactionFeedback } from '../components/BlockchainTransactionFeedback';

// Mock shipment data
const mockShipments = [
  {
    id: 'SH001',
    batchId: 'KR1697123456',
    cropType: 'Tomato',
    quantity: '500 kg',
    farmer: 'राम कुमार',
    origin: 'Punjab',
    destination: 'Delhi Market',
    status: 'In Transit',
    pickupDate: '2024-01-17',
    expectedDelivery: '2024-01-18',
    currentLocation: 'Highway NH-1',
    temperature: '12°C',
    humidity: '65%'
  },
  {
    id: 'SH002', 
    batchId: 'KR1697123457',
    cropType: 'Wheat',
    quantity: '2000 kg',
    farmer: 'सुरेश पटेल',
    origin: 'Haryana',
    destination: 'Mumbai Port',
    status: 'Delivered',
    pickupDate: '2024-01-15',
    deliveryDate: '2024-01-16',
    currentLocation: 'Mumbai Port',
    temperature: '18°C',
    humidity: '45%'
  }
];

export const DistributorPanel = ({ user, onLogout }) => {
  const [shipments, setShipments] = useState(mockShipments);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showBlockchainFeedback, setShowBlockchainFeedback] = useState(false);
  const [currentAction, setCurrentAction] = useState<(() => Promise<string>) | null>(null);
  const { showToast } = useToast();
  
  const blockchainTx = useBlockchainTransaction({
    onSuccess: (txHash) => {
      showToast('success', 'Blockchain transaction confirmed!');
    },
    onError: (error) => {
      showToast('error', `Transaction failed: ${error.message}`);
    },
    requiredConfirmations: 3,
    maxRetries: 3
  });
  const [newShipment, setNewShipment] = useState({
    batchId: '',
    destination: '',
    expectedDelivery: '',
    vehicleId: '',
    driverName: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Picked Up': return '#F9A825';
      case 'In Transit': return '#039BE5';
      case 'Delivered': return '#2E7D32';
      case 'Delayed': return '#E65100';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Picked Up': return Clock;
      case 'In Transit': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Delayed': return AlertCircle;
      default: return Package;
    }
  };

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    // Show blockchain transaction feedback
    setShowBlockchainFeedback(true);
    
    // Create transaction function
    const transactionFn = async () => {
      // Simulate blockchain transaction
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          // 80% success rate for simulation
          if (Math.random() > 0.2) {
            const txHash = `0x${Math.random().toString(16).substring(2, 42)}`;
            
            // Update shipment after blockchain confirmation
            setShipments(prev => prev.map(shipment =>
              shipment.id === shipmentId 
                ? { 
                    ...shipment, 
                    status: newStatus, 
                    currentLocation: 'Updated via blockchain',
                    ...(newStatus === 'Delivered' && { deliveryDate: new Date().toISOString().split('T')[0] })
                  }
                : shipment
            ));
            
            resolve(txHash);
          } else {
            reject(new Error('Network error: Unable to connect to blockchain'));
          }
        }, 1500);
      });
    };
    
    setCurrentAction(() => transactionFn);
    await blockchainTx.executeTransaction(transactionFn);
  };
  
  const handleRetryTransaction = async () => {
    if (currentAction) {
      await blockchainTx.retry(currentAction);
    }
  };
  
  const handleCloseFeedback = () => {
    setShowBlockchainFeedback(false);
    blockchainTx.reset();
    setCurrentAction(null);
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile Header
  const MobileHeader = () => (
    <div 
      className="app-bar-height safe-area flex items-center justify-between px-4 shadow-sm"
      style={{ backgroundColor: '#F9A825' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{user.name || 'Distributor'}</h3>
          <p className="text-xs text-white/80">Logistics Management</p>
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

  // Stats Cards
  const StatsCards = () => {
    const activeShipments = shipments.filter(s => s.status === 'In Transit').length;
    const deliveredToday = shipments.filter(s => 
      s.status === 'Delivered' && 
      new Date(s.deliveryDate || s.expectedDelivery).toDateString() === new Date().toDateString()
    ).length;

    return (
      <div className="safe-area px-4 py-4 grid grid-cols-2 gap-3">
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5" style={{ color: '#F9A825' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Active Shipments</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>{activeShipments}</h2>
        </div>
        
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Delivered Today</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>{deliveredToday}</h2>
        </div>
      </div>
    );
  };

  // Search Bar
  const SearchBar = () => (
    <div className="safe-area px-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9E9E9E' }} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shipments..."
          className="tap-target rounded-lg pl-10"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E0E0'
          }), [])}
        />
      </div>
    </div>
  );

  // Shipment List
  const ShipmentList = () => (
    <div className="safe-area px-4">
      <div className="flex items-center justify-between mb-4">
        <h3>Shipments</h3>
        <Button
          onClick={() => setShowAddShipment(true)}
          className="tap-target rounded-lg text-sm"
          style={{ backgroundColor: '#F9A825', color: 'white' }}
        >
          Add Shipment
        </Button>
      </div>

      {filteredShipments.length === 0 ? (
        <div 
          className="rounded-lg p-8 text-center"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#9E9E9E' }} />
          <h3 className="mb-2">No Shipments Found</h3>
          <p className="caption">Try adjusting your search or add a new shipment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShipments.map((shipment) => {
            const StatusIcon = getStatusIcon(shipment.status);
            const statusColor = getStatusColor(shipment.status);
            
            return (
              <div 
                key={shipment.id}
                className="card-item rounded-lg p-4 shadow-sm cursor-pointer"
                style={{ backgroundColor: '#FFFFFF' }}
                onClick={() => setSelectedShipment(shipment)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium" style={{ color: '#212121' }}>
                        {shipment.cropType}
                      </h4>
                      <div 
                        className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {shipment.status}
                      </div>
                    </div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>
                      ID: {shipment.batchId} • {shipment.quantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>From</p>
                    <p style={{ color: '#212121' }}>{shipment.origin}</p>
                  </div>
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>To</p>
                    <p style={{ color: '#212121' }}>{shipment.destination}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #E0E0E0' }}>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" style={{ color: '#9E9E9E' }} />
                    <p className="caption" style={{ color: '#9E9E9E' }}>
                      {shipment.currentLocation}
                    </p>
                  </div>
                  
                  {shipment.status === 'In Transit' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(shipment.id, 'Delivered');
                        }}
                        disabled={blockchainTx.isLoading}
                        className="text-xs py-1 px-3 rounded flex items-center gap-1"
                        style={{ 
                          backgroundColor: blockchainTx.isLoading ? '#9E9E9E' : '#2E7D32', 
                          color: 'white' 
                        }}
                      >
                        {blockchainTx.isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        {blockchainTx.isLoading ? 'Processing...' : 'Mark Delivered'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Shipment Details Modal
  const ShipmentDetails = () => (
    selectedShipment && (
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
              <h2>Shipment Details</h2>
              <Button
                onClick={() => setSelectedShipment(null)}
                className="tap-target p-2"
                style={{ backgroundColor: 'transparent' }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div 
                className="rounded-lg p-4"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <h4 className="mb-3">Shipment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Batch ID</p>
                    <p style={{ color: '#212121' }}>{selectedShipment.batchId}</p>
                  </div>
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Crop Type</p>
                    <p style={{ color: '#212121' }}>{selectedShipment.cropType}</p>
                  </div>
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Quantity</p>
                    <p style={{ color: '#212121' }}>{selectedShipment.quantity}</p>
                  </div>
                  <div>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Farmer</p>
                    <p style={{ color: '#212121' }}>{selectedShipment.farmer}</p>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div 
                className="rounded-lg p-4"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <h4 className="mb-3">Route Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2E7D32' }}></div>
                    <div>
                      <p className="font-medium" style={{ color: '#212121' }}>{selectedShipment.origin}</p>
                      <p className="caption" style={{ color: '#9E9E9E' }}>Pickup: {new Date(selectedShipment.pickupDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="ml-1.5">
                    <div className="w-0.5 h-8" style={{ backgroundColor: '#E0E0E0' }}></div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F9A825' }}></div>
                    <div>
                      <p className="font-medium" style={{ color: '#212121' }}>{selectedShipment.currentLocation}</p>
                      <p className="caption" style={{ color: '#9E9E9E' }}>Current Location</p>
                    </div>
                  </div>
                  
                  <div className="ml-1.5">
                    <div className="w-0.5 h-8" style={{ backgroundColor: '#E0E0E0' }}></div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full border-2"
                      style={{ borderColor: '#9E9E9E' }}
                    ></div>
                    <div>
                      <p className="font-medium" style={{ color: '#212121' }}>{selectedShipment.destination}</p>
                      <p className="caption" style={{ color: '#9E9E9E' }}>
                        Expected: {new Date(selectedShipment.expectedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div 
                className="rounded-lg p-4"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <h4 className="mb-3">Transport Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Temperature</p>
                    <p className="font-semibold" style={{ color: '#212121' }}>{selectedShipment.temperature}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    <p className="caption" style={{ color: '#9E9E9E' }}>Humidity</p>
                    <p className="font-semibold" style={{ color: '#212121' }}>{selectedShipment.humidity}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedShipment.status === 'In Transit' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedShipment.id, 'Delayed');
                      setSelectedShipment(null);
                    }}
                    disabled={blockchainTx.isLoading}
                    className="tap-target rounded-lg flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: blockchainTx.isLoading ? '#9E9E9E' : '#E65100', 
                      color: 'white' 
                    }}
                  >
                    {blockchainTx.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {blockchainTx.isLoading ? 'Processing...' : 'Report Delay'}
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedShipment.id, 'Delivered');
                      setSelectedShipment(null);
                    }}
                    disabled={blockchainTx.isLoading}
                    className="tap-target rounded-lg flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: blockchainTx.isLoading ? '#9E9E9E' : '#2E7D32', 
                      color: 'white' 
                    }}
                  >
                    {blockchainTx.isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {blockchainTx.isLoading ? 'Processing...' : 'Mark Delivered'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <MobileHeader />
      <StatsCards />
      <SearchBar />
      <ShipmentList />
      
      <ShipmentDetails />
      
      {/* Blockchain Transaction Feedback Modal */}
      {showBlockchainFeedback && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blockchain-transaction-title"
        >
          <div 
            className="w-full max-w-md"
          >
            <BlockchainTransactionFeedback
              state={blockchainTx.state}
              onRetry={handleRetryTransaction}
              canRetry={blockchainTx.canRetry}
              retryCount={blockchainTx.retryCount}
              maxRetries={blockchainTx.maxRetries}
              onClose={handleCloseFeedback}
              showExplorerLink={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
