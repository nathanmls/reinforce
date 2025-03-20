'use client';

import Link from 'next/link';
import { useState } from 'react';
import WaitlistModal from '../WaitlistModal';


export default function ComingSoonSection() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  return (
    <div id='coming-soon' className="bg-white relative isolate flex items-center h-screen px-6 pt-14 lg:px-8">
      <div className="mx-auto flex flex-col w-full max-w-7xl items-start">
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl font-bold tracking-tight text-black uppercase sm:text-4xl">
            Vem por Aí Novas Atualizações
          </h2>
          <p className="mt-6 text-lg leading-8 text-black">
            Prepare-se para mais inovações:
          </p>
        </div>
        <div className="mt-6 max-w-2xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-1">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black">
                <div className="h-12 w-12 rounded-full bg-indigo-400 flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/vr-headset.png"
                    alt="VR Headset"
                    className="h-8 w-8 object-cover"
                  />
                </div>
                Mentoria em Realidade Virtual
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-black">
                <p className="flex-auto">Para uma experiência totalmente imersiva.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black">
                <div className="h-12 w-12 rounded-full bg-indigo-400 flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/community.png"
                    alt="Community"
                    className="h-8 w-8 object-cover"
                  />
                </div>
                Mentoria em Grupo
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-black">
                <p className="flex-auto">Para aprendizado colaborativo.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-black">
                <div className="h-12 w-12 rounded-full bg-indigo-400 flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/mobile-app.png"
                    alt="Mobile App"
                    className="h-8 w-8 object-cover"
                  />
                </div>
                App no Meta Quest
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-black">
                <p className="flex-auto">Para acesso ainda mais fácil.</p>
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Entre na Lista de Espera
            </button>
            <Link href="/about" className="text-sm font-semibold leading-6 text-black">
              Saiba mais <span aria-hidden="true">→</span>
            </Link>
        </div>
      </div>
      <WaitlistModal isOpen={isWaitlistOpen} setIsOpen={setIsWaitlistOpen} />
    </div>
  );
}
