// Katalog-prompts som data til generer-katalog.ts (ejer-ordre 2026-08-19).
// PROMPT-SPROG ER ENGELSK — dokumenteret læring (skabeloner.ts, v3→v4):
// billedmodellerne følger engelske instrukser markant bedre. Ejer-feedback
// 19/8 på første danske kørsel: "det ser for ai ud" → engelsk + hårdere
// amatør-/uperfekthedscues. Kilde-teksterne (dansk) bor i docs/katalog-prompts.md.
// PRODUKTVINKLERNE (uden person) bygges programmatisk: kategori × visning.

export type KatalogPrompt = {
  id: string;
  titel: string;
  prompt: string;
};

// Fælles realisme-blok — udvidet udgave af den PROVEN blok fra
// docs/marketing-billeder.md (v4). Realismen kommer fra det uperfekte.
const REALISME =
  " Photo style: a completely authentic casual smartphone photo taken quickly " +
  "for a secondhand clothing listing on Vinted — NOT a professional photoshoot, " +
  "NOT editorial, NOT a lookbook, NOT staged. Shot handheld on an ordinary " +
  "two-year-old mid-range phone: framing is noticeably careless — the subject " +
  "is a bit off-centre with slightly too much empty space on one side, the " +
  "camera is tilted one or two degrees, and the crop feels accidental rather " +
  "than composed. Slightly uneven exposure with one corner a touch " +
  "underexposed; any window in frame is partly blown out with clipped " +
  "highlights. A very slight handheld motion softness — the photo is NOT " +
  "tack-sharp anywhere. DEEP focus like a phone's main camera: the background " +
  "and the room are almost exactly as sharp as the garment — absolutely NO " +
  "depth-of-field blur, NO bokeh, NO portrait mode; everything from the " +
  "garment to the back wall reads clearly. Visible fine " +
  "sensor noise and subtle JPEG compression artifacts across flat surfaces, " +
  "mild lens vignetting in the corners, a faint chromatic aberration fringe " +
  "at high-contrast edges, and a slight overall colour cast the phone failed " +
  "to correct. Natural mixed light with soft, slightly muddy shadows — " +
  "ordinary flat indoor light, never golden or cinematic. Believable lived-in " +
  "Scandinavian home with everyday mess at the frame edges (a charger cable, " +
  "a door frame, a radiator, a laundry basket, a stray sock — subtle, not " +
  "arranged). Realistic fabric with natural wrinkles and creases from " +
  "storage. The result must be indistinguishable from a boring real photo a " +
  "private seller snapped at home in ten seconds without thinking about " +
  "composition — mundane, flat, unremarkable, slightly disappointing. Muted, " +
  "slightly dull natural colours. Vertical 2:3 composition.";

const UNDGAA_FAELLES =
  " Avoid: AI look, CGI, 3D render, illustration, perfect studio lighting, " +
  "perfectly even light, perfect symmetry, perfectly smooth fabric, tack-sharp " +
  "focus everywhere, editorial or lookbook styling, product-photography or " +
  "catalog look, centred balanced composition, oversaturated colours, " +
  "hyperreal crispness, beauty retouching, plastic skin, extra or deformed " +
  "fingers, warped anatomy, distorted phone, wrong mirror reflection, blurred " +
  "background, bokeh, portrait mode, shallow depth of field, ANY " +
  "readable or pseudo-readable text anywhere in the image, ANY visible brand " +
  "label or care label or neck label (no label visible at all), logos, " +
  "watermark, people (unless the motif requires one hand), the photographer's " +
  "hand or phone or reflection visible anywhere, a phone-shaped shadow, " +
  "floating garments, damaged or frayed or stained fabric, double hangers, " +
  "duplicated buttons or hardware, shop or showroom look, staged styling.";

// ---------------------------------------------------------------------------
// Tøjdele til produktvinklerne — én pr. kategori, matcher person-prompterne
// så serien hænger sammen (samme kjole i P4 og i kjole-vinklerne osv.)

