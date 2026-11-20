import type { ContentPage } from "./types";

const PUBLISHED = "2026-11-20";

export const clanky: ContentPage[] = [
  {
    slug: "diktovani-prepis-nebo-navrh-zpravy",
    shortTitle: "Diktování, přepis, nebo návrh zprávy?",
    title: "Diktování, přepis, nebo návrh zprávy z rozhovoru? Tři způsoby, jak psát lékařské zprávy hlasem",
    metaTitle: "Diktování, přepis, nebo návrh zprávy? | ANOTE",
    description:
      "Diktování, přepis rozhovoru a strukturovaný návrh zprávy: v čem se liší a na co se při výběru zaměřit, pokud chcete psát lékařské zprávy hlasem.",
    perex:
      "Psát zprávy hlasem místo na klávesnici lze třemi různými způsoby. Liší se tím, kdo zprávu formuluje, co je výstupem a kolik práce zbývá po vyšetření.",
    sections: [
      {
        heading: "1. Diktování",
        blocks: [
          {
            type: "p",
            text: "Při diktování formulujete zprávu sami, větu po větě, a software převádí řeč na text. Výsledkem je přesně to, co nadiktujete — včetně struktury, oddílů a interpunkce. Diktujete obvykle až po vyšetření, mimo rozhovor s pacientem.",
          },
        ],
      },
      {
        heading: "2. Přepis rozhovoru",
        blocks: [
          {
            type: "p",
            text: "Přepis zachytí celý rozhovor s pacientem slovo od slova. Výsledkem je text konzultace, ne zpráva: obsahuje odbočky, opakování i pozdravy a strukturu z něj musíte vytvořit sami.",
          },
        ],
      },
      {
        heading: "3. Strukturovaný návrh zprávy z rozhovoru",
        blocks: [
          {
            type: "p",
            text: "Třetí způsob kombinuje přepis s rozdělením obsahu do oddílů zprávy podle typu vyšetření — u vstupního vyšetření například NO, RA, OA, FA, AA, objektivní nález a hodnocení. Výsledkem je návrh zprávy, který lékař zkontroluje a upraví. Během návštěvy se tak můžete věnovat pacientovi, ne klávesnici.",
          },
        ],
      },
      {
        heading: "Na co se při výběru zaměřit",
        blocks: [
          {
            type: "ul",
            items: [
              "Jazyk a terminologie — je nástroj stavěný na češtinu a na české zvyklosti v dokumentaci?",
              "Struktura — dostanete prostý text, nebo zprávu v oddílech, které používáte?",
              "Kde a jak se data zpracovávají — v cloudu, v telefonu, v jakém regionu?",
              "Jak se výstup dostane do vaší dokumentace — schránka, e-mail, soubor?",
              "Kontrola — můžete každý řádek upravit, než zprávu použijete?",
            ],
          },
        ],
      },
      {
        heading: "Jak to dělá ANOTE",
        blocks: [
          {
            type: "p",
            text: "ANOTE patří do třetí skupiny. Nahráváte rozhovor nebo diktát v telefonu, ANOTE ho přepíše a z přepisu připraví strukturovaný návrh lékařské zprávy v češtině podle typu vyšetření. Návrh je plně upravitelný a do dokumentace ho vložíte přes schránku nebo e-mail. Zpracování probíhá na infrastruktuře v EU.",
          },
        ],
      },
    ],
    related: [
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/obory", label: "Obory a typy zpráv" },
      { href: "/typy-zprav", label: "Typy zpráv" },
    ],
    cta: {
      heading: "Vyzkoušejte návrh zprávy z rozhovoru",
      text: "Demo běží přímo v prohlížeči, bez instalace.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "struktura-ambulantni-zpravy",
    shortTitle: "Struktura ambulantní zprávy",
    title: "Struktura ambulantní lékařské zprávy: NO, RA, OA, FA, AA a další oddíly přehledně",
    metaTitle: "Struktura ambulantní zprávy: NO, RA, OA, FA, AA | ANOTE",
    description:
      "Co patří do NO, RA, OA, FA, AA, GA a SA, kam zapsat objektivní nález a jak se liší zpráva z kontrolní návštěvy. Přehled oddílů ambulantní zprávy.",
    perex:
      "Ambulantní zpráva má v české praxi ustálené pořadí oddílů. Přehled níže shrnuje, co do kterého oddílu obvykle patří a jak se liší zpráva ze vstupního a z kontrolního vyšetření.",
    sections: [
      {
        heading: "Proč má zpráva ustálenou strukturu",
        blocks: [
          {
            type: "p",
            text: "Pevné pořadí oddílů usnadňuje čtení: kolega, který zprávu otevře, ví, kde hledat medikaci, alergie nebo závěr. Stejně tak pomáhá při psaní — nic podstatného se nevynechá.",
          },
        ],
      },
      {
        heading: "Anamnéza: zkratky a jejich obsah",
        blocks: [
          {
            type: "table",
            head: ["Zkratka", "Oddíl", "Co do něj obvykle patří"],
            rows: [
              ["NO", "Nynější onemocnění", "důvod návštěvy, začátek, trvání, lokalizace a charakter potíží, doprovodné příznaky, výslovně negované příznaky"],
              ["RA", "Rodinná anamnéza", "závažná onemocnění v rodině — kardiovaskulární, diabetes, onkologická, trombózy"],
              ["OA", "Osobní anamnéza", "prodělaná a chronická onemocnění, operace, hospitalizace"],
              ["FA", "Farmakologická anamnéza", "pravidelně užívané léky s dávkou a režimem, volně prodejné léky, doplňky"],
              ["AA", "Alergologická anamnéza", "alergie na léky, potraviny, pyl a typ reakce"],
              ["GA", "Gynekologická anamnéza", "jen u žen — menstruace, gravidity, porody, menopauza, antikoncepce"],
              ["SA", "Sociální anamnéza", "kouření, alkohol, zaměstnání a pracovní zátěž, rodinná situace, pohyb"],
            ],
          },
          {
            type: "p",
            text: "Pokud pacient něco výslovně popře, zapisuje se to (např. „alergie neguje“). Pokud se o tématu nemluvilo, je poctivější „neuvedeno“ než šablonovité „bez pozoruhodností“.",
          },
        ],
      },
      {
        heading: "Objektivní nález",
        blocks: [
          {
            type: "p",
            text: "Sem patří jen to, co bylo změřeno nebo zjištěno: TK, P, SpO2, TT a fyzikální nález. Pokud pacient pouze udává, že horečku nemá, patří to do NO, ne do objektivního nálezu.",
          },
        ],
      },
      {
        heading: "Hodnocení, vyšetření, terapie a plán",
        blocks: [
          {
            type: "ul",
            items: [
              "Hodnocení — pracovní diagnóza nebo klinický závěr lékaře",
              "Návrh vyšetření — odběry, zobrazování, konzilia",
              "Návrh terapie — změny medikace a režimová opatření",
              "Pokyny a plán kontrol — kdy a za jakých okolností se pacient vrací",
            ],
          },
        ],
      },
      {
        heading: "Kontrolní návštěva: co se liší",
        blocks: [
          {
            type: "p",
            text: "Zpráva z kontroly se soustředí na změny od minulé návštěvy, ne na celou anamnézu. Typické oddíly: subjektivní stav, průběh od poslední kontroly, kompenzace onemocnění, režim a adherence, přidružené obtíže, objektivní nález, hodnocení a plán.",
          },
        ],
      },
      {
        heading: "Jak tuto strukturu předvyplní ANOTE",
        blocks: [
          {
            type: "p",
            text: "ANOTE z nahraného rozhovoru připraví návrh zprávy přesně v tomto pořadí oddílů — pro vstupní vyšetření i pro kontrolu. Co v rozhovoru nezazní, zůstane jako „neuvedeno“. Hodnocení a terapii převezme jen tehdy, když je vyslovíte. Návrh pak zkontrolujete a upravíte.",
          },
        ],
      },
    ],
    related: [
      { href: "/obory/prakticky-lekar", label: "Pro praktické lékaře" },
      { href: "/obory/interna", label: "Ambulantní interní zpráva" },
      { href: "/clanky/diktovani-prepis-nebo-navrh-zpravy", label: "Diktování, přepis, nebo návrh zprávy?" },
    ],
    cta: {
      heading: "Podívejte se, jak ANOTE rozdělí rozhovor do těchto oddílů",
      text: "V demu vyberte Vstupní vyšetření a nahrajte ukázkový rozhovor.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "protokol-gastroskopie-a-kolonoskopie",
    shortTitle: "Protokol z gastroskopie a kolonoskopie",
    title: "Protokol z gastroskopie a kolonoskopie: z jakých částí se skládá a jak ho psát rychleji",
    metaTitle: "Protokol z gastroskopie a kolonoskopie | ANOTE",
    description:
      "Indikace, premedikace, přístroj, popis výkonu, závěr a doporučení: z čeho se skládá endoskopický protokol a jak ho připravit z diktátu.",
    perex:
      "Endoskopický protokol se píše po každém výkonu a jeho struktura se téměř nemění. Právě proto se vyplatí mít ho rozdělený do pevných oddílů — a diktovat jen to, co je u daného pacienta jinak.",
    sections: [
      {
        heading: "Společné oddíly obou protokolů",
        blocks: [
          {
            type: "ul",
            items: [
              "Indikace — důvod vyšetření a odesílající lékař",
              "Premedikace — typ a kdo ji aplikoval",
              "Přístroj — endoskop a další vybavení",
              "Asistence a čas začátku a konce výkonu",
              "Informovaný souhlas",
            ],
          },
        ],
      },
      {
        heading: "Gastroskopie: popis výkonu",
        blocks: [
          {
            type: "ul",
            items: [
              "Poloha pacienta",
              "Jícen — sliznice, kardie, těsnost",
              "Žaludek — sliznice, řasy, jezírko; inverze, kardie a fundus",
              "Angulární řasa, antrum, pylorus",
              "Bulbus duodena a D2",
              "Patologie a intervence — biopsie (odkud, kolik vzorků), polypektomie, hemostáza",
            ],
          },
        ],
      },
      {
        heading: "Kolonoskopie: popis výkonu",
        blocks: [
          {
            type: "ul",
            items: [
              "Dosah výkonu",
              "Popis sliznice po úsecích",
              "Polypy — lokalizace, velikost, tvar, provedené odstranění",
              "Divertikly",
              "Odběry biopsie",
            ],
          },
        ],
      },
      {
        heading: "Závěr, doporučení a stav po výkonu",
        blocks: [
          {
            type: "p",
            text: "Závěr shrnuje makroskopický nález. Doporučení obsahuje medikaci, informace o histologii, režimová opatření a kontroly. Stav po výkonu zaznamenává komplikace a kam pacient odchází.",
          },
        ],
      },
      {
        heading: "Kde protokol zabírá nejvíc času",
        blocks: [
          {
            type: "p",
            text: "Většina protokolu je u různých pacientů podobná — mění se indikace, nález a závěr. Psaní celého textu po každém výkonu znamená opakovaně přepisovat tytéž věty.",
          },
        ],
      },
      {
        heading: "Návrh protokolu z diktátu",
        blocks: [
          {
            type: "p",
            text: "ANOTE má samostatné struktury pro gastroskopii a koloskopii. Během výkonu nebo po něm nadiktujete průběh a ANOTE z přepisu připraví návrh protokolu v těchto oddílech. Co nezazní, zůstane „neuvedeno“ — nic se nedoplňuje. Návrh pak zkontrolujete, upravíte a vložíte do dokumentace.",
          },
        ],
      },
    ],
    related: [
      { href: "/obory/gastroenterologie", label: "ANOTE pro gastroenterologii a endoskopii" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/typy-zprav", label: "Typy zpráv" },
    ],
    cta: {
      heading: "Nadiktujte ukázkový nález",
      text: "V demu vyberte Gastroskopii nebo Koloskopii. Bez instalace, přímo v prohlížeči.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "jak-vznika-navrh-zpravy-z-nahravky",
    shortTitle: "Jak vzniká návrh zprávy z nahrávky",
    title: "Jak vzniká návrh lékařské zprávy z nahrávky: krok za krokem od rozhovoru po kontrolu",
    metaTitle: "Jak vzniká návrh lékařské zprávy z nahrávky | ANOTE",
    description:
      "Od nahrání rozhovoru přes přepis až po návrh zprávy, který lékař zkontroluje: jak ANOTE pracuje krok za krokem a co nedělá.",
    perex:
      "Co se děje mezi stisknutím tlačítka Nahrávat a zprávou ve vaší dokumentaci? Popisujeme celý postup v aplikaci ANOTE, krok za krokem.",
    sections: [
      {
        heading: "1. Nahrávání",
        blocks: [
          {
            type: "p",
            text: "Nahráváte v telefonu — buď celý rozhovor s pacientem, nebo diktát po vyšetření. Typ vyšetření vyberete předem; v automatickém režimu ho ANOTE rozpozná z přepisu.",
          },
        ],
      },
      {
        heading: "2. Přepis",
        blocks: [
          {
            type: "p",
            text: "Výchozí je cloudový přepis na infrastruktuře v EU. V nastavení lze zapnout lokální přepis přímo v telefonu — zvuk pak telefon neopouští. Dostupnost lokálního režimu závisí na zařízení. Zvukový záznam se v aplikaci neukládá.",
          },
        ],
      },
      {
        heading: "3. Návrh zprávy už během nahrávání",
        blocks: [
          {
            type: "p",
            text: "Zatímco nahráváte, ANOTE zhruba každou půlminutu aktualizuje rozpracovaný návrh zprávy. Po skončení nahrávání vytvoří výsledný návrh z celého přepisu. Zpráva se generuje vždy online.",
          },
        ],
      },
      {
        heading: "4. Struktura podle typu vyšetření",
        blocks: [
          {
            type: "p",
            text: "Každý typ vyšetření má vlastní oddíly — vstupní vyšetření, kontrolní návštěva, gastroskopie, koloskopie a ultrazvuk; ortopedie má vlastní verzi aplikace. ANOTE do oddílů převádí jen to, co zaznělo. Co nezazní, zůstane „neuvedeno“.",
          },
        ],
      },
      {
        heading: "5. Kontrola a úprava",
        blocks: [
          {
            type: "p",
            text: "Návrh je plně upravitelný — každý řádek můžete přepsat, doplnit nebo smazat. Výstup se může mezi jednotlivými běhy lišit a může obsahovat chyby, proto ho před použitím vždy kontrolujete vy.",
          },
        ],
      },
      {
        heading: "6. Předání do dokumentace",
        blocks: [
          {
            type: "p",
            text: "Zprávu zkopírujete do schránky a vložíte do svého systému, nebo si ji pošlete e-mailem na adresu, kterou nastavíte. Předchozí návštěvy zůstávají v historii v telefonu — přepis i zprávu lze znovu otevřít a upravit.",
          },
        ],
      },
      {
        heading: "Co ANOTE nedělá",
        blocks: [
          {
            type: "ul",
            items: [
              "Nestanovuje diagnózu, nenavrhuje léčbu a nepředepisuje léky.",
              "Nenahrazuje lékaře ani jeho kontrolu.",
              "Nepropojuje se přímo s ambulantním nebo nemocničním systémem.",
            ],
          },
        ],
      },
    ],
    related: [
      { href: "/clanky/diktovani-prepis-nebo-navrh-zpravy", label: "Diktování, přepis, nebo návrh zprávy?" },
      { href: "/obory", label: "Obory a typy zpráv" },
      { href: "/bezpecnost", label: "Bezpečnost a data" },
    ],
    cta: {
      heading: "Vyzkoušejte to sami",
      text: "Nahrajte ukázkový rozhovor v demu a sledujte, jak vzniká návrh zprávy.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "co-rikaji-studie-o-dokumentaci",
    shortTitle: "Víte, že…? Co říkají studie o dokumentaci",
    title: "Víte, že…? Kolik času lékaři tráví dokumentací a co ukazují studie o AI asistentech",
    metaTitle: "Kolik času zabírá dokumentace: co říkají studie | ANOTE",
    description:
      "Kolik času lékaři tráví u počítače a co zatím ukázaly veřejně dostupné studie o AI asistentech pro zápis z návštěvy — čísla, zdroje a jejich limity.",
    perex:
      "Přehled veřejně dostupných studií o tom, kolik času zabírá lékařská dokumentace a co zatím ukázalo nasazení AI asistentů, kteří z rozhovoru připravují návrh zápisu. U každého čísla uvádíme zdroj a jeho omezení.",
    sections: [
      {
        heading: "Důležité předem",
        blocks: [
          {
            type: "p",
            text: "Všechny studie níže zkoumaly jiné nástroje než ANOTE, převážně v USA a v angličtině. Jejich výsledky nejsou měřením ANOTE a nelze je na ANOTE přímo přenášet. Uvádíme je jako kontext: jak velký je problém dokumentace a co se o AI asistentech zatím ví.",
          },
        ],
      },
      {
        heading: "Víte, že lékaři v ambulanci tráví u počítače víc času než s pacientem?",
        blocks: [
          {
            type: "ul",
            items: [
              "Studie Sinsky a kol. (2016) sledovala 57 ambulantních lékařů ve čtyřech oborech včetně ortopedie a kardiologie. Elektronická dokumentace a administrativa zabíraly 49,2 % jejich pracovní doby, přímý kontakt s pacientem 27 %. Na každou hodinu s pacientem připadaly téměř dvě hodiny práce u počítače a stolu. [1]",
              "Studie Arndt a kol. (2017) analyzovala záznamy ze systému u 142 praktických lékařů. Z 11,4hodinového pracovního dne strávili v elektronické dokumentaci 5,9 hodiny, z toho 1,4 hodiny po skončení ordinačních hodin. [2]",
            ],
          },
        ],
      },
      {
        heading: "Víte, že čeští lékaři označují za největší zátěž byrokracii?",
        blocks: [
          {
            type: "p",
            text: "Podle průzkumu prezentovaného v roce 2024 na konferenci České lékařské komory „Duševní zdraví v medicíně“ (více než tisíc respondentů) se lékaři nejvíce cítí přetíženi byrokratickými úkoly — uvedlo to 77 % z nich. Ohroženo syndromem vyhoření se cítí 62 %. [3]",
          },
        ],
      },
      {
        heading: "Co zatím ukázaly studie AI asistentů",
        blocks: [
          {
            type: "ul",
            items: [
              "The Permanente Medical Group (Kalifornie) nabídla AI asistenta 10 000 lékařům. Během prvních 10 týdnů ho použilo 3 442 lékařů u 303 266 návštěv; podle skupiny většina z nich strávila u počítače v průměru zhruba o hodinu denně méně. [4] Za 15 měsíců provozu skupina odhadla úsporu 15 791 hodin dokumentace. [5] Jde o vlastní vyhodnocení provozovatele, ne o nezávislou studii.",
              "Randomizovaná studie UCLA (Lukac a kol., NEJM AI, 2025) s 238 lékaři ze 14 oborů porovnala dva AI nástroje s běžnou praxí. U jednoho se čas strávený psaním zápisu zkrátil o 9,5 %, u druhého se statisticky významná změna neprokázala. [6]",
              "Studie Olson a kol. (JAMA Network Open, 2025) se 263 lékaři v šesti zdravotnických systémech zjistila po 30 dnech používání AI asistenta pokles podílu lékařů s příznaky vyhoření z 51,9 % na 38,8 %. Studie neměla kontrolní skupinu. [7]",
            ],
          },
        ],
      },
      {
        heading: "Co z toho plyne — a co ne",
        blocks: [
          {
            type: "ul",
            items: [
              "Dokumentace zabírá velkou část pracovního dne lékaře; to potvrzují studie i český průzkum.",
              "Výsledky AI asistentů se liší podle nástroje, oboru i způsobu měření. Některé studie úsporu času prokázaly, jiné ne.",
              "Nejkonzistentněji se v dosavadních studiích objevuje menší pocit zátěže a vyhoření.",
              "Kolik času ušetří konkrétní nástroj ve vaší ambulanci, ukáže jen vyzkoušení na vašich vlastních návštěvách.",
            ],
          },
        ],
      },
      {
        heading: "Kde je v tom ANOTE",
        blocks: [
          {
            type: "p",
            text: "ANOTE patří do stejné kategorie nástrojů: z nahraného rozhovoru nebo diktátu připraví v češtině strukturovaný návrh lékařské zprávy podle typu vyšetření. Vlastní měření úspory času u ANOTE zatím nemáme, proto žádné číslo neuvádíme. Návrh vždy kontrolujete a upravujete vy.",
          },
        ],
      },
    ],
    sources: [
      { label: "[1] Sinsky C. a kol. Allocation of Physician Time in Ambulatory Practice: A Time and Motion Study in 4 Specialties. Annals of Internal Medicine. 2016;165(11):753–760.", url: "https://www.acpjournals.org/doi/10.7326/M16-0961" },
      { label: "[2] Arndt B. a kol. Tethered to the EHR: Primary Care Physician Workload Assessment Using EHR Event Log Data and Time-Motion Observations. Annals of Family Medicine. 2017;15(5):419–426.", url: "https://www.annfammed.org/content/15/5/419" },
      { label: "[3] Většinu lékařů ohrožuje syndrom vyhoření, odbornou pomoc ale nevyhledávají. Ekonomický deník, 20. 11. 2024 (konference ČLK „Duševní zdraví v medicíně“).", url: "https://ekonomickydenik.cz/vetsinu-lekaru-ohrozuje-syndrom-vyhoreni-odbornou-pomoc-ale-nevyhledavaji/" },
      { label: "[4] AI scribe saves doctors an hour at the keyboard every day. American Medical Association, 18. 3. 2024 (k článku Tierney A. a kol., NEJM Catalyst, 2024).", url: "https://www.ama-assn.org/practice-management/digital/ai-scribe-saves-doctors-hour-keyboard-every-day" },
      { label: "[5] AI scribes save 15,000 hours — and restore the human side of medicine. American Medical Association, 2025.", url: "https://www.ama-assn.org/practice-management/digital-health/ai-scribes-save-15000-hours-and-restore-human-side-medicine" },
      { label: "[6] Lukac P., Mafi J. a kol. Ambient AI Scribes in Clinical Practice: A Randomized Trial. NEJM AI. 2025.", url: "https://pubmed.ncbi.nlm.nih.gov/41497288/" },
      { label: "[7] Olson K. a kol. Use of Ambient AI Scribes to Reduce Administrative Burden and Professional Burnout. JAMA Network Open. 2025.", url: "https://pubmed.ncbi.nlm.nih.gov/41037268/" },
    ],
    related: [
      { href: "/clanky/diktovani-prepis-nebo-navrh-zpravy", label: "Diktování, přepis, nebo návrh zprávy?" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/obory", label: "Obory a typy zpráv" },
    ],
    cta: {
      heading: "Vyzkoušejte to na vlastní návštěvě",
      text: "Jediné číslo, které platí pro vaši ambulanci, zjistíte sami. Demo běží v prohlížeči, bez instalace.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "ai-v-ordinaci-otazky-na-dodavatele",
    shortTitle: "AI v ordinaci: otázky na dodavatele",
    title: "AI v ordinaci a ochrana dat: 10 otázek, které položit dodavateli",
    metaTitle: "AI v ordinaci: 10 otázek pro dodavatele | ANOTE",
    description:
      "Kde se zpracovává zvuk a text, ukládají se data, kdo je subdodavatel, jak se informuje pacient? Deset otázek před nasazením AI nástroje v ordinaci.",
    perex:
      "Než začnete v ordinaci používat nástroj, který zpracovává rozhovor s pacientem, stojí za to se dodavatele zeptat na několik konkrétních věcí. U každé otázky uvádíme, jak odpovídá ANOTE.",
    sections: [
      {
        heading: "1. Kde probíhá přepis řeči?",
        blocks: [
          { type: "p", text: "ANOTE: výchozí je cloudový přepis na infrastruktuře v EU; volitelně lze přepisovat lokálně v telefonu." },
        ],
      },
      {
        heading: "2. Kde se generuje zpráva?",
        blocks: [
          { type: "p", text: "ANOTE: ve službě Azure OpenAI v EU. Generování zprávy vyžaduje připojení v každém režimu." },
        ],
      },
      {
        heading: "3. Je k dispozici lokální režim — a je výchozí?",
        blocks: [
          { type: "p", text: "ANOTE: lokální přepis je k dispozici, výchozí ale není. V lokálním režimu zvuk zůstává v telefonu; zpráva se generuje online. Dostupnost závisí na zařízení." },
        ],
      },
      {
        heading: "4. Ukládá se zvukový záznam?",
        blocks: [
          { type: "p", text: "ANOTE: zvuk se v aplikaci neukládá. Uchovává se jen text — přepis a zpráva — v historii ve vašem telefonu." },
        ],
      },
      {
        heading: "5. Jaké subdodavatele nástroj využívá?",
        blocks: [
          { type: "p", text: "Ptejte se na cloud, AI model i odesílání e-mailů. ANOTE: Microsoft Azure (přepis a generování zprávy); volitelné odeslání zprávy e-mailem používá e-mailovou službu třetí strany." },
        ],
      },
      {
        heading: "6. Co přesně odchází e-mailem?",
        blocks: [
          { type: "p", text: "ANOTE: e-mail obsahuje zprávu a přepis konzultace a jde jen na adresu, kterou si sami nastavíte." },
        ],
      },
      {
        heading: "7. Je výstup označen jako návrh a dá se upravit?",
        blocks: [
          { type: "p", text: "ANOTE: ano, výstup je návrh lékařské zprávy a každý řádek lze před použitím upravit." },
        ],
      },
      {
        heading: "8. Může nástroj doplnit něco, co nezaznělo?",
        blocks: [
          { type: "p", text: "Ptejte se, jak se nástroj chová k chybějícím informacím. ANOTE: oddíly, o kterých se nemluvilo, označí „neuvedeno“. Výstup AI se ale může mezi běhy lišit a může obsahovat chyby — proto je kontrola lékařem nezbytná." },
        ],
      },
      {
        heading: "9. Jak bude informován pacient?",
        blocks: [
          { type: "p", text: "Pacient by měl vědět, že rozhovor zpracovává softwarový nástroj, a mít možnost odmítnout. Zeptejte se dodavatele, zda pro to má připravený text." },
        ],
      },
      {
        heading: "10. Jaké smluvní dokumenty dodavatel nabízí?",
        blocks: [
          { type: "p", text: "Zeptejte se na obchodní podmínky, zásady zpracování osobních údajů a zpracovatelskou smlouvu. Napište nám a dokumenty pro vaši ordinaci s vámi projdeme." },
        ],
      },
    ],
    related: [
      { href: "/bezpecnost", label: "Bezpečnost a data v ANOTE" },
      { href: "/ochrana-soukromi", label: "Ochrana soukromí" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
    ],
    cta: {
      heading: "Máte další otázky k datům?",
      text: "Napište nám — odpovíme konkrétně pro vaši ordinaci.",
      primary: "contact",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
];
