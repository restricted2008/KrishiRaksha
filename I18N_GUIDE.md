# Internationalization (i18n) Implementation Guide

## Overview

Krishiraksha now supports **multi-language** localization with **Hindi (हिंदी)** and **English** initially, with the infrastructure ready to support **13 Indian languages**.

---

## 🌍 Supported Languages

### Currently Available
- **English** (en) 🇬🇧
- **Hindi** (हिंदी) 🇮🇳

### Ready to Add (Infrastructure in place)
- Punjabi (ਪੰਜਾਬੀ)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Odia (ଓଡ଼ିଆ)
- Urdu (اردو)
- Assamese (অসমীয়া)

---

## 📁 File Structure

```
src/
├── i18n/
│   └── config.ts           # i18n configuration & helpers
├── locales/
│   ├── en/
│   │   └── translations.json   # English translations
│   └── hi/
│       └── translations.json   # Hindi translations
├── components/
│   ├── LanguageSelector.tsx    # Language switcher component
│   └── VoiceInput.tsx          # Voice input with multi-language support
└── main.tsx                    # i18n initialization
```

---

## 🚀 Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('common.tagline')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### With Interpolation

```tsx
// Translation: "Batch ID: {{id}}"
<p>{t('qrCode.batchId', { id: batch.id })}</p>

// Translation: "Expected Price (₹ per {{unit}})"
<label>{t('batch.expectedPriceLabel', { unit: 'kg' })}</label>
```

---

## 🎨 Components

### LanguageSelector

A dropdown component for switching languages with live updates.

**Usage:**

```tsx
import LanguageSelector from './components/LanguageSelector';

// In your layout/header
<LanguageSelector showLabel={true} />

// Icon only (mobile-friendly)
<LanguageSelector showLabel={false} />
```

**Features:**
- ✅ Live language switching (no page reload)
- ✅ Shows current language
- ✅ Accessible (keyboard navigation, ARIA labels)
- ✅ Focus trap in modal
- ✅ ESC key to close

**Props:**
- `showLabel?: boolean` - Show language name next to icon (default: false)
- `className?: string` - Additional CSS classes

---

### VoiceInput

Voice input component using Web Speech API with graceful fallback for unsupported browsers.

**Usage:**

```tsx
import VoiceInput from './components/VoiceInput';

function MyForm() {
  const handleTranscript = (transcript: string) => {
    setFormData({ ...formData, email: transcript });
  };

  return (
    <div className="flex gap-2">
      <Input 
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <VoiceInput onTranscript={handleTranscript} />
    </div>
  );
}
```

**Features:**
- ✅ Multi-language support (automatically uses current language)
- ✅ Graceful fallback for unsupported browsers
- ✅ Visual feedback (listening animation)
- ✅ Error handling (permission denied, network errors, etc.)
- ✅ Accessible (ARIA labels, status announcements)

**Props:**
- `onTranscript: (text: string) => void` - Callback with recognized text
- `onError?: (error: string) => void` - Optional error callback
- `lang?: string` - Override language (defaults to current app language)
- `continuous?: boolean` - Continuous listening mode (default: false)
- `className?: string` - Additional CSS classes

**Language Support:**

| Language | Speech Recognition Code |
|----------|------------------------|
| English  | en-US |
| Hindi    | hi-IN |
| Punjabi  | pa-IN |
| Tamil    | ta-IN |
| Telugu   | te-IN |
| Bengali  | bn-IN |
| Marathi  | mr-IN |
| Gujarati | gu-IN |
| Kannada  | kn-IN |
| Malayalam| ml-IN |
| Odia     | or-IN |
| Urdu     | ur-IN |
| Assamese | as-IN |

---

## 📝 Translation Keys

Translations are organized by feature/page:

### Common
- `common.appName` - App name
- `common.tagline` - Tagline
- `common.loading` - Loading text
- `common.error`, `common.success`
- `common.cancel`, `common.submit`, `common.close`
- `common.online`, `common.offline`

### Login
- `login.title` - "Welcome Back"
- `login.subtitle` - "Sign in to continue"
- `login.email`, `login.password`
- `login.signIn`, `login.signingIn`
- `login.successMessage`, `login.errorMessage`
- `login.demoAccess`, `login.noAccount`, `login.registerHere`

### Dashboard
- `dashboard.farmer.title` - "Farmer Dashboard"
- `dashboard.farmer.totalBatches`, `dashboard.farmer.expectedValue`
- `dashboard.government.title` - "Government Portal"

### Batch
- `batch.addNew`, `batch.cropType`, `batch.quantity`
- `batch.harvestDate`, `batch.expectedPrice`
- `batch.createBatch`
- `batch.crops.rice`, `batch.crops.wheat`, etc.
- `batch.units.kg`, `batch.units.quintal`, etc.

### Voice
- `voice.startListening`, `voice.stopListening`
- `voice.listening`, `voice.notSupported`
- `voice.error`, `voice.permissionDenied`

### Language
- `language.selectLanguage`, `language.changeLanguage`
- `language.currentLanguage`, `language.english`, `language.hindi`

---

## 🔧 Configuration

### Adding a New Language

1. **Create translation file:**

```bash
# Create directory
mkdir src/locales/pa

# Create translations
# Copy src/locales/en/translations.json and translate
```

2. **Import in config:**

```typescript
// src/i18n/config.ts
import paTranslations from '../locales/pa/translations.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  pa: { translation: paTranslations }, // Add new language
};
```

3. **Add to SUPPORTED_LANGUAGES:**

