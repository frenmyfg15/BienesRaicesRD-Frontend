// app/vendedor/layout.tsx
'use client'; // Este layout debe ser un componente cliente porque usará el AuthContext y useRouter

import React, { ReactNode } from 'react';
interface VendedorLayoutProps {
  children: ReactNode;
}

export default function VendedorLayout({ children }: VendedorLayoutProps) {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
