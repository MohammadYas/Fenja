"use client";

// Klientside-komprimering før upload (B-2): mobildata er dyre. Skalerer til
// maks. kantlængde og sænker JPEG-kvaliteten trinvist til målstørrelsen er nået.

import { upload } from "@/lib/config";

export async function komprimerFoto(fil: File): Promise<Blob> {
  const bitmap = await createImageBitmap(fil);
  const skala = Math.min(1, upload.maksKantPx / Math.max(bitmap.width, bitmap.height));
  const bredde = Math.round(bitmap.width * skala);
  const hoejde = Math.round(bitmap.height * skala);

  const canvas = document.createElement("canvas");
  canvas.width = bredde;
  canvas.height = hoejde;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas ikke tilgængelig");
  ctx.drawImage(bitmap, 0, 0, bredde, hoejde);
  bitmap.close();

  for (const kvalitet of [0.85, 0.75, 0.65, 0.55, 0.45]) {
    const blob = await tilBlob(canvas, kvalitet);
    if (blob.size <= upload.maksFotoBytes) return blob;
  }
  // Sidste udvej: laveste kvalitet — stadig bedre end at blokere brugeren
  return tilBlob(canvas, 0.35);
}

function tilBlob(canvas: HTMLCanvasElement, kvalitet: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Komprimering fejlede"))),
      "image/jpeg",
      kvalitet,
    );
  });
}
