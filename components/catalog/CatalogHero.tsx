"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const HIGHLIGHTS = [
  "Ingredientes naturais",
  "Fragrâncias exclusivas",
  "Feito à mão com carinho",
] as const;

export function CatalogHero() {
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const leafOneRef = useRef<HTMLDivElement>(null);
  const leafTwoRef = useRef<HTMLDivElement>(null);
  const leafThreeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (parallaxBgRef.current) {
        parallaxBgRef.current.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
      }
      if (leafOneRef.current) {
        leafOneRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0) rotate(-18deg)`;
      }
      if (leafTwoRef.current) {
        leafTwoRef.current.style.transform = `translate3d(0, ${y * 0.08}px, 0) rotate(24deg) scaleX(-1)`;
      }
      if (leafThreeRef.current) {
        leafThreeRef.current.style.transform = `translate3d(0, ${y * 0.06}px, 0) rotate(-8deg)`;
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
      className="catalog-hero-premium relative mx-2 mt-2 sm:mx-4 sm:mt-3"
    >
      <div
        ref={parallaxBgRef}
        className="catalog-hero-premium__parallax"
        aria-hidden
      />

      <div
        ref={leafOneRef}
        className="catalog-hero-premium__leaf catalog-hero-premium__leaf--1"
        aria-hidden
      />
      <div
        ref={leafTwoRef}
        className="catalog-hero-premium__leaf catalog-hero-premium__leaf--2"
        aria-hidden
      />
      <div
        ref={leafThreeRef}
        className="catalog-hero-premium__leaf catalog-hero-premium__leaf--3"
        aria-hidden
      />

      <div
        className="catalog-hero-premium__blob catalog-hero-premium__blob--1"
        aria-hidden
      />
      <div
        className="catalog-hero-premium__blob catalog-hero-premium__blob--2"
        aria-hidden
      />

      <div className="catalog-hero-premium__inner">
        <div className="catalog-hero-premium__glass">
          <div className="catalog-hero-animate-logo">
            <BrandLogo size="hero" centered priority />
          </div>

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
