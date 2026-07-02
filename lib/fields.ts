export const FIELDS = [
  {
    key: "ekonomia",
    n: 1,
    name: "Ekonomia, Financat dhe Tregu i Punës",
    subs: [
      "Politika fiskale",
      "Tatimet",
      "Investimet",
      "Zhvillimi ekonomik",
      "Punësimi",
    ],
  },
  {
    key: "mireqenia",
    n: 2,
    name: "Mirëqenia Sociale",
    subs: ["Pensionet", "Ndihma sociale", "Barazia sociale"],
  },
  {
    key: "arsimi",
    n: 3,
    name: "Arsimi, Shkenca dhe Inovacioni",
    subs: [
      "Arsimi parauniversitar",
      "Arsimi i lartë",
      "Kërkimi shkencor",
      "Teknologjia dhe inovacioni",
    ],
  },
  {
    key: "shendetesia",
    n: 4,
    name: "Shëndetësia",
    subs: [
      "Kujdesi parësor",
      "Spitalet",
      "Shëndeti publik",
      "Sigurimet shëndetësore",
    ],
  },
  {
    key: "bujqesia",
    n: 5,
    name: "Bujqësia dhe Zhvillimi Rural",
    subs: [
      "Prodhimi bujqësor",
      "Subvencionet",
      "Siguria ushqimore",
      "Zhvillimi i fshatit",
    ],
  },
  {
    key: "infrastruktura",
    n: 6,
    name: "Infrastruktura, Energjia dhe Transporti",
    subs: [
      "Rrugët dhe hekurudhat",
      "Energjia",
      "Ujësjellës-kanalizimet",
      "Transporti publik",
    ],
  },
  {
    key: "mjedisi",
    n: 7,
    name: "Mjedisi dhe Ndryshimet Klimatike",
    subs: [
      "Mbrojtja e natyrës",
      "Menaxhimi i mbetjeve",
      "Energjia e gjelbër",
      "Adaptimi klimatik",
    ],
  },
  {
    key: "drejtesia",
    n: 8,
    name: "Drejtësia dhe Sundimi i Ligjit",
    subs: [
      "Reforma ligjore",
      "Lufta kundër korrupsionit",
      "Të drejtat e njeriut",
      "Sistemi gjyqësor",
    ],
  },
  {
    key: "siguria",
    n: 9,
    name: "Siguria dhe Mbrojtja",
    subs: [
      "Rendi publik",
      "Mbrojtja civile",
      "Siguria kibernetike",
      "Forcat e armatosura",
    ],
  },
  {
    key: "qeverisja",
    n: 10,
    name: "Qeverisja Vendore dhe Administrata Publike",
    subs: [
      "Decentralizimi",
      "Reforma administrative",
      "Shërbimet publike",
      "Digjitalizimi",
    ],
  },
  {
    key: "politika_jashtme",
    n: 11,
    name: "Politika e Jashtme dhe Integrimi Evropian",
    subs: [
      "Marrëdhëniet ndërkombëtare",
      "Integrimi evropian",
      "Diplomacia ekonomike",
    ],
  },
  {
    key: "kultura",
    n: 12,
    name: "Kultura, Rinia dhe Sporti",
    subs: [
      "Trashëgimia kulturore",
      "Politikat rinore",
      "Sporti dhe rekreacioni",
    ],
  },
  {
    key: "digjitalizimi",
    n: 13,
    name: "Transformimi Digjital",
    subs: [
      "Qeverisja elektronike",
      "Inteligjenca artificiale",
      "Infrastruktura digjitale",
      "Mbrojtja e të dhënave",
    ],
  },
  {
    key: "demokratizimi",
    n: 14,
    name: "Demokratizimi dhe Institucionet",
    subs: ["Reforma zgjedhore", "Demokratizimi institucional"],
  },
] as const;

export const OTHER_FIELD = { key: "other", name: "Tjetër" } as const;

export type FieldKey = (typeof FIELDS)[number]["key"] | "other";

/** All valid field keys including "other". */
export const FIELD_KEYS: string[] = [
  ...FIELDS.map((f) => f.key),
  OTHER_FIELD.key,
];

/** Look up a field's display name by key. Returns "Tjetër" for "other". */
export function fieldName(key: string): string {
  if (key === OTHER_FIELD.key) return OTHER_FIELD.name;
  return FIELDS.find((f) => f.key === key)?.name ?? key;
}

/** Short label for chips: the first segment before a comma. */
export function fieldShort(key: string): string {
  return fieldName(key).split(",")[0]!.split(" dhe ")[0]!.trim();
}

export function fieldSubs(key: string): readonly string[] {
  return FIELDS.find((f) => f.key === key)?.subs ?? [];
}

export function isValidFieldKey(key: string): boolean {
  return FIELD_KEYS.includes(key);
}
