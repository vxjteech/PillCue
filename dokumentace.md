# PillCue – Tracker léků a zdravotních návyků

## Popis aplikace

PillCue je progresivní webová aplikace (PWA) určená pro každodenní správu léků a sledování adherence k léčbě. Uživatel si zadá své léky, nastaví časy dávkování a aplikace ho prostřednictvím push notifikací připomíná, kdy je čas lék vzít. Veškerá historie užívání se ukládá lokálně a vizualizuje formou statistik a kalendářního přehledu.

Aplikace je primárně určena pro pacienty s chronickým onemocněním, seniory nebo kohokoliv, kdo užívá léky pravidelně a potřebuje spolehlivou připomínku. Informace o léčivech jsou čerpány z databáze SÚKL (Státní ústav pro kontrolu léčiv), která obsahuje všechna v ČR registrovaná léčiva.

---

## Use-case diagram

```
+-------------------+
|     Uživatel      |
+-------------------+
        |
        |--- Přidat lék (název, dávka, časy)
        |--- Vyhledat lék v databázi SÚKL
        |--- Potvrdit užití léku ("Vzal jsem")
        |--- Přeskočit dávku ("Přeskočit")
        |--- Zobrazit historii užívání
        |--- Zobrazit statistiky adherence
        |--- Upravit / smazat lék
        |--- Nastavit připomínky (push notifikace)
        |--- Exportovat historii (PDF / CSV)
```

---

## Účel aplikace

Hlavním cílem aplikace je zjednodušit každodenní správu léků a zvýšit adherenci k léčbě. Špatné dodržování léčebného režimu je jedním z nejčastějších problémů v péči o chronicky nemocné pacienty. PillCue tento problém řeší jednoduchou, přehlednou aplikací dostupnou na jakémkoliv zařízení bez nutnosti instalace.

Aplikace má potenciál pro další rozšíření – například sdílení přístupu s pečovatelem, napojení na elektronickou zdravotní dokumentaci nebo detekci interakcí mezi léky.

---

## Struktura projektu

```
pillcue/
├── index.html              # Hlavní stránka aplikace
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker (offline, notifikace)
├── css/
│   └── style.css           # Styly aplikace
├── js/
│   ├── app.js              # Hlavní logika aplikace
│   ├── storage.js          # Práce s localStorage
│   ├── notifications.js    # Push notifikace a timery
│   ├── api.js              # Komunikace s backendem (SÚKL)
│   ├── stats.js            # Výpočet statistik a adherence
│   └── export.js           # Export dat (PDF / CSV)
├── backend/
│   ├── server.js           # Node.js + Express server
│   ├── db/
│   │   └── sukl.db         # SQLite databáze importovaná ze SÚKL
│   └── routes/
│       └── medications.js  # API endpointy
└── docs/
    └── dokumentace.md      # Tato dokumentace
```

---

## Použité technologie

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- PWA – Service Worker, Web App Manifest
- Web Notifications API
- Chart.js – vizualizace statistik
- localStorage – lokální ukládání dat

### Backend
- Node.js + Express
- SQLite – databáze léčiv importovaná z SÚKL
- CORS, dotenv

---

## Datová struktura (localStorage)

Veškerá uživatelská data jsou ukládána lokálně v prohlížeči pomocí `localStorage`.

### `medications` – seznam léků uživatele

```json
[
  {
    "id": "uuid-1234",
    "name": "Ibuprofen",
    "sukl_id": "0123456",
    "dose": "400",
    "unit": "mg",
    "times": ["08:00", "20:00"],
    "color": "#e74c3c",
    "active": true,
    "notes": "Brát po jídle",
    "createdAt": "2025-05-01T10:00:00Z"
  }
]
```

### `logs` – záznamy o užití

```json
[
  {
    "id": "log-uuid-5678",
    "medicationId": "uuid-1234",
    "scheduledTime": "2025-05-13T08:00:00Z",
    "takenAt": "2025-05-13T08:07:00Z",
    "status": "taken"
  },
  {
    "id": "log-uuid-9999",
    "medicationId": "uuid-1234",
    "scheduledTime": "2025-05-13T20:00:00Z",
    "takenAt": null,
    "status": "skipped"
  }
]
```

Možné hodnoty `status`: `taken`, `skipped`, `missed`

### `settings` – uživatelská nastavení

```json
{
  "notificationsEnabled": true,
  "notificationLeadMinutes": 5,
  "theme": "light",
  "exportFormat": "pdf"
}
```

---

## Backend – API endpointy

