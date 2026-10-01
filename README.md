# ŽAR — Pljeskavica sârbească pe jar

Site de prezentare pentru **ŽAR**, local de pljeskavica sârbească: meniu, povestea casei, catering și locație.

**Live:** https://portalstudiodesign.github.io/zar-pljeskavica/

![ŽAR — Pljeskavica sârbească pe jar](img/og-image.jpg)

## Stare

🚧 **Previzualizare.** Datele de contact (telefon, adresă, program, email, firmă) nu sunt încă publicate. Până la lansare:

- pagina e marcată `noindex`, deci nu apare în Google;
- o bandă „Site în lucru” e afișată sus;
- formularul de catering validează câmpurile, dar nu trimite nimic.

Ce mai e de făcut până la lansare e în [issues](https://github.com/portalstudiodesign/zar-pljeskavica/issues). Checklist-ul pentru trecerea în varianta finală e în [#7](https://github.com/portalstudiodesign/zar-pljeskavica/issues/7).

## Structură

Site static, fără build și fără dependențe:

```
index.html               conținutul paginii
confidentialitate.html   politica de confidențialitate (GDPR)
styles.css               stiluri (culori și dimensiuni în variabilele din :root), inclusiv @font-face
script.js                meniu mobil, categorii meniu, detalii preparate, animații, formular catering, scântei în hero
img/                     poze .webp, pictograma ANPC SAL, imaginea de previzualizare pentru link-uri (og-image.jpg)
fonts/                   Bricolage Grotesque și Inter găzduite local (.woff2) + licențele OFL
.nojekyll                GitHub Pages servește fișierele exact cum sunt
```

## Rulare locală

Orice server static merge, de exemplu:

```bash
python -m http.server 5178
```

Apoi deschide http://localhost:5178.

## Publicare

GitHub Pages servește ramura `main`, din rădăcină. Un `git push` pe `main` republică site-ul în ~1 minut.

GitHub Pages le cere browserelor să păstreze fișierele până la 10 minute. La fiecare modificare în `styles.css` sau `script.js`, schimbă versiunea din `index.html` (`styles.css?v=…`, `script.js?v=…`), ca vizitatorii să primească imediat fișierele noi.

## Poze

- Cardurile din meniu folosesc poze 4:3, cu preparatul în centru (decupate din originale 16:9).
- Poza din prima secțiune e pătrată, cu marginile aproape negre, pentru că se estompează în fundal.
- Numele fișierelor sunt referite din `index.html`. O poză nouă salvată cu același nume înlocuiește poza veche fără alte modificări.
- Originalele la rezoluție mare nu sunt în repo.
- Pozele generate cu AI au clasa `ai-img`, care afișează eticheta „Imagine generată AI” (AI Act, art. 50). Când o poză e înlocuită cu una reală, se scoate clasa.

## Conformitate

- **Pictograma ANPC SAL** în bara de meniu, pe telefon în meniul deschis și în subsol, cu link spre reclamatiisal.anpc.ro (Ord. ANPC 449/2022, mod. 270/2026).
- **Fără cookie-uri și fără resurse externe:** fonturile sunt găzduite local, deci nu e nevoie de banner de cookie-uri.
- **Politica de confidențialitate** în `confidentialitate.html`, cu link de lângă formular.
- **Alergenii și ingredientele** fiecărui preparat, în blocurile `dish__details` din `index.html` (Reg. UE 1169/2011).

Ce mai e de verificat e în issues, cu eticheta [`legal`](https://github.com/portalstudiodesign/zar-pljeskavica/issues?q=label%3Alegal).

---

Design și dezvoltare: Portal Design Studio
