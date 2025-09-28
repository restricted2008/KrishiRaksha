import React, { useState, useEffect } from 'react';
import { FarmerDashboard } from "./components/FarmerDashboard";
import { DistributorPanel } from "./components/DistributorPanel";
import { ConsumerApp } from "./components/ConsumerApp";
import { GovernmentDashboard } from "./components/GovernmentDashboard";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ToastProvider } from "./components/ui/toast";

// Authentication context
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (role, userData) => {
    setUser(userData);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('krishiraksha_auth', JSON.stringify({ 
      user: userData, 
      role, 
      isAuthenticated: true 
    }));
  };

  const register = (role, userData) => {
    // Same as login for this demo
    login(role, userData);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('krishiraksha_auth');
  };

  useEffect(() => {
    const stored = localStorage.getItem('krishiraksha_auth');
    if (stored) {
      try {
        const { user: userData, role, isAuthenticated: authStatus } = JSON.parse(stored);
        if (authStatus) {
          setUser(userData);
          setUserRole(role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear invalid storage
        localStorage.removeItem('krishiraksha_auth');
      }
    }
  }, []);

  return { user, userRole, isAuthenticated, login, register, logout };
};



export default function App() {
  const { user, userRole, isAuthenticated, login, register, logout } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  const renderContent = () => {
    // If authenticated, render the appropriate dashboard
    if (isAuthenticated && user && userRole) {
      switch (userRole) {
        case 'farmer':
          return <FarmerDashboard user={user} onLogout={logout} />;
        case 'distributor':
          return <DistributorPanel user={user} onLogout={logout} />;
        case 'retailer':
          return <ConsumerApp user={user} onLogout={logout} />;
        case 'consumer':
          return <ConsumerApp user={user} onLogout={logout} />;
        case 'government':
          return <GovernmentDashboard user={user} onLogout={logout} />;
        default:
          return (
            <LoginPage 
              onLogin={login}
              onSwitchToRegister={() => setCurrentView('register')}
            />
          );
      }
    }

    // Show authentication pages
    if (currentView === 'register') {
      return (
        <RegisterPage
          onRegister={register}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      );
    }

    // Default to login page
    return (
      <LoginPage 
        onLogin={login}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  };

  return (
    <ToastProvider>
      {renderContent()}
    </ToastProvider>
  );
}