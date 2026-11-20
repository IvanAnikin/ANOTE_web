import type { ContentPage } from "./types";

const PUBLISHED = "2026-11-20";

const reviewStep =
  "Návrh se zobrazí v aplikaci. Každý řádek můžete přepsat, doplnit nebo smazat — zprávu do dokumentace vkládáte až po své kontrole.";

const modesSection = {
  heading: "Přepis a zpracování dat",
  blocks: [
    {
      type: "p" as const,
      text: "Výchozí je cloudový přepis na infrastruktuře v EU. V nastavení můžete zapnout lokální přepis — v tomto režimu zvuk zůstává v telefonu. Samotná zpráva se generuje vždy online. Zvukový záznam se v aplikaci neukládá; uchovává se jen text, a to ve vašem telefonu.",
    },
  ],
};

const notSection = {
  heading: "Co ANOTE nedělá",
  blocks: [
    {
      type: "ul" as const,
      items: [
        "Nestanovuje diagnózu a nenavrhuje léčbu — do zprávy převádí jen to, co při vyšetření zaznělo.",
        "Nenahrazuje lékaře ani jeho kontrolu výstupu.",
        "Nepropojuje se s vaším ambulantním ani nemocničním systémem. Zprávu vložíte přes schránku, nebo si ji pošlete e-mailem na adresu, kterou zadáte.",
      ],
    },
  ],
};

