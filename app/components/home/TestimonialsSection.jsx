'use client';

import { useState, useEffect, useRef } from 'react';

const testimonials = [
  {
    body: 'A plataforma me ajudou a desenvolver habilidades que eu nem sabia que tinha. A inteligência artificial realmente entende minhas necessidades.',
    author: {
      name: 'Ana Silva',
      handle: 'Estudante de Graduação',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Incrível como a IA consegue adaptar o conteúdo ao meu ritmo de aprendizado. Me sinto mais confiante a cada dia.',
    author: {
      name: 'Bruna Santos',
      handle: 'Profissional em Transição',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'A mentoria personalizada me ajudou a encontrar o caminho certo para o meu sucesso acadêmico.',
    author: {
      name: 'Márcio Oliveira',
      handle: 'Aluno do Ensino Superior',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Como professora, vejo um grande potencial na forma como a IA personaliza o aprendizado para cada aluno.',
    author: {
      name: 'Patricia Lima',
      handle: 'Professora',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'O suporte 24/7 e a flexibilidade do programa fizeram toda a diferença na minha jornada de aprendizado.',
    author: {
      name: 'Roberto Martins',
      handle: 'Estudante Trabalhador',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    body: 'Minha filha está muito mais engajada com os estudos desde que começou a usar a plataforma.',
    author: {
      name: 'Carla Mendes',
      handle: 'Mãe de Aluna',
      imageUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
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
    setDragPosition(prev => ({ ...prev, current: currentPosition }));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const containerWidth = slideContainerRef.current?.offsetWidth || 0;
    const threshold = 20; // percentage of slide width needed to trigger change
    
    let newIndex = currentIndex;
    if (Math.abs(dragOffset) > threshold) {
      newIndex = dragOffset > 0 
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
    <div id="testimonials" className="overflow-hidden bg-white h-screen items-center flex py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-10">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Depoimentos</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            O que nossos alunos dizem
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
                      <p className="text-lg tracking-tight">"{testimonial.body}"</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <img
                        className="h-10 w-10 rounded-full bg-gray-50"
                        src={testimonial.author.imageUrl}
                        alt=""
                      />
                      <div>
                        <div className="font-semibold">{testimonial.author.name}</div>
                        <div className="text-gray-600">{testimonial.author.handle}</div>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {[...Array(testimonials.length - itemsPerView + 1)].map((_, idx) => (
              <button
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
