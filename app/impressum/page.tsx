import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Das Portal – Angaben gemäß § 5 TMG.",
};

export default function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="font-serif text-3xl font-semibold text-text-primary">
        Impressum
      </h1>

      <section className="mt-6 space-y-5 text-sm leading-relaxed text-text-secondary">
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Lennert Bewernick
            <br />
            Lindenallee 10
            <br />
            23843 Rümpel
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Kontakt
          </h2>
          <p>
            E-Mail: lennert.bewernick@gmail.com
            <br />
            Telefon: 0176 62348657
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Haftung für Inhalte
          </h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
            Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
            verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
            jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf
            eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="mt-2">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
            Informationen nach den allgemeinen Gesetzen bleiben hiervon
            unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
            Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
            Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
            Inhalte umgehend entfernen.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Haftung für Links
          </h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum
            Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
            erkennbar.
          </p>
          <p className="mt-2">
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
            jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
            zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
            derartige Links umgehend entfernen.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Urheberrecht
          </h2>
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht
            kommerziellen Gebrauch gestattet.
          </p>
        </div>
      </section>
    </article>
  );
}
