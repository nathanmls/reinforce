'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { translations } from '@/translations';

export default function PrivacyPolicyPage({ params }) {
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    // Get language from localStorage if available
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Privacy Policy | Reinforce</title>
        <meta
          name="description"
          content="Privacy Policy for Reinforce - Learn how we protect your data and privacy"
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header language={language} setLanguage={setLanguage} />
        <div className="relative pointer-events-none z-20 pb-[400px]">
          <main className="rounded-b-2xl overflow-hidden pt-16">
            <section className="py-12 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                  {language === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
                </h1>
                <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12">
                  {language === 'pt'
                    ? 'Última atualização: 26 de Março de 2025'
                    : 'Last updated: March 26, 2025'}
                </p>

                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Introdução' : 'Introduction'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'A Reinforce ("nós", "nosso" ou "nossa") está comprometida em proteger a privacidade das crianças que usam nossa plataforma educacional. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos as informações pessoais de nossos usuários, incluindo crianças menores de 13 anos. Estamos em conformidade com as leis de proteção de dados aplicáveis, incluindo a Lei Geral de Proteção de Dados (LGPD) e a Lei de Proteção à Privacidade Online das Crianças (COPPA).'
                      : 'Reinforce ("we," "our," or "us") is committed to protecting the privacy of children who use our educational platform. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information from our users, including children under the age of 13. We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the Children\'s Online Privacy Protection Act (COPPA).'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Informações que Coletamos' : 'Information We Collect'}
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Coletamos diferentes tipos de informações para fornecer e melhorar nossa plataforma educacional:'
                      : 'We collect different types of information to provide and improve our educational platform:'}
                  </p>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Informações Fornecidas pelos Pais/Responsáveis ou Escolas:' : 'Information Provided by Parents/Guardians or Schools:'}
                  </h3>
                  <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Nome da criança, idade e nível escolar'
                        : 'Child\'s name, age, and grade level'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Endereço de e-mail dos pais/responsáveis'
                        : 'Parent/guardian email address'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Informações da escola e do professor (quando aplicável)'
                        : 'School and teacher information (when applicable)'}
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Informações Coletadas Automaticamente:' : 'Information Collected Automatically:'}
                  </h3>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Dados de uso, como interações com a plataforma e tempo gasto em atividades'
                        : 'Usage data, such as platform interactions and time spent on activities'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Progresso educacional e resultados de desempenho'
                        : 'Educational progress and performance results'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Informações do dispositivo e do navegador'
                        : 'Device and browser information'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Endereço IP e dados de localização aproximada'
                        : 'IP address and approximate location data'}
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Como Usamos as Informações' : 'How We Use Information'}
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Usamos as informações coletadas para:'
                      : 'We use the information collected to:'}
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Fornecer, personalizar e melhorar nossa plataforma educacional'
                        : 'Provide, personalize, and improve our educational platform'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Adaptar o conteúdo educacional às necessidades e nível de habilidade de cada criança'
                        : 'Adapt educational content to each child\'s needs and skill level'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Gerar relatórios de progresso para pais, responsáveis e educadores'
                        : 'Generate progress reports for parents, guardians, and educators'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Comunicar atualizações, recursos e informações relacionadas ao serviço'
                        : 'Communicate updates, features, and service-related information'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Garantir a segurança e a integridade de nossa plataforma'
                        : 'Ensure the security and integrity of our platform'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Cumprir obrigações legais e regulatórias'
                        : 'Comply with legal and regulatory obligations'}
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Compartilhamento de Informações' : 'Information Sharing'}
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Não vendemos informações pessoais de crianças. Podemos compartilhar informações nas seguintes circunstâncias:'
                      : 'We do not sell children\'s personal information. We may share information in the following circumstances:'}
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Com escolas e educadores, conforme necessário para fornecer nossos serviços'
                        : 'With schools and educators as necessary to provide our services'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Com prestadores de serviços que nos ajudam a operar, desenvolver e melhorar nossa plataforma'
                        : 'With service providers who help us operate, develop, and improve our platform'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Com pais ou responsáveis legais da criança'
                        : 'With the child\'s parents or legal guardians'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Quando exigido por lei, processo legal ou autoridades governamentais'
                        : 'When required by law, legal process, or governmental authorities'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Em caso de fusão, venda ou transferência de ativos (com proteções adequadas)'
                        : 'In the event of a merger, sale, or asset transfer (with appropriate protections)'}
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Segurança de Dados' : 'Data Security'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Implementamos medidas técnicas, administrativas e físicas projetadas para proteger as informações pessoais contra acesso não autorizado, divulgação, alteração e destruição. Essas medidas incluem criptografia, controles de acesso, treinamento de funcionários e avaliações regulares de segurança.'
                      : 'We implement technical, administrative, and physical measures designed to protect personal information against unauthorized access, disclosure, alteration, and destruction. These measures include encryption, access controls, employee training, and regular security assessments.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Direitos dos Pais e Responsáveis' : 'Parental Rights'}
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Os pais e responsáveis têm o direito de:'
                      : 'Parents and guardians have the right to:'}
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Revisar as informações pessoais que coletamos de seus filhos'
                        : 'Review the personal information we have collected from their children'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Solicitar a exclusão das informações pessoais de seus filhos'
                        : 'Request deletion of their children\'s personal information'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Recusar a coleta ou uso adicional das informações de seus filhos'
                        : 'Refuse further collection or use of their children\'s information'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Solicitar correções nas informações pessoais de seus filhos'
                        : 'Request corrections to their children\'s personal information'}
                    </li>
                  </ul>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Para exercer esses direitos, entre em contato conosco em privacy@reinforce.com.'
                      : 'To exercise these rights, please contact us at privacy@reinforce.com.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Retenção de Dados' : 'Data Retention'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Mantemos as informações pessoais apenas pelo tempo necessário para fornecer nossos serviços, cumprir obrigações legais ou conforme permitido por lei. Quando as informações não são mais necessárias, as excluímos ou as anonimizamos de forma segura.'
                      : 'We retain personal information only for as long as necessary to provide our services, comply with legal obligations, or as permitted by law. When information is no longer needed, we securely delete or anonymize it.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Transferências Internacionais de Dados' : 'International Data Transfers'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Podemos transferir, armazenar e processar informações em países fora de sua residência. Implementamos salvaguardas apropriadas para proteger suas informações durante essas transferências, em conformidade com as leis de proteção de dados aplicáveis.'
                      : 'We may transfer, store, and process information in countries outside of your residence. We implement appropriate safeguards to protect your information during these transfers, in compliance with applicable data protection laws.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Alterações nesta Política' : 'Changes to This Policy'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas publicando a nova política em nossa plataforma e, quando apropriado, enviando uma notificação por e-mail. A data da última atualização será indicada no início da política.'
                      : 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our platform and, where appropriate, sending an email notification. The date of the last update will be indicated at the beginning of the policy.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Entre em Contato Conosco' : 'Contact Us'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco em:'
                      : 'If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:'}
                  </p>
                  <div className="mb-12 text-gray-600 dark:text-gray-300">
                    <p>Reinforce</p>
                    <p>Email: privacy@reinforce.com</p>
                    <p>
                      {language === 'pt'
                        ? 'Endereço: Rua Exemplo, 123 - São Paulo, SP - Brasil'
                        : 'Address: 123 Example Street - São Paulo, SP - Brazil'}
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
