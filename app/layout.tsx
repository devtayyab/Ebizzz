import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "sonner";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package2, BarChart2, MessageSquare } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Price Management System',
  description: 'Manage and compare supplier prices effectively',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              <Link href="/products">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Package2 className="h-4 w-4" />
                  Products
                </Button>
              </Link>
              <Link href="/products/add">
                <Button variant="ghost" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
              <Link href="/ask">
                <Button variant="ghost" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask AI
                </Button>
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}