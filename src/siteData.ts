export type NavigationItem = {
  label: string;
  path: string;
};

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
  description: string;
};

export type FeatureItem = {
  title: string;
  description: string;
};

export type FormationItem = {
  title: string;
  description: string;
  objectives: string[];
  image: string;
  alt: string;
};

export type PricingTable = {
  title: string;
  note: string;
  columns: string[];
  rows: string[][];
};

export type GalleryItem = {
  id: string;
  type: "image" | "video";
  category: "photo" | "video" | "classe" | "bibliotheque" | "science" | "numerique" | "sport";
  title: string;
  description: string;
  src: string;
  poster?: string;
  alt: string;
  temporary?: boolean;
};

export type NewsItem = {
  title: string;
  summary: string;
  badge: string;
  image: string;
  alt: string;
};

export type EventItem = {
  title: string;
  summary: string;
  badge: string;
  date: string;
  image: string;
  alt: string;
};

export const school = {
  name: "GROUPE SCOLAIRE EDEN PROVIDENCE",
  shortName: "EDEN PROVIDENCE",
  slogan: "L'apprentissage commence ici",
  mission:
    "Accompagner chaque enfant dès ses premiers pas dans un parcours d'apprentissage de qualité, en favorisant son épanouissement intellectuel, social, moral et affectif dans un environnement propice à la réussite.",
  address: "COCODY RIVIERA M'BADON CITÉ EDEN",
  phones: ["07 48 78 61 53", "05 96 08 22 22", "05 96 34 11 11", "07 00 65 45 98"],
  whatsappDisplay: "07 00 65 45 98",
  whatsappLink: "https://wa.me/2250700654598",
  email: "edenprovidence701@gmail.com",
  facebookLabel: "GS EDEN PROVIDENCE",
  facebookUrl: "https://www.facebook.com/search/top/?q=GS%20EDEN%20PROVIDENCE",
  tiktokLabel: "gs.providence",
  tiktokUrl: "https://www.tiktok.com/@gs.providence",
  mapsUrl: "https://maps.app.goo.gl/YRVmmqYGEuAdKpXA9?g_st=ac",
  mapEmbedUrl:
    "https://www.google.com/maps?q=COCODY%20RIVIERA%20M%27BADON%20CIT%C3%89%20EDEN&output=embed",
};

export const navigation: NavigationItem[] = [
  { label: "Accueil", path: "/" },
  { label: "Présentation", path: "/presentation" },
  { label: "Formations", path: "/formations" },
  { label: "Tarifs", path: "/tarifs" },
  { label: "Galerie", path: "/galerie" },
  { label: "Actualités", path: "/actualites" },
  { label: "Eden Event", path: "/eden-event" },
  { label: "Contact", path: "/contact" },
];

export const mediaLibrary = {
  heroVideo: {
    src: "https://videos.pexels.com/video-files/32778876/13973092_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/32778876/africa-african-children-african-rural-school-african-students-32778876.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
  },
  scienceVideo: {
    src: "https://videos.pexels.com/video-files/8471232/8471232-uhd_4096_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/8471232/pexels-photo-8471232.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
  },
  digitalVideo: {
    src: "https://videos.pexels.com/video-files/5892365/5892365-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/5892365/pexels-photo-5892365.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
  },
  communityVideo: {
    src: "https://videos.pexels.com/video-files/7207380/7207380-uhd_4096_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/7207380/pexels-photo-7207380.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
  },
};

export const quickHighlights: FeatureItem[] = [
  {
    title: "Accompagnement dès les premiers pas",
    description:
      "Une approche pensée pour guider l'enfant avec bienveillance, sécurité et régularité tout au long de son parcours.",
  },
  {
    title: "Parcours éducatif structuré",
    description:
      "De la crèche au primaire, l'école propose une progression claire pour favoriser l'autonomie et la confiance.",
  },
  {
    title: "Épanouissement global",
    description:
      "L'école place au cœur de sa mission le développement intellectuel, social, moral et affectif de chaque enfant.",
  },
  {
    title: "Cadre propice à la réussite",
    description:
      "Un environnement serein et engageant pour apprendre, grandir, coopérer et s'ouvrir au monde.",
  },
];