const TOEJDELE = [
  {
    kategori: "kjole",
    beskrivelse:
      "a dusty sage-green midi dress in light matte viscose with thin straps, a simple neckline and a soft natural drape",
    detalje:
      "the straps, the neckline seam and the soft natural drape of the viscose with its fine wrinkles",
  },
  {
    kategori: "jeans",
    beskrivelse:
      "a pair of classic medium-blue straight-leg jeans in a vintage wash with a metal button, fly, belt loops and clearly visible denim twill weave",
    detalje:
      "the waistband with its metal button, the orange contrast stitching and the diagonal twill weave of the denim",
  },
  {
    kategori: "striktroeje",
    beskrivelse:
      "a navy-blue crew-neck lambswool sweater with fine ribbing at the neck, cuffs and hem, a soft matte surface with visible knit stitches",
    detalje:
      "the ribbed collar and the individual knit stitches, with a hint of natural pilling on one sleeve",
  },
  {
    kategori: "jakke",
    beskrivelse:
      "an olive-green wool overshirt with visible buttons, two flap chest pockets and a regular collar, with a clearly visible matte wool weave",
    detalje:
      "the collar, the buttons and one flap chest pocket, with the wool weave clearly visible",
  },
  {
    kategori: "taske",
    beskrivelse:
      "a black medium-sized shoulder bag in lightly grained leather with an adjustable strap, a simple flap and discreet metal hardware",
    detalje:
      "the flap closure and metal hardware, and the natural grain of the leather with small signs of use",
  },
] as const;

// Visninger (uden person) — hver tøjdel × hver visning = én prompt
const VISNINGER = [
  {
    id: "gulv",
    titel: "På gulvet (top-down)",
    byg: (t: (typeof TOEJDELE)[number]) =>
      `A quick top-down phone photo for a secondhand listing: ${t.beskrivelse} laid out by hand on an oak plank floor with visible grain. The garment is smoothed out roughly but keeps natural small wrinkles and sits slightly askew — laid out in a hurry, NOT shop-folded, NOT perfectly straight. At the frame edge a hint of everyday life: the edge of a rug, a skirting board, a radiator foot. Natural daylight from a window to one side gives a soft shadow gradient across the floor. Any visible collar or waistband interior is plain fabric with NO label of any kind. The photographer is completely invisible: no hand, no phone, no reflection and no shadow of the photographer anywhere in the frame.` +
      REALISME +
      UNDGAA_FAELLES,
  },
  {
    id: "stativ",
    titel: "På tøjstativ",
    byg: (t: (typeof TOEJDELE)[number]) =>
      `A quick phone photo for a secondhand listing: ${t.beskrivelse} ${
        t.kategori === "taske"
          ? "hanging by its strap on the rail of a simple black metal clothes rack"
          : t.kategori === "jeans"
            ? "folded once over the wooden bar of a single mismatched wooden hanger on a simple black metal clothes rack, hanging the way people actually hang jeans"
            : "on a single mismatched wooden hanger on a simple black metal clothes rack, hanging naturally with its own drape and slightly askew"
      } in an ordinary bedroom. Two or three other pieces of clothing in muted colours hang pushed to one side, slightly crowded, so the listed item stands clearly apart. White wall behind with a few small marks, pale wood floor, a laundry basket or a pair of worn sneakers at the base of the rack. Daylight from a window outside the frame, one side of the garment slightly brighter than the other.` +
      REALISME +
      UNDGAA_FAELLES,
  },
  {
    id: "bagside",
    titel: "Bagside",
    byg: (t: (typeof TOEJDELE)[number]) =>
      `A quick phone photo for a secondhand listing showing the BACK of ${t.beskrivelse}: ${
        t.kategori === "taske"
          ? "the bag stands on a pale wood floor with its back towards the camera, leaning slightly against a white wall with a small scuff mark"
          : "the garment hangs on a mismatched wooden hanger on a white door, back towards the camera, hanging slightly askew"
      }. The back construction, seams and natural drape from behind are clearly visible, with realistic storage creases. Photographed at a casual standing angle, daylight from one side, soft uneven shadows.` +
      REALISME +
      UNDGAA_FAELLES,
  },
  {
    id: "detalje",
    titel: "Close-up detalje",
    byg: (t: (typeof TOEJDELE)[number]) =>
      `A quick close-up phone photo for a secondhand listing: a tight detail shot of ${t.detalje} of ${t.beskrivelse}. The item lies on a wooden table with visible grain and a faint scratch, or on slightly wrinkled linen bedding. At most one ordinary adult hand with five correct fingers and plain short nails lifts the edge of the item naturally — no face, no body. The garment's construction must be correct and undamaged: every button, seam and edge appears exactly once and intact — no duplicated buttons, no frayed or torn edges, the item is in good used condition. Sharp focus on the detail, the background naturally a little softer without artificial bokeh. Daylight slightly from the side so the texture gets relief and micro-shadows; a couple of dust specks or crumbs on the surface.` +
      REALISME +
      UNDGAA_FAELLES,
  },
] as const;

