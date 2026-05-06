import type { Metadata } from 'next';
import './styles.css';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'NHC User Management',
  description: 'Namma Health Card admin user management',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
