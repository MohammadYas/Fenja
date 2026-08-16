# Marketing-billeder — prompts & principper

Prompterne bag billedserien på forsiden (`public/eksempler/`), så serien kan
genskabes eller udvides konsistent. v4 (2026-08-16) er genereret med
gemini-3-pro-image (2:3, 2K) og konverteret til 900×1350 webp via ffmpeg;
motiverne og realisme-blokken er uændrede fra v3 (dengang gpt-image-1).

**Provenance:** alle billeder er AI-genererede (ejer-ordre 2026-08-15; ingen
synlig mærkat MIDLERTIDIGT — se STATUS/S25). Ingen genkendelige ansigter (C-6):
telefonen dækker ansigtet, eller billedet er beskåret over hagen.

**App-pipelinen** bruger samme principper i kode: kategori-skabeloner og faste
hjem-ankre pr. sælger bor i `lib/pipeline/skabeloner.ts` (ejerens
prompt-bibliotek oversat til C-2/C-6-reglerne).

## Fælles realisme-blok (sættes efter hvert motiv)

> A completely authentic casual smartphone photo taken quickly for a secondhand
> clothing listing on Vinted — NOT a professional photoshoot, NOT editorial,
> NOT a lookbook, NOT staged. Slightly imperfect framing and exposure, natural
> mixed indoor light with realistic shadows, mild smartphone sensor noise,
> believable lived-in Scandinavian home with small everyday details and slight
> clutter (a charger cable, a door frame, a radiator, a laundry basket edge —
> subtle). Realistic fabric texture with natural wrinkles and folds. Ordinary
> realistic body proportions, realistic hands. The result must look
> indistinguishable from a real photo a private seller took at home with their
> phone. Muted natural colours, no text, no watermark, no logo, no
> recognizable face anywhere.

Læren fra v2→v3: uden ordene "quickly/amateur/lived-in/clutter/NOT editorial"
bliver resultatet for poleret og ligner AI. Realismen kommer fra det uperfekte:
blandet lys, rod i kanten af billedet, skæv beskæring.

## Motiverne (v3)

| Fil | Motiv |
|---|---|
| `spejl-strik.webp` | Casual mirror selfie in an ordinary Scandinavian bedroom: a young woman wearing a dark navy wool sweater and light straight-leg jeans photographs herself in a tall mirror leaning against the wall, her black phone held vertically completely covering her face. Slightly tilted amateur angle from chest height, unmade bed partly visible behind, oak floor, a bedside lamp switched on, mixed daylight and warm lamp light. |
| `spejl-jakke.webp` | Casual mirror selfie in an ordinary Scandinavian hallway: a young man wearing an olive-green wool overshirt over a white tee photographs himself in a slim full-length mirror with a few fingerprint smudges, phone held up covering the face entirely. Shoes by the door, jackets on wall hooks partly visible, pale wood floor, uneven hallway lighting. |
| `strik-vindue.webp` | Casual mirror selfie for a secondhand clothing listing, in an ordinary Scandinavian living room next to a window: a young woman wearing a cream chunky-knit cardigan buttoned up over dark straight-leg jeans photographs herself in a tall mirror leaning against the wall, her phone held vertically in front of her face so the phone completely covers the entire face — the face is hidden behind the phone, NOT blurred, NOT cropped, simply covered by the phone. The whole cardigan is clearly visible and centered. Grey daylight from the window beside the mirror, a radiator under the window, slightly tilted amateur angle, oak floor. NO posing, NOT atmospheric — an ordinary photo that shows the garment for sale. |
| `skjorte-doer.webp` | A quick listing photo: a light-blue striped cotton shirt on a mismatched wooden hanger, hung on a white wardrobe door with a slightly loose handle, photographed from a casual standing angle with the phone, soft uneven daylight from the side, a bit of the bedroom visible at the edge of the frame. |
| `flatlay-seng.webp` | A quick top-down phone photo on a bed with slightly wrinkled white linen bedding: a folded rust-brown merino sweater and a pair of vintage straight-leg jeans laid out by hand, not perfectly straight, natural window light from the left with a soft shadow of the photographer's arm barely visible at the frame edge. |
| `denim-detalje.webp` | A close-up phone photo of vintage denim on a kitchen table: waistband, button and belt loops with visible weave texture and the edge of the inner care label, slightly off-centre framing, natural daylight from a window, faint crumbs or dust specks on the table surface. |
| `gade-look.webp` | Casual mirror selfie for a secondhand clothing listing, in an ordinary Scandinavian entryway: a person wearing a camel wool coat open over a grey knit and dark jeans photographs themselves in a slim full-length mirror by the front door, phone held vertically in front of the face so the phone completely covers the entire face — the face is hidden behind the phone, NOT blurred, NOT cropped, simply covered by the phone. The whole coat is clearly visible and centered. Shoes by the door and a jacket on a wall hook at the edge of the frame, pale wood floor, flat ordinary daylight from a nearby window, slightly tilted amateur angle. NO posing, NOT atmospheric — an ordinary photo that shows the garment for sale. |

OG-billedet (`app/opengraph-image.png`) er `spejl-strik` + `skjorte-doer`
side om side i 1200×630.

## Regler for nye billeder i serien

1. Aldrig genkendelige ansigter. **Ejer-krav 2026-08-16: er der mennesker på,
   skal det være spejl-selfie med telefonen foran ansigtet — ALDRIG sløring,
   ALDRIG hoved-beskæring, og ALDRIG "taget af en ven".** (Tøj-uden-menneske-
   motiver er undtaget; flatlay/close-up med sælgerens egen hånd er ok.) Serien
   skal ligne salgsannoncer, ikke photoshoots — ingen positur, ingen stemning.
2. Altid den fælles realisme-blok efter motivet.
3. Samme "hjem"-følelse på tværs af serien — genbrug detaljer (egetræsgulv,
   hørtekstiler, hvide døre), så serien hænger sammen.
4. Ingen tekst/logoer/vandmærker; dæmpede naturlige farver.
5. Udskiftes med ÆGTE produkt-output efter S12 (S25 har deadline Gate 4).