```typescript
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }, // Uncomment
};
```

4. **Done!** The language will automatically appear in the LanguageSelector.

---

## 🎯 Best Practices

### 1. Always Use Translation Keys

❌ **Bad:**
```tsx
<h1>Welcome Back</h1>
```

✅ **Good:**
```tsx
<h1>{t('login.title')}</h1>
```

### 2. Use Interpolation for Dynamic Content

❌ **Bad:**
```tsx
<p>Batch ID: {batch.id}</p>
```

✅ **Good:**
```tsx
<p>{t('qrCode.batchId', { id: batch.id })}</p>
```

### 3. Organize Keys Logically

```json
{
  "feature": {
    "subFeature": {
      "key": "value"
    }
  }
}
```

### 4. Keep Translations Consistent

Use the same terminology across the app:
- "Batch" not "Lot" or "Group"
- "Harvest Date" consistently, not "Picking Date" elsewhere

### 5. Provide Context in Translation Files

```json
{
  "batch": {
    "status": {
      "harvested": "Harvested",       // Past tense - already harvested
      "inTransit": "In Transit",      // Currently being transported
      "delivered": "Delivered"         // Successfully delivered
    }
  }
}
```

---

## 🔄 Language Detection & Persistence

### Automatic Detection

The app automatically detects the user's language preference:

1. **localStorage** - Previously selected language
2. **Browser language** - User's browser/system language
3. **Default** - Falls back to English

### Manual Override

```typescript
import { changeLanguage } from './i18n/config';

// Change language programmatically
await changeLanguage('hi');
```

### Persistence

- Selected language is saved to `localStorage`
- Persists across sessions
- HTML `lang` attribute updated for accessibility

---

## ♿ Accessibility

### ARIA Labels

Always translate ARIA labels:

```tsx
<button aria-label={t('language.changeLanguage')}>
  <Globe />
</button>
```

### Screen Readers

Translations automatically work with screen readers when properly labeled:

```tsx
<div role="status" aria-live="polite">
  {t('voice.listening')}
</div>
```

### RTL Support

For RTL languages (Urdu), update config:

```typescript
// In i18n/config.ts
i18n.init({
  // ... other options
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
  },
});
```

---

## 🧪 Testing

### Test Language Switching

1. Open app
2. Click language selector (Globe icon)
3. Select Hindi (हिंदी)
4. Verify all text changes to Hindi
5. Refresh page - language should persist
6. Switch back to English

### Test Voice Input

**English:**
1. Click microphone icon
2. Allow microphone permission
3. Say "farmer at example dot com"
4. Verify text appears in input field

**Hindi:**
1. Switch language to Hindi
2. Click microphone icon
3. Say "किसान" (Kisaan)
4. Verify Hindi text appears

### Fallback Browsers

Test in browsers without Web Speech API support:
- Firefox (partial support)
- Safari (webkit prefix required)
- Older browsers

---

## 📊 Translation Coverage

| Feature | English | Hindi | Other Languages |
|---------|---------|-------|-----------------|
| Login | ✅ | ✅ | 📋 Ready to add |
| Register | ✅ | ✅ | 📋 Ready to add |
| Dashboard (Farmer) | ✅ | ✅ | 📋 Ready to add |
| Dashboard (Government) | ✅ | ✅ | 📋 Ready to add |
| Batch Management | ✅ | ✅ | 📋 Ready to add |
| QR Code | ✅ | ✅ | 📋 Ready to add |
| Validation Messages | ✅ | ✅ | 📋 Ready to add |
| Common UI | ✅ | ✅ | 📋 Ready to add |

---

## 🐛 Troubleshooting

### Translations Not Showing

**Check:**
1. Is `src/i18n/config` imported in `main.tsx`?
2. Is `useTranslation()` imported in component?
3. Are translation keys correct?
4. Check browser console for errors

**Fix:**
```tsx
// Ensure this is in main.tsx
import './i18n/config';

// In your component
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

### Language Not Switching

**Check:**
1. Is the language added to `SUPPORTED_LANGUAGES`?
2. Are translations imported in `resources`?
3. Check localStorage: `localStorage.getItem('i18nextLng')`

**Fix:**
```typescript
// Clear localStorage and reload
localStorage.removeItem('i18nextLng');
window.location.reload();
```

### Voice Input Not Working

**Check:**
1. Browser support: Chrome/Edge (best), Firefox (partial), Safari (webkit)
2. HTTPS required (or localhost for testing)
3. Microphone permission granted

**Fix:**
```javascript
// Check support
const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
console.log('Speech recognition supported:', isSupported);
```

---

## 🔗 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Speech Recognition Browser Support](https://caniuse.com/speech-recognition)

---

## 📋 Checklist for Adding i18n to a Component

- [ ] Import `useTranslation` hook
- [ ] Replace hardcoded strings with `t('key')`
- [ ] Add translation keys to both `en` and `hi` files
- [ ] Use interpolation for dynamic content
- [ ] Translate ARIA labels and placeholders
- [ ] Add LanguageSelector to header (if needed)
- [ ] Test in both English and Hindi
- [ ] Verify voice input works (if applicable)

---

## 🎉 Example Implementation

See `src/pages/LoginPageI18n.example.tsx` for a complete example of:
- Using `useTranslation` hook
- Integrating LanguageSelector
- Adding VoiceInput for forms
- Proper ARIA labeling
- Translation key usage

---

**Version:** 1.0  
**Last Updated:** 2025-02-01  
**Maintained By:** Development Team
