'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function CTASection() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to join waitlist
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <div id='cta' className="relative pointer-events-auto py-12 bg-[#5A1A8A]">
      {/* Decorative top wave */}
      <div className="absolute -top-1 left-0 right-0 overflow-hidden w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto transform rotate-180">
          <path fill="#F2B035" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 mt-16">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#B3D45A] to-[#82A327] px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          {/* 3D Bot illustration */}
          <div className="hidden lg:block lg:flex-shrink-0 lg:flex lg:items-center">
            <img
              src="/images/waitlist.png"
              alt="Reinforce Waitlist"
              className="h-80 w-auto object-contain transform translate-y-6"
            />
          </div>
          
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-24 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get early access
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-900">
              Seja um dos primeiros a experimentar nossa plataforma de aprendizado com IA. Receba atualizações exclusivas e acesso antecipado.
            </p>
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                    <label htmlFor="email-address" className="sr-only">Endereço de email</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-w-0 flex-auto rounded-xl placeholder:text-gray-900 border-0 bg-white/5 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#C7DF88] sm:text-sm sm:leading-6"
                      placeholder="Seu endereço de email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-none rounded-xl bg-[#C7DF88] px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-[#B8D277] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C7DF88] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Enviando...' : 'Entrar na lista'}
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-900">
                  Não se preocupe, não enviaremos spam. Você pode cancelar a qualquer momento.
                </p>
              </form>
            ) : (
              <div className="mt-10 bg-[#C7DF88]/20 p-4 rounded-md">
                <p className="text-gray-900 font-medium">
                  Obrigado por se inscrever! Em breve enviaremos novidades.
                </p>
              </div>
            )}
            
            <div className="mt-10 flex items-center h-[24px] justify-center gap-x-6 lg:justify-start">
              <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900 hover:text-lg transition-all">
                Saiba mais sobre a plataforma <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
}
