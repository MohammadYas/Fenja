// Fælles layout for vilkår/privatliv: menneskedansk, læsbar bredde, semantisk HTML.

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
      <h1 className="font-display text-display">{titel}</h1>
      <p className="mt-1 font-mono text-detalje text-tekst/70">{opdateret}</p>
      {afsnit.map((del) => (
        <section key={del.overskrift} className="mt-8">
          <h2 className="text-titel font-medium">{del.overskrift}</h2>
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