export const values: FeatureItem[] = [
  {
    title: "Bienveillance",
    description: "Créer un climat rassurant où chaque enfant peut apprendre avec confiance.",
  },
  {
    title: "Exigence de qualité",
    description: "Soutenir un apprentissage solide, progressif et structuré à chaque étape.",
  },
  {
    title: "Respect",
    description: "Valoriser la personne, l'écoute, la politesse et la vie en communauté.",
  },
  {
    title: "Épanouissement",
    description: "Favoriser le développement équilibré des dimensions intellectuelle, sociale, morale et affective.",
  },
];

export const objectives: FeatureItem[] = [
  {
    title: "Développer les bases académiques",
    description: "Installer des fondations durables pour lire, comprendre, s'exprimer et progresser.",
  },
  {
    title: "Encourager la socialisation",
    description: "Apprendre à partager, coopérer, respecter les autres et grandir ensemble.",
  },
  {
    title: "Renforcer l'autonomie",
    description: "Aider l'enfant à prendre confiance et à évoluer avec davantage d'initiative.",
  },
  {
    title: "Cultiver les repères humains",
    description: "Accompagner la construction de valeurs essentielles dans le quotidien scolaire.",
  },
];

export const stats: StatItem[] = [
  {
    value: 4,
    suffix: "",
    label: "cycles d'accueil",
    description: "Crèche, garderie, maternelle et primaire.",
  },
  {
    value: 4,
    suffix: "",
    label: "numéros de contact",
    description: "Plusieurs lignes pour joindre rapidement l'établissement.",
  },
  {
    value: 1,
    suffix: "",
    label: "contact WhatsApp officiel",
    description: "Un canal direct pour les demandes d'information.",
  },
  {
    value: 1,
    suffix: "",
    label: "localisation Google Maps",
    description: "Repérage simplifié pour préparer votre visite.",
  },
];

export const formations: FormationItem[] = [
  {
    title: "Crèche",
    description:
      "Un univers d'éveil pour les tout-petits, avec un accompagnement rassurant, des repères stables et des activités adaptées au rythme de l'enfant.",
    objectives: [
      "Favoriser l'éveil sensoriel et relationnel",
      "Installer des routines sécurisantes",
      "Accompagner les premières découvertes",
    ],
    image:
      "https://images.pexels.com/photos/8612897/pexels-photo-8612897.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'enfants en activité ludique, en attente des photos officielles de la crèche.",
  },
  {
    title: "Garderie",
    description:
      "Un accueil encadré pensé pour prolonger la journée dans un cadre serein, chaleureux et sécurisé, avec des temps d'activités et de socialisation.",
    objectives: [
      "Offrir un cadre de confiance aux familles",
      "Proposer des activités calmes et ludiques",
      "Encourager le vivre-ensemble",
    ],
    image:
      "https://images.pexels.com/photos/35573005/pexels-photo-35573005.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'enfants jouant ensemble, en attente des photos officielles de la garderie.",
  },
  {
    title: "Maternelle",
    description:
      "Une étape essentielle pour découvrir les premiers apprentissages, développer le langage, la motricité, l'imagination et le plaisir d'apprendre.",
    objectives: [
      "Stimuler la curiosité et l'expression",
      "Préparer les premiers apprentissages fondamentaux",
      "Développer l'autonomie au quotidien",
    ],
    image:
      "https://images.pexels.com/photos/8363576/pexels-photo-8363576.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'une classe maternelle, en attente des photos officielles de l'école.",
  },
  {
    title: "Primaire",
    description:
      "Un cadre d'apprentissage structuré pour consolider les compétences fondamentales, encourager la réflexion et installer une progression durable.",
    objectives: [
      "Renforcer les bases académiques",
      "Développer la méthode et la concentration",
      "Préparer l'enfant à réussir les étapes suivantes",
    ],
    image:
      "https://images.pexels.com/photos/8923036/pexels-photo-8923036.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'élèves en classe primaire, en attente des photos officielles de l'école.",
  },
];