Backend slouží výhradně jako rozhraní pro vyhledávání v databázi SÚKL. Databáze je importována z volně dostupných dat SÚKL (CSV export) do SQLite při prvním spuštění serveru.

### Base URL
```
http://localhost:3000/api
```

---

### `GET /api/medications/search`

Vyhledá léčiva v databázi SÚKL podle názvu nebo účinné látky.

**Query parametry:**

| Parametr | Typ | Popis |
|---|---|---|
| `q` | string | Název léku nebo účinná látka (min. 3 znaky) |
| `limit` | number | Počet výsledků (výchozí: 10, max: 50) |

**Příklad požadavku:**
```
GET /api/medications/search?q=ibuprofen&limit=5
```

**Příklad odpovědi:**
```json
{
  "results": [
    {
      "sukl_id": "0123456",
      "name": "Ibuprofen Apotex 400 mg",
      "active_substance": "Ibuprofenum",
      "form": "Potahovaná tableta",
      "strength": "400 mg",
      "package": "30 tablet",
      "atc_code": "M01AE01",
      "registration_status": "registrován"
    }
  ],
  "total": 1
}
```

---

### `GET /api/medications/:sukl_id`

Vrátí detail konkrétního léčiva podle jeho SÚKL identifikátoru.

**Příklad požadavku:**
```
GET /api/medications/0123456
```

**Příklad odpovědi:**
```json
{
  "sukl_id": "0123456",
  "name": "Ibuprofen Apotex 400 mg",
  "active_substance": "Ibuprofenum",
  "form": "Potahovaná tableta",
  "strength": "400 mg",
  "package": "30 tablet",
  "atc_code": "M01AE01",
  "atc_name": "Ibuprofen",
  "manufacturer": "Apotex Europe B.V.",
  "registration_status": "registrován",
  "registration_number": "29/123/05-C",
  "leaflet_url": "https://www.sukl.cz/..."
}
```

---

### `GET /api/medications/atc/:atc_code`

Vrátí seznam léčiv se stejným ATC kódem (stejná účinná látka, různí výrobci).

**Příklad požadavku:**
```
GET /api/medications/atc/M01AE01
```

---

### `GET /api/health`

Kontrolní endpoint – ověří, že server běží.

**Příklad odpovědi:**
```json
{
  "status": "ok",
  "db_records": 42381,
  "sukl_data_version": "2025-04"
}
```

---

## Principy fungování jednotlivých částí

### Připomínky (notifikace)

Po přidání léku se na základě nastavených časů zaregistrují opakované timery pomocí `setTimeout` / `setInterval`. Service Worker zajišťuje, že notifikace fungují i při minimalizovaném prohlížeči. Uživatel může přímo z notifikace potvrdit užití nebo dávku přeskočit.

### Statistiky a adherence

Modul `stats.js` prochází záznamy v `logs` a počítá:
- **adherence skóre** – procento včas vzatých dávek za zvolené období
- **streak** – počet dní v řadě bez vynechané dávky
- **přehled po dnech** – podklad pro kalendářní vizualizaci

### Vyhledávání léků

Při přidávání léku uživatel začne psát název, aplikace volá `GET /api/medications/search?q=...` a zobrazuje výsledky jako autocomplete. Po výběru se ze SÚKL databáze předvyplní název a účinná látka. Dávku a časy si uživatel nastavuje sám.

### PWA a offline režim

Service Worker cachuje statické soubory aplikace, takže základní funkcionalita (zobrazení léků, potvrzení dávky, statistiky) funguje i bez připojení k internetu. Vyhledávání v SÚKL databázi vyžaduje připojení k backendu.

---

## Zdroj dat

Databáze léčiv pochází z otevřených dat **SÚKL – Státní ústav pro kontrolu léčiv**, konkrétně z datasetu *Databáze léčivých přípravků (DLP)*:
- [https://opendata.sukl.cz/?q=katalog/databaze-lecivych-pripravku-dlp](https://opendata.sukl.cz/?q=katalog/databaze-lecivych-pripravku-dlp)
- Data jsou dostupná jako jeden ZIP soubor obsahující sadu CSV souborů (~9,5 MB)
- Aktualizována měsíčně, volně ke stažení bez registrace
- Obsahuje veškerá v ČR registrovaná humánní léčiva

Při prvním spuštění backend automaticky stáhne a naimportuje ZIP do SQLite databáze. Měsíční aktualizace probíhá stejným způsobem.

> **Disclaimer:** Aplikace slouží výhradně jako osobní připomínač a organizační nástroj. Informace z databáze SÚKL jsou poskytovány informativně a nenahrazují příbalový leták ani radu lékaře či lékárníka.