export const obory: ContentPage[] = [
  {
    slug: "gastroenterologie",
    shortTitle: "Gastroenterologie a endoskopie",
    title: "Protokol z gastroskopie a kolonoskopie z diktátu",
    metaTitle: "Protokol gastroskopie a kolonoskopie z diktátu | ANOTE",
    description:
      "Nadiktujte průběh výkonu a ANOTE připraví strukturovaný návrh protokolu z gastroskopie či koloskopie. Návrh zkontrolujete a upravíte. Vyzkoušejte demo.",
    perex:
      "Protokoly z endoskopie mají pevnou strukturu a opakují se celý den. ANOTE z vašeho diktátu nebo rozhovoru připraví návrh protokolu rozdělený do oddílů, které znáte — vy ho zkontrolujete a upravíte.",
    sections: [
      {
        heading: "Co ANOTE připraví u gastroskopie",
        blocks: [
          {
            type: "p",
            text: "Návrh protokolu dodržuje pevné pořadí oddílů. Co během výkonu nezazní, zůstane označeno jako „neuvedeno“ — nic se nedomýšlí.",
          },
          {
            type: "ul",
            items: [
              "Indikace a odesílající lékař",
              "Premedikace",
              "Přístroj, asistence a čas výkonu",
              "Informovaný souhlas",
              "Popis výkonu — jícen, žaludek včetně inverze, pylorus, bulbus a D2, případné intervence",
              "Závěr",
              "Doporučení a stav po výkonu",
            ],
          },
        ],
      },
      {
        heading: "Co ANOTE připraví u kolonoskopie",
        blocks: [
          {
            type: "ul",
            items: [
              "Indikace a odesílající lékař",
              "Premedikace, přístroj, asistence a čas",
              "Informovaný souhlas",
              "Popis výkonu — dosah, nález, polypy, divertikly, odběry biopsie",
              "Závěr",
              "Stav po výkonu a doporučení včetně kontrol",
            ],
          },
        ],
      },
      {
        heading: "Jak to probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Během výkonu nebo hned po něm diktujete do telefonu tak, jak jste zvyklí.",
              "ANOTE řeč přepíše a průběžně z ní skládá návrh protokolu.",
              reviewStep,
            ],
          },
        ],
      },
      modesSection,
      notSection,
    ],
    related: [
      { href: "/clanky/protokol-gastroskopie-a-kolonoskopie", label: "Protokol z gastroskopie a kolonoskopie: z jakých částí se skládá" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/typy-zprav", label: "Všechny typy zpráv" },
    ],
    cta: {
      heading: "Vyzkoušejte si to na vlastním diktátu",
      text: "V demu vyberte typ vyšetření Gastroskopie nebo Koloskopie a nadiktujte ukázkový nález. Demo běží v prohlížeči, bez instalace.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "prakticky-lekar",
    shortTitle: "Praktický lékař",
    title: "Zpráva ze vstupní i kontrolní návštěvy pro praktické lékaře",
    metaTitle: "Návrh zprávy pro praktické lékaře | ANOTE",
    description:
      "Ze vstupní nebo kontrolní návštěvy připraví ANOTE návrh zprávy s anamnézou, nálezem a plánem. Vy ho zkontrolujete a upravíte. Vyzkoušejte demo.",
    perex:
      "V ordinaci praktického lékaře se střídají vstupní prohlídky a kontroly chronických pacientů. ANOTE z rozhovoru s pacientem připraví návrh zprávy ve struktuře, kterou běžně píšete — a vy se během návštěvy můžete soustředit na pacienta.",
    sections: [
      {
        heading: "Vstupní vyšetření",
        blocks: [
          {
            type: "p",
            text: "Návrh zprávy ze vstupního vyšetření má anamnestické oddíly v obvyklém pořadí:",
          },
          {
            type: "ul",
            items: [
              "NO — nynější onemocnění, včetně výslovně negovaných příznaků",
              "RA, OA, FA, AA — rodinná, osobní, farmakologická a alergologická anamnéza",
              "GA (jen u žen) a SA — sociální anamnéza, zaměstnání, režim",
              "Adherence a spolupráce pacienta",
              "Objektivní nález — jen to, co bylo změřeno nebo zjištěno",
              "Hodnocení, návrh vyšetření, návrh terapie, pokyny a plán kontrol",
            ],
          },
        ],
      },
      {
        heading: "Kontrolní návštěva",
        blocks: [
          {
            type: "p",
            text: "Pro kontroly má ANOTE kratší strukturu zaměřenou na změny od minulé návštěvy:",
          },
          {
            type: "ul",
            items: [
              "Subjektivní stav a průběh od poslední kontroly",
              "Kompenzace onemocnění, režim a adherence",
              "Přidružené obtíže",
              "Objektivní nález, hodnocení a plán",
            ],
          },
          {
            type: "p",
            text: "Pokud typ návštěvy nevyberete, automatický režim ho rozpozná z přepisu a zvolí odpovídající strukturu.",
          },
        ],
      },
      {
        heading: "Jak to probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Na začátku návštěvy spustíte nahrávání v telefonu.",
              "ANOTE přepisuje rozhovor a průběžně skládá návrh zprávy.",
              reviewStep,
            ],
          },
          {
            type: "p",
            text: "Co v rozhovoru nezazní, zůstane ve zprávě jako „neuvedeno“. ANOTE nic nedoplňuje ze šablony.",
          },
        ],
      },
      modesSection,
      notSection,
    ],
    related: [
      { href: "/clanky/struktura-ambulantni-zpravy", label: "Struktura ambulantní zprávy: NO, RA, OA, FA, AA" },
      { href: "/obory/interna", label: "Ambulantní interní zpráva" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
    ],
    cta: {
      heading: "Podívejte se, jak vypadá návrh z rozhovoru",
      text: "V demu vyberte Vstupní vyšetření nebo Kontrolní návštěvu a nahrajte ukázkový rozhovor. Bez instalace, přímo v prohlížeči.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "interna",
    shortTitle: "Interna",
    title: "Ambulantní interní zpráva z rozhovoru s pacientem",
    metaTitle: "Návrh ambulantní interní zprávy | ANOTE",
    description:
      "NO, RA, OA, FA, AA, objektivní nález i hodnocení: ANOTE připraví z rozhovoru návrh interní zprávy, který zkontrolujete a upravíte. Demo v prohlížeči.",
    perex:
      "Interní ambulance pracuje s dlouhou anamnézou, chronickou medikací a pravidelnými kontrolami. ANOTE z rozhovoru s pacientem připraví návrh zprávy v ustálené struktuře interního vyšetření.",
    sections: [
      {
        heading: "Struktura návrhu zprávy",
        blocks: [
          {
            type: "table",
            head: ["Oddíl", "Co do něj ANOTE převede"],
            rows: [
              ["NO", "důvod návštěvy, průběh potíží, výslovně negované příznaky"],
              ["RA, OA", "onemocnění v rodině, prodělaná a chronická onemocnění, operace"],
              ["FA", "pravidelně užívané léky s dávkou a režimem, pokud zazněly"],
              ["AA", "alergie a reakce"],
              ["SA, adherence", "režim, zaměstnání, pohyb; co pacient dodržuje a co odmítá"],
              ["Objektivní nález", "jen naměřené a zjištěné hodnoty — TK, P, SpO2, fyzikální nález"],
              ["Hodnocení a plán", "závěr, návrh vyšetření a terapie — pouze pokud je vyslovil lékař"],
            ],
          },
        ],
      },
      {
        heading: "Kontroly chronických pacientů",
        blocks: [
          {
            type: "p",
            text: "U kontrolní návštěvy ANOTE použije kratší strukturu: subjektivní stav, průběh od minulé kontroly, kompenzace onemocnění, režim a adherence, přidružené obtíže, objektivní nález, hodnocení a plán.",
          },
        ],
      },
      {
        heading: "Jak to probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Nahráváte rozhovor s pacientem nebo diktujete po vyšetření.",
              "ANOTE přepíše řeč a rozdělí obsah do oddílů zprávy.",
              reviewStep,
            ],
          },
        ],
      },
      modesSection,
      notSection,
    ],
    related: [
      { href: "/clanky/struktura-ambulantni-zpravy", label: "Struktura ambulantní zprávy: NO, RA, OA, FA, AA" },
      { href: "/obory/prakticky-lekar", label: "Pro praktické lékaře" },
      { href: "/typy-zprav", label: "Všechny typy zpráv" },
    ],
    cta: {
      heading: "Vyzkoušejte návrh interní zprávy",
      text: "V demu zvolte Vstupní vyšetření a nahrajte krátký ukázkový rozhovor.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "sonografie",
    shortTitle: "Sonografie",
    title: "Popis ultrazvuku břicha z diktátu",
    metaTitle: "Návrh popisu ultrazvuku břicha | ANOTE",
    description:
      "Nadiktujte nález a ANOTE připraví návrh popisu UZ břicha po orgánech — játra, žlučník, pankreas, ledviny, slezina. Návrh vždy kontrolujete vy.",
    perex:
      "Při ultrazvukovém vyšetření máte ruce u sondy. Nález nadiktujete a ANOTE z něj připraví návrh popisu v pevné struktuře, který po vyšetření zkontrolujete.",
    sections: [
      {
        heading: "Struktura návrhu popisu",
        blocks: [
          {
            type: "ul",
            items: [
              "Indikace a odesílající lékař",
              "Přístroj",
              "Popis nálezu — játra, žlučník a žlučové cesty, pankreas, ledviny, slezina",
              "Elastografie / FibroScan, pokud byla provedena",
              "Závěr",
            ],
          },
          {
            type: "p",
            text: "Orgán, o kterém v diktátu nepadne zmínka, ANOTE nepopisuje jako normální — zůstane „neuvedeno“.",
          },
        ],
      },
      {
        heading: "Jak to probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Během vyšetření diktujete nález do telefonu.",
              "ANOTE přepíše diktát a rozdělí ho podle orgánů.",
              reviewStep,
            ],
          },
        ],
      },
      modesSection,
      notSection,
    ],
    related: [
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/obory/gastroenterologie", label: "Gastroenterologie a endoskopie" },
      { href: "/typy-zprav", label: "Všechny typy zpráv" },
    ],
    cta: {
      heading: "Nadiktujte ukázkový nález",
      text: "V demu vyberte typ vyšetření Ultrazvuk a vyzkoušejte, jak ANOTE rozdělí nález podle orgánů.",
      primary: "demo",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "ortopedie",
    shortTitle: "Ortopedie",
    title: "Ortopedická zpráva z rozhovoru a vyšetření",
    metaTitle: "Návrh ortopedické zprávy z nahrávky | ANOTE",
    description:
      "ANOTE připraví z rozhovoru a diktátu návrh ortopedické zprávy: anamnéza, status localis, zobrazovací vyšetření, závěr a doporučení. Domluvte si ukázku.",
    perex:
      "Ortopedická verze ANOTE má vlastní strukturu zprávy podle běžné praxe ortopedického vyšetření — ve dvou variantách, krátké a rozšířené.",
    sections: [
      {
        heading: "Struktura návrhu zprávy",
        blocks: [
          {
            type: "ul",
            items: [
              "Nynější onemocnění",
              "Anamnéza",
              "Objektivní nález (status localis)",
              "Zobrazovací a paraklinická vyšetření",
              "Závěr / diagnóza — tak, jak ji vyslovíte",
              "Terapie a doporučení",
            ],
          },
        ],
      },
      {
        heading: "Krátká a rozšířená varianta",
        blocks: [
          {
            type: "p",
            text: "Obě varianty mají stejné oddíly a liší se stylem: krátká je heslovitá (např. „Bolest: koleno l. dx.; námahová; noční bolest neguje“), rozšířená je psaná souvislým textem.",
          },
        ],
      },
      {
        heading: "Jak to probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Nahráváte rozhovor s pacientem a během vyšetření diktujete nález.",
              "ANOTE přepíše řeč a skládá návrh zprávy.",
              reviewStep,
            ],
          },
          {
            type: "p",
            text: "Ortopedická verze se instaluje jako samostatná aplikace. Ukázku vám rádi předvedeme.",
          },
        ],
      },
      modesSection,
      notSection,
    ],
    related: [
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
      { href: "/obory/dalsi-obory", label: "Šablona pro další obory" },
      { href: "/typy-zprav", label: "Všechny typy zpráv" },
    ],
    cta: {
      heading: "Chcete vidět ortopedickou zprávu?",
      text: "Napište nám a domluvíme ukázku ortopedické verze pro vaši ambulanci.",
      primary: "contact",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
  {
    slug: "dalsi-obory",
    shortTitle: "Váš obor",
    title: "Šablonu zprávy pro váš obor připravíme s vámi",
    metaTitle: "Šablona zprávy pro váš obor | ANOTE",
    description:
      "Váš obor zatím ANOTE nemá? Formát návrhu zprávy pro vaši specializaci připravíme společně s vámi, podle toho, jak zprávy píšete. Napište nám.",
    perex:
      "Gastroenterologie, ortopedie, sonografie a ambulantní vyšetření už mají svou strukturu. Pokud váš obor mezi nimi není, další formát zprávy připravíme společně s vámi.",
    sections: [
      {
        heading: "Jak spolupráce probíhá",
        blocks: [
          {
            type: "ol",
            items: [
              "Ukážete nám, jak vaše zpráva vypadá — oddíly, pořadí, ustálené formulace.",
              "Podle toho připravíme strukturu návrhu zprávy pro váš typ vyšetření.",
              "Vyzkoušíte ji na ukázkových rozhovorech a řeknete nám, co upravit.",
              "Teprve když strukturu sami ověříte, je připravená k používání.",
            ],
          },
        ],
      },
      {
        heading: "Co z toho máte",
        blocks: [
          {
            type: "ul",
            items: [
              "Návrh zprávy v oddílech, na které jste zvyklí — ne obecný přepis.",
              "Strukturu, která vznikla podle praxe vašeho oboru.",
              "Stejné principy jako u ostatních typů: co nezazní, se nedoplňuje, a každý návrh před použitím kontrolujete.",
            ],
          },
        ],
      },
      notSection,
    ],
    related: [
      { href: "/obory", label: "Obory, které ANOTE už má" },
      { href: "/clanky/jak-vznika-navrh-zpravy-z-nahravky", label: "Jak vzniká návrh zprávy z nahrávky" },
    ],
    cta: {
      heading: "Napište nám, jak vypadají vaše zprávy",
      text: "Ozvěte se a domluvíme se, jak formát pro váš obor připravit.",
      primary: "contact",
    },
    published: PUBLISHED,
    modified: PUBLISHED,
  },
];
