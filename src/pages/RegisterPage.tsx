import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Sprout, Truck, ShoppingCart, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { validateEmail, validatePassword, validateConfirmPassword, validatePhone, validateRequired } from '../utils/validation';

const roleOptions = [
  {
    value: 'farmer',
    label: 'Farmer',
    icon: Sprout,
    description: 'Register crops, generate QR codes',
    color: '#2E7D32'
  },
  {
    value: 'distributor',
    label: 'Distributor', 
    icon: Truck,
    description: 'Update transport, verify batches',
    color: '#F9A825'
  },
  {
    value: 'retailer',
    label: 'Retailer',
    icon: ShoppingCart,
    description: 'Sell products, update inventory',
    color: '#039BE5'
  }
];

export const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
    organization: '',
    location: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
    location: '',
    phone: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateStep1 = () => {
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    const newErrors = {
      ...errors,
      email: emailValidation.isValid ? '' : emailValidation.error || '',
      password: passwordValidation.isValid ? '' : passwordValidation.error || '',
      confirmPassword: confirmPasswordValidation.isValid ? '' : confirmPasswordValidation.error || '',
      general: ''
    };
    
    setErrors(newErrors);
    
    return emailValidation.isValid && passwordValidation.isValid && confirmPasswordValidation.isValid;
  };

  const validateStep2 = () => {
    const roleValidation = validateRequired(formData.role, 'Role');
    
    const newErrors = {
      ...errors,
      role: roleValidation.isValid ? '' : roleValidation.error || '',
      general: ''
    };
    
    setErrors(newErrors);
    
    return roleValidation.isValid;
  };

  const validateStep3 = () => {
    const nameValidation = validateRequired(formData.name, 'Name');
    const locationValidation = validateRequired(formData.location, 'Location');
    const phoneValidation = formData.phone ? validatePhone(formData.phone) : { isValid: true };
    
    const newErrors = {
      ...errors,
      name: nameValidation.isValid ? '' : nameValidation.error || '',
      location: locationValidation.isValid ? '' : locationValidation.error || '',
      phone: phoneValidation.isValid ? '' : phoneValidation.error || '',
      general: ''
    };
    
    setErrors(newErrors);
    
    return nameValidation.isValid && locationValidation.isValid && phoneValidation.isValid;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    setTimeout(() => {
      setRegistrationSuccess(true);
      
      setTimeout(() => {
        const userData = {
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          location: formData.location,
          phone: formData.phone
        };

        if (formData.role === 'farmer') {
          userData.farmName = formData.organization || 'My Farm';
        } else if (formData.role === 'distributor') {
          userData.type = 'Distributor';
        } else if (formData.role === 'retailer') {
          userData.type = 'Retailer';
        }

        onRegister(formData.role, userData);
      }, 1000);
    }, 1500);
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

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword && 
               !errors.email && !errors.password && !errors.confirmPassword;
      case 2:
        return formData.role && !errors.role;
      case 3:
        return formData.name && formData.location && 
               !errors.name && !errors.location && !errors.phone;
      default:
        return false;
    }
  };

  const selectedRole = roleOptions.find(role => role.value === formData.role);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="email" className="block mb-2">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter your email"
          className="tap-target w-full rounded-lg border px-4"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: errors.email ? '#E65100' : '#E0E0E0',
            minHeight: '48px'
          }), [errors.email])}
        />
        {errors.email && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
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
            placeholder="Min 8 characters with letters & numbers"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 tap-target flex items-center justify-center"
            style={{ color: '#9E9E9E' }}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#E65100' }}>{errors.password}</p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="block mb-2">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm password"
            className="tap-target w-full rounded-lg border px-4 pr-12"
            style={useMemo(() => ({
              backgroundColor: '#FFFFFF',
              borderColor: errors.confirmPassword ? '#E65100' : '#E0E0E0',
              minHeight: '48px'
            }), [errors.confirmPassword])}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 tap-target flex items-center justify-center"
            style={{ color: '#9E9E9E' }}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#E65100' }}>{errors.confirmPassword}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="mb-2">Choose Your Role</h3>
        <p className="caption">Select how you'll use Krishiraksha</p>
      </div>

      <div className="space-y-3">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isSelected = formData.role === role.value;
          
          return (
            <div
              key={role.value}
              className={`card-item rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected ? 'shadow-md' : 'shadow-sm'
              }`}
              style={{
                backgroundColor: isSelected ? '#F5F5F5' : '#FFFFFF',
                borderColor: isSelected ? role.color : (errors.role ? '#E65100' : '#E0E0E0'),
                borderWidth: isSelected ? '2px' : '1px'
              }}
              onClick={() => handleInputChange('role', role.value)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${role.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: role.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium" style={{ color: role.color }}>{role.label}</h4>
                    {isSelected && <CheckCircle className="w-4 h-4" style={{ color: role.color }} />}
                  </div>
                  <p className="caption">{role.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {errors.role && (
        <div className="flex items-start gap-2 mt-4">
          <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
          <p className="caption" style={{ color: '#E65100' }}>{errors.role}</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="mb-2">Complete Profile</h3>
        <p className="caption">
          Set up your {selectedRole?.label.toLowerCase()} profile
        </p>
      </div>

      <div>
        <Label htmlFor="name" className="block mb-2">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          className="tap-target w-full rounded-lg border px-4"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: errors.name ? '#E65100' : '#E0E0E0',
            minHeight: '48px'
          }), [errors.name])}
        />
        {errors.name && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#E65100' }}>{errors.name}</p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="organization" className="block mb-2">
          {formData.role === 'farmer' ? 'Farm Name' : 
           formData.role === 'distributor' ? 'Company' :
           formData.role === 'retailer' ? 'Store Name' : 'Organization'}
        </Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => handleInputChange('organization', e.target.value)}
          placeholder={
            formData.role === 'farmer' ? 'e.g., Green Valley Farm' :
            formData.role === 'distributor' ? 'e.g., Fresh Logistics' :
            formData.role === 'retailer' ? 'e.g., Fresh Mart' :
            'Organization name'
          }
          className="tap-target w-full rounded-lg border px-4"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E0E0',
            minHeight: '48px'
          }), [])}
        />
      </div>

      <div>
        <Label htmlFor="location" className="block mb-2">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="City, State"
          className="tap-target w-full rounded-lg border px-4"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: errors.location ? '#E65100' : '#E0E0E0',
            minHeight: '48px'
          }), [errors.location])}
        />
        {errors.location && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#E65100' }}>{errors.location}</p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="block mb-2">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+91 98765 43210"
          className="tap-target w-full rounded-lg border px-4"
          style={useMemo(() => ({
            backgroundColor: '#FFFFFF',
            borderColor: errors.phone ? '#E65100' : '#E0E0E0',
            minHeight: '48px'
          }), [errors.phone])}
        />
        {errors.phone && (
          <div className="flex items-start gap-2 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#E65100' }} />
            <p className="caption" style={{ color: '#E65100' }}>{errors.phone}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mobile-container min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="safe-area-y safe-area text-center pt-8">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#2E7D32' }}
        >
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <h1 className="mb-1" style={{ color: '#2E7D32' }}>Join Krishiraksha</h1>
        <p className="caption mb-6">Create your account</p>
      </div>

      {/* Progress */}
      <div className="safe-area mb-6">
        <div className="flex items-center justify-between caption mb-2">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}%</span>
        </div>
        <Progress 
          value={(step / 3) * 100} 
          className="h-2 rounded-full"
          style={{ backgroundColor: '#E0E0E0' }}
        />
      </div>

      {/* Form */}
      <div className="safe-area px-4">
        <div 
          className="rounded-xl p-6 shadow-sm border"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E0E0'
          }}
        >
          <div className="text-center mb-6">
            <h2 className="mb-2">
              {step === 1 && 'Account Setup'}
              {step === 2 && 'Select Role'}
              {step === 3 && 'Profile Info'}
            </h2>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {registrationSuccess && (
            <div 
              className="rounded-lg p-4 flex items-start gap-3 mt-6"
              style={{ backgroundColor: '#E8F5E8', borderColor: '#2E7D32', borderWidth: '1px' }}
            >
              <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
              <p className="caption flex-1" style={{ color: '#2E7D32' }}>Registration successful! Redirecting...</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && !registrationSuccess && (
              <Button
                onClick={() => setStep(step - 1)}
                className="flex-1 tap-target rounded-lg font-medium"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0E0E0',
                  borderWidth: '1px',
                  color: '#2E7D32',
                  minHeight: '48px'
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={loading || !isStepValid() || registrationSuccess}
              className={`${step === 1 && !registrationSuccess ? 'w-full' : 'flex-1'} tap-target rounded-lg font-medium flex items-center justify-center gap-2`}
              style={{
                backgroundColor: (loading || !isStepValid() || registrationSuccess) ? '#9E9E9E' : '#2E7D32',
                color: '#FFFFFF',
                minHeight: '48px'
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 
               registrationSuccess ? 'Success!' :
               step === 3 ? 'Create Account' : 'Continue'}
            </Button>
          </div>

          {step === 1 && !registrationSuccess && (
            <div className="text-center mt-6 pt-6" style={{ borderTop: '1px solid #E0E0E0' }}>
              <p className="caption">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="font-medium"
                  style={{ color: '#2E7D32' }}
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};