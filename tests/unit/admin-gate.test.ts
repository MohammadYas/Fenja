import { afterEach, describe, expect, it } from "vitest";
import { erAdmin } from "@/lib/auth/admin";

// Admin-gaten (21/8): kommasepareret liste, case-ufølsom, fejlsikker lukket.
const OPRINDELIG = process.env.ADMIN_EMAIL;
afterEach(() => {
  process.env.ADMIN_EMAIL = OPRINDELIG;
});

describe("erAdmin", () => {
  it("kender alle adresser på listen, uanset store bogstaver og luft", () => {
    process.env.ADMIN_EMAIL = "a@b.dk, C@D.dk";
    expect(erAdmin("a@b.dk")).toBe(true);
    expect(erAdmin("c@d.DK")).toBe(true);
    expect(erAdmin(" A@B.dk ")).toBe(true);
  });

  it("afviser alle andre", () => {
    process.env.ADMIN_EMAIL = "a@b.dk";
    expect(erAdmin("x@y.dk")).toBe(false);
  });

  it("fejlkonfiguration åbner ALDRIG panelet", () => {
    process.env.ADMIN_EMAIL = "";
    expect(erAdmin("a@b.dk")).toBe(false);
    delete process.env.ADMIN_EMAIL;
    expect(erAdmin("a@b.dk")).toBe(false);
    process.env.ADMIN_EMAIL = "a@b.dk";
    expect(erAdmin(null)).toBe(false);
    expect(erAdmin(undefined)).toBe(false);
  });
});
