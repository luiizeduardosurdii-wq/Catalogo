"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { CloseIcon, MenuIcon } from "@/components/admin/AdminIcons";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/opcoes", label: "Opções" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={
        active
          ? "admin-nav__link admin-nav__link--active"
          : "admin-nav__link"
      }
    >
      {label}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/admin" className="shrink-0">
          <BrandLogo size="sm" priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Administração">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActive(pathname, link.href, link.exact)}
            />
          ))}
        </nav>
      </div>

      <button
        type="button"
        className="admin-nav__menu-btn shrink-0 md:hidden"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="admin-nav__backdrop md:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="admin-nav__mobile md:hidden"
            aria-label="Administração mobile"
          >
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(pathname, link.href, link.exact)}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
