"use client";

import { useEffect, useRef } from "react";

const HIGHLIGHTS = [
  "Ingredientes naturais",
  "Fragrâncias exclusivas",
  "Feito à mão com carinho",
] as const;

export function CatalogHero() {
  const parallaxBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (parallaxBgRef.current) {
        parallaxBgRef.current.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToProducts() {
    document
      .getElementById("catalog-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      aria-label="Apresentação da loja"
      className="catalog-hero-premium relative w-full"
    >
      <div
        ref={parallaxBgRef}
        className="catalog-hero-premium__parallax catalog-hero-premium__bg"
        aria-hidden
      />

      <div className="catalog-hero-premium__overlay" aria-hidden />

      <div className="catalog-hero-premium__inner">
        <div className="catalog-hero-premium__glass">
          <h1 className="catalog-hero-premium__title catalog-hero-animate-title">
            Sabonetes feitos à mão que acolhem sua pele e seus momentos
          </h1>

          <p className="catalog-hero-premium__subtitle catalog-hero-animate-subtitle">
            Cada peça é elaborada com ingredientes naturais, fragrâncias
            delicadas e o cuidado de quem entende que autocuidado é um ritual.
          </p>

          <ul className="catalog-hero-premium__highlights catalog-hero-animate-highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={scrollToProducts}
            className="catalog-hero-premium__cta catalog-btn-primary catalog-hero-animate-cta"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    </section>
  );
}
