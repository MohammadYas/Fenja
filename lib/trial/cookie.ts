// Signeret trial-cookie (værn b): sættes httpOnly efter en COMPLETED prøve,
// så samme browser ikke kan starte en ny — og bærer samtidig tokenet, der
// claimer resultatet ved signup. HMAC-signaturen gør værdien uforfalskelig;
// selve tokenet gemmes kun hashet i databasen (se migrationen).
//
// Rene funktioner uden I/O — fuldt testbare.

import { createHmac, timingSafeEqual } from "node:crypto";
import { trial } from "@/lib/config";

function hemmelighed(): string {
  // Dev-fallback så flowet kan køre lokalt; i produktion SKAL env være sat
  return process.env.TRIAL_COOKIE_SECRET ?? "selja-trial-dev-hemmelighed";
}

function signatur(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex").slice(0, 32);
}

/** Cookie-værdien: "<token>.<hmac>" */
export function signerTrialToken(token: string, secret = hemmelighed()): string {
  return `${token}.${signatur(token, secret)}`;
}

/** Tokenet fra en cookie-værdi — null ved manglende/forfalsket signatur */
export function laesTrialToken(
  vaerdi: string | null | undefined,
  secret = hemmelighed(),
): string | null {
  if (!vaerdi) return null;
  const punkt = vaerdi.lastIndexOf(".");
  if (punkt <= 0) return null;
  const token = vaerdi.slice(0, punkt);
  const givet = vaerdi.slice(punkt + 1);
  const forventet = signatur(token, secret);
  if (givet.length !== forventet.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(givet), Buffer.from(forventet))) return null;
  } catch {
    return null;
  }
  // Kun vores egne tokens (uuid) accepteres — alt andet er støj
  return /^[0-9a-f-]{36}$/i.test(token) ? token : null;
}

/** Fælles cookie-attributter — httpOnly, så klient-JS aldrig kan læse tokenet */
export function trialCookieOpsaetning(): {
  name: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
} {
  return {
    name: trial.cookieNavn,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: trial.cookieDage * 86_400,
  };
}
