'use client';
import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { translations } from '@/translations';

export default function ContactSection({ language = 'en' }) {
  const t = translations[language] || translations.en;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({
      submitted: true,
      success: true,
      message: t.contact.form.successMessage,
    });

    // Reset form after successful submission
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setFormStatus({ submitted: false, success: false, message: '' });
    }, 3000);
  };

  return (
    <section
      id="contact"
      className="relative pointer-events-auto bg-white rounded-b-2xl py-24 sm:py-32 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          {/* Left column - Contact info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              {t.contact.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-md mb-12">
              {t.contact.subtitle}
            </p>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C7DF88]/20">
                    <EnvelopeIcon
                      className="h-6 w-6 text-[#5A1A8A]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t.contact.support.title}
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {t.contact.support.description}
                  </p>
                  <a
                    href={`mailto:${t.contact.support.email}`}
                    className="mt-2 block text-[#5A1A8A] font-medium hover:text-[#C7DF88]"
                  >
                    {t.contact.support.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C7DF88]/20">
                    <PhoneIcon
                      className="h-6 w-6 text-[#5A1A8A]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t.contact.phone.title}
                  </h3>
                  <p className="mt-1 text-gray-600">{t.contact.phone.hours}</p>
                  <a
                    href={`tel:${t.contact.phone.number}`}
                    className="mt-2 block text-[#5A1A8A] font-medium hover:text-[#C7DF88]"
                  >
                    {t.contact.phone.number}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              {t.contact.form.title}
            </h3>

            {formStatus.submitted && (
              <div
                className={`mb-6 p-4 rounded-md ${formStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
              >
                {formStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t.contact.form.name.label}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#5A1A8A] focus:ring-[#5A1A8A] sm:text-sm"
                  placeholder={t.contact.form.name.placeholder}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t.contact.form.email.label}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#5A1A8A] focus:ring-[#5A1A8A] sm:text-sm"
                  placeholder={t.contact.form.email.placeholder}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t.contact.form.message.label}
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#5A1A8A] focus:ring-[#5A1A8A] sm:text-sm"
                  placeholder={t.contact.form.message.placeholder}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-[#5A1A8A] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#5A1A8A]/90 focus:outline-none focus:ring-2 focus:ring-[#C7DF88] transition-all duration-200 ease-in-out"
                >
                  {t.contact.form.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
