"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { vinted } from "@/lib/copy/vinted";

// Sticky mobil-CTA (ejer-godkendt plan 20/8): fast bund-bar på små skærme,
// vises først når heroens egen CTA er scrollet forbi, så de ikke dobler.
export function StickyCta() {
  const [synlig, setSynlig] = useState(false);

  useEffect(() => {
    const tjek = () => setSynlig(window.scrollY > 600);
    tjek();
    window.addEventListener("scroll", tjek, { passive: true });
    return () => window.removeEventListener("scroll", tjek);
  }, []);

  if (!synlig) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-kant bg-baggrund p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <Link href="/log-ind" className="knap-link w-full justify-center">
        {vinted.stickyCta}
      </Link>
    </div>
  );
}
