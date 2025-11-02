// Example of LoginPage with i18n translations
// To use: Copy relevant sections to your actual LoginPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Add this import
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sprout, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';
import LanguageSelector from '../components/LanguageSelector'; // Add this import
import VoiceInput from '../components/VoiceInput'; // Add this import (optional)

export const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const { t } = useTranslation(); // Add this hook
  
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

  // ... rest of your logic ...

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Add Language Selector at the top */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector showLabel={false} />
      </div>

      {/* Header */}
      <header className="safe-area-y safe-area text-center pt-12">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#2E7D32' }}
          role="img"
          aria-label={t('common.appName')}
        >
          <Sprout className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="mb-2" style={{ color: '#2E7D32' }}>{t('common.appName')}</h1>
        <p className="caption mb-8">{t('common.tagline')}</p>
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
            <h2 id="login-heading" className="mb-2">{t('login.title')}</h2>
            <p className="caption">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" aria-label={t('login.title')}>
            <div>
              <Label htmlFor="email" className="block mb-2">{t('login.email')}</Label>
              
              {/* Optional: Add voice input for email */}
              <div className="flex gap-2 items-start">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  required
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="tap-target w-full rounded-lg border px-4 flex-1"
                  style={useMemo(() => ({
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.email ? '#E65100' : '#E0E0E0',
                    minHeight: '48px'
                  }), [errors.email])}
                />
                
                {/* Voice Input for email (optional) */}
                <VoiceInput
                  onTranscript={(transcript) => {
                    handleInputChange('email', transcript.trim());
                  }}
                />
              </div>
              
              {errors.email && (
                <div className="flex items-start gap-2 mt-2" role="alert" id="email-error">
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} aria-hidden="true" />
                  <p className="caption" style={{ color: '#E65100' }}>{errors.email}</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block mb-2">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
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
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
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
                <p className="caption flex-1" style={{ color: '#E65100' }}>{t('login.errorMessage')}</p>
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
                <p className="caption flex-1" style={{ color: '#2E7D32' }}>{t('login.successMessage')}</p>
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
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {loading ? t('login.signingIn') : loginSuccess ? t('common.success') : t('login.signIn')}
            </Button>
          </form>

          {/* Demo Accounts */}
          <section className="mt-8 pt-6" style={{ borderTop: '1px solid #E0E0E0' }} aria-label={t('login.demoAccess')}>
            <p className="caption text-center mb-4">{t('login.demoAccess')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'farmer', label: t('roles.farmer'), color: '#2E7D32' },
                { role: 'distributor', label: t('roles.distributor'), color: '#F9A825' },
                { role: 'retailer', label: t('roles.retailer'), color: '#039BE5' },
                { role: 'consumer', label: t('roles.consumer'), color: '#9E9E9E' }
              ].map(({ role, label, color }) => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => fillDemoCredentials(role)}
                  aria-label={`${t('login.demoAccess')} ${label}`}
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
          <nav className="text-center mt-6 pt-6" style={{ borderTop: '1px solid #E0E0E0' }} aria-label={t('register.title')}>
            <p className="caption">
              {t('login.noAccount')}{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-medium"
                style={{ color: '#2E7D32' }}
                aria-label={t('login.registerHere')}
              >
                {t('login.registerHere')}
              </button>
            </p>
          </nav>
        </section>
      </main>

      {/* Footer */}
      <footer className="safe-area text-center mt-8 pb-8">
        <p className="caption" style={{ color: '#2E7D32' }}>
          {t('login.footer')}
        </p>
      </footer>
    </div>
  );
};
