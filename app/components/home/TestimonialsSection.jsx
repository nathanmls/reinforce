'use client';

import { useState, useEffect, useRef } from 'react';

const testimonials = [
  {
    body: 'Como professora do 3º ano, vejo uma transformação incrível nos meus alunos. A plataforma adapta-se ao ritmo de cada criança, tornando o aprendizado mais eficaz e divertido.',
    author: {
      name: 'Profa. Maria Oliveira',
      handle: 'Professora do 3º ano',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Meu filho de 8 anos tinha dificuldades em matemática. Depois de usar o Reinforce, ele não só melhorou suas notas, mas agora adora resolver problemas matemáticos!',
    author: {
      name: 'Carlos Mendes',
      handle: 'Pai de aluno do 2º ano',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Como coordenadora pedagógica, observei que as turmas que usam o Reinforce demonstram maior engajamento e melhores resultados nas avaliações nacionais.',
    author: {
      name: 'Dra. Lúcia Santos',
      handle: 'Coordenadora Pedagógica',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Minha filha tem TDAH e sempre lutou para se concentrar. O Reinforce oferece atividades interativas que mantêm sua atenção e a ajudam a progredir no seu próprio ritmo.',
    author: {
      name: 'Juliana Pereira',
      handle: 'Mãe de aluna do 4º ano',
      imageUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Como professor de ciências, adoro como o Reinforce torna conceitos complexos acessíveis através de visualizações e experimentos virtuais. Meus alunos estão fascinados!',
    author: {
      name: 'Prof. André Lima',
      handle: 'Professor de Ciências',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Como pai de gêmeos, era difícil dar atenção individualizada aos dois. O Reinforce oferece experiências personalizadas que atendem às necessidades específicas de cada um.',
    author: {
      name: 'Roberto Alves',
      handle: 'Pai de alunos do 1º ano',
      imageUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Implementamos o Reinforce em toda a nossa escola primária e vimos um aumento de 30% no desempenho em leitura. A abordagem adaptativa faz toda a diferença.',
    author: {
      name: 'Profa. Beatriz Costa',
      handle: 'Diretora de Escola Primária',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Minha filha com dislexia finalmente está ganhando confiança na leitura graças às ferramentas especializadas do Reinforce. É emocionante ver seu progresso diário.',
    author: {
      name: 'Fernanda Moraes',
      handle: 'Mãe de aluna do 5º ano',
      imageUrl:
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragPosition, setDragPosition] = useState({ start: 0, current: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const slideContainerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerView = isMobile ? 2 : 3;
  const slideWidth = 100 / itemsPerView;

  const handleDragStart = (e) => {
    setIsDragging(true);
    setIsPaused(true);
    const position = e.pageX || e.touches?.[0].pageX;
    setDragPosition({ start: position, current: position });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const currentPosition = e.pageX || e.touches?.[0].pageX;
    const delta = dragPosition.start - currentPosition;
    const containerWidth = slideContainerRef.current?.offsetWidth || 0;

    // Calculate the drag offset as a percentage
    const newOffset = (delta / containerWidth) * 100;
    setDragOffset(newOffset);
    setDragPosition((prev) => ({ ...prev, current: currentPosition }));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const containerWidth = slideContainerRef.current?.offsetWidth || 0;
    const threshold = 20; // percentage of slide width needed to trigger change

    let newIndex = currentIndex;
    if (Math.abs(dragOffset) > threshold) {
      newIndex =
        dragOffset > 0
          ? Math.min(currentIndex + 1, testimonials.length - itemsPerView)
          : Math.max(currentIndex - 1, 0);
    }

    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    setCurrentIndex(newIndex);
    setIsPaused(false);
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= testimonials.length - itemsPerView + 1) {
        return 0;
      }
      return nextIndex;
    });
  };

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(nextTestimonial, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, itemsPerView]);

  const getTransform = () => {
    const baseTransform = currentIndex * slideWidth;
    const dragTransform = isDragging ? dragOffset : 0;
    return -(baseTransform + dragTransform);
  };

  return (
    <div
      id="testimonials"
      className="overflow-hidden bg-gray-900 pointer-events-auto h-screen items-center flex py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-10">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
            Depoimentos
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            O que educadores e pais dizem
          </p>
          <p className="mt-4 text-lg text-gray-700">
            Veja como o Reinforce está transformando a educação fundamental
          </p>
        </div>

        <div
          className="relative mx-auto max-w-[90rem] select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            if (isDragging) handleDragEnd();
            setIsPaused(false);
          }}
        >
          <div
            ref={slideContainerRef}
            className="cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div
              className={`flex ${!isDragging ? 'transition-transform duration-500 ease-out' : 'transform-none'}`}
              style={{
                transform: `translateX(${getTransform()}%)`,
                willChange: 'transform',
              }}
            >
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="px-4 flex-shrink-0"
                  style={{
                    width: `${slideWidth}%`,
                  }}
                >
                  <figure className="relative h-full rounded-2xl bg-white p-6 shadow-xl shadow-gray-900/10">
                    <blockquote className="text-gray-900">
                      <p className="text-lg tracking-tight">
                        "{testimonial.body}"
                      </p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <img
                        className="h-10 w-10 rounded-full bg-gray-50"
                        src={testimonial.author.imageUrl}
                        alt=""
                      />
                      <div>
                        <div className="font-semibold">
                          {testimonial.author.name}
                        </div>
                        <div className="text-gray-600">
                          {testimonial.author.handle}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-x-6">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(Math.max(0, currentIndex - 1));
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 1000);
              }}
              className="rounded-full bg-white p-2 text-gray-900 shadow-sm hover:bg-gray-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(
                  Math.min(testimonials.length - itemsPerView, currentIndex + 1)
                );
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 1000);
              }}
              className="rounded-full bg-white p-2 text-gray-900 shadow-sm hover:bg-gray-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
