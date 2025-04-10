'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { translations } from '@/translations';

export default function TermsOfServicePage({ params }) {
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
        <title>Terms of Service | Reinforce</title>
        <meta
          name="description"
          content="Terms of Service for Reinforce - Learn about our terms and conditions"
        />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header language={language} setLanguage={setLanguage} />
        <div className="relative pointer-events-none z-20 pb-[400px]">
          <main className="rounded-b-2xl overflow-hidden pt-16">
            <section className="py-12 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                  {language === 'pt' ? 'Termos de Serviço' : 'Terms of Service'}
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
                      ? 'Bem-vindo à Reinforce. Estes Termos de Serviço ("Termos") regem seu acesso e uso da plataforma Reinforce, incluindo nosso site, aplicativos, serviços e ferramentas (coletivamente, os "Serviços"). Ao acessar ou usar nossos Serviços, você concorda com estes Termos. Se você está acessando ou usando os Serviços em nome de uma escola ou instituição educacional, você declara e garante que tem autoridade para vincular essa entidade a estes Termos.'
                      : 'Welcome to Reinforce. These Terms of Service ("Terms") govern your access to and use of the Reinforce platform, including our website, applications, services, and tools (collectively, the "Services"). By accessing or using our Services, you agree to these Terms. If you are accessing or using the Services on behalf of a school or educational institution, you represent and warrant that you have authority to bind that entity to these Terms.'}
                  </p>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'A Reinforce é uma plataforma SaaS de ponta que busca aprimorar a experiência de apoio escolar, trazendo mais interatividade por meio de personagens 3D animados, gamificação e conversas em tempo real com tecnologia de IA.'
                      : 'Reinforce is a cutting-edge SaaS platform that seeks to enhance the schooling support experience by bringing more interactivity through animated 3D characters, gamification, and AI-powered real-time conversation.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Elegibilidade' : 'Eligibility'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Nossos Serviços são projetados para crianças, educadores e escolas. Para crianças menores de 13 anos, exigimos consentimento verificável dos pais ou responsáveis legais, de acordo com as leis de proteção à privacidade infantil aplicáveis. Se você é pai, responsável ou educador registrando uma criança, você declara que tem autoridade legal para fazê-lo.'
                      : 'Our Services are designed for children, educators, and schools. For children under the age of 13, we require verifiable parental consent in accordance with applicable children\'s privacy protection laws. If you are a parent, guardian, or educator registering a child, you represent that you have legal authority to do so.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Contas e Registro' : 'Accounts and Registration'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Para acessar determinados recursos de nossos Serviços, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de conta e por todas as atividades que ocorrem sob sua conta. Você concorda em fornecer informações precisas e completas durante o processo de registro e em manter essas informações atualizadas.'
                      : 'To access certain features of our Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during the registration process and to keep this information up to date.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Serviços Educacionais' : 'Educational Services'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'A Reinforce oferece serviços educacionais interativos e personalizados para ajudar crianças a resolver dúvidas de lição de casa e melhorar a compreensão. Nossos serviços incluem:'
                      : 'Reinforce offers interactive and personalized educational services to help children solve homework doubts and improve understanding. Our services include:'}
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Assistência personalizada através de personagens 3D animados e tecnologia de IA'
                        : 'Personalized assistance through animated 3D characters and AI technology'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Conversas em tempo real adaptáveis aos materiais escolares específicos'
                        : 'Real-time conversations adaptable to school-specific materials'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Elementos de gamificação para tornar o aprendizado mais envolvente'
                        : 'Gamification elements to make learning more engaging'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Ferramentas para educadores monitorarem o desempenho e a saúde dos alunos'
                        : 'Tools for educators to monitor student performance and well-being'}
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Conteúdo do Usuário' : 'User Content'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Nossos Serviços podem permitir que você envie, armazene ou compartilhe conteúdo, incluindo textos, imagens e outros materiais ("Conteúdo do Usuário"). Você mantém todos os direitos sobre seu Conteúdo do Usuário, mas nos concede uma licença mundial, não exclusiva, transferível, sublicenciável e livre de royalties para usar, reproduzir, modificar, adaptar, publicar, traduzir e distribuir seu Conteúdo do Usuário em conexão com a operação e fornecimento de nossos Serviços.'
                      : 'Our Services may allow you to submit, store, or share content, including text, images, and other materials ("User Content"). You retain all rights to your User Content, but you grant us a worldwide, non-exclusive, transferable, sublicensable, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with operating and providing our Services.'}
                  </p>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Você declara e garante que: (i) possui ou tem os direitos necessários sobre seu Conteúdo do Usuário; (ii) seu Conteúdo do Usuário não viola direitos de terceiros; e (iii) seu Conteúdo do Usuário cumpre estes Termos e todas as leis aplicáveis.'
                      : 'You represent and warrant that: (i) you own or have the necessary rights to your User Content; (ii) your User Content does not infringe on third-party rights; and (iii) your User Content complies with these Terms and all applicable laws.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Conduta do Usuário' : 'User Conduct'}
                  </h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Ao usar nossos Serviços, você concorda em não:'
                      : 'When using our Services, you agree not to:'}
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-600 dark:text-gray-300">
                    <li>
                      {language === 'pt'
                        ? 'Violar quaisquer leis ou regulamentos aplicáveis'
                        : 'Violate any applicable laws or regulations'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Infringir os direitos de propriedade intelectual ou outros direitos de terceiros'
                        : 'Infringe the intellectual property or other rights of third parties'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Enviar conteúdo que seja ilegal, ofensivo, difamatório, pornográfico ou inadequado para crianças'
                        : 'Submit content that is illegal, offensive, defamatory, pornographic, or inappropriate for children'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Tentar acessar áreas restritas dos Serviços ou contornar medidas de segurança'
                        : 'Attempt to access restricted areas of the Services or circumvent security measures'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Usar os Serviços para enviar spam, malware ou conteúdo prejudicial'
                        : 'Use the Services to send spam, malware, or harmful content'}
                    </li>
                    <li>
                      {language === 'pt'
                        ? 'Interferir na operação dos Serviços ou sobrecarregar nossa infraestrutura'
                        : 'Interfere with the operation of the Services or overload our infrastructure'}
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Propriedade Intelectual' : 'Intellectual Property'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Os Serviços e todo o conteúdo, recursos e funcionalidades neles contidos (incluindo, mas não se limitando a, textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais, compilações de dados e software) são de propriedade da Reinforce ou de seus licenciadores e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual. Nosso software é licenciado, não vendido, e você pode usá-lo apenas de acordo com estes Termos.'
                      : 'The Services and all content, features, and functionality contained therein (including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software) are owned by Reinforce or its licensors and are protected by copyright, trademark, and other intellectual property laws. Our software is licensed, not sold, and you may use it only in accordance with these Terms.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Assinaturas e Pagamentos' : 'Subscriptions and Payments'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Podemos oferecer serviços gratuitos e pagos. Para serviços pagos, os termos de pagamento serão especificados no momento da compra. Você concorda em fornecer informações de pagamento precisas e completas e nos autoriza a cobrar o método de pagamento especificado. Todas as assinaturas são renovadas automaticamente, a menos que você as cancele antes da data de renovação. Os preços estão sujeitos a alterações, mas notificaremos você com antecedência sobre qualquer alteração de preço.'
                      : 'We may offer both free and paid services. For paid services, payment terms will be specified at the time of purchase. You agree to provide accurate and complete payment information and authorize us to charge your specified payment method. All subscriptions automatically renew unless you cancel before the renewal date. Prices are subject to change, but we will notify you in advance of any price change.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Privacidade' : 'Privacy'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Nossa Política de Privacidade descreve como coletamos, usamos e compartilhamos informações sobre você e as crianças que usam nossos Serviços. Ao usar nossos Serviços, você concorda com nossa coleta, uso e compartilhamento de informações conforme descrito em nossa Política de Privacidade.'
                      : 'Our Privacy Policy describes how we collect, use, and share information about you and the children who use our Services. By using our Services, you agree to our collection, use, and sharing of information as described in our Privacy Policy.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Isenção de Garantias' : 'Disclaimer of Warranties'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'NOSSOS SERVIÇOS SÃO FORNECIDOS "COMO ESTÃO" E "CONFORME DISPONÍVEIS", SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS. NA EXTENSÃO MÁXIMA PERMITIDA POR LEI, RENUNCIAMOS A TODAS AS GARANTIAS, INCLUINDO, MAS NÃO SE LIMITANDO A, GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO E NÃO VIOLAÇÃO. NÃO GARANTIMOS QUE NOSSOS SERVIÇOS ATENDERÃO SEUS REQUISITOS, ESTARÃO DISPONÍVEIS DE FORMA ININTERRUPTA, OPORTUNA, SEGURA OU LIVRE DE ERROS.'
                      : 'OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Limitação de Responsabilidade' : 'Limitation of Liability'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'NA EXTENSÃO MÁXIMA PERMITIDA POR LEI, EM NENHUM CASO A REINFORCE, SEUS DIRETORES, FUNCIONÁRIOS, PARCEIROS OU FORNECEDORES SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO, MAS NÃO SE LIMITANDO A, PERDA DE LUCROS, DADOS, USO, BOA VONTADE OU OUTRAS PERDAS INTANGÍVEIS, RESULTANTES DE (i) SEU ACESSO OU USO OU INCAPACIDADE DE ACESSAR OU USAR OS SERVIÇOS; (ii) QUALQUER CONDUTA OU CONTEÚDO DE TERCEIROS NOS SERVIÇOS; OU (iii) ACESSO NÃO AUTORIZADO, USO OU ALTERAÇÃO DE SEU CONTEÚDO OU TRANSMISSÕES.'
                      : 'TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL REINFORCE, ITS DIRECTORS, EMPLOYEES, PARTNERS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; OR (iii) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT OR TRANSMISSIONS.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Indenização' : 'Indemnification'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Você concorda em defender, indenizar e isentar a Reinforce, seus diretores, funcionários e agentes de e contra quaisquer reivindicações, responsabilidades, danos, perdas e despesas, incluindo, sem limitação, honorários advocatícios razoáveis, decorrentes de ou de qualquer forma relacionados com (i) seu acesso ou uso dos Serviços; (ii) seu Conteúdo do Usuário; (iii) sua violação destes Termos; ou (iv) sua violação de quaisquer direitos de terceiros.'
                      : 'You agree to defend, indemnify, and hold harmless Reinforce, its directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable attorneys\' fees, arising out of or in any way connected with (i) your access to or use of the Services; (ii) your User Content; (iii) your violation of these Terms; or (iv) your violation of any third-party rights.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Modificações dos Termos' : 'Modifications to Terms'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Podemos revisar estes Termos a qualquer momento, publicando os termos atualizados em nosso site. É sua responsabilidade verificar periodicamente as alterações. Seu uso continuado dos Serviços após a publicação dos Termos revisados significa que você aceita e concorda com as alterações.'
                      : 'We may revise these Terms at any time by posting the updated terms on our website. It is your responsibility to check for changes periodically. Your continued use of the Services following the posting of revised Terms means that you accept and agree to the changes.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Rescisão' : 'Termination'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Podemos encerrar ou suspender seu acesso aos Serviços imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos. Após a rescisão, seu direito de usar os Serviços cessará imediatamente. Todas as disposições dos Termos que, por sua natureza, devem sobreviver à rescisão, sobreviverão, incluindo, sem limitação, disposições de propriedade, isenções de garantia, indenização e limitações de responsabilidade.'
                      : 'We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the Services will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Lei Aplicável' : 'Governing Law'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem levar em consideração seus princípios de conflito de leis.'
                      : 'These Terms shall be governed and construed in accordance with the laws of Brazil, without regard to its conflict of law principles.'}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {language === 'pt' ? 'Entre em Contato Conosco' : 'Contact Us'}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {language === 'pt'
                      ? 'Se você tiver dúvidas sobre estes Termos, entre em contato conosco em:'
                      : 'If you have any questions about these Terms, please contact us at:'}
                  </p>
                  <div className="mb-12 text-gray-600 dark:text-gray-300">
                    <p>Reinforce</p>
                    <p>Email: legal@reinforce.com</p>
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