function kapital(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

const PRODUKTVINKLER: KatalogPrompt[] = TOEJDELE.flatMap((t) =>
  VISNINGER.map((v) => ({
    id: `${t.kategori}-${v.id}`,
    titel: `${kapital(t.kategori)} · ${v.titel}`,
    prompt: v.byg(t),
  })),
);

// ---------------------------------------------------------------------------
// P1–P13 (engelsk, variabler udfyldt). Hårfarver roteret bevidst (C-6):
// blond, honningblond, mørkebrun, sort, rødbrun, gråsprængt.

const SELFIE_KERNE =
  "Casual mirror selfie for a secondhand clothing listing: the phone is held " +
  "vertically in front of the face so the phone completely covers the entire " +
  "face — the face is hidden behind the phone, NOT blurred, NOT cropped, " +
  "simply covered by the phone. Only a hint of chin, jawline and the hair " +
  "around the face can be seen. The back of the phone shows a plain " +
  "one-colour case with NO logo, NO emblem and NO text of any kind. ";

const PERSON_PROMPTS: KatalogPrompt[] = [
  {
    id: "p1-sovevaerelse-tanktop",
    titel: "P1 · Soveværelse — tanktop + vest + lyse jeans (kvinde)",
    prompt:
      SELFIE_KERNE +
      `A slim young adult woman stands in front of a tall floor-length mirror with a wide cream-white frame in a bright modern bedroom, facing the mirror almost straight on with a relaxed, slightly asymmetric posture, one hip pushed a little to the side. She has very long, straight, silky golden-blonde hair down to her waist, worn loose with a middle parting, falling over both shoulders. The phone is a light cream iPhone-style smartphone with a large square camera module and a plain minimalist case. She wears a very fitted white ribbed tank top with classic wide straps and a fairly deep round neckline ending just above the waistband so a small strip of stomach shows; over it an open short black sleeveless vest ending at the waist, creating two vertical black panels beside the white top. Light washed pale blue-grey denim jeans sit low on the hips with visible waistband and belt loops, fairly slim fit but not skinny, natural creases at hips and knees, no belt. A thin necklace with a small cross pendant; on the phone wrist several beige fabric scrunchies, hair elastics and thin bracelets with a small gold charm; a couple of thin bracelets on the free arm, which hangs relaxed with the hand resting against the outside of one thigh, fingers naturally spread. Her upper body and most of her legs are visible; the lower legs are cropped by the bottom edge. The mirror's vertical edges frame her on both sides; she fills roughly the middle third, phone at head height, natural perspective without wide-angle distortion. Behind her: warm beige off-white walls, a large floor-to-ceiling window covered by long sheer white curtains gathering slightly on the floor, green trees faintly visible through them, large dark-grey floor tiles. To the left a small white bedside unit with a drawer, a few everyday objects on top and a small pale plush toy near its base; a vertical row of white light switches on the wall. Soft diffuse daylight through the curtains, slightly warm tones indoors and a faint cool cast from the window, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: dark or curly hair, high-waisted jeans, crop top, patterned clothes, sunglasses, shoes in frame, a luxury hotel look.",
  },
  {
    id: "p2-entre-cardigan",
    titel: "P2 · Entre — taupegrå cardigan + hvide jeans (kvinde)",
    prompt:
      SELFIE_KERNE +
      `A slim young adult woman takes a close mirror selfie in a bright modern Scandinavian home, framed from the top of her head (almost cropped by the frame) down to mid-thigh, her body filling 70–80% of the image width. She faces the mirror almost straight on, slightly turned, leaning a touch towards the mirror; the free hand rests casually at a front pocket. She has long warm honey-blonde hair in large soft waves starting at jaw height, one loose wave falling forward over her shoulder — soft, glossy, naturally styled, NOT platinum. The phone is a cream-white smartphone with a plain minimalist case; a single wide minimalist gold ring on that hand. She wears a very fitted light taupe-grey fine-knit cardigan (a mix of warm grey and greige, heather texture) with long tight sleeves reaching almost over the hands, a deep V-neckline, very shaped at the waist, and a vertical row of about six small pearly buttons from under the bust down; the hem ends just above the hips so a narrow strip of bare stomach shows above the jeans. White/cream low-to-mid-rise jeans with a visible white button, fly, belt loops and front pockets, matte structured denim, fitted at hips and thighs, with one small horizontal distressed detail at one thigh. Camera at face height pointing slightly down, mild wide-angle feel without distortion. The room: a bright hallway with warm honey-oak plank flooring and white walls; on the left a floor-to-ceiling white-framed glass door letting daylight in, a darker doormat with several pairs of shoes standing naturally (grey-white sneakers, taupe chunky sneakers, pale ballerina flats with small bows); on the right a white wall very close to the camera; further back a living room with a cream sofa with dark grey cushions, a pale rug, and large windows showing a very green garden, slightly soft. On a small table near the back window a small bouquet of pink flowers and a thin pale book. Soft diffuse daylight from the left and the back, naturally warm skin tones, soft shadows in the knit folds, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: short or dark or perfectly straight hair, platinum blonde, a black or oversized cardigan, a high neckline, a t-shirt, high-waisted or blue jeans, a skirt, dominant necklaces, an exaggerated hourglass figure.",
  },
  {
    id: "p3-entre-overshirt-mand",
    titel: "P3 · Entre — uld-overshirt + mørke jeans (mand)",
    prompt:
      SELFIE_KERNE +
      `A young adult man with an ordinary natural build stands in front of a narrow floor-length mirror with a thin black metal frame and a couple of faint fingerprint smudges on the glass, in a bright modern Scandinavian hallway. He faces the mirror almost straight on, relaxed and slightly asymmetric, weight on one leg — not posing. He has short-to-medium dark brown hair, slightly untidy, everyday, no styling-product look. The phone is a black smartphone with a plain case. He wears an olive-green wool overshirt hanging open over a plain white t-shirt: visible buttons, two flap chest pockets, a regular collar, regular fit, clearly matte wool texture with natural creases at the elbows and around the pockets — the overshirt is the focus and fully visible from shoulder to hem. Dark navy plain straight-fit jeans with visible waistband and belt loops, no belt, natural creases at knees and hips. The free arm hangs relaxed, hand slightly open; at most a discreet watch. Feet may be cropped by the bottom edge. He fills the middle third of the frame, camera at head height. The hallway: off-white walls, pale wood floor with subtle grain, wall hooks with a couple of jackets and a tote bag, two or three pairs of shoes standing naturally by the door (sneakers, boots), a door frame and the corner of a radiator at the frame edge, a small key tray on a narrow sideboard. Soft uneven daylight from a glass door outside the frame mixed with a bit of warm ceiling light, slightly cool-neutral white balance with a warm cast, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: blonde or long hair, a dominant beard, a fitness pose, oversized streetwear, a cap, sunglasses, a luxury apartment look.",
  },
  {
    id: "p4-sovevaerelse-kjole",
    titel: "P4 · Soveværelse — salviegrøn midi-kjole (kvinde)",
    prompt:
      SELFIE_KERNE +
      `A slim young adult woman stands in front of a tall rectangular mirror with a thin oak frame leaning slightly against the wall (so the reflection has a natural minimal tilt) in a bright, lived-in Scandinavian bedroom. Relaxed, slightly asymmetric posture with one foot a little in front so the drape of the dress reads clearly. She has dark brown hair in large soft waves to mid-back, worn loose, falling naturally over one shoulder. The phone is white with a plain case and a large camera module. The dress is the focus: a dusty sage-green midi dress in light matte viscose with thin straps, a simple slightly V-shaped neckline, a softly marked waist and a soft natural drape to mid-calf — fine natural wrinkles and movement in the fabric, not stiff, not shiny, no print, no lace. She is barefoot; the free arm hangs relaxed; at most a thin gold chain. The whole dress is visible from shoulder to hem with air below the hem so the length reads. She fills the middle third, camera at head height. The room: warm off-white walls, oak floor, a bed with crumpled sand-coloured linen bedding partly in frame, a small bedside lamp switched on with warm light, a chair in the corner with a couple of garments slung over the backrest, a radiator and a window with a thin curtain at the edge, a glass of water and a book on the bedside table, a charger cable. Soft daylight mixed with warm lamp light — genuine mixed home white balance, no flash, soft shadows.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: blonde or short hair, shoes, high heels, a party-dress look, sequins, a deep neckline, mini length, prints, a hotel look.",
  },
  {
    id: "p5-walkin-jeans",
    titel: "P5 · Walk-in — jeans som hovedmotiv (kvinde, bryst og ned)",
    prompt: `Casual mirror photo for a secondhand clothing listing, framed from mid-chest down to the ankles — the jeans are the absolute focus, and the head is entirely OUTSIDE the top edge of the frame. A slim young adult woman photographs her jeans in a wide mirror in a bright bedroom/walk-in corner. One hand holds a cream smartphone visible at the top of the frame; the other hand rests relaxed in a front pocket. The jeans: a classic medium-blue vintage wash, straight-leg, mid-rise, visible waistband with a metal button, fly, belt loops and front pockets, no belt. Clearly matte denim twill texture, natural creases at hips, crotch and knees, slight stacking of fabric at the ankles, natural light whiskering at the pockets — no artificial rips. The top is deliberately plain and secondary: a simple white t-shirt tucked loosely into the waistband at the front so the waistband and button are fully visible. She stands slightly angled to the mirror, weight on one leg, the other knee slightly bent so the fit reads naturally. White socks, no shoes. The legs fill most of the frame height; the camera points slightly down without distorting leg length. The room: white walls, pale wood floor, a clothes rail with garments on hangers in the background, a basket at the frame edge — lived-in, not a showroom. Soft daylight from one window, natural shadows along the legs, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: a visible face or head, shoes, high heels, a model-leg pose, extreme skinny fit, artificial rips, a belt, unnaturally long legs.",
  },
  {
    id: "p6-vaerelse-strik-mand",
    titel: "P6 · Værelse — marineblå striktrøje (mand, hofte og op)",
    prompt:
      SELFIE_KERNE +
      `Framed from the hip up — the sweater is the focus. A young adult man with an ordinary build takes a mirror selfie in a rectangular wall mirror in a bright room. He has short, slightly curly black hair, everyday look. The phone is black with a plain case. The sweater: a navy-blue crew-neck lambswool sweater with clearly visible fine ribbing at the neck, cuffs and hem, regular fit, a soft matte surface with visible knit stitches and a hint of natural pilling on the sleeves — used but well kept. The collar of a white t-shirt shows at the neck. The free hand is half in a trouser pocket; at the bottom edge the waistband of beige chinos is just visible and secondary. Relaxed, slightly turned stance, no posing. The mirror hangs on a white wall; he fills about 70% of the frame width; camera at chest height angled slightly up. The room: a white wall, the corner of a framed print with no readable text, an oak chest of drawers with everyday items (a deodorant, a couple of books, a bowl of odds and ends), daylight from a window to the side. Lived-in, not styled. Soft side light bringing out the knit texture with fine shadows in the stitches, no flash, neutral-warm white balance.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: blonde or long straight hair, oversized streetwear fit, a hoodie, chest prints, a cap, sunglasses, muscle posing.",
  },
  {
    id: "p7-entre-taske",
    titel: "P7 · Entre — sort skuldertaske (kvinde, torso)",
    prompt:
      SELFIE_KERNE +
      `The bag is the absolute focus and sits near the centre of the image, framed from the top of the head down to mid-thigh. A slim young adult woman stands in front of a floor-length mirror in a bright hallway photographing a bag worn over her shoulder, the phone held vertically in front of her face so it completely covers the face. She has auburn/red-brown hair in soft waves, one lock falling over one shoulder. The bag: a black medium-sized shoulder/crossbody bag in lightly grained leather, hanging by an adjustable strap over one shoulder and resting against the hip. A simple flap, discreet gold hardware, clearly realistic leather grain with small natural signs of use. The bag's shape, its size relative to the body, the strap and the closure are fully visible — nothing hidden behind hands or clothing. The clothes are deliberately plain and secondary: a plain beige knit and dark jeans. One hand holds a cream smartphone with a plain case; the other rests lightly on the strap at the shoulder without covering the bag. She stands slightly angled so both the front and a little of the side/depth of the bag show; camera at chest height. The hallway: off-white walls, pale wood floor, wall hooks with a couple of jackets at the frame edge, a pair of shoes by the door, soft daylight from a glass door. Lived-in, not arranged. Soft diffuse daylight, natural soft reflections on the leather — not shiny plastic, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: a visible face, inventing a strap or carrying style the bag does not have, hands covering the closure or hardware, flashy jewellery, patterned clothes, plastic-looking brand-new leather.",
  },
  {
    id: "p8-opgang-frakke-mand",
    titel: "P8 · Opgang — camel uldfrakke (mand)",
    prompt:
      SELFIE_KERNE +
      `A young adult man stands in front of a tall mirror in an older Copenhagen apartment stairwell, taking a mirror selfie on his way out. He has short greying hair — adult, everyday. The phone is dark grey with a plain case. The coat is the focus: a camel wool coat in a classic cut ending just above the knee, with a regular collar and lapels, single-breasted buttons and side pockets, hanging open over a plain dark knit and dark jeans. The wool has a clearly matte texture with natural creases at the elbows and around the buttons. The whole coat is visible from shoulder to hem. Ordinary boots, partly cropped by the bottom edge. The free hand is in a coat pocket; no scarf covering the collar. The mirror is an older tall stairwell mirror with a simple frame and a couple of age spots near the edge. He fills the middle third, camera at head height. The stairwell: authentic older Danish stairwell — painted walls in a dusty cream/pale green, terrazzo floor, a row of metal letterboxes with NO readable names at the frame edge, a staircase with a railing behind, a bicycle helmet on a shelf. Diffuse daylight from a stairwell window mixed with cool ceiling light — slightly uneven like a real stairwell, no flash, flattish shadows, overcast Danish everyday light.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: blonde or long hair, readable names on letterboxes, signs with readable text, a scarf over the collar, golden-hour light, a marble luxury stairwell.",
  },
  {
    id: "p9-stue-strik",
    titel: "P9 · Stue — beige chunky-strik + mørke jeans (kvinde)",
    prompt:
      SELFIE_KERNE +
      `A slim young adult woman stands in front of a tall rectangular mirror with a thin oak frame leaning against the wall in a cosy, lived-in Scandinavian living room. The phone is white with a plain case. She has warm honey-blonde hair in large soft waves to mid-back, falling naturally around her shoulders. The sweater is the focus: a beige/off-white chunky-knit wool-mix sweater with a clearly visible coarse knit structure, a crew neck, regular-to-slightly-relaxed fit and ribbed cuffs and hem. The knit looks soft and used-but-well-kept with visible stitches — absolutely no AI-smooth surface. Dark plain straight-leg jeans with a visible waistband; wool socks, no shoes. The free arm hangs relaxed with the hand lightly against the thigh; weight on one leg. She fills the middle third, camera at head height. The living room, genuinely lived-in: a sofa in dusty green fabric with a crumpled wool throw over the armrest, a monstera in a pot, a wooden coffee table with a mug and a book, a floor lamp switched on with warm light, a window with white glazing bars and a thin curtain, oak floor with a jute rug, a radiator under the window, discreet clutter at the edges (newspapers, a charger, a basket). Grey soft Danish daylight from the window mixed with warm lamp light — the classic homely mix, no flash, soft shadows.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: dark or short hair, shoes, an oversized fit hiding the silhouette entirely, patterned or Christmas knit, candle-lit romance, a showroom living room.",
  },
  {
    id: "p10-boejle-skjorte",
    titel: "P10 · Bøjle — lyseblå skjorte på klædeskabsdør",
    prompt: `A quick phone photo for a secondhand listing, no people. A light blue cotton shirt hangs on a mismatched wooden hanger over the edge of a white wardrobe door in a bright Scandinavian bedroom — the hanger's metal hook is hidden behind the top edge of the door, so only the wooden shoulders of the hanger are visible. The shirt is seen from the FRONT — the buttoned front facing the camera. The shirt is the only focus: classic collar with NO neck label visible, button-through front with small pale buttons, one chest pocket, long sleeves hanging naturally down the sides. The cotton has clearly visible weave texture and natural light creases — worn-and-washed, absolutely not advertising-smooth, with a slightly rumpled hem. The shirt hangs a little askew on the hanger, hung up in a hurry by a person. The door is white with an ordinary handle and a faint natural wear mark around the handle. Photographed at a slightly skew casual standing angle from a bit too far away, the shirt off-centre with too much door visible on one side; at the frame edges a corner of a bed with crumpled linen bedding, a door frame and a strip of oak floor. Soft uneven daylight from a window to the side — one side of the shirt slightly brighter than the other, soft natural shadows behind it on the door, no flash.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: hands, any visible neck label or brand label or care label (the inside of the collar is plain fabric with no label), perfectly symmetric hanging, a steamer-ad look, a shop hanger with a logo, a fake backdrop, a deformed collar, wrong buttons.",
  },
  {
    id: "p11-flatlay-seng",
    titel: "P11 · Flatlay — strik + jeans på hørseng",
    prompt: `A quick top-down phone photo for a secondhand listing, no people. The photographer is completely invisible: no hand, no phone, no reflection and no shadow of the photographer anywhere in the frame. On a bed with slightly crumpled sand/off-white linen bedding an outfit is laid out casually by hand: a rust/terracotta merino knit sweater folded in half, and a pair of classic medium-blue straight-leg jeans beside it at a slight angle. Laid out like a person did it with their hands — NOT perfectly parallel, NOT shop-folded. The sweater has clearly visible fine merino stitches, ribbed neck and cuffs, and natural soft bumps in the fabric. The jeans have a visible waistband with a metal button, belt loops, clear denim twill texture and natural creases at the knees; one leg lies slightly bent. In a corner a pair of folded wool socks — nothing stealing focus. The bedding keeps its natural creases and folds — lived-in, not smoothed out; a hint of the bed edge and a bedside table at the frame edge. Natural daylight from a window on the left with a soft visible shadow gradient across the bedding, no flash. Taken from directly above with the phone at arm's length, at a slightly skew angle — not perfectly perpendicular.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: hands in frame, any visible neck label or brand label (the inside of the collar and waistband is plain fabric with no label), a perfectly symmetric shop flatlay, props like coffee or flowers arranged around the clothes, deformed proportions between sweater and jeans.",
  },
  {
    id: "p12-closeup-denim",
    titel: "P12 · Close-up — denimlinning med hånd",
    prompt: `A quick close-up phone photo for a secondhand listing. Only ONE ordinary adult hand is visible — no face, no body. A pair of vintage jeans lies on a wooden dining table. Tight detail shot of the waistband: the metal button with natural matte patina, the fly, the belt loops and the top of the front pockets. The hand holds the waistband gently folded open towards the camera so the inside with a washed-out care label is just barely hinted at — the label text must NOT be readable, only suggested. The denim shows a clearly visible sharp twill weave with its diagonal, orange contrast stitching, and natural light fading around the button and along the waistband — genuine wear, no artificial effects. The hand is realistic with five correct fingers, natural skin, plain short unpainted nails, at most one thin ring — holding naturally, not posed like a hand model. The table has visible grain and small everyday traces — a faint scratch, a couple of crumbs; the edge of a mug just visible in the soft frame edge. Daylight from a kitchen window slightly from the side so the denim texture gets relief and micro-shadows, no flash. Tight crop — the waistband fills most of the frame width at a slightly skew angle, focus sharp on the button and stitching, the background naturally a little softer without artificial bokeh.` +
      REALISME +
      UNDGAA_FAELLES +
      " Also avoid: faces, more than one hand, wrong finger count, readable label text, hand-model posing, brightly painted nails.",
  },
  {
    id: "p13-foer-billede",
    titel: "P13 · FØR-billedet — bevidst dårligt hverdagsfoto",
    prompt: `A genuinely BAD amateur phone photo, like a typical careless secondhand listing photo, no people. A navy-blue wool knit sweater lies dumped on a bed with crumpled, slightly dark bedding — thrown there, not laid out. The sweater is wrinkled, one sleeve folded under the body of the sweater, the neckline pointing askew; the shape is hard to read. The light is bad: warm yellowish ceiling light at night — no daylight. A clear hard shadow from the photographer's phone and arm falls across the sweater; one corner is slightly underexposed. The composition is skew and careless: taken from a half-lazy side angle, the sweater off-centre, too much empty bedding on one side, and a slice of a messy bedside table — a charger, a glass, a TV remote — poking into the frame edge. The quality is an ordinary phone in poor light: visible noise and grain in the shadows, slightly soft focus, yellowish white balance the phone failed to correct. NOT artistic — just sloppy. The sweater must still clearly read as a navy wool knit sweater — the photo is bad, not incomprehensible; the sweater itself is fine, just badly photographed. Badly lit amateur phone photo, cluttered bedroom, warm yellow indoor lighting at night, noisy shadows, careless framing, vertical 2:3.` +
      " Avoid: people, daylight, a neatly made bed, a neatly folded sweater, good composition, a flash look, black and white, artistic filters, extreme blur, readable logos, damaged or stained clothing, AI look, CGI, render.",
  },
];

// P14: EFTER-billedet til før/efter-panelet — Seljas "rensede foto"-output af
// samme mørkeblå strik som P13 (FØR). Skal ligne appens faktiske leverance:
// ren neutral baggrund, tøjet bevaret trofast — poleret, men stadig et foto.
const EFTER_PROMPT: KatalogPrompt = {
  id: "p14-efter-strik",
  titel: "P14 · EFTER — renset foto af mørkeblå strik",
  prompt:
    "A finished secondhand listing photo, the cleaned-up AFTER version: a navy-blue crew-neck lambswool sweater presented neatly on a clean, neutral light-grey seamless background, softly and evenly lit. The sweater is the same garment as an ordinary home photo — its knit texture, fine ribbing at neck, cuffs and hem, and natural slight signs of use are preserved completely faithfully; visible knit stitches, a soft matte wool surface, gentle natural folds where the fabric relaxes. Presented slightly angled and photographed straight on at chest height, filling most of the frame with calm air around it. The result looks like a professional-quality product photo made from a phone photo: clean background, balanced neutral white balance, soft shadow under the garment — but the garment itself stays real and unretouched, no artificial smoothing of the wool. No people, no hands, no hanger visible, no props. Any visible collar interior is plain fabric with NO label. Vertical 2:3 composition, photorealistic, high detail, realistic knit texture. Avoid: AI look, CGI, render, mannequin, ghost-mannequin effect, floating unnatural shape, plastic-smooth fabric, logos, readable or pseudo-readable text, labels, watermark, harsh studio glamour lighting, oversaturated colour, deformed proportions.",
};

// P15: EFTER som SPEJLSELFIE (ejer-ordre 2026-08-20: "efter med selja" skal
// være et realistisk spejlbillede) — samme mørkeblå strik som P13 (FØR), nu
// båret og fotograferet ordentligt i dagslys. Kontrasten til FØR er lyset og
// omhuen, ikke stilen: stadig et ægte telefonfoto.
const EFTER_SELFIE_PROMPT: KatalogPrompt = {
  id: "p15-efter-spejl-strik",
  titel: "P15 · EFTER — spejlselfie med mørkeblå strik (dagslys)",
  prompt:
    SELFIE_KERNE +
    `A young adult man with an ordinary natural build stands in front of a tall floor-length mirror with a thin oak frame leaning slightly against the wall in a bright, tidy Scandinavian bedroom. He wears the navy-blue crew-neck lambswool sweater — the SAME sweater as in a bad night-time photo, now worn and photographed properly: fine ribbing at neck, cuffs and hem clearly visible, soft matte wool with visible knit stitches, regular fit, the collar of a white t-shirt just visible at the neck. Dark plain straight-leg jeans, wool socks, no shoes. He has short dark brown hair, slightly untidy. The phone is a dark grey smartphone with a plain one-colour case. The free hand rests relaxed at his side; weight on one leg, relaxed posture, no posing. The whole sweater is clearly visible and centred — the sweater is the focus of the photo. The room is bright with soft daylight from a window with a thin white curtain: a neatly made bed with sand-coloured linen bedding, an oak floor, a small plant on the windowsill, calm and tidy but lived-in (a book and a glass of water on the bedside table). The light is generous and even — the clear daylight OPPOSITE of a dim yellow evening photo — with soft natural shadows, no flash.` +
    REALISME +
    UNDGAA_FAELLES +
    " Also avoid: blonde or long hair, an oversized fit, a messy dark room, yellow evening light, shoes.",
};

// P16–P18: flere FØR-billeder til før/efter-vælgeren (ejer-ordre 2026-08-20:
// man skal kunne vælge mellem flere eksempler). Samme bevidst dårlige stil
// som P13; tøjet matcher eksisterende EFTER-spejlselfies (p4 kjole, p5 jeans,
// p2 cardigan), så hvert par viser SAMME stykke tøj.
function foerPrompt(toej: string, ekstra: string): string {
  return `A genuinely BAD amateur phone photo, like a typical careless secondhand listing photo, no people. ${toej} lies dumped on a bed with crumpled, slightly dark bedding — thrown there, not laid out. The garment is wrinkled and partly folded under itself so the shape is hard to read. ${ekstra} The light is bad: warm yellowish ceiling light at night — no daylight. A clear hard shadow from the photographer's phone and arm falls across the garment; one corner is slightly underexposed. The composition is skew and careless: a half-lazy side angle, the garment off-centre, too much empty bedding on one side, a slice of a messy bedside table — a charger, a glass, a TV remote — poking into the frame edge. Ordinary phone in poor light: visible noise and grain in the shadows, slightly soft focus, yellowish white balance. NOT artistic — just sloppy. The garment must still clearly be recognisable — the photo is bad, not incomprehensible; the garment itself is fine, just badly photographed. Badly lit amateur phone photo, cluttered bedroom, warm yellow indoor lighting at night, noisy shadows, careless framing, vertical 2:3, no people. Avoid: people, daylight, a neatly made bed, neat folding, good composition, a flash look, black and white, artistic filters, extreme blur, readable logos, damaged or stained clothing, AI look, CGI, render.`;
}

const FOER_PROMPTS: KatalogPrompt[] = [
  {
    id: "p16-foer-kjole",
    titel: "P16 · FØR — dårligt foto af salviegrøn kjole",
    prompt: foerPrompt(
      "A dusty sage-green midi dress in light matte viscose with thin straps",
      "One strap is twisted and the hem is bunched up.",
    ),
  },
  {
    id: "p17-foer-jeans",
    titel: "P17 · FØR — dårligt foto af blå jeans",
    prompt: foerPrompt(
      "A pair of classic medium-blue straight-leg jeans in a vintage wash",
      "One leg is folded under the other and the waistband is turned half inside out.",
    ),
  },
  {
    id: "p18-foer-cardigan",
    titel: "P18 · FØR — dårligt foto af taupegrå cardigan",
    prompt: foerPrompt(
      "A fitted light taupe-grey fine-knit cardigan with small pearly buttons and a deep V-neck",
      "One sleeve hangs over the bed edge and the button row is askew.",
    ),
  },
];

export const KATALOG_PROMPTS: KatalogPrompt[] = [
  ...PERSON_PROMPTS,
  EFTER_PROMPT,
  EFTER_SELFIE_PROMPT,
  ...FOER_PROMPTS,
  ...PRODUKTVINKLER,
];
