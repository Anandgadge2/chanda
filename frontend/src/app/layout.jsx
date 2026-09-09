import './globals.css';
import PortalLayout from '../components/PortalLayout';

export const metadata = {
  title: 'जिल्हाधिकारी कार्यालय, चंद्रपूर | Chandrapur District Land Governance & Revenue Portal',
  description:
    'महाराष्ट्र जमीन महसूल संहिता (MLRC) १९६६ अंतर्गत चंद्रपूर जिल्हा जमीन अभिलेख, १९५० मूळ शीर्षक साखळी, आदिवासी जमीन संरक्षण व अर्ध-न्यायिक सुनावणी पोर्टल.',
  icons: {
    icon: [
      { url: '/images/chandrapur_seal.png', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/images/chandrapur_seal.png',
    apple: '/images/chandrapur_seal.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
