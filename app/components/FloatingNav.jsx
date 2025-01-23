import { useEffect, useState } from "react";
import { Fragment } from "react";
import { useSmoothCenter } from "../hooks/useSmoothCenter";

export default function FloatingNav() {
  const sections = [
    "hero",
    "welcome",
    "mentor",
    "meet-tia",
    "coming-soon",
    "about",
    "testimonials",
    "cta",
    "contact",
  ];

  const translations = {
    hero: "Início",
    welcome: "Futuro da Educação",
    mentor: "Mentor AI",
    "meet-tia": "Conheça Tia",
    "coming-soon": "Próximas Atualizações",
    about: "Sobre Nós",
    testimonials: "Depoimentos",
    cta: "Fazer Parte",
    contact: "Contato",
  };

  const [activeSection, setActiveSection] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  // Use the smooth center hook
  useSmoothCenter(activeSection, {
    threshold: 50,
    smoothness: 'smooth',
    debounceTime: 150
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const sectionTop = element.offsetTop;
          const sectionHeight = element.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(section);
            return;
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle temporary highlight effect
  useEffect(() => {
    if (activeSection && !isHovered) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeSection, isHovered]);

  const scrollToSection = (section) => {
    const element = document.getElementById(section);
    if (element) {
      setActiveSection(section);
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Fragment>
      <nav
        className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ul className="space-y-2 justify-items-end">
          {sections.map((section) => (
            <li key={section}>
              <button
                onClick={() => scrollToSection(section)}
                className="group flex items-center justify-end w-full"
              >
                <span
                  className={`
                    session-name mr-4 text-sm border-2 border-gray-200 transition-all hover:opacity-100 hover:text-gray-800 hover:py-2 hover:bg-white/100 duration-300 px-3 py-1 bg-white/10 rounded-lg
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                    ${activeSection === section ? "text-gray-800 bg-white/100 px-4 py-2 rounded-lg" : "text-gray-600"}
                    ${
                      (!isHovered && activeSection === section && showHighlight)
                        ? "opacity-100 border-gray-200"
                        : isHovered ? "opacity-70 border-white/10" : "opacity-0"
                    }
                  `}
                >
                  {translations[section]}
                </span>
                <div
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300 border-2 border-gray-300 group-hover:scale-125 
                    ${
                      activeSection === section
                        ? "bg-[#B3D45A] scale-125"
                        : "bg-white/50 group-hover:bg-white"
                    }
                  `}
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </Fragment>
  );
}
