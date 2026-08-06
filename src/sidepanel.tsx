import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import SidePanel from './components/SidePanel';
import './index.css';

// Import messages
import enMessages from './messages/en.json';
import esMessages from './messages/es.json';

const messages = {
  en: enMessages,
  es: esMessages
};

function App() {
  const [locale, setLocale] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['language', 'theme'], (result) => {
      if (result.language && (result.language === 'en' || result.language === 'es')) {
        setLocale(result.language);
      } else {
        const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
        setLocale(browserLang);
        chrome.storage.local.set({ language: browserLang });
      }

      if (result.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        if (!result.theme) {
          chrome.storage.local.set({ theme: 'dark' });
        }
      }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.language && changes.language.newValue) {
        setLocale(changes.language.newValue as string);
      }
      if (changes.theme && changes.theme.newValue) {
        if (changes.theme.newValue === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  if (!locale) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
      <SidePanel />
    </NextIntlClientProvider>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
