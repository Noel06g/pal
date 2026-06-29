/**
 * Platforma Shqiptare — të gjitha tekstet e ndërfaqes në një vend (shqip).
 * Ndrysho fjalët këtu për t'i pasqyruar kudo në aplikacion.
 */
export const t = {
  site: {
    name: "Platforma Shqiptare",
    tagline: "Të ndërtojmë të ardhmen së bashku",
    tempName: "",
    footerNote: "Nismë e pavarur qytetare",
  },

  nav: {
    home: "Ballina",
    ideas: "Idetë",
    experts: "Ekspertët",
    about: "Rreth nesh",
    admin: "Administrimi",
    account: "Llogaria ime",
    signIn: "Hyr",
    signOut: "Dil",
    newIdea: "Propozo një ide",
    menu: "Menyja",
  },

  home: {
    heroTitle: "Të ndërtojmë të ardhmen së bashku",
    heroSub:
      "Platforma Shqiptare është një nismë e pavarur qytetare ku qytetarët propozojnë ide e zgjidhje për problemet e vendit, komuniteti i mbështet e diskuton, dhe ekspertët ndërlidhen me idetë.",
    heroCtaPrimary: "Propozo një ide",
    heroCtaSecondary: "Propozo një ekspert",
    howTitle: "Si funksionon",
    how: [
      {
        title: "Propozo një ide",
        body: "Përshkruaj problemin dhe zgjidhjen që propozon, zgjedh një fushë dhe, nëse do, ngarko dokumente mbështetëse.",
      },
      {
        title: "Komuniteti mbështet e diskuton",
        body: "Qytetarët e tjerë e mbështesin idenë, komentojnë pro, kundër ose neutral dhe mund të propozojnë zgjidhje.",
      },
      {
        title: "Ekspertët ndërlidhen",
        body: "Ekspertë të fushës propozohen ose vetëpropozohen për idenë. Kontakti vijon jashtë platformës.",
      },
    ],
    fieldsTitle: "14 fushat",
    fieldsSub: "Çdo ide i përket një fushe. Kliko një fushë për të parë idetë e saj.",
    mostSupported: "Idetë më të mbështetura",
    viewAll: "Shiko të gjitha",
    expertsTeaser: "Ekspertët",
    expertsTeaserSub:
      "Njerëz që ofrojnë njohuri për fushat e tyre. Vetëpropozohu ose propozo dikë nga një ide.",
    aboutTeaser: "Rreth nesh",
    aboutTeaserSub:
      "Një nismë e pavarur qytetare. Lexo misionin dhe rregullat tona.",
  },

  ideas: {
    listTitle: "Idetë",
    listSub: "Ide e zgjidhje për problemet e vendit.",
    searchPlaceholder: "Kërko sipas titullit, përmbledhjes ose autorit…",
    filterTitle: "Fushat",
    filterButton: "Filtro sipas fushës",
    filterAll: "Të gjitha",
    sortNote: "Renditur sipas mbështetjes — të arkivuarat në fund.",
    empty: "Nuk u gjet asnjë ide. Provo një filtër tjetër ose propozo një ide të re.",
    supports: "mbështetje",
    comments: "komente",
    by: "nga",
    statusActive: "AKTIVE",
    statusArchived: "ARKIVUAR",
    archivedNote: "Kjo ide është arkivuar — një ekspert e mori përsipër. Vetëm për lexim.",
  },

  idea: {
    support: "Mbështet",
    supported: "E mbështetur",
    supportLogin: "Hyr për të mbështetur",
    report: "Raporto",
    archive: "Arkivo idenë",
    archiveConfirm:
      "Arkivimi do të thotë që një ekspert e mori përsipër idenë. Pas arkivimit nuk pranohen mbështetje ose komente të reja. Vazhdo?",
    proposeExpert: "Propozo një ekspert",
    expertsInField: "Ekspertë në këtë fushë",
    noExpertsInField: "Ende s'ka ekspertë të konfirmuar në këtë fushë.",
    documents: "Dokumente mbështetëse",
    download: "Shkarko",
    commentsTitle: "Komentet",
    addComment: "Shto një koment",
    commentLogin: "Hyr për të komentuar",
    deleteComment: "Fshi",
    proposesSolution: "Propozon një zgjidhje",
    field: "Fusha",
    subfield: "Nënfusha",
    author: "Autori",
    backToList: "← Të gjitha idetë",
  },

  stance: {
    PRO: "Pro",
    KUNDER: "Kundër",
    NEUTRAL: "Neutral",
    label: "Qëndrimi",
  },

  experts: {
    title: "Ekspertët",
    sub: "Njerëz që ofrojnë njohuri për fushat ku ndërtojmë zgjidhje.",
    filterAll: "Të gjitha fushat",
    selfNominate: "Vetëpropozohu si ekspert",
    badgePrefix: "Ekspert ·",
    privateNote: "Kontakti & CV-ja janë private (vetëm administrata).",
    empty: "Ende s'ka ekspertë në këtë fushë.",
    confirmTitle: "Konfirmo propozimin si ekspert",
    confirmAccept: "Prano",
    confirmReject: "Refuzo",
    confirmIntro:
      "Je propozuar si ekspert në Platformën Shqiptare. Nëse pranon, emri, fusha dhe biografia jote bëhen publike. Kontakti dhe CV-ja mbeten private (vetëm administrata).",
    confirmAccepted: "Faleminderit! Profili yt u konfirmua dhe tani është publik.",
    confirmRejected: "Propozimi u refuzua. Të dhënat e tua nuk do të publikohen.",
    confirmInvalid: "Ky lidhje konfirmimi është e pavlefshme ose ka skaduar.",
    confirmAlready: "Ky propozim është trajtuar tashmë.",
  },

  forms: {
    // Idea
    ideaTitle: "Titulli",
    ideaTitlePh: "P.sh. Dixhitalizimi i lejeve të ndërtimit",
    ideaSummary: "Përmbledhja (problemi + zgjidhja e propozuar)",
    ideaSummaryPh: "Përshkruaj problemin dhe zgjidhjen që propozon…",
    ideaField: "Fusha",
    ideaSubfield: "Nënfusha (opsionale)",
    ideaOther: "Shpjego fushën",
    ideaOtherPh: "Përshkruaj shkurt fushën që ke parasysh…",
    ideaDocs: "Dokumente mbështetëse (PDF, opsionale, publike)",
    ideaSubmit: "Publiko idenë",
    chooseField: "Zgjedh një fushë…",
    chooseSubfield: "Zgjedh një nënfushë…",

    // Comment
    commentBody: "Komenti yt",
    commentBodyPh: "Shkruaj mendimin tënd…",
    commentStance: "Qëndrimi",
    commentIsSolution: "Po propozoj një zgjidhje",
    commentSubmit: "Dërgo komentin",

    // Self-nominate expert
    expName: "Emër Mbiemër",
    expField: "Fusha",
    expBio: "Biografia (publike)",
    expBioPh: "Përvoja dhe njohuritë e tua në fushë…",
    expReason: "Arsyeja / motivimi (private)",
    expReasonPh: "Pse dëshiron të kontribuosh…",
    expContact: "Kontakti (privat)",
    expContactPh: "Email ose telefon — vetëm administrata e sheh",
    expCv: "CV (PDF, opsionale, private)",
    selfNominateSubmit: "Dërgo vetëpropozimin",

    // Nominate from idea
    nomFieldPrefilled: "Fusha (e idesë)",
    nomName: "Emër Mbiemër i propozuar",
    nomBio: "Biografia (bëhet publike nëse konfirmohet)",
    nomReason: "Arsyeja",
    nomContact: "Kontakti i propozuar (privat)",
    nomProposerName: "Emri yt (propozuesi)",
    nomProposerContact: "Kontakti yt (privat)",
    nomCv: "CV e propozuar (PDF, opsionale, private)",
    nominateSubmit: "Dërgo propozimin",
    nominateNote:
      "Profili nuk shfaqet publikisht menjëherë — shqyrtohet nga administrata para se të publikohet.",

    // Report
    reportReason: "Arsyeja e raportimit",
    reportReasonPh: "Pse po e raporton këtë përmbajtje…",
    reportSubmit: "Dërgo raportimin",

    // Auth
    authEmail: "Email",
    authName: "Emër Mbiemër",
    authNamePh: "Emri yt i plotë",
    authSignIn: "Më dërgo lidhjen e hyrjes",
    authNote:
      "Të dërgojmë një lidhje hyrjeje me email. S'ka fjalëkalim. Një llogari për person.",
    required: "E detyrueshme",
  },

  account: {
    title: "Llogaria ime",
    yourIdeas: "Idetë e mia",
    noIdeas: "Ende s'ke propozuar asnjë ide.",
    deleteTitle: "Fshi llogarinë",
    deleteWarn:
      "Fshirja e llogarisë heq përfundimisht të dhënat e tua personale, idetë, komentet dhe mbështetjet. Ky veprim s'kthehet mbrapsht.",
    deleteBtn: "Fshi llogarinë time",
    deleteConfirm: "A je i/e sigurt? Ky veprim s'kthehet mbrapsht.",
  },

  admin: {
    title: "Administrimi",
    tabReports: "Raportime",
    tabIdeas: "Idetë",
    tabAccounts: "Llogaritë",
    tabExperts: "Ekspertët",
    reportPost: "Postimi",
    reportReason: "Arsyeja",
    reportReporter: "Raportuesi",
    reportResolve: "Zgjidh",
    reportDelete: "Fshi postimin",
    resolved: "Zgjidhur",
    delete: "Fshi",
    ban: "Pezullo llogarinë",
    unban: "Riaktivizo",
    approve: "Mirato",
    reject: "Refuzo",
    viewPrivate: "Të dhëna private",
    downloadCv: "Shkarko CV",
    pending: "Në pritje",
    confirmed: "Të konfirmuar",
    noPrivate: "—",
    proposer: "Propozuesi",
    contact: "Kontakti",
    reason: "Arsyeja",
  },

  notifications: {
    title: "Njoftimet",
    empty: "S'ke njoftime.",
    markAllRead: "Shëno të gjitha si të lexuara",
    bellLabel: "Njoftimet",
  },

  auth: {
    checkEmail: "Kontrollo email-in tënd",
    checkEmailBody:
      "Të dërguam një lidhje hyrjeje. Hape email-in dhe kliko lidhjen për të vazhduar.",
    verifying: "Po verifikohet…",
    error: "Diçka shkoi keq",
    errorBody: "Lidhja mund të ketë skaduar ose është përdorur tashmë. Provo përsëri.",
    banned: "Kjo llogari është pezulluar.",
    errorVerification:
      "Lidhja e hyrjes ka skaduar ose është përdorur tashmë. Kërko një lidhje të re më poshtë.",
    errorGeneric: "Hyrja dështoi. Provo përsëri më poshtë.",
    alreadyIn: "Je tashmë i kyçur",
    alreadyInBody: "Je i kyçur si",
    goAccount: "Shko te llogaria",
  },

  common: {
    save: "Ruaj",
    cancel: "Anulo",
    submit: "Dërgo",
    close: "Mbyll",
    loading: "Po ngarkohet…",
    error: "Ndodhi një gabim.",
    success: "U krye me sukses.",
    requiredField: "Kjo fushë është e detyrueshme.",
    loginRequired: "Duhet të hysh për të vazhduar.",
    notFoundTitle: "Faqja nuk u gjet",
    notFoundBody: "Faqja që kërkove nuk ekziston ose është hequr.",
    errorTitle: "Ndodhi një gabim",
    errorBody: "Na vjen keq — diçka shkoi keq. Provo përsëri.",
    backHome: "Kthehu në ballinë",
    retry: "Provo përsëri",
  },

  toast: {
    ideaCreated: "Ideja u publikua.",
    supported: "E mbështete idenë.",
    unsupported: "Hoqe mbështetjen.",
    commented: "Komenti u shtua.",
    commentDeleted: "Komenti u fshi.",
    archived: "Ideja u arkivua.",
    reported: "Faleminderit — raportimi u dërgua.",
    expertSelf: "Vetëpropozimi u regjistrua — je tani në direktorinë e ekspertëve.",
    expertNominated: "Propozimi u dërgua. Do të shqyrtohet nga administrata para se të publikohet.",
    accountDeleted: "Llogaria u fshi.",
    fileTooBig: "Skedari është shumë i madh (maks. 10 MB).",
    fileNotPdf: "Lejohen vetëm skedarë PDF.",
    rateLimited: "Shumë veprime në pak kohë. Provo pas pak.",
    turnstileFailed: "Verifikimi kundër robotëve dështoi. Provo përsëri.",
  },

  about: {
    title: "Rreth Platformës Shqiptare",
    missionTitle: "Misioni",
    mission:
      "Platforma Shqiptare është një nismë e pavarur qytetare që i jep qytetarëve një hapësirë për të propozuar ide e zgjidhje për problemet e Shqipërisë, për t'i diskutuar bashkë dhe për t'i ndërlidhur me ekspertë. Nuk jemi parti politike dhe nuk përfaqësojmë asnjë institucion.",
    principlesTitle: "Parimet",
    principles: [
      "E pavarur dhe jopartiake — pa simbole partiake, pa axhenda.",
      "E hapur — leximi i lirë për të gjithë, pa llogari.",
      "Me përgjegjësi — çdo ide nënshkruhet me emrin e vërtetë.",
      "Me cilësi — ekspertët ndihmojnë që idetë të bëhen të zbatueshme.",
      "Me respekt — diskutim civil, pa fyerje dhe pa gjuhë urrejtjeje.",
    ],
    rulesTitle: "Rregullat e komunitetit",
    rules: [
      "Përdor emrin tënd të vërtetë. Një llogari për person.",
      "Mos publiko gjuhë urrejtjeje, fyerje, shpifje apo përmbajtje të paligjshme.",
      "Mos publiko të dhëna personale të të tjerëve pa pëlqim.",
      "Mos bëj spam, reklama apo manipulim të mbështetjes.",
      "Respekto qëndrimet e ndryshme — diskuto idenë, jo personin.",
    ],
    penaltyTitle: "Pasojat",
    penalty:
      "Shkelja e rregullave çon në heqjen e llogarisë. Administrata mund të fshijë ide, komente dhe llogari që shkelin këto rregulla.",
  },
} as const;

export type Strings = typeof t;
