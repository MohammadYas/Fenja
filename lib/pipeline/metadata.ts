import sharp from "sharp";

// Metadata-rens (ejer-beslutning 22/8: "0 AI-metadata på billederne").
// Provideren lægger EXIF/XMP/IPTC og C2PA-provenance i filerne — det skal
// ALDRIG følge med ud til kunden. Filen skal indeholde billedet og intet
// andet: ingen model- eller leverandørnavne (samme regel som at DeepSeek
// aldrig nævnes udadtil), ingen kameradata, ingen provenance-manifest.
//
// VIGTIGT om ærligheden: den SYNLIGE AI-mærkning i produktet består —
// visualiseringen er altid mærket som genereret i annoncen og i copy'en
// (EU AI-forordningen art. 50 om oplysning til brugeren). Denne funktion
// rører kun filens metadata-felter.
//
// Sharp fjerner som udgangspunkt AL metadata ved gen-kodning, så længe der
// ikke kaldes withMetadata()/keepExif(). Det afgørende er .rotate(): den
// bager EXIF-orienteringen ind i pixels FØR metadataen ryger, så billeder
// fra telefoner ikke vender forkert, når orienterings-flaget forsvinder.
export const JPEG_KVALITET = 92;

export async function fjernMetadata(billede: Buffer): Promise<Buffer> {
  return sharp(billede)
    .rotate() // uden argument: anvend EXIF-orientering, og drop så flaget
    .jpeg({ quality: JPEG_KVALITET, mozjpeg: true })
    .toBuffer();
}
