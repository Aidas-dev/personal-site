/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/context/themeContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../styles.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Aidas Kriščiūnas — Portfolio' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <RootDocument>
        <Header />
        <main className="min-h-[calc(100vh-theme(spacing.16))]">
          <Outlet />
        </main>
        <Footer />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
