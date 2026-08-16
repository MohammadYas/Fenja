// Renderer struktureret data som et <script type="application/ld+json">.
// Server-komponent: intet klient-JS. `<` escapes til <, så et "</script>"
// i copy aldrig kan bryde ud af tagget (XSS-hærdning på egne data).

export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
