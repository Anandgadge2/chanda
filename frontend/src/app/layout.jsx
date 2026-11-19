import './globals.css';
import PortalLayout from '../components/PortalLayout';
import { AuthProvider } from '../components/AuthContext';
import { LanguageProvider } from '../components/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export const metadata = {
  title: 'जिल्हाधिकारी कार्यालय, चंद्रपूर | Chandrapur District Land Governance & Revenue Portal',
  description:
    'महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत चंद्रपूर जिल्हा जमीन अभिलेख, १९५० मूळ शीर्षक साखळी, आदिवासी जमीन संरक्षण व अर्ध-न्यायिक सुनावणी पोर्टल.',
  other: {
    google: 'notranslate',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/images/chandrapur_seal.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col notranslate font-sans">
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <PortalLayout>{children}</PortalLayout>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
