"use client";

import { useEffect } from "react";

export function DevSwCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k));
      });
    }
  }, []);

  return null;
}
