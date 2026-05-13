# PillCue – Tracker léků a zdravotních návyků

## Popis aplikace

PillCue je progresivní webová aplikace určená pro každodenní správu léků a sledování adherence k léčbě. Uživatel si zadá své léky, nastaví časy dávkování a aplikace ho prostřednictvím push notifikací připomíná, kdy je čas lék vzít. Veškerá historie užívání se ukládá lokálně a vizualizuje formou statistik a kalendářního přehledu.

Aplikace je primárně určena pro pacienty s chronickým onemocněním, seniory nebo kohokoliv, kdo užívá léky pravidelně a potřebuje spolehlivou připomínku. Informace o léčivech jsou čerpány z databáze SÚKL (Státní ústav pro kontrolu léčiv), která obsahuje všechna v ČR registrovaná léčiva.

---

## Účel aplikace

Hlavním cílem aplikace je zjednodušit každodenní správu léků a zvýšit adherenci k léčbě. Špatné dodržování léčebného režimu je jedním z nejčastějších problémů v péči o chronicky nemocné pacienty. PillCue tento problém řeší jednoduchou, přehlednou aplikací dostupnou na jakémkoliv zařízení bez nutnosti instalace.

---

## Použité technologie

### Frontend
- HTML, CSS, JavaScript
- PWA - Service Worker, Web App Manifest
- Web Notifications API
- Chart.js - vizualizace statistik
- localStorage - lokální ukládání dat

### Backend
- Node.js + Express
- SQLite – databáze léčiv importovaná z SÚKL

---

## Backend – API endpointy

Backend slouží výhradně jako rozhraní pro vyhledávání v databázi SÚKL. Databáze je importována z volně dostupných dat SÚKL (CSV export) do SQLite při prvním spuštění serveru.

---

## Principy fungování jednotlivých částí

### Připomínky (notifikace)

Po přidání léku se na základě nastavených časů zaregistrují opakované timery. Service Worker zajišťuje, že notifikace fungují i při minimalizovaném prohlížeči. Uživatel může přímo z notifikace potvrdit užití nebo dávku přeskočit.

### Statistiky a adherence

Modul `stats.js` prochází záznamy v `logs` a počítá:
- **adherence skóre** – procento včas vzatých dávek za zvolené období
- **streak** – počet dní v řadě bez vynechané dávky
- **přehled po dnech** – podklad pro kalendářní vizualizaci

### Vyhledávání léků

Při přidávání léku uživatel začne psát název, aplikace zobrazuje výsledky jako autocomplete. Po výběru se ze SÚKL databáze předvyplní název a účinná látka. Dávku a časy si uživatel nastavuje sám.

---

## Zdroj dat

Databáze léčiv pochází z otevřených dat **SÚKL – Státní ústav pro kontrolu léčiv**, konkrétně z datasetu *Databáze léčivých přípravků (DLP)*:
- [https://opendata.sukl.cz/?q=katalog/databaze-lecivych-pripravku-dlp](https://opendata.sukl.cz/?q=katalog/databaze-lecivych-pripravku-dlp)
- Data jsou dostupná jako jeden ZIP soubor obsahující sadu CSV souborů
- Aktualizována měsíčně, volně ke stažení bez registrace
- Obsahuje veškerá v ČR registrovaná humánní léčiva

Při prvním spuštění backend automaticky stáhne a naimportuje ZIP do SQLite databáze. Měsíční aktualizace probíhá stejným způsobem.
