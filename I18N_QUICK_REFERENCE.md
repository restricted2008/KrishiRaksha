# i18n Quick Reference Card

## 🚀 Quick Start (2 Minutes)

### 1. Use Translations in Component

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('common.appName')}</h1>;
}
```

### 2. Add Language Selector

```tsx
import LanguageSelector from './components/LanguageSelector';

<LanguageSelector showLabel={false} />
```

### 3. Add Voice Input (Optional)

```tsx
import VoiceInput from './components/VoiceInput';

<VoiceInput onTranscript={(text) => setValue(text)} />
```

---

## 📝 Common Translation Keys

| Key | English | Hindi |
|-----|---------|-------|
| `common.appName` | Krishiraksha | कृषिरक्षा |
| `common.submit` | Submit | जमा करें |
| `common.cancel` | Cancel | रद्द करें |
| `login.title` | Welcome Back | स्वागत है |
| `login.signIn` | Sign In | साइन इन करें |
| `dashboard.farmer.title` | Farmer Dashboard | किसान डैशबोर्ड |
| `batch.addNew` | Add New Batch | नया बैच जोड़ें |

**Full list:** See `src/locales/en/translations.json`

---

## 🎯 Usage Patterns

### Simple Text
```tsx
<h1>{t('login.title')}</h1>
```

### With Variables
```tsx
// Translation: "Batch ID: {{id}}"
<p>{t('qrCode.batchId', { id: '12345' })}</p>
```

### Placeholders
```tsx
<Input placeholder={t('login.emailPlaceholder')} />
```

### ARIA Labels
```tsx
<button aria-label={t('common.close')}>×</button>
```

---

## 🌐 Language Codes

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Active |
| Hindi | hi | ✅ Active |
| Punjabi | pa | 📋 Ready |
| Tamil | ta | 📋 Ready |
| Telugu | te | 📋 Ready |

---

## 🎤 Voice Input Example

```tsx
<div className="flex gap-2">
  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
  <VoiceInput onTranscript={setEmail} />
</div>
```

---

## 🔧 Helper Functions

```typescript
import { changeLanguage, getCurrentLanguageInfo } from './i18n/config';

// Change language
await changeLanguage('hi');

// Get current language info
const langInfo = getCurrentLanguageInfo();
// Returns: { name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' }
```

---

## 📁 File Locations

- **Config:** `src/i18n/config.ts`
- **Translations:** `src/locales/{en|hi}/translations.json`
- **Components:** `src/components/{LanguageSelector|VoiceInput}.tsx`
- **Example:** `src/pages/LoginPageI18n.example.tsx`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No translations | Import `src/i18n/config` in `main.tsx` |
| Not switching | Clear localStorage: `localStorage.removeItem('i18nextLng')` |
| Voice not working | Check browser support (Chrome/Edge best) |

---

## 📚 Documentation

- **Full Guide:** `I18N_GUIDE.md`
- **Summary:** `I18N_IMPLEMENTATION_SUMMARY.md`
- **This Card:** `I18N_QUICK_REFERENCE.md`

---

**Version:** 1.0 | **Last Updated:** 2025-02-01
