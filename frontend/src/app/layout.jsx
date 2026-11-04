import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import PortalLayout from '../components/PortalLayout';
import { AuthProvider } from '../components/AuthContext';
import { LanguageProvider } from '../components/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-noto-devanagari',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#4169E1',
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
    <html lang="mr" translate="no" className={`${inter.variable} ${notoSansDevanagari.variable} notranslate`}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="bg-[#F8F7F3] text-[#252B36] antialiased min-h-screen flex flex-col notranslate font-sans text-[16px] sm:text-[16.5px] leading-relaxed selection:bg-[#4169E1]/20 selection:text-[#252B36]">
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
