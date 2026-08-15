// Fælles layout for vilkår/privatliv: menneskedansk, læsbar bredde, semantisk
// HTML. v2: plakat-rubrik og mono-nummererede sektioner (REDESIGN §2.1).

type Afsnit = { overskrift: string; tekst: readonly string[] };

export function JuridiskSide({
  titel,
  opdateret,
  afsnit,
}: {
  titel: string;
  opdateret: string;
  afsnit: readonly Afsnit[];
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-kaempe font-bold">{titel}</h1>
      <p className="mt-2 font-mono text-detalje text-tekst/70">{opdateret}</p>
      {afsnit.map((del, i) => (
        <section key={del.overskrift} className="mt-10">
          <p className="font-mono text-detalje font-bold tracking-wide text-ravDyb">
            {String(i + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-1 text-titel font-medium">{del.overskrift}</h2>
          {del.tekst.map((afsnitTekst) => (
            <p key={afsnitTekst} className="mt-2 max-w-laesbar text-tekst/90">
              {afsnitTekst}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}
