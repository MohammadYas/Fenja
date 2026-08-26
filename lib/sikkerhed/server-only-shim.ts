// Tom erstatning for npm-pakken "server-only", når serverkode bundtes til
// miljøer UDEN for Next (fx Netlify-baggrundsfunktionen): pakkens default-
// export kaster ved import i almindelig Node, fordi værnet er bygget til
// Reacts bundler-betingelser. Selve beskyttelsen (klientkode må ikke
// importere serverkode) håndhæves stadig af Next-builden — denne shim
// bruges KUN via esbuild-alias i scripts/byg-netlify-funktioner (se
// package.json "byg:funktioner").
export {};
