import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Shield, LogOut, TrendingUp, AlertTriangle, Users, Package, BarChart3, MapPin, Calendar, Download } from 'lucide-react';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalBatches: 12547,
    activeFarmers: 2341,
    verifiedProducts: 11892,
    suspiciousActivity: 23
  },
  regions: [
    { name: 'Punjab', batches: 4521, farmers: 892, suspiciousActivity: 8 },
    { name: 'Haryana', batches: 3214, farmers: 567, suspiciousActivity: 5 },
    { name: 'Uttar Pradesh', batches: 2891, farmers: 445, suspiciousActivity: 7 },
    { name: 'Rajasthan', batches: 1921, farmers: 437, suspiciousActivity: 3 }
  ],
  crops: [
    { name: 'Rice', batches: 3547, value: 89234000 },
    { name: 'Wheat', batches: 2981, value: 78451000 },
    { name: 'Tomato', batches: 2034, value: 45678000 },
    { name: 'Potato', batches: 1876, value: 34567000 }
  ],
  alerts: [
    {
      id: 1,
      type: 'fraud',
      message: 'Duplicate QR codes detected in Haryana region',
      severity: 'high',
      timestamp: '2024-01-18T10:30:00Z',
      location: 'Haryana'
    },
    {
      id: 2,
      type: 'quality',
      message: 'Pesticide levels exceed limits in batch KR1697123458',
      severity: 'medium',
      timestamp: '2024-01-18T09:15:00Z',
      location: 'Punjab'
    },
    {
      id: 3,
      type: 'pricing',
      message: 'Unusual price variations in tomato market',
      severity: 'low',
      timestamp: '2024-01-18T08:45:00Z',
      location: 'Delhi'
    }
  ]
};

export const GovernmentDashboard = ({ user, onLogout }) => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#E65100';
      case 'medium': return '#F9A825';
      case 'low': return '#039BE5';
      default: return '#9E9E9E';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'fraud': return AlertTriangle;
      case 'quality': return Package;
      case 'pricing': return TrendingUp;
      default: return AlertTriangle;
    }
  };

  // Mobile Header
  const MobileHeader = () => (
    <div 
      className="app-bar-height safe-area flex items-center justify-between px-4 shadow-sm"
      style={{ backgroundColor: '#E65100' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Government Portal</h3>
          <p className="text-xs text-white/80">Agricultural Monitoring</p>
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

  // Filters
  const FiltersSection = () => (
    <div className="safe-area px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="tap-target rounded-lg">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="punjab">Punjab</SelectItem>
              <SelectItem value="haryana">Haryana</SelectItem>
              <SelectItem value="up">Uttar Pradesh</SelectItem>
              <SelectItem value="rajasthan">Rajasthan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="tap-target rounded-lg">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Overview Stats
  const OverviewStats = () => (
    <div className="safe-area px-4">
      <h3 className="mb-4">System Overview</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Total Batches</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>
            {mockAnalytics.overview.totalBatches.toLocaleString()}
          </h2>
        </div>
        
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" style={{ color: '#F9A825' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Active Farmers</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>
            {mockAnalytics.overview.activeFarmers.toLocaleString()}
          </h2>
        </div>
        
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" style={{ color: '#039BE5' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Verified Products</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>
            {mockAnalytics.overview.verifiedProducts.toLocaleString()}
          </h2>
        </div>
        
        <div 
          className="rounded-lg p-4 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#9E9E9E' }}>Alerts</p>
          </div>
          <h2 className="font-semibold" style={{ color: '#212121' }}>
            {mockAnalytics.overview.suspiciousActivity}
          </h2>
        </div>
      </div>

      {/* Regional Data */}
      <div 
        className="rounded-lg p-4 shadow-sm mb-6"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-4">Regional Breakdown</h4>
        <div className="space-y-3">
          {mockAnalytics.regions.map((region, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-medium" style={{ color: '#212121' }}>{region.name}</p>
                <p className="caption" style={{ color: '#9E9E9E' }}>
                  {region.batches.toLocaleString()} batches • {region.farmers.toLocaleString()} farmers
                </p>
              </div>
              <div className="text-right">
                {region.suspiciousActivity > 0 && (
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}
                  >
                    {region.suspiciousActivity} alerts
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Crops */}
      <div 
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4 className="mb-4">Top Crops by Volume</h4>
        <div className="space-y-3">
          {mockAnalytics.crops.map((crop, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium" style={{ color: '#212121' }}>{crop.name}</p>
                <p className="caption" style={{ color: '#9E9E9E' }}>
                  {crop.batches.toLocaleString()} batches
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium" style={{ color: '#2E7D32' }}>
                  {formatCurrency(crop.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Alerts Section
  const AlertsSection = () => (
    <div className="safe-area px-4">
      <div className="flex items-center justify-between mb-4">
        <h3>Recent Alerts</h3>
        <Button
          className="tap-target rounded-lg text-sm"
          style={{ backgroundColor: '#E65100', color: 'white' }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {mockAnalytics.alerts.length === 0 ? (
        <div 
          className="rounded-lg p-8 text-center"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#9E9E9E' }} />
          <h3 className="mb-2">No Active Alerts</h3>
          <p className="caption">All systems are operating normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockAnalytics.alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            const severityColor = getSeverityColor(alert.severity);
            
            return (
              <div 
                key={alert.id}
                className="rounded-lg p-4 shadow-sm"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${severityColor}20` }}
                  >
                    <AlertIcon className="w-5 h-5" style={{ color: severityColor }} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium" style={{ color: '#212121' }}>
                          {alert.message}
                        </p>
                      </div>
                      <div 
                        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: `${severityColor}20`, color: severityColor }}
                      >
                        {alert.severity.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 caption" style={{ color: '#9E9E9E' }}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #E0E0E0' }}>
                  <Button
                    className="tap-target rounded text-xs py-1 px-3"
                    style={{ backgroundColor: '#F5F5F5', color: '#9E9E9E' }}
                  >
                    View Details
                  </Button>
                  <Button
                    className="tap-target rounded text-xs py-1 px-3"
                    style={{ backgroundColor: '#2E7D32', color: 'white' }}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Bottom Tab Navigation
  const BottomTabs = () => (
    <div 
      className="fixed bottom-0 left-0 right-0 safe-area border-t"
      style={{ 
        backgroundColor: '#FFFFFF', 
        borderColor: '#E0E0E0',
        maxWidth: '360px',
        margin: '0 auto'
      }}
    >
      <div className="nav-height flex">
        <Button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 tap-target rounded-none flex flex-col items-center justify-center gap-1`}
          style={{
            backgroundColor: activeTab === 'overview' ? '#FFF3E0' : 'transparent',
            color: activeTab === 'overview' ? '#E65100' : '#9E9E9E'
          }}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">Overview</span>
        </Button>
        
        <Button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 tap-target rounded-none flex flex-col items-center justify-center gap-1`}
          style={{
            backgroundColor: activeTab === 'alerts' ? '#FFF3E0' : 'transparent',
            color: activeTab === 'alerts' ? '#E65100' : '#9E9E9E'
          }}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-xs">Alerts</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mobile-container min-h-screen pb-20" style={{ backgroundColor: '#FAFAFA' }}>
      <MobileHeader />
      <FiltersSection />
      
      {activeTab === 'overview' && <OverviewStats />}
      {activeTab === 'alerts' && <AlertsSection />}
      
      <BottomTabs />
    </div>
  );
};