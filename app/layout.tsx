import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'OX Shoes — Enterprise MongoDB Atlas Database Layer',
  description: 'Enterprise-grade MongoDB Atlas & Mongoose architecture for OX Shoes Pakistan with strict TypeScript schemas, seeders, compound indexes, and live management console.',
  openGraph: {
    title: 'OX Shoes — Enterprise MongoDB Atlas Database Layer',
    description: 'Enterprise-grade MongoDB Atlas & Mongoose architecture for OX Shoes Pakistan with strict TypeScript schemas, seeders, compound indexes, and live management console.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OX Shoes — Enterprise MongoDB Atlas Database Layer',
    description: 'Enterprise-grade MongoDB Atlas & Mongoose architecture for OX Shoes Pakistan with strict TypeScript schemas, seeders, compound indexes, and live management console.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
