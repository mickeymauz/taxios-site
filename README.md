# Strona TaxiOS

Statyczna strona (GitHub Pages, bez budowania): `index.html`, `style.css`, `main.js`, `polityka-prywatnosci.html`, obrazy w `img/`.

- **Animacje**: sekcje `.scrolly` z `data-scene` (hero, meter, track, bubble) są sterowane przewijaniem w `main.js` — canvas i CSS, bez bibliotek. Przy systemowym „ogranicz ruch” strona pokazuje statyczne kadry.
- **Zrzuty ekranu**: `img/*.webp` (540×1050) z `docs/play/assets/screenshots` w repo aplikacji.
- **Zmiana nazwy aplikacji**: nazwa występuje tylko jako tekst „TaxiOS” w plikach HTML i w `main.js` nie występuje. Podmiana: `sed -i 's/TaxiOS/NowaNazwa/g' *.html` (sprawdź też nazwę folderu Dysku w polityce, która musi zgadzać się z aplikacją).
- **Podgląd lokalnie**: `python3 -m http.server` w tym folderze i http://localhost:8000.
