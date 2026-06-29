import { PrismaClient } from "@prisma/client";

// String union (matches the Stance enum values) so the seed works against both
// the Postgres schema (enum) and the SQLite preview schema (string).
type Stance = "PRO" | "KUNDER" | "NEUTRAL";

const db = new PrismaClient();

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function upsertUser(email: string, name: string, isAdmin = false) {
  return db.user.upsert({
    where: { email },
    update: { name, isAdmin },
    create: { email, name, isAdmin, emailVerified: new Date() },
  });
}

async function main() {
  console.log("Seeding Pal…");

  // ── Admins from ADMIN_EMAILS ──
  for (const email of adminEmails) {
    const local = email.split("@")[0] ?? "Admin";
    const name = local.charAt(0).toUpperCase() + local.slice(1);
    await upsertUser(email, `${name} (Admin)`, true);
    console.log(`  admin: ${email}`);
  }

  // Fallback admin if none configured (so the seed is useful out of the box).
  if (adminEmails.length === 0) {
    await upsertUser("admin@pal.al", "Administrata", true);
    console.log("  admin: admin@pal.al (fallback — set ADMIN_EMAILS to override)");
  }

  // ── Example citizens ──
  const ana = await upsertUser("ana.k@example.al", "Ana Kovaçi");
  const besnik = await upsertUser("besnik.h@example.al", "Besnik Hoxha");
  const drita = await upsertUser("drita.l@example.al", "Drita Leka");
  const fatos = await upsertUser("fatos.m@example.al", "Fatos Marku");

  // ── Example ideas (idempotent by deterministic id) ──
  const ideas: Array<{
    id: string;
    title: string;
    summary: string;
    fieldKey: string;
    subfield?: string;
    authorId: string;
    archived?: boolean;
  }> = [
    {
      id: "seed-idea-leje-ndertimi",
      title: "Dixhitalizimi i lejeve të ndërtimit",
      summary:
        "Problemi: procesi i lejeve të ndërtimit është i ngadaltë, i errët dhe i prirur ndaj korrupsionit. Zgjidhja: një platformë e vetme online ku aplikimi, dokumentet dhe statusi ndiqen në kohë reale, me afate ligjore të detyrueshme dhe gjurmë auditimi për çdo hap.",
      fieldKey: "qeverisja",
      subfield: "Digjitalizimi",
      authorId: ana.id,
    },
    {
      id: "seed-idea-bursa-mjeke",
      title: "Bursa kthimi për mjekët e rinj",
      summary:
        "Problemi: largimi i mjekëve të rinj jashtë vendit po lë spitalet pa staf. Zgjidhja: bursa studimi me kusht shërbimi disavjeçar në spitalet publike, me pagë konkurruese dhe mbështetje për specializim.",
      fieldKey: "shendetesia",
      subfield: "Spitalet",
      authorId: besnik.id,
    },
    {
      id: "seed-idea-transport-orare",
      title: "Orare të unifikuara të transportit ndërqytetas",
      summary:
        "Problemi: oraret e autobusëve ndërqytetas janë të paqarta dhe të pakoordinuara. Zgjidhja: një sistem kombëtar oraresh i publikuar online dhe në stacione, me detyrim raportimi nga operatorët dhe një aplikacion për qytetarët.",
      fieldKey: "infrastruktura",
      subfield: "Transporti publik",
      authorId: drita.id,
    },
    {
      id: "seed-idea-sportel-biznes",
      title: "Sportel i vetëm për biznesin",
      summary:
        "Problemi: hapja e një biznesi kërkon vizita në shumë institucione. Zgjidhja: një sportel i vetëm (fizik dhe online) që mbledh të gjitha regjistrimet, lejet dhe njoftimet tatimore në një proces të vetëm.",
      fieldKey: "ekonomia",
      subfield: "Zhvillimi ekonomik",
      authorId: fatos.id,
    },
    {
      id: "seed-idea-panele-diellore",
      title: "Panele diellore për fshatrat e thella",
      summary:
        "Problemi: disa fshatra kanë furnizim të paqëndrueshëm me energji. Zgjidhja: programe mbështetjeje për panele diellore dhe bateri në zonat rurale, me mirëmbajtje lokale dhe trajnim për banorët.",
      fieldKey: "mjedisi",
      subfield: "Energjia e gjelbër",
      authorId: ana.id,
    },
    {
      id: "seed-idea-provim-mesuesit",
      title: "Provim kombëtar i mësuesve",
      summary:
        "Problemi: cilësia e mësimdhënies ndryshon shumë midis shkollave. Zgjidhja: një provim kombëtar standard për licencimin dhe zhvillimin profesional të mësuesve, i lidhur me trajnime të vazhdueshme.",
      fieldKey: "arsimi",
      subfield: "Arsimi parauniversitar",
      authorId: besnik.id,
      archived: true,
    },
  ];

  for (const i of ideas) {
    await db.idea.upsert({
      where: { id: i.id },
      update: {
        title: i.title,
        summary: i.summary,
        fieldKey: i.fieldKey,
        subfield: i.subfield ?? null,
        status: i.archived ? "ARCHIVED" : "ACTIVE",
      },
      create: {
        id: i.id,
        title: i.title,
        summary: i.summary,
        fieldKey: i.fieldKey,
        subfield: i.subfield ?? null,
        status: i.archived ? "ARCHIVED" : "ACTIVE",
        authorId: i.authorId,
      },
    });
  }

  // ── Supports (idempotent via unique [ideaId,userId]) ──
  const supportPairs: Array<[string, string]> = [
    ["seed-idea-leje-ndertimi", besnik.id],
    ["seed-idea-leje-ndertimi", drita.id],
    ["seed-idea-leje-ndertimi", fatos.id],
    ["seed-idea-bursa-mjeke", ana.id],
    ["seed-idea-bursa-mjeke", drita.id],
    ["seed-idea-transport-orare", fatos.id],
    ["seed-idea-sportel-biznes", ana.id],
    ["seed-idea-sportel-biznes", besnik.id],
    ["seed-idea-panele-diellore", drita.id],
  ];
  for (const [ideaId, userId] of supportPairs) {
    await db.support.upsert({
      where: { ideaId_userId: { ideaId, userId } },
      update: {},
      create: { ideaId, userId },
    });
  }

  // ── Comments (idempotent by deterministic id) ──
  const comments: Array<{
    id: string;
    ideaId: string;
    authorId: string;
    body: string;
    stance: Stance;
    isSolution?: boolean;
  }> = [
    {
      id: "seed-comment-1",
      ideaId: "seed-idea-leje-ndertimi",
      authorId: besnik.id,
      body: "Dakord plotësisht. Afatet e detyrueshme janë çelësi — pa to platforma bëhet thjesht një formular tjetër.",
      stance: "PRO",
    },
    {
      id: "seed-comment-2",
      ideaId: "seed-idea-leje-ndertimi",
      authorId: drita.id,
      body: "Mund të shtohet edhe nënshkrimi elektronik dhe pagesa online e tarifave, që qytetari të mos shkojë fare në sportel.",
      stance: "PRO",
      isSolution: true,
    },
    {
      id: "seed-comment-3",
      ideaId: "seed-idea-bursa-mjeke",
      authorId: ana.id,
      body: "Ideja është e mirë, por kushti i shërbimit duhet të jetë i drejtë dhe jo ndëshkues për të rinjtë.",
      stance: "NEUTRAL",
    },
  ];
  for (const c of comments) {
    await db.comment.upsert({
      where: { id: c.id },
      update: { body: c.body, stance: c.stance, isSolution: c.isSolution ?? false },
      create: {
        id: c.id,
        ideaId: c.ideaId,
        authorId: c.authorId,
        body: c.body,
        stance: c.stance,
        isSolution: c.isSolution ?? false,
      },
    });
  }

  // ── Experts: 5 confirmed across fields + 1 pending ──
  const experts: Array<{
    id: string;
    name: string;
    fieldKey: string;
    bio: string;
    contact: string;
    reason: string;
    status: "CONFIRMED" | "PENDING";
    source: "SELF" | "NOMINATED";
    confirmToken?: string;
    fromIdeaId?: string;
    proposerName?: string;
    proposerContact?: string;
  }> = [
    {
      id: "seed-expert-1",
      name: "Dr. Elira Tafa",
      fieldKey: "shendetesia",
      bio: "Mjeke e shëndetit publik me 15 vjet përvojë në politika spitalore dhe menaxhim të kujdesit parësor.",
      contact: "elira.tafa@example.al",
      reason: "Dëshiroj të ndihmoj reformat shëndetësore me të dhëna.",
      status: "CONFIRMED",
      source: "SELF",
    },
    {
      id: "seed-expert-2",
      name: "Ardit Bregu",
      fieldKey: "ekonomia",
      bio: "Ekonomist, fokusuar te politika fiskale dhe tregu i punës. Ish-këshilltar në organizata ndërkombëtare.",
      contact: "+355 69 000 0000",
      reason: "Kontribut në analizë ekonomike.",
      status: "CONFIRMED",
      source: "SELF",
    },
    {
      id: "seed-expert-3",
      name: "Ina Marku",
      fieldKey: "digjitalizimi",
      bio: "Inxhiniere softueri dhe eksperte e qeverisjes elektronike. Ka ndërtuar shërbime digjitale publike.",
      contact: "ina.marku@example.al",
      reason: "Digjitalizimi i shërbimeve publike.",
      status: "CONFIRMED",
      source: "SELF",
    },
    {
      id: "seed-expert-4",
      name: "Prof. Gjergj Nika",
      fieldKey: "arsimi",
      bio: "Pedagog dhe studiues i politikave arsimore, me fokus te vlerësimi dhe zhvillimi i mësuesve.",
      contact: "gjergj.nika@example.al",
      reason: "Reforma në arsim.",
      status: "CONFIRMED",
      source: "NOMINATED",
      fromIdeaId: "seed-idea-provim-mesuesit",
      proposerName: "Besnik Hoxha",
      proposerContact: "besnik.h@example.al",
    },
    {
      id: "seed-expert-5",
      name: "Sara Doçi",
      fieldKey: "mjedisi",
      bio: "Eksperte e energjisë së gjelbër dhe projekteve të qëndrueshmërisë në zonat rurale.",
      contact: "sara.doci@example.al",
      reason: "Energjia e rinovueshme.",
      status: "CONFIRMED",
      source: "SELF",
    },
    {
      id: "seed-expert-pending",
      name: "Klodian Rama",
      fieldKey: "infrastruktura",
      bio: "Inxhinier transporti me përvojë në planifikimin e rrjeteve të transportit publik.",
      contact: "klodian.rama@example.al",
      reason: "Propozuar për idenë e transportit ndërqytetas.",
      status: "PENDING",
      source: "NOMINATED",
      fromIdeaId: "seed-idea-transport-orare",
      proposerName: "Drita Leka",
      proposerContact: "drita.l@example.al",
      confirmToken: "seed-confirm-token-klodian",
    },
  ];
  for (const e of experts) {
    await db.expertProfile.upsert({
      where: { id: e.id },
      update: {
        name: e.name,
        fieldKey: e.fieldKey,
        bio: e.bio,
        status: e.status,
      },
      create: {
        id: e.id,
        name: e.name,
        fieldKey: e.fieldKey,
        bio: e.bio,
        status: e.status,
        source: e.source,
        contact: e.contact,
        reason: e.reason,
        proposerName: e.proposerName ?? null,
        proposerContact: e.proposerContact ?? null,
        fromIdeaId: e.fromIdeaId ?? null,
        confirmToken: e.confirmToken ?? null,
        confirmTokenExpires: e.confirmToken
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
          : null,
      },
    });
  }

  // ── Reports (idempotent by deterministic id) ──
  const reports: Array<{
    id: string;
    ideaId: string;
    ideaTitle: string;
    reason: string;
    reporterId: string;
    reporterEmail: string;
  }> = [
    {
      id: "seed-report-1",
      ideaId: "seed-idea-sportel-biznes",
      ideaTitle: "Sportel i vetëm për biznesin",
      reason: "Dyshoj se ka mbështetje të manipuluar nga llogari fake.",
      reporterId: drita.id,
      reporterEmail: "drita.l@example.al",
    },
    {
      id: "seed-report-2",
      ideaId: "seed-idea-transport-orare",
      ideaTitle: "Orare të unifikuara të transportit ndërqytetas",
      reason: "Përmbledhja kopjon një tekst nga një faqe tjetër.",
      reporterId: fatos.id,
      reporterEmail: "fatos.m@example.al",
    },
  ];
  for (const r of reports) {
    await db.report.upsert({
      where: { id: r.id },
      update: { reason: r.reason },
      create: {
        id: r.id,
        ideaId: r.ideaId,
        ideaTitle: r.ideaTitle,
        reason: r.reason,
        reporterId: r.reporterId,
        reporterEmail: r.reporterEmail,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
