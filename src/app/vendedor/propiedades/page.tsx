'use client'
import React, { useState } from 'react'
import CrearProyecto from '../components/CrearProyecto'
import CrearPropiedad from '../components/CrearPropiedad'

export default function CrearProductoPage() {
  const [producto, setProducto] = useState<'propiedad' | 'proyecto'>('propiedad')
  return (
    <main className='my-20 justify-center flex flex-col items-center'>
      <h1 className='text-2xl font-semibold'>Sube un producto</h1>
      <p className='mx-5 font-light text-xs text-center md:text-base md:font-medium'>Un proyecto podrá tener varios productos, por ejemplo un proyecto residencial con sus propiedades, y una propiedad independiente no tiene proyecto, puede ser un apartamente, un local, un solar, etc.</p>
      <div className='flex gap-10 m-10'>
        <button className={`border-1 p-3 rounded-2xl cursor-pointer hover:scale-110 transition ${producto === 'propiedad' ? 'bg-azul-marino text-white font-bold' : ''}`} onClick={()=>{setProducto('propiedad')}}>
          Propiedad
        </button>
        <button className={`border-1 p-3 rounded-2xl cursor-pointer hover:scale-110 transition ${producto === 'proyecto' ? 'bg-azul-marino text-white font-bold' : ''}`} onClick={()=>{setProducto('proyecto')}}>
          Proyecto
        </button>
      </div>

      {producto === 'proyecto' && 
        <CrearProyecto/>
      }
      {producto === 'propiedad' && 
        <CrearPropiedad/>
      }


        
    </main>
  )
}
