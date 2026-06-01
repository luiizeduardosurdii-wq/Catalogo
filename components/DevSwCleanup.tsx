import Script from "next/script";

export function DevSwCleanup() {
  return (
    <Script id="sw-cleanup" strategy="beforeInteractive">
      {`
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            regs.forEach(function(r) { r.unregister(); });
          });
        }
        if ('caches' in window) {
          caches.keys().then(function(keys) {
            keys.forEach(function(k) { caches.delete(k); });
          });
        }
      `}
    </Script>
  );
}
