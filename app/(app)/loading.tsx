import { da } from "@/lib/copy/da";

// Gruppe-loading for hele app-delen (hastighed, ejer 22/8): uden denne
// blokerede hvert faneskift på fuld server-render med NUL feedback — det
// føltes som en langsom side. Skelettet vises øjeblikkeligt i app-skallen
// (topbar og bundnavigation bliver stående), mens serveren arbejder.
export default function Indlaeser() {
  return (
    <main className="py-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">{da.nav.indlaeser}</span>
      <div className="h-9 w-44 animate-pulse rounded-bloed bg-flade" />
      <div className="mt-6 h-28 animate-pulse rounded-bloed bg-flade" />
      <div className="mt-4 h-40 animate-pulse rounded-bloed bg-flade" />
      <div className="mt-4 h-28 animate-pulse rounded-bloed bg-flade" />
    </main>
  );
}
