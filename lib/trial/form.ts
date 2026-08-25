// Whitelist-læsning af trial-formularen (ejer-krav 8): endpointet tager KUN
// imod fotoet, captcha-tokenet og skærmdata til fingerprintet. Model,
// opløsning, antal, visning — ALT er hårdkodet server-side, og fremmede
// felter i payloaden kasseres her, før de når nogen logik.
//
// Ren funktion over FormData — testbar uden request.

export type TrialFelter = {
  foto: File | null;
  captchaToken: string | null;
  skaerm: string;
};

export function laesTrialFelter(form: FormData): TrialFelter {
  const foto = form.get("foto");
  const captcha = form.get("captcha");
  const skaerm = form.get("skaerm");
  return {
    foto: foto instanceof File ? foto : null,
    captchaToken: typeof captcha === "string" && captcha.length > 0 ? captcha.slice(0, 4096) : null,
    skaerm: typeof skaerm === "string" ? skaerm.slice(0, 60) : "",
  };
}
