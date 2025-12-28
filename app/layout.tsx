import type { ReactNode } from "react";
import Link from "next/link";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[rgba(2,6,23,0.98)] via-[#020617] to-black">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 px-6 py-3 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between text-xs uppercase tracking-[0.5em] text-white">
            <span className="text-sm font-semibold tracking-[0.7em] text-white/80">Planner v3</span>
            <div className="flex gap-6 text-white/70">
              <Link className="transition hover:text-white" href="/today">
                Today
              </Link>
              <Link className="transition hover:text-white" href="/week/2025-W01">
                Weekly plan
              </Link>
              <Link className="transition hover:text-white" href="/settings">
                Settings
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
