"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const HIGHLIGHTS = ["Natural", "Artesanal", "Ritual diário"] as const;

const HERO_PHOTOS = [
  {
    src: "/brand/hero-products/gift-butterfly-pink.png",
    alt: "Sabonetes personalizados em embalagem rosa com laço",
    className: "catalog-hero-premium__photo catalog-hero-premium__photo--pink",
  },
  {
    src: "/brand/hero-products/gift-blue-feet.png",
    alt: "Sabonetes azuis personalizados em embalagem com laço",
    className: "catalog-hero-premium__photo catalog-hero-premium__photo--blue",
  },
  {
    src: "/brand/hero-products/green-baby-soap.png",
    alt: "Sabonete verde em formato de body infantil",
    className: "catalog-hero-premium__photo catalog-hero-premium__photo--green",
  },
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
      <div className="catalog-hero-premium__orb catalog-hero-premium__orb--top" aria-hidden />
      <div className="catalog-hero-premium__orb catalog-hero-premium__orb--bottom" aria-hidden />
      <div className="catalog-hero-premium__botanical catalog-hero-premium__botanical--left" aria-hidden />
      <div className="catalog-hero-premium__botanical catalog-hero-premium__botanical--right" aria-hidden />

      <div className="catalog-hero-premium__inner">
        <div className="catalog-hero-premium__layout">
          <div className="catalog-hero-premium__content">
            <p className="catalog-hero-premium__eyebrow catalog-hero-animate-title">
              Saboart Atelier
            </p>

            <h1 className="catalog-hero-premium__title catalog-hero-animate-title">
              Sabonetes artesanais para transformar o banho em ritual
            </h1>

            <p className="catalog-hero-premium__subtitle catalog-hero-animate-subtitle">
              Texturas delicadas, aromas suaves e acabamento feito à mão para
              presentear ou cuidar de si.
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
              Ver produtos
              <span aria-hidden>→</span>
            </button>
          </div>

          <div className="catalog-hero-premium__gallery" aria-label="Produtos em destaque">
            <div className="catalog-hero-premium__gallery-glow" aria-hidden />
            {HERO_PHOTOS.map((photo, index) => (
              <figure key={photo.src} className={photo.className}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, (max-width: 1200px) 24vw, 330px"
                  priority={index === 0}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
