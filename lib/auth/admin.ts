// Én kilde til admin-tjekket: ADMIN_EMAIL er en kommasepareret liste
// (ejer-ordre 21/8: flere admins). Tom/udefineret liste = ingen admins —
// fejlkonfiguration må aldrig åbne panelet.
export function erAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const liste = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((adresse) => adresse.trim().toLowerCase())
    .filter(Boolean);
  return liste.includes(email.trim().toLowerCase());
}
