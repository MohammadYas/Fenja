import { da } from "@/lib/copy/da";

// Skip-link (U3): første fokuserbare element — usynligt indtil tastaturfokus,
// hvor det står som en lille koks-lap øverst til venstre.
export function SpringLink() {
  return (
    <a
      href="#indhold"
      className="sr-only z-50 rounded-bloed bg-koks px-4 py-2 font-medium text-kalk focus:not-sr-only focus:absolute focus:left-2 focus:top-2"
    >
      {da.a11y.springTilIndhold}
    </a>
  );
}
