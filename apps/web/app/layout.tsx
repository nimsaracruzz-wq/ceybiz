import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp AI Sales SaaS — 24/7 AI Assistant',
  description: 'Multi-tenant WhatsApp AI Sales & Customer Service Assistant Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
