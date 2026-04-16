import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import LayoutWrapper from '@/components/Layout/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'InvestHub | Fintech Dashboard',
  description: 'Advanced investment and corporate analytics dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
