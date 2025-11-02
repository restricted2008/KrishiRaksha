import React, { useState } from 'react';
import { FarmerDashboard } from "./pages/FarmerRegistration";
import { DistributorPanel } from "./pages/SupplyChainUpdate";
import { ConsumerApp } from "./pages/ConsumerVerification";
import { GovernmentDashboard } from "./pages/GovernmentDashboard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ToastProvider } from "./components/ui/toast";
import ErrorBoundary from "./components/ErrorBoundary";
import PageErrorBoundary from "./components/PageErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const { user, userRole, isAuthenticated, login, register, logout } = useAuthStore();
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  const handleResetToLogin = () => {
    logout();
    setCurrentView('login');
  };

  const renderContent = () => {
    // If authenticated, render the appropriate dashboard
    if (isAuthenticated && user && userRole) {
      switch (userRole) {
        case 'farmer':
          return (
            <PageErrorBoundary pageName="Farmer Dashboard" onReset={handleResetToLogin}>
              <FarmerDashboard user={user} onLogout={logout} />
            </PageErrorBoundary>
          );
        case 'distributor':
          return (
            <PageErrorBoundary pageName="Supply Chain Update" onReset={handleResetToLogin}>
              <DistributorPanel user={user} onLogout={logout} />
            </PageErrorBoundary>
          );
        case 'retailer':
          return (
            <PageErrorBoundary pageName="Consumer Verification" onReset={handleResetToLogin}>
              <ConsumerApp user={user} onLogout={logout} />
            </PageErrorBoundary>
          );
        case 'consumer':
          return (
            <PageErrorBoundary pageName="Consumer Verification" onReset={handleResetToLogin}>
              <ConsumerApp user={user} onLogout={logout} />
            </PageErrorBoundary>
          );
        case 'government':
          return (
            <PageErrorBoundary pageName="Government Dashboard" onReset={handleResetToLogin}>
              <GovernmentDashboard user={user} onLogout={logout} />
            </PageErrorBoundary>
          );
        default:
          return (
            <PageErrorBoundary pageName="Login" onReset={() => setCurrentView('login')}>
              <LoginPage 
                onLogin={login}
                onSwitchToRegister={() => setCurrentView('register')}
              />
            </PageErrorBoundary>
          );
      }
    }

    // Show authentication pages
    if (currentView === 'register') {
      return (
        <PageErrorBoundary pageName="Registration" onReset={() => setCurrentView('login')}>
          <RegisterPage
            onRegister={register}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        </PageErrorBoundary>
      );
    }

    // Default to login page
    return (
      <PageErrorBoundary pageName="Login" onReset={() => setCurrentView('login')}>
        <LoginPage 
          onLogin={login}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      </PageErrorBoundary>
    );
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        {renderContent()}
        <OfflineIndicator showDetails={false} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
