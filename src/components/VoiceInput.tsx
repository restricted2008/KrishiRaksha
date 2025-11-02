import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
  className?: string;
  continuous?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  lang,
  className = '',
  continuous = false,
}) => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Get language code for speech recognition
  const getLanguageCode = () => {
    const currentLang = lang || i18n.language || 'en';
    // Map language codes to speech recognition language codes
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'pa': 'pa-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'ur': 'ur-IN',
      'as': 'as-IN',
    };
    return langMap[currentLang.split('-')[0]] || 'en-US';
  };

  // Initialize speech recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError(t('voice.notSupported'));
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode();

    // Handle results
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Call callback with final transcript
      if (finalTranscript) {
        onTranscript(finalTranscript);
        if (!continuous) {
          setIsListening(false);
        }
      }
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = t('voice.error');
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = t('voice.permissionDenied');
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `${t('voice.error')}: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      if (onError) {
        onError(errorMessage);
      }
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, lang, i18n.language, onTranscript, onError, t]);

  // Start/stop listening
  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current.lang = getLanguageCode();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Render unsupported state
  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          disabled
          className="tap-target p-2 rounded-lg opacity-50 cursor-not-allowed"
          style={{ backgroundColor: '#F5F5F5' }}
          aria-label={t('voice.notSupported')}
          title={t('voice.notSupported')}
        >
          <MicOff className="w-5 h-5" style={{ color: '#9E9E9E' }} aria-hidden="true" />
        </button>
        {error && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={toggleListening}
        aria-label={isListening ? t('voice.stopListening') : t('voice.startListening')}
        aria-pressed={isListening}
        className={`tap-target p-2 rounded-lg transition-all ${
          isListening ? 'animate-pulse' : ''
        }`}
        style={{
          backgroundColor: isListening ? '#E8F5E8' : '#F5F5F5',
          borderColor: isListening ? '#2E7D32' : 'transparent',
          borderWidth: '2px',
          minWidth: '44px',
          minHeight: '44px'
        }}
        title={isListening ? t('voice.stopListening') : t('voice.startListening')}
      >
        {isListening ? (
          <Mic className="w-5 h-5" style={{ color: '#2E7D32' }} aria-hidden="true" />
        ) : (
          <Mic className="w-5 h-5" style={{ color: '#616161' }} aria-hidden="true" />
        )}
      </button>
      
      {/* Status indicator */}
      {isListening && (
        <span 
          className="text-sm font-medium flex items-center gap-2" 
          style={{ color: '#2E7D32' }}
          role="status"
          aria-live="polite"
        >
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
          {t('voice.listening')}
        </span>
      )}
      
      {/* Error indicator */}
      {error && !isListening && (
        <span 
          className="text-xs flex items-center gap-1" 
          style={{ color: '#E65100' }}
          role="alert"
        >
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
};

export default VoiceInput;
