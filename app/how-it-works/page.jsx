"use client";

import { useState, useEffect } from 'react';
import { translations } from '../translations';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainScene3D from '../components/MainScene3D';
import WaveDivider from '../components/WaveDivider';
import { detectUserLanguage } from '../utils/geolocation';

export default function HowItWorksPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const t = translations[language];

  // Handle language detection
  useEffect(() => {
    const initLanguage = async () => {
      const detectedLang = await detectUserLanguage();
      setLanguage(detectedLang);
    };
    initLanguage();
  }, []);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      title: language === 'pt' ? 'Cadastre-se' : 'Sign Up',
      description: language === 'pt' 
        ? 'Crie sua conta gratuitamente e configure seu perfil de estudante ou educador.' 
        : 'Create your free account and set up your student or educator profile.',
      icon: '👤'
    },
    {
      title: language === 'pt' ? 'Conheça a Tia' : 'Meet Tia',
      description: language === 'pt' 
        ? 'Interaja com nossa assistente virtual de IA que personaliza a experiência de aprendizado.' 
        : 'Interact with our AI virtual assistant who personalizes the learning experience.',
      icon: '🤖'
    },
    {
      title: language === 'pt' ? 'Explore o Conteúdo' : 'Explore Content',
      description: language === 'pt' 
        ? 'Acesse materiais de estudo, exercícios e recursos educacionais adaptados ao seu nível.' 
        : 'Access study materials, exercises, and educational resources adapted to your level.',
      icon: '📚'
    },
    {
      title: language === 'pt' ? 'Pratique e Aprenda' : 'Practice & Learn',
      description: language === 'pt' 
        ? 'Resolva exercícios, receba feedback instantâneo e acompanhe seu progresso.' 
        : 'Solve exercises, receive instant feedback, and track your progress.',
      icon: '✏️'
    },
    {
      title: language === 'pt' ? 'Conecte-se' : 'Connect',
      description: language === 'pt' 
        ? 'Interaja com mentores e outros estudantes para enriquecer sua jornada de aprendizado.' 
        : 'Interact with mentors and other students to enrich your learning journey.',
      icon: '🔄'
    }
  ];

  return (
    <div className="relative min-h-screen">
      <MainScene3D />
      <div className="relative z-10">
        <Header 
          language={language}
          setLanguage={setLanguage}
          isScrolled={isScrolled}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
        <main className="bg-transparent flex flex-col">
          {/* Hero Section */}
          <section className="py-20 px-4 md:px-8 lg:px-16 relative">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                {language === 'pt' ? 'Como Funciona' : 'How It Works'}
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-300">
                {language === 'pt' 
                  ? 'Descubra como a Reinforce está transformando a educação através da tecnologia e inteligência artificial.' 
                  : 'Discover how Reinforce is transforming education through technology and artificial intelligence.'}
              </p>
            </div>
          </section>

          <WaveDivider />

          {/* Process Steps */}
          <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
                {language === 'pt' ? 'O Processo é Simples' : 'The Process is Simple'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <WaveDivider flip={true} />

          {/* Features Section */}
          <section className="py-16 px-4 md:px-8 lg:px-16">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
                {language === 'pt' ? 'Principais Recursos' : 'Key Features'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        {language === 'pt' ? 'Aprendizado Personalizado' : 'Personalized Learning'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'pt' 
                          ? 'Algoritmos de IA adaptam o conteúdo ao seu ritmo e estilo de aprendizado.' 
                          : 'AI algorithms adapt content to your pace and learning style.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        {language === 'pt' ? 'Conteúdo Rico' : 'Rich Content'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'pt' 
                          ? 'Acesso a uma vasta biblioteca de materiais educacionais de alta qualidade.' 
                          : 'Access to a vast library of high-quality educational materials.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        {language === 'pt' ? 'Mentoria Especializada' : 'Expert Mentoring'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'pt' 
                          ? 'Conecte-se com mentores qualificados que guiam seu aprendizado.' 
                          : 'Connect with qualified mentors who guide your learning.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        {language === 'pt' ? 'Progresso Rastreável' : 'Trackable Progress'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'pt' 
                          ? 'Acompanhe seu desenvolvimento com métricas detalhadas e relatórios de progresso.' 
                          : 'Monitor your development with detailed metrics and progress reports.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <WaveDivider />

          {/* FAQ Section */}
          <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
                {language === 'pt' ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Quanto custa usar a Reinforce?' : 'How much does Reinforce cost?'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {language === 'pt' 
                      ? 'Oferecemos um plano gratuito com recursos básicos e planos premium com funcionalidades avançadas. Visite nossa página de preços para mais detalhes.' 
                      : 'We offer a free plan with basic features and premium plans with advanced functionality. Visit our pricing page for more details.'}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Quem pode usar a plataforma?' : 'Who can use the platform?'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {language === 'pt' 
                      ? 'Nossa plataforma é projetada para estudantes de todas as idades, educadores, escolas e instituições de ensino.' 
                      : 'Our platform is designed for students of all ages, educators, schools, and educational institutions.'}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Como a IA personaliza o aprendizado?' : 'How does AI personalize learning?'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {language === 'pt' 
                      ? 'Nossa IA analisa seu desempenho, identifica pontos fortes e fracos, e adapta o conteúdo para otimizar seu aprendizado.' 
                      : 'Our AI analyzes your performance, identifies strengths and weaknesses, and adapts content to optimize your learning.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <Footer />
        </main>
      </div>
    </div>
  );
}