// "Ugens salgsplan"-mail (abonnent-fordel, 21/8): Smart Salgsplan-rådene fra
// oversigten som mandagsmail. Emne: emails.salgsplan.emne(antal).

import type { SalgsPunkt } from "@/lib/salg/smart-plan";
import { emails } from "@/lib/copy/emails";
import { emailFarver, emailSkrifter, emailTypo } from "./stil";
import { Afsnit, EmailRamme, Knap, Overskrift } from "./komponenter";

export type SalgsplanMailProps = {
  punkter: readonly SalgsPunkt[];
  oversigtUrl: string;
};

export function SalgsplanMail({ punkter, oversigtUrl }: SalgsplanMailProps) {
  const kopi = emails.salgsplan;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod}</Afsnit>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {punkter.map((punkt) => (
            <tr key={punkt.itemId}>
              <td style={{ padding: "0 0 14px" }}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontFamily: emailSkrifter.brod,
                    fontSize: emailTypo.detalje,
                    fontWeight: 700,
                    color: emailFarver.knap,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.04em",
                  }}
                >
                  {kopi.handlinger[punkt.handling] ?? punkt.handling}
                </p>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontFamily: emailSkrifter.brod,
                    fontSize: emailTypo.basis,
                    fontWeight: 700,
                    color: emailFarver.tekst,
                  }}
                >
                  {punkt.titel}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: emailSkrifter.brod,
                    fontSize: emailTypo.basis,
                    lineHeight: "1.6",
                    color: emailFarver.tekst,
                  }}
                >
                  {punkt.tekst}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Knap href={oversigtUrl} tekst={kopi.knap} />
      <Afsnit daempet>{kopi.hvorfor}</Afsnit>
    </EmailRamme>
  );
}