export const pricingTables: PricingTable[] = [
  {
    title: "Grille des frais d'inscription",
    note:
      "Les montants du document officiel n'ont pas été fournis dans l'espace de travail. Le tableau est prêt à être complété sans modifier le design du site.",
    columns: ["Cycle", "Inscription", "Réinscription", "Dossier / kit", "Observation"],
    rows: [
      ["Crèche", "À compléter", "À compléter", "À compléter", "Document officiel à intégrer"],
      ["Garderie", "À compléter", "À compléter", "À compléter", "Document officiel à intégrer"],
      ["Maternelle", "À compléter", "À compléter", "À compléter", "Document officiel à intégrer"],
      ["Primaire", "À compléter", "À compléter", "À compléter", "Document officiel à intégrer"],
    ],
  },
  {
    title: "Grille des frais de scolarité",
    note:
      "Version HTML responsive prête pour l'intégration fidèle des données du document de frais de scolarité transmis ultérieurement.",
    columns: ["Cycle", "Mensualité", "Trimestre", "Annuel", "Observation"],
    rows: [
      ["Crèche", "À compléter", "À compléter", "À compléter", "Tarification officielle en attente"],
      ["Garderie", "À compléter", "À compléter", "À compléter", "Tarification officielle en attente"],
      ["Maternelle", "À compléter", "À compléter", "À compléter", "Tarification officielle en attente"],
      ["Primaire", "À compléter", "À compléter", "À compléter", "Tarification officielle en attente"],
    ],
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    type: "image",
    category: "bibliotheque",
    title: "Lecture accompagnée",
    description: "Visuel d'ambiance temporaire en attente des photos officielles de l'établissement.",
    src: "https://images.pexels.com/photos/8926887/pexels-photo-8926887.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'élèves en lecture dans une bibliothèque.",
    temporary: true,
  },
  {
    id: "gal-2",
    type: "image",
    category: "classe",
    title: "Vie de classe",
    description: "Visuel d'ambiance temporaire pour illustrer l'expérience d'apprentissage.",
    src: "https://images.pexels.com/photos/8423116/pexels-photo-8423116.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'élèves assis en classe.",
    temporary: true,
  },
  {
    id: "gal-3",
    type: "image",
    category: "numerique",
    title: "Découverte numérique",
    description: "Visuel d'ambiance temporaire pour représenter les activités informatiques.",
    src: "https://images.pexels.com/photos/8926900/pexels-photo-8926900.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'un élève accompagné sur ordinateur.",
    temporary: true,
  },
  {
    id: "gal-4",
    type: "image",
    category: "science",
    title: "Curiosité scientifique",
    description: "Visuel d'ambiance temporaire pour illustrer les activités de découverte.",
    src: "https://images.pexels.com/photos/8364069/pexels-photo-8364069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'un atelier pédagogique guidé par un adulte.",
    temporary: true,
  },
  {
    id: "gal-5",
    type: "image",
    category: "sport",
    title: "Jeux éducatifs et cohésion",
    description: "Visuel d'ambiance temporaire pour représenter les activités de groupe.",
    src: "https://images.pexels.com/photos/35573005/pexels-photo-35573005.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'enfants en activité de groupe.",
    temporary: true,
  },
  {
    id: "gal-6",
    type: "video",
    category: "video",
    title: "Classe immersive",
    description: "Vidéo d'ambiance temporaire, remplaçable plus tard depuis l'administration.",
    src: "https://videos.pexels.com/video-files/5427895/5427895-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/5427895/pexels-photo-5427895.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Vidéo temporaire montrant une salle de classe.",
    temporary: true,
  },
  {
    id: "gal-7",
    type: "video",
    category: "science",
    title: "Expérimentation",
    description: "Vidéo d'ambiance temporaire pour représenter les activités scientifiques.",
    src: "https://videos.pexels.com/video-files/8471232/8471232-uhd_4096_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/8471232/pexels-photo-8471232.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Vidéo temporaire d'enfants participant à une expérience scientifique.",
    temporary: true,
  },
  {
    id: "gal-8",
    type: "video",
    category: "numerique",
    title: "Apprentissage numérique",
    description: "Vidéo d'ambiance temporaire pour illustrer le travail sur ordinateur.",
    src: "https://videos.pexels.com/video-files/5892365/5892365-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/5892365/pexels-photo-5892365.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Vidéo temporaire d'enfants travaillant sur ordinateur.",
    temporary: true,
  },
];

