'use client';

import Link from 'next/link';

export default function AboutUsSection() {
  return (
    <div id='about' className="bg-gray-900 flex items-center h-screen bg-opacity-1 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Conheça a Reinforce
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Dúvidas? Precisa de suporte extra?
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Conecte-se com um Professor Online a qualquer momento e obtenha respostas imediatas para seus desafios.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/waitlist"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Entre na Lista de Espera
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
