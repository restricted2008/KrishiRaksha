# KrishiRaksha

A blockchain-based agricultural supply chain tracking system built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The development server will run on `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, dialogs, etc.)
│   ├── ErrorBoundary.tsx
│   └── ...
├── pages/              # Core application screens
│   ├── FarmerRegistration.tsx
│   ├── SupplyChainUpdate.tsx
│   ├── ConsumerVerification.tsx
│   ├── GovernmentDashboard.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── Onboarding.tsx
├── services/           # API and external service integrations
│   ├── api.ts         # Backend API calls
│   ├── blockchain.ts  # Blockchain/Web3 integration
│   └── qr.ts          # QR code generation and scanning
├── store/              # Global state management (Zustand)
│   ├── index.ts       # Main store with all slices
│   └── slices/        # Modular store slices
│       ├── userSlice.ts
│       ├── registrationSlice.ts
│       ├── languageSlice.ts
│       └── offlineSyncSlice.ts
├── utils/              # Helper functions and utilities
│   ├── validation.ts  # Form validation helpers
│   ├── formatting.ts  # Data formatting utilities
│   └── errorHandling.ts  # Error handling and logging
├── i18n/               # Internationalization
│   ├── index.ts       # i18n configuration
│   └── locales/       # Language files
│       ├── en.json    # English translations
│       └── hi.json    # Hindi translations
├── App.tsx             # Root component with routing
└── main.tsx            # Application entry point
```

## 🏗️ Architecture

### State Management

The application uses **Zustand** for global state management with persistent storage.

#### Store Structure

The store is organized into modular slices:

```typescript
src/store/
├── index.ts                    # Main store configuration
└── slices/
    ├── userSlice.ts           # User authentication & profile
    ├── registrationSlice.ts   # Registration form progress
    ├── languageSlice.ts       # i18n language state
    └── offlineSyncSlice.ts    # Offline sync queue
```

#### Store Slices

**User Slice** - Authentication and user profile management
```typescript
import { useUser } from './store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useUser();
  
  const handleLogin = async () => {
    await login('user@example.com', 'password');
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

**Registration Slice** - Multi-step form progress tracking
```typescript
import { useRegistration } from './store';

function RegistrationForm() {
  const { data, currentStep, nextStep, prevStep, updateData } = useRegistration();
  
  const handleNext = () => {
    updateData({ name: 'John Doe', email: 'john@example.com' });
    nextStep();
  };
  
  return (
    <div>
      <p>Step {currentStep + 1} of 3</p>
      {/* Form fields */}
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

**Language Slice** - Internationalization state
```typescript
import { useLanguage } from './store';

function LanguageSelector() {
  const { current, setLanguage, toggle } = useLanguage();
  
  return (
    <button onClick={toggle}>
      Current: {current === 'en' ? 'English' : 'हिंदी'}
    </button>
  );
}
```

**Offline Sync Slice** - Offline operation queue management
```typescript
import { useOfflineSync } from './store';

function OfflineIndicator() {
  const { isOnline, pendingCount, addOperation, startSync } = useOfflineSync();
  
  const handleOfflineAction = () => {
    addOperation({
      type: 'create',
      entity: 'batch',
      data: { name: 'New Batch' }
    });
  };
  
  return (
    <div>
      Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
      {pendingCount > 0 && (
        <span>{pendingCount} operations pending</span>
      )}
    </div>
  );
}
```

#### Persistence

The store automatically persists key state to `localStorage`:
- User authentication state
- Registration form progress
- Language preference
- Pending offline operations

```typescript
// Data is saved to localStorage under key: 'krishiraksha-store'
// Automatically restored on app reload
```

#### Direct Store Access

For non-React contexts or one-time reads:

```typescript
import { useAppStore } from './store';

// Get current state
const user = useAppStore.getState().user;

// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
  (state) => console.log('User changed:', state.user)
);

// Update state
useAppStore.getState().setUser({ id: '123', name: 'John' });
```

#### Testing the Store

```bash
# Run store tests
npm test -- store.test.ts
```

**Test Coverage:**
- User authentication flow
- Registration step navigation
- Language switching
- Offline sync queue management
- localStorage persistence

### Service Layer
- **API Service**: Handles all backend API communications
- **Blockchain Service**: Web3 integration for blockchain transactions
- **QR Service**: QR code generation, scanning, and verification

### Utilities
- **Validation**: Form validation with comprehensive error messages
- **Formatting**: Consistent data formatting (dates, currency, phone numbers)
- **Error Handling**: Centralized error management with user-friendly messages

### Internationalization
- Supports English and Hindi
- Uses `react-i18next` for translations
- Easy to add more languages by adding JSON files in `src/i18n/locales/`

### Error Boundaries
- React Error Boundaries implemented to catch and handle runtime errors gracefully
- Prevents entire app crashes and provides user-friendly error messages

## 🎯 Key Features

- **Multi-role Support**: Farmer, Distributor, Retailer, Consumer, Government
- **Blockchain Integration**: Transparent and immutable supply chain tracking
- **QR Code System**: Easy product verification and tracking
- **Multilingual**: English and Hindi support with easy extensibility
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Type-Safe**: Full TypeScript support for better developer experience

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📦 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: Radix UI + Custom components
- **Styling**: Tailwind CSS
- **Internationalization**: react-i18next
- **Form Handling**: react-hook-form
- **Icons**: Lucide React

## 🛠️ Development

### Project Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

### Adding a New Language

1. Create a new JSON file in `src/i18n/locales/` (e.g., `te.json` for Telugu)
2. Copy the structure from `en.json` and translate the values
3. Import and add it to `src/i18n/index.ts`

### Adding a New Service

1. Create a new file in `src/services/`
2. Define the service class and methods
3. Export a singleton instance
4. Import and use in components

## 📝 License

This project is part of the KrishiRaksha initiative.

## 🤝 Contributing

Contributions are welcome! Please ensure code quality and follow the existing patterns.
