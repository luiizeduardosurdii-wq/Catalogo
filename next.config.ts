import type { NextConfig } from "next";
import { appendFileSync } from "fs";
import path from "path";

const debugLogPath = path.join(process.cwd(), "..", "debug-ed619f.log");

function agentLog(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  // #region agent log
  const entry = {
    sessionId: "ed619f",
    timestamp: Date.now(),
    location: "next.config.ts",
    message,
    data,
    hypothesisId,
    runId: process.env.DEBUG_RUN_ID ?? "pre-fix",
  };
  try {
    appendFileSync(debugLogPath, `${JSON.stringify(entry)}\n`);
    fetch("http://127.0.0.1:7628/ingest/5119f2b2-1b6e-40e1-879b-56b7964a1a99", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ed619f",
      },
      body: JSON.stringify(entry),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
  // #endregion
}

agentLog(
  "next.config loaded",
  {
    cwd: process.cwd(),
    hasNonAsciiPath: /[^\u0000-\u007f]/.test(process.cwd()),
  },
  "H3"
);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  async redirects() {
    return [
      {
        source: "/s/minha-loja",
        destination: "/s/saboart",
        permanent: true,
      },
      {
        source: "/s/minha-loja/:path*",
        destination: "/s/saboart/:path*",
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
      agentLog(
        "webpack watchOptions applied",
        {
          watchOptions: config.watchOptions,
          infrastructureLogging: Boolean(config.infrastructureLogging),
        },
        "H1"
      );
    }
    return config;
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Permite JS/HMR no emulador Android (10.0.2.2) e celular na rede local
  allowedDevOrigins: [
    "10.0.2.2",
    "10.0.2.2:3000",
    "192.168.0.6",
    "192.168.0.6:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;
