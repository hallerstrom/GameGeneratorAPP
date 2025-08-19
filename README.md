# Poolspelsverktyget

Ett enkelt och intuitivt webbverktyg för att generera spelscheman, lagindelningar och kioskscheman för sportevenemang eller turneringar.

## Vad är det?

Poolspelsverktyget är en webbapplikation byggd med React som hjälper dig att snabbt organisera spel och evenemang. Appen erbjuder följande funktioner:

* **Spelschema:** Skapa automatiskt ett komplett spelschema baserat på antalet lag. Du kan även lägga till speltider om du vill.
* **Lagindelning:** Slumpa ihop lag från en lista av spelare för en rättvis uppdelning.
* **Kioskschema:** Generera ett passande schema för kioskpass baserat på total tid och antal personer.

## Tekniker

Appen är byggd med moderna webbtekniker:

* **React:** För att bygga det dynamiska användargränssnittet.
* **JavaScript:** För all applikationslogik.
* **HTML & CSS:** För sidans struktur och design.
* **gh-pages:** Används för att enkelt publicera applikationen på GitHub Pages.
* **jspdf:** Ett JavaScript-bibliotek för att generera PDF-filer från scheman.

## Hur man använder appen

1.  Gå till den publicerade applikationen på [denna länk](https://hallerstrom.github.io/Poolspelsverktyget/).
2.  Välj mellan att **Generera spelschema**, **Generera lag** eller **Generera kioskschema**.
3.  Fyll i informationen i formuläret. Följ instruktionerna för varje val.
4.  Klicka på "Generera" för att se ditt schema.
5.  Du kan sedan spara ditt schema som en PDF-fil genom att klicka på knappen "Spara som PDF".

## Installation och körning lokalt

Om du vill köra eller utveckla applikationen lokalt på din egen dator, följ dessa steg:

1.  Klona ner detta repository:
    ```bash
    git clone [https://github.com/hallerstrom/Poolspelsverktyget.git](https://github.com/hallerstrom/Poolspelsverktyget.git)
    ```
2.  Navigera till projektmappen:
    ```bash
    cd Poolspelsverktyget
    ```
3.  Installera alla nödvändiga beroenden:
    ```bash
    npm install
    ```
4.  Starta utvecklingsservern:
    ```bash
    npm start
    ```
    Appen kommer då att startas i din webbläsare på `http://localhost:3000`.

## Licens

Detta projekt är licensierat under **MIT-licensen**.
