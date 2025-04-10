'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import ImageWaitlist from '../../public/images/waitlist.png';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { translations } from '@/translations';

export default function WaitlistModal({ isOpen, setIsOpen, language = 'en' }) {
  const t = translations[language] || translations.en;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="mx-auto flex items-center justify-center">
                    <Image
                      src={ImageWaitlist}
                      alt="Tia Avatar"
                      width={200}
                      height={200}
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-semibold leading-6 text-white"
                    >
                      {t.welcome.modal.title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        {t.welcome.modal.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <div id="mc_embed_signup">
                    <form
                      action="https://reinforce.us21.list-manage.com/subscribe/post?u=c4db39575fa82e6152ef4adc9&amp;id=12d42c34ff&amp;f_id=008ebce2f0"
                      method="post"
                      id="mc-embedded-subscribe-form"
                      name="mc-embedded-subscribe-form"
                      className="validate"
                      target="_blank"
                    >
                      <div
                        id="mc_embed_signup_scroll"
                        className="flex flex-col gap-4"
                      >
                        <div className="mc-field-group">
                          <input
                            type="email"
                            name="EMAIL"
                            className="required email w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            id="mce-EMAIL"
                            placeholder={t.welcome.modal.emailPlaceholder}
                            required
                          />
                        </div>
                        <div hidden>
                          <input type="hidden" name="tags" value="2849655" />
                        </div>
                        <div id="mce-responses" className="clear foot">
                          <div
                            className="response"
                            id="mce-error-response"
                            style={{ display: 'none' }}
                          ></div>
                          <div
                            className="response"
                            id="mce-success-response"
                            style={{ display: 'none' }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            type="submit"
                            className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            {t.welcome.modal.submitButton}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
