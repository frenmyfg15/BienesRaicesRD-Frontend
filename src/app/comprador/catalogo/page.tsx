import React, { Suspense } from 'react'
import Catalogo from '../components/Catalogo'

export default function page() {
  return (
    <Suspense fallback={<p>Cargando catálogo...</p>}>
      <Catalogo/>
    </Suspense>
  )
}