export const newsItems: NewsItem[] = [
  {
    title: "Rubrique actualités prête à être alimentée",
    summary:
      "Espace prévu pour les annonces importantes, la vie pédagogique, les temps forts et les communications destinées aux familles.",
    badge: "Contenu temporaire",
    image:
      "https://images.pexels.com/photos/8926885/pexels-photo-8926885.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire pour la rubrique actualités.",
  },
  {
    title: "Vie scolaire et projets éducatifs",
    summary:
      "Section conçue pour mettre en avant les projets de classe, les ateliers et les initiatives pédagogiques dès que le contenu officiel sera disponible.",
    badge: "À compléter",
    image:
      "https://images.pexels.com/photos/8364030/pexels-photo-8364030.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'un élève tenant un livre.",
  },
  {
    title: "Informations familles",
    summary:
      "Zone premium dédiée aux communications pratiques, rappels de calendrier, informations de rentrée et publications institutionnelles.",
    badge: "Bientôt disponible",
    image:
      "https://images.pexels.com/photos/8926840/pexels-photo-8926840.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'enfants lisant en bibliothèque.",
  },
];

export const eventItems: EventItem[] = [
  {
    title: "Eden Event — calendrier à personnaliser",
    summary:
      "Espace événementiel prêt à présenter les journées portes ouvertes, célébrations, rencontres pédagogiques et animations spéciales.",
    badge: "Contenu temporaire",
    date: "Date à confirmer",
    image:
      "https://images.pexels.com/photos/8363015/pexels-photo-8363015.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'enfants en activité.",
  },
  {
    title: "Ateliers, spectacles et moments de partage",
    summary:
      "La page est structurée pour accueillir affiches, vidéos, galerie et détails logistiques dès publication des événements officiels.",
    badge: "À programmer",
    date: "Programme à compléter",
    image:
      "https://images.pexels.com/photos/7715131/pexels-photo-7715131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'une activité musicale ou numérique.",
  },
  {
    title: "Rencontres parents-école",
    summary:
      "Bloc dédié aux invitations, temps d'échanges et rendez-vous importants, avec architecture déjà prête pour un futur CMS.",
    badge: "Bientôt disponible",
    date: "Agenda à compléter",
    image:
      "https://images.pexels.com/photos/8923036/pexels-photo-8923036.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Illustration temporaire d'un temps d'échange en classe.",
  },
];

export const legalHighlights = [
  "Éditeur du site : GROUPE SCOLAIRE EDEN PROVIDENCE",
  "Adresse : COCODY RIVIERA M'BADON CITÉ EDEN",
  "Email : edenprovidence701@gmail.com",
  "Téléphones : 07 48 78 61 53 / 05 96 08 22 22 / 05 96 34 11 11 / 07 00 65 45 98",
  "Directeur de publication : information non fournie — à compléter",
  "Hébergement : information non fournie — à compléter",
];
