import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk";

// Jobbet kører på Trigger.dev's maskiner, ikke hos Netlify, så det har sit
// EGET miljø: uden disse nøgler dér ville pipelinen fejle med "provider
// mangler nøgle", selvom Netlify var sat rigtigt op. Værdierne læses fra det
// lokale miljø ved DEPLOY (gitignoreret .env.local) og skubbes op — samme
// kilde som Netlify fik, så de to miljøer ikke kan drifte fra hinanden.
// Tomme værdier springes over, så en manglende valgfri nøgle (fx Resend)
// ikke overskriver noget der allerede står i dashboardet.
const NOEGLER_TIL_JOBBET = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "GEMINI_API_KEY",
  "GEMINI_VISION_MODEL",
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_TEKST_MODEL",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "DAILY_BUDGET_CAP_DKK",
] as const;

export default defineConfig({
  // Trigger.dev-projektet "Selja" i org SDu (oprettet af ejeren, HANDOFF §6.6).
  // Ref'en er ikke en hemmelighed — den identificerer kun projektet; adgang
  // kræver TRIGGER_SECRET_KEY.
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_zmmrdmvkjhnxepwlxssi",
  dirs: ["./trigger"],
  maxDuration: 300,
  build: {
    // sharp er en native dependency og skal med i job-bundlet
    external: ["sharp"],
    extensions: [
      syncEnvVars(() =>
        NOEGLER_TIL_JOBBET.map((name) => ({ name, value: process.env[name] ?? "" })).filter(
          (v) => v.value !== "",
        ),
      ),
    ],
  },
});
