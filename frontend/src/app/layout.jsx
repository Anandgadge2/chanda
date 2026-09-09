import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Chandrapur Land Intelligence & Governance Portal | जिल्हाधिकारी कार्यालय, चंद्रपूर',
  description:
    'Maharashtra Land Revenue Code (MLRC) 1966 - Automated Village Excel Ingestion, Backward 1950 Title Linkage, Forward Quasi-Judicial Enforcement, and Prapatra-3 Compliance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-6 flex gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
