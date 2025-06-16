
'use client';

import React, { ReactNode } from 'react';
interface CompradorLayoutProps {
  children: ReactNode;
}

export default function CompradorLayout({ children }: CompradorLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
