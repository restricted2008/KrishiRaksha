import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sprout, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';

// Mock user database
const mockUsers = [
  { 
    email: 'farmer@test.com', 
    password: 'password123', 
    role: 'farmer', 
    userData: { name: 'राम कुमार', farmName: 'Green Valley Farm', location: 'Punjab' }
  },
  { 
    email: 'distributor@test.com', 
    password: 'password123', 
    role: 'distributor', 
    userData: { name: 'Fresh Logistics', type: 'Distributor', location: 'Delhi' }
  },
  { 
    email: 'retailer@test.com', 
    password: 'password123', 
    role: 'retailer', 
    userData: { name: 'Fresh Mart', type: 'Retailer', location: 'Mumbai' }
  },
  { 
    email: 'consumer@test.com', 
    password: 'password123', 
    role: 'consumer', 
    userData: { name: 'Consumer User' }
  },
  // Government accounts are created separately, not via self-registration
  { 
    email: 'gov@admin.krishiraksha.in', 
    password: 'admin123ABC', 
    role: 'government', 
    userData: { name: 'Agricultural Department', role: 'Admin' }
  }
];

export const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ email: '', password: '', general: '' });
    
    // Validate inputs
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    
    const newErrors = {
      email: emailValidation.isValid ? '' : emailValidation.error || '',
      password: passwordValidation.isValid ? '' : passwordValidation.error || '',
      general: ''
    };
    
    setErrors(newErrors);
    
    // If validation fails, don't proceed
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      return;
    }
    
    setLoading(true);

    setTimeout(() => {
      const user = mockUsers.find(u => 
        u.email === formData.email && u.password === formData.password
      );

      if (user) {
        setLoginSuccess(true);
        setTimeout(() => {
          onLogin(user.role, user.userData);
        }, 1000);
      } else {
        setErrors(prev => ({ ...prev, general: 'Invalid email or password. Try demo accounts below.' }));
        setLoading(false);
      }
    }, 1000);
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        delete newErrors[field];
      }
      if (newErrors.general) {
        delete newErrors.general;
      }
      return newErrors;
    });
  }, []);

  const isFormValid = () => {
    return formData.email && formData.password && !errors.email && !errors.password;
  };

  const fillDemoCredentials = (userType) => {
    const demoUser = mockUsers.find(u => u.role === userType);
    if (demoUser) {
      setFormData({
        email: demoUser.email,
        password: demoUser.password
      });
    }
  };

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="safe-area-y safe-area text-center pt-12">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#2E7D32' }}
          role="img"
          aria-label="Krishiraksha logo"
        >
          <Sprout className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="mb-2" style={{ color: '#2E7D32' }}>Krishiraksha</h1>
        <p className="caption mb-8">Farm to Fork Transparency</p>
      </header>

      {/* Login Form */}
      <main className="safe-area px-4">
        <section 
          className="rounded-xl p-6 shadow-sm border"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E0E0'
          }}
          aria-labelledby="login-heading"
        >
          <div className="text-center mb-8">
            <h2 id="login-heading" className="mb-2">Welcome Back</h2>
            <p className="caption">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login form">
            <div>
              <Label htmlFor="email" className="block mb-2">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="tap-target w-full rounded-lg border px-4"
                style={useMemo(() => ({
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.email ? '#E65100' : '#E0E0E0',
                  minHeight: '48px'
                }), [errors.email])}
              />
              {errors.email && (
                <div className="flex items-start gap-2 mt-2" role="alert" id="email-error">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} aria-hidden="true" />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.email}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block mb-2">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="tap-target w-full rounded-lg border px-4 pr-12"
                  style={useMemo(() => ({
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.password ? '#E65100' : '#E0E0E0',
                    minHeight: '48px'
                  }), [errors.password])}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 tap-target flex items-center justify-center"
                  style={{ color: '#9E9E9E' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-start gap-2 mt-2" role="alert" id="password-error">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} aria-hidden="true" />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.password}</p>
                </div>
              )}
            </div>

            {errors.general && (
              <div 
                className="rounded-lg p-4 flex items-start gap-3"
                style={{ backgroundColor: '#FFF3E0', borderColor: '#E65100', borderWidth: '1px' }}
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#E65100' }} aria-hidden="true" />
                <p className="caption flex-1" style={{ color: '#E65100' }}>{errors.general}</p>
              </div>
            )}

            {loginSuccess && (
              <div 
                className="rounded-lg p-4 flex items-start gap-3"
                style={{ backgroundColor: '#E8F5E8', borderColor: '#2E7D32', borderWidth: '1px' }}
                role="status"
                aria-live="polite"
              >
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} aria-hidden="true" />
                <p className="caption flex-1" style={{ color: '#2E7D32' }}>Login successful! Redirecting...</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isFormValid() || loginSuccess}
              className="w-full tap-target rounded-lg font-medium flex items-center justify-center gap-2"
              style={{
                backgroundColor: (loading || !isFormValid() || loginSuccess) ? '#9E9E9E' : '#2E7D32',
                color: '#FFFFFF',
                minHeight: '48px'
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : loginSuccess ? 'Success!' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <section className="mt-8 pt-6" style={{ borderTop: '1px solid #E0E0E0' }} aria-label="Demo accounts">
            <p className="caption text-center mb-4">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'farmer', label: '👨‍🌾 Farmer', color: '#2E7D32' },
                { role: 'distributor', label: '🚛 Distributor', color: '#F9A825' },
                { role: 'retailer', label: '🏪 Retailer', color: '#039BE5' },
                { role: 'consumer', label: '🛒 Consumer', color: '#9E9E9E' }
              ].map(({ role, label, color }) => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => fillDemoCredentials(role)}
                  aria-label={`Fill demo credentials for ${label}`}
                  className="tap-target rounded-lg text-xs font-medium"
                  style={{
                    borderColor: color,
                    color: color,
                    minHeight: '40px'
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </section>

          {/* Register Link */}
          <nav className="text-center mt-6 pt-6" style={{ borderTop: '1px solid #E0E0E0' }} aria-label="Registration">
            <p className="caption">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-medium"
                style={{ color: '#2E7D32' }}
                aria-label="Switch to registration page"
              >
                Register here
              </button>
            </p>
          </nav>
        </section>
      </main>

      {/* Footer */}
      <footer className="safe-area text-center mt-8 pb-8">
        <p className="caption" style={{ color: '#2E7D32' }}>
          🌾 Secure • Transparent • Farmer-Friendly
        </p>
      </footer>
    </div>
  );
};