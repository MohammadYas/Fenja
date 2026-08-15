import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Demo-tilstand (ejer-ordre 2026-08-15): uden Supabase-env — og aldrig i
// production — serveres app-fladerne med en demo-bruger og faste
// eksempeldata, så dashboardet kan ses og vises frem uden nøgler.
// Med env sat er adfærden præcis som før (rigtig auth, RLS, cookies).
const demoAktiv =
  !process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV !== "production";

type DemoSvar = { data: unknown; error: null; count: number | null };

// Formen matcher ItemRaekke i app/(app)/oversigt/page.tsx
const DEMO_ITEMS = [
  {
    id: "demo-1",
    brand: "Ganni",
    titel: "Uldstrik med rund hals · str. M",
    category: "striktrøje",
    status: "sold",
    sold_price_dkk: 240,
    leveret_at: "2026-08-01T10:00:00Z",
    solgt_at: "2026-08-04T18:00:00Z",
    created_at: "2026-08-01T09:55:00Z",
  },
  {
    id: "demo-2",
    brand: "Norse Projects",
    titel: "Overshirt i bomuld · str. L",
    category: "jakke",
    status: "sold",
    sold_price_dkk: 310,
    leveret_at: "2026-08-05T12:00:00Z",
    solgt_at: "2026-08-11T09:00:00Z",
    created_at: "2026-08-05T11:40:00Z",
  },
  {
    id: "demo-3",
    brand: "Wood Wood",
    titel: "Hættetrøje · str. S",
    category: "hoodie",
    status: "active",
    sold_price_dkk: null,
    leveret_at: "2026-08-14T15:00:00Z",
    solgt_at: null,
    created_at: "2026-08-14T14:45:00Z",
  },
  {
    id: "demo-4",
    brand: "Levi's",
    titel: "501 jeans · W30 L32",
    category: "jeans",
    status: "draft",
    sold_price_dkk: null,
    leveret_at: null,
    solgt_at: null,
    created_at: "2026-08-15T08:30:00Z",
  },
];

type DemoQuery = {
  select: (...args: unknown[]) => DemoQuery;
  insert: (...args: unknown[]) => DemoQuery;
  update: (...args: unknown[]) => DemoQuery;
  upsert: (...args: unknown[]) => DemoQuery;
  delete: (...args: unknown[]) => DemoQuery;
  eq: (...args: unknown[]) => DemoQuery;
  neq: (...args: unknown[]) => DemoQuery;
  in: (...args: unknown[]) => DemoQuery;
  is: (...args: unknown[]) => DemoQuery;
  gte: (...args: unknown[]) => DemoQuery;
  lte: (...args: unknown[]) => DemoQuery;
  order: (...args: unknown[]) => DemoQuery;
  limit: (...args: unknown[]) => DemoQuery;
  range: (...args: unknown[]) => DemoQuery;
  maybeSingle: () => Promise<DemoSvar>;
  single: () => Promise<DemoSvar>;
  then: (
    opfyldt: (svar: DemoSvar) => unknown,
    afvist?: (fejl: unknown) => unknown,
  ) => Promise<unknown>;
};

function demoQuery(tabel: string): DemoQuery {
  const listeSvar: DemoSvar = {
    data: tabel === "items" ? DEMO_ITEMS : null,
    error: null,
    count: tabel === "items" ? DEMO_ITEMS.length : null,
  };
  const enkeltSvar: DemoSvar = {
    data: tabel === "credit_balances" ? { balance: 4 } : null,
    error: null,
    count: null,
  };
  const builder: DemoQuery = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    in: () => builder,
    is: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    maybeSingle: () => Promise.resolve(enkeltSvar),
    single: () => Promise.resolve(enkeltSvar),
    then: (opfyldt, afvist) => Promise.resolve(listeSvar).then(opfyldt, afvist),
  };
  return builder;
}

function opretDemoKlient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: "demo-bruger", email: "demo@fenja.dk" } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    from: (tabel: string) => demoQuery(tabel),
  };
}

// Server-klient til server components og route handlers — kører som den
// indloggede bruger (RLS gælder). Sessionen bæres i cookies (A-5).
export async function opretServerKlient() {
  if (demoAktiv) {
    return opretDemoKlient() as unknown as ReturnType<typeof createServerClient>;
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Kald fra en server component uden respons — middleware fornyer sessionen
          }
        },
      },
    },
  );
}
