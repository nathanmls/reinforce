'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/translations';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
      description:
        language === 'pt'
          ? 'Crie sua conta gratuitamente e configure seu perfil de estudante ou educador.'
          : 'Create your free account and set up your student or educator profile.',
      icon: '👤',
    },
    {
      title: language === 'pt' ? 'Conheça a Tia' : 'Meet Tia',
      description:
        language === 'pt'
          ? 'Interaja com nossa assistente virtual de IA que personaliza a experiência de aprendizado com personagens 3D interativos.'
          : 'Interact with our AI virtual assistant who personalizes the learning experience with interactive 3D characters.',
      icon: '🤖',
    },
    {
      title: language === 'pt' ? 'Receba Assistência Personalizada' : 'Get Personalized Assistance',
      description:
        language === 'pt'
          ? 'Nossa IA não apenas fornece respostas, mas ensina como resolver problemas, guiando você passo a passo através do processo de aprendizagem.'
          : 'Our AI doesn\'t just deliver answers, but teaches you how to solve problems, guiding you step-by-step through the learning process.',
      icon: '🧩',
    },
    {
      title: language === 'pt' ? 'Assistência com Tarefas' : 'Homework Assistance',
      description:
        language === 'pt'
          ? 'Obtenha ajuda com suas tarefas escolares através de explicações detalhadas que promovem a compreensão profunda dos conceitos.'
          : 'Get help with your homework through detailed explanations that promote deep understanding of concepts.',
      icon: '📝',
    },
    {
      title: language === 'pt' ? 'Acompanhe seu Progresso' : 'Track Your Progress',
      description:
        language === 'pt'
          ? 'Visualize seu desenvolvimento com métricas detalhadas e relatórios de progresso que identificam áreas para melhoria.'
          : 'Visualize your development with detailed metrics and progress reports that identify areas for improvement.',
      icon: '📈',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <Header
          language={language}
          setLanguage={setLanguage}
          isScrolled={isScrolled}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
        <div className="relative pointer-events-none z-20 pb-[400px]">
          <main className="bg-white rounded-b-2xl flex flex-col">
            {/* Hero Section */}
            <section className="py-20 px-4 md:px-8 lg:px-16 relative">
              <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                  {language === 'pt' ? 'Como Funciona' : 'How It Works'}
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6 text-gray-700 dark:text-gray-300">
                  {language === 'pt'
                    ? 'Descubra como a Reinforce está transformando a educação através de personagens 3D interativos, gamificação e assistência de IA em tempo real.'
                    : 'Discover how Reinforce is transforming education through interactive 3D characters, gamification, and real-time AI assistance.'}
                </p>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-300 font-medium">
                  {language === 'pt'
                    ? 'Nossa IA não apenas fornece respostas, mas ensina como resolver problemas, guiando os estudantes passo a passo no processo de aprendizagem.'
                    : 'Our AI doesn\'t just deliver answers, but teaches how to solve problems, guiding students step-by-step through the learning process.'}
                </p>
              </div>
            </section>

            <WaveDivider />

            {/* Process Steps */}
            <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
                  {language === 'pt'
                    ? 'O Processo é Simples'
                    : 'The Process is Simple'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="text-4xl mb-4">{step.icon}</div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                        <svg
                          className="w-6 h-6 text-primary-600 dark:text-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {language === 'pt'
                            ? 'Aprendizado Personalizado'
                            : 'Personalized Learning'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'pt'
                            ? 'Conteúdo adaptado ao seu estilo de aprendizado e nível de conhecimento, com assistência personalizada para cada estudante.'
                            : 'Content adapted to your learning style and knowledge level, with personalized assistance for each student.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                        <svg
                          className="w-6 h-6 text-primary-600 dark:text-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {language === 'pt'
                            ? 'Assistência com Tarefas'
                            : 'Homework Assistance'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'pt'
                            ? 'Nossa IA não apenas fornece respostas, mas ensina como resolver problemas passo a passo, promovendo compreensão profunda.'
                            : 'Our AI doesn\'t just provide answers, but teaches how to solve problems step-by-step, promoting deep understanding.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                        <svg
                          className="w-6 h-6 text-primary-600 dark:text-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {language === 'pt'
                            ? 'Personagens 3D Interativos'
                            : 'Interactive 3D Characters'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'pt'
                            ? 'Aprenda com assistentes virtuais 3D que tornam o aprendizado mais envolvente e divertido através de interações naturais.'
                            : 'Learn with 3D virtual assistants that make learning more engaging and fun through natural interactions.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                        <svg
                          className="w-6 h-6 text-primary-600 dark:text-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                          {language === 'pt'
                            ? 'Gamificação Educacional'
                            : 'Educational Gamification'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {language === 'pt'
                            ? 'Elementos de jogos que tornam o aprendizado divertido e motivador, com recompensas e desafios que incentivam o progresso.'
                            : 'Game elements that make learning fun and motivating, with rewards and challenges that encourage progress.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <WaveDivider bgColor="bg-gray-900" color="#ffffff" />

            {/* FAQ Section */}
            <section className="py-16 px-4 md:px-8 lg:px-16 ">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
                  {language === 'pt'
                    ? 'Perguntas Frequentes'
                    : 'Frequently Asked Questions'}
                </h2>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                      {language === 'pt'
                        ? 'Como a Reinforce difere de outros assistentes de IA?'
                        : 'How does Reinforce differ from other AI assistants?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'pt'
                        ? 'Diferente de outros assistentes que apenas fornecem respostas, a Reinforce ensina como resolver problemas, guiando os estudantes passo a passo no processo de aprendizagem com personagens 3D interativos e gamificação.'
                        : 'Unlike other assistants that just provide answers, Reinforce teaches how to solve problems, guiding students step-by-step through the learning process with interactive 3D characters and gamification.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                      {language === 'pt'
                        ? 'Como funciona a assistência com tarefas?'
                        : 'How does homework assistance work?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'pt'
                        ? 'Os estudantes podem enviar suas tarefas e receber assistência personalizada que não apenas fornece respostas, mas explica os conceitos e ensina métodos de resolução, promovendo compreensão profunda.'
                        : 'Students can submit their homework and receive personalized assistance that not only provides answers but explains concepts and teaches solution methods, promoting deep understanding.'}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                      {language === 'pt'
                        ? 'A plataforma pode ser integrada com materiais escolares existentes?'
                        : 'Can the platform be integrated with existing school materials?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'pt'
                        ? 'Sim! A Reinforce pode ser contextualizada com o material didático da escola para maior alinhamento com o programa escolar, oferecendo assistência personalizada baseada no currículo específico.'
                        : 'Yes! Reinforce can be contextualized with the school\'s didactic material for better alignment with the school program, offering personalized assistance based on the specific curriculum.'}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                      {language === 'pt'
                        ? 'Que tipo de insights os educadores recebem?'
                        : 'What kind of insights do educators receive?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === 'pt'
                        ? 'Educadores recebem informações detalhadas sobre o desempenho e progresso dos alunos, identificando áreas que precisam de atenção adicional e permitindo intervenções personalizadas.'
                        : 'Educators receive detailed information about student performance and progress, identifying areas that need additional attention and enabling personalized interventions.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
