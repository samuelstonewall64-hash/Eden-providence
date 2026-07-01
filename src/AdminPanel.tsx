import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CloudUpload,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Film,
  Globe,
  GripVertical,
  History,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  Lock,
  LogOut,
  Moon,
  Search,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Undo2,
  Redo2,
  Upload,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { fetchRemoteCmsState, saveRemoteCmsState, subscribeToRemoteCms, uploadMediaToSupabase } from "./cmsSync";
import { CMS_STORAGE_KEY, CMS_UPDATED_EVENT } from "./runtimeCms";
import { hasSupabaseConfig } from "./supabase";
import { cn } from "./utils/cn";
import { eventItems, formations, galleryItems, newsItems, pricingTables, school } from "./siteData";

type ThemeMode = "light" | "dark";
type SessionMode = "guest" | "active" | "locked";
type AdminTab = "dashboard" | "content" | "pages" | "collections" | "media" | "settings" | "security";
type ToastType = "success" | "error" | "info";
type MediaType = "image" | "video" | "document";
type CollectionKind = "formations" | "actualites" | "evenements" | "enseignants" | "documents" | "galerie";
type BlockType =
  | "Hero"
  | "Galerie"
  | "Texte"
  | "Vidéo"
  | "Image"
  | "Témoignages"
  | "Équipe"
  | "Tarifs"
  | "FAQ"
  | "Boutons"
  | "Cartes"
  | "Statistiques"
  | "Formulaire"
  | "Carte Google Maps"
  | "Documents"
  | "Actualités"
  | "Événements"
  | "Bloc personnalisé";

type CmsMedia = {
  id: string;
  name: string;
  type: MediaType;
  category: string;
  src: string;
  poster?: string;
  size: number;
  createdAt: string;
  hidden: boolean;
  featured: boolean;
  source: "remote" | "upload" | "document";
};

type CmsBlock = {
  id: string;
  type: BlockType;
  title: string;
  subtitle: string;
  content: string;
  mediaId?: string;
  visible: boolean;
  published: boolean;
  updatedAt: string;
};

type CmsPage = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  blocks: CmsBlock[];
  seoTitle: string;
  seoDescription: string;
};

type CollectionItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  mediaId?: string;
  published: boolean;
  hidden: boolean;
  updatedAt: string;
  label?: string;
};

type CmsSettings = {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  animations: boolean;
  menuStyle: string;
  footerText: string;
  address: string;
  email: string;
  phones: string[];
  whatsapp: string;
  facebook: string;
  tiktok: string;
  mapsUrl: string;
  analytics: string;
  metaPixel: string;
  headScripts: string;
  bodyScripts: string;
  globalSeoTitle: string;
  globalSeoDescription: string;
};

type CmsState = {
  pages: CmsPage[];
  media: CmsMedia[];
  collections: Record<CollectionKind, CollectionItem[]>;
  settings: CmsSettings;
  activity: string[];
};

type SnapshotEntry = {
  id: string;
  savedAt: string;
  snapshot: string;
};

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type SearchResult = {
  id: string;
  label: string;
  meta: string;
  tab: AdminTab;
  pageId?: string;
  collectionKind?: CollectionKind;
};

const STORAGE_KEYS = {
  hash: "eden-admin-code-hash",
  session: "eden-admin-session",
  lastLogin: "eden-admin-last-login",
  cms: CMS_STORAGE_KEY,
  versions: "eden-admin-cms-versions",
  theme: "eden-admin-theme",
};

const DEFAULT_ADMIN_CODE = "1234567890";
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

const blockPalette: BlockType[] = [
  "Hero",
  "Galerie",
  "Texte",
  "Vidéo",
  "Image",
  "Témoignages",
  "Équipe",
  "Tarifs",
  "FAQ",
  "Boutons",
  "Cartes",
  "Statistiques",
  "Formulaire",
  "Carte Google Maps",
  "Documents",
  "Actualités",
  "Événements",
  "Bloc personnalisé",
];

const adminTabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "content", label: "Contenu", icon: Wand2 },
  { id: "pages", label: "Pages", icon: LayoutTemplate },
  { id: "collections", label: "Collections", icon: Globe },
  { id: "media", label: "Médias", icon: ImageIcon },
  { id: "settings", label: "Paramètres", icon: Settings2 },
  { id: "security", label: "Sécurité", icon: Shield },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function bytesToSize(bytes: number) {
  if (!bytes) return "0 Ko";
  const sizes = ["octets", "Ko", "Mo", "Go"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function getPublicPreviewUrl(slug: string) {
  const normalized = slug === "/" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;
  return `${window.location.pathname}#${normalized}`;
}

async function hashCode(value: string) {
  const encoded = new TextEncoder().encode(value);
  const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function createInitialCmsState(): CmsState {
  const now = new Date().toISOString();

  const media: CmsMedia[] = [
    ...galleryItems.map(
      (item, index): CmsMedia => ({
        id: item.id,
        name: item.title,
        type: item.type === "video" ? "video" : "image",
        category: item.category,
        src: item.src,
        poster: item.poster,
        size: item.type === "video" ? 22_000_000 + index * 500_000 : 2_400_000 + index * 200_000,
        createdAt: now,
        hidden: false,
        featured: index < 2,
        source: "remote",
      }),
    ),
    {
      id: "doc-tarifs",
      name: "Tarifs à compléter",
      type: "document",
      category: "tarifs",
      src: "/documents/tarifs-eden-providence-a-completer.txt",
      size: 1024,
      createdAt: now,
      hidden: false,
      featured: false,
      source: "document",
    },
  ];

  const collections: Record<CollectionKind, CollectionItem[]> = {
    formations: formations.map((formation, index) => ({
      id: uid("formation"),
      title: formation.title,
      summary: formation.description,
      category: "formation",
      mediaId: media[index]?.id,
      published: true,
      hidden: false,
      updatedAt: now,
      label: `Cycle ${index + 1}`,
    })),
    actualites: newsItems.map((item, index) => ({
      id: uid("news"),
      title: item.title,
      summary: item.summary,
      category: "actualité",
      mediaId: media[index]?.id,
      published: false,
      hidden: false,
      updatedAt: now,
      label: item.badge,
    })),
    evenements: eventItems.map((item, index) => ({
      id: uid("event"),
      title: item.title,
      summary: item.summary,
      category: "événement",
      mediaId: media[index + 2]?.id,
      published: false,
      hidden: false,
      updatedAt: now,
      label: item.date,
    })),
    enseignants: [
      {
        id: uid("teacher"),
        title: "Profil enseignant à compléter",
        summary: "Fiche administrable prête pour ajouter nom, fonction, biographie, photo et publication.",
        category: "enseignant",
        published: false,
        hidden: false,
        updatedAt: now,
        label: "Contenu temporaire",
      },
      {
        id: uid("teacher"),
        title: "Équipe pédagogique — emplacement réservé",
        summary: "Section préparée pour la gestion future de l'équipe pédagogique depuis le CMS.",
        category: "enseignant",
        published: false,
        hidden: false,
        updatedAt: now,
        label: "À compléter",
      },
    ],
    documents: [
      {
        id: uid("document"),
        title: "Document tarifs à compléter",
        summary: "Document téléchargeable temporaire déjà lié à la page Tarifs.",
        category: "document",
        mediaId: "doc-tarifs",
        published: true,
        hidden: false,
        updatedAt: now,
        label: "Téléchargement",
      },
    ],
    // Collection volontairement vide : elle n'est remplie que par les vraies
    // photos/vidéos importées par l'administrateur depuis son téléphone ou son PC.
    galerie: [],
  };

  const pages: CmsPage[] = [
    {
      id: "page-home",
      title: "Accueil",
      slug: "/",
      published: true,
      seoTitle: `${school.shortName} | ${school.slogan}`,
      seoDescription: school.mission,
      blocks: [
        {
          id: uid("block"),
          type: "Hero",
          title: "Hero Accueil",
          subtitle: school.slogan,
          content: school.mission,
          mediaId: media[5]?.id,
          visible: true,
          published: true,
          updatedAt: now,
        },
        {
          id: uid("block"),
          type: "Statistiques",
          title: "Chiffres clés",
          subtitle: "Repères essentiels",
          content: "Mettre en avant les cycles, contacts, localisation et parcours d'accueil.",
          visible: true,
          published: true,
          updatedAt: now,
        },
      ],
    },
    {
      id: "page-presentation",
      title: "Présentation",
      slug: "/presentation",
      published: true,
      seoTitle: `Présentation | ${school.shortName}`,
      seoDescription: "Mission, valeurs, objectifs, vision et informations institutionnelles.",
      blocks: [
        {
          id: uid("block"),
          type: "Texte",
          title: "Mission",
          subtitle: "Texte institutionnel",
          content: school.mission,
          visible: true,
          published: true,
          updatedAt: now,
        },
        {
          id: uid("block"),
          type: "Bloc personnalisé",
          title: "Vision",
          subtitle: "Contenu temporaire",
          content: "Section prête à être complétée depuis le CMS.",
          visible: true,
          published: false,
          updatedAt: now,
        },
      ],
    },
    {
      id: "page-formations",
      title: "Formations",
      slug: "/formations",
      published: true,
      seoTitle: `Formations | ${school.shortName}`,
      seoDescription: "Crèche, garderie, maternelle et primaire.",
      blocks: formations.slice(0, 3).map((formation, index) => ({
        id: uid("block"),
        type: "Cartes",
        title: formation.title,
        subtitle: `Cycle ${index + 1}`,
        content: formation.description,
        mediaId: media[index]?.id,
        visible: true,
        published: true,
        updatedAt: now,
      })),
    },
    {
      id: "page-tarifs",
      title: "Tarifs",
      slug: "/tarifs",
      published: true,
      seoTitle: `Tarifs | ${school.shortName}`,
      seoDescription: "Tableaux HTML modernes et document téléchargeable.",
      blocks: pricingTables.map((table) => ({
        id: uid("block"),
        type: "Tarifs",
        title: table.title,
        subtitle: "Tableau responsive",
        content: table.note,
        mediaId: "doc-tarifs",
        visible: true,
        published: true,
        updatedAt: now,
      })),
    },
    {
      id: "page-actualites",
      title: "Actualités",
      slug: "/actualites",
      published: true,
      seoTitle: `Actualités | ${school.shortName}`,
      seoDescription: "Rubrique actualités prête à être alimentée.",
      blocks: newsItems.map((item, index) => ({
        id: uid("block"),
        type: "Actualités",
        title: item.title,
        subtitle: item.badge,
        content: item.summary,
        mediaId: media[index]?.id,
        visible: true,
        published: false,
        updatedAt: now,
      })),
    },
    {
      id: "page-evenements",
      title: "Eden Event",
      slug: "/eden-event",
      published: true,
      seoTitle: `Eden Event | ${school.shortName}`,
      seoDescription: "Calendrier, affiches, photos et vidéos des événements.",
      blocks: eventItems.map((item, index) => ({
        id: uid("block"),
        type: "Événements",
        title: item.title,
        subtitle: item.date,
        content: item.summary,
        mediaId: media[index + 2]?.id,
        visible: true,
        published: false,
        updatedAt: now,
      })),
    },
  ];

  return {
    pages,
    media,
    collections,
    settings: {
      logo: "/logo-eden-providence.svg", 
      favicon: "/favicon.svg",
      primaryColor: "#0E2A7B",
      secondaryColor: "#D3132E",
      accentColor: "#F4D84E",
      fontHeading: "Cormorant Garamond",
      fontBody: "Manrope",
      animations: true,
      menuStyle: "Glass premium",
      footerText: `© ${new Date().getFullYear()} ${school.name}`,
      address: school.address,
      email: school.email,
      phones: [...school.phones],
      whatsapp: school.whatsappLink,
      facebook: school.facebookUrl,
      tiktok: school.tiktokUrl,
      mapsUrl: school.mapsUrl,
      analytics: "",
      metaPixel: "",
      headScripts: "",
      bodyScripts: "",
      globalSeoTitle: `${school.name} | ${school.slogan}`,
      globalSeoDescription:
        "Site scolaire premium, moderne et immersif du Groupe Scolaire Eden Providence.",
    },
    activity: [
      `${formatDateTime(now)} — Structure CMS initialisée.`,
      `${formatDateTime(now)} — Les blocs publics ont été préchargés pour faciliter l'administration.`,
    ],
  };
}

function inputBase(isDark: boolean) {
  return cn(
    "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E2A7B]",
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
  );
}

function AdminCard({ children, className, isDark }: { children: ReactNode; className?: string; isDark: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border shadow-sm",
        isDark ? "border-white/10 bg-[#0E172A]/82 shadow-black/15" : "border-slate-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  action,
  isDark,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  isDark: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className={cn("text-xs font-bold uppercase tracking-[0.28em]", isDark ? "text-slate-400" : "text-[#0E2A7B]")}>Administration</p>
        <h2 className={cn("mt-2 text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{title}</h2>
        <p className={cn("mt-3 max-w-3xl text-sm leading-7", isDark ? "text-slate-400" : "text-slate-600")}>{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function AdminPanel() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return (window.localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode) || "dark";
  });
  const [authReady, setAuthReady] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>("guest");
  const [loginCode, setLoginCode] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [cms, setCms] = useState<CmsState>(createInitialCmsState());
  const [versions, setVersions] = useState<SnapshotEntry[]>([]);
  const [past, setPast] = useState<CmsState[]>([]);
  const [future, setFuture] = useState<CmsState[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState("page-home");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedCollectionKind, setSelectedCollectionKind] = useState<CollectionKind>("formations");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [bulkMediaCategory, setBulkMediaCategory] = useState("album-principal");
  const [bulkCollectionCategory, setBulkCollectionCategory] = useState("collection-premium");
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [changeCodeForm, setChangeCodeForm] = useState({ current: "", next: "", confirm: "" });
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement | null>(null);
  const lastActivityRef = useRef(Date.now());
  const lastSnapshotRef = useRef("");

  const isDark = theme === "dark";
  const isAuthenticated = sessionMode === "active";
  const isLocked = sessionMode === "locked";

  useEffect(() => {
    document.body.style.background = isDark ? "#030712" : "#F8FAFC";
    document.body.style.color = isDark ? "#F8FAFC" : "#0F172A";
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [isDark, theme]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const storedHash = window.localStorage.getItem(STORAGE_KEYS.hash);
      if (!storedHash) {
        window.localStorage.setItem(STORAGE_KEYS.hash, await hashCode(DEFAULT_ADMIN_CODE));
      }

      const initialCms = createInitialCmsState();
      const remoteCms = await fetchRemoteCmsState<Partial<CmsState>>();
      const storedCms = remoteCms ?? safeJsonParse<Partial<CmsState>>(window.localStorage.getItem(STORAGE_KEYS.cms), initialCms);
      const hydratedCms: CmsState = {
        ...initialCms,
        ...storedCms,
        collections: {
          ...initialCms.collections,
          ...(storedCms.collections ?? {}),
        },
      };
      const storedVersions = safeJsonParse<SnapshotEntry[]>(window.localStorage.getItem(STORAGE_KEYS.versions), []);
      const storedSession = (window.localStorage.getItem(STORAGE_KEYS.session) as SessionMode | null) || "guest";
      const storedLastLogin = window.localStorage.getItem(STORAGE_KEYS.lastLogin);

      if (!active) return;

      setCms(hydratedCms);
      setVersions(storedVersions);
      setSessionMode(storedSession === "active" || storedSession === "locked" ? storedSession : "guest");
      setLastLogin(storedLastLogin);
      setLastSavedAt(storedVersions[0]?.savedAt ?? null);
      lastSnapshotRef.current = JSON.stringify(hydratedCms);
      setAuthReady(true);
    };

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cms.pages.some((page) => page.id === selectedPageId)) {
      setSelectedPageId(cms.pages[0]?.id ?? "");
    }
  }, [cms.pages, selectedPageId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_LIMIT_MS) {
        handleLogout("Déconnexion automatique après inactivité.");
      }
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    const snapshot = JSON.stringify(cms);
    if (snapshot === lastSnapshotRef.current) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEYS.cms, snapshot);
      window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
      if (hasSupabaseConfig) {
        void saveRemoteCmsState(cms as unknown as Record<string, unknown>);
      }
      const entry = { id: uid("version"), savedAt: new Date().toISOString(), snapshot };
      setVersions((current) => {
        const next = current[0]?.snapshot === snapshot ? current : [entry, ...current].slice(0, 14);
        window.localStorage.setItem(STORAGE_KEYS.versions, JSON.stringify(next));
        return next;
      });
      lastSnapshotRef.current = snapshot;
      setLastSavedAt(entry.savedAt);
      addToast(hasSupabaseConfig ? "Sauvegarde automatique locale + Supabase effectuée." : "Sauvegarde automatique effectuée.", "info");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [authReady, cms, isAuthenticated]);

  useEffect(() => {
    if (!authReady || !isAuthenticated || !hasSupabaseConfig) return;

    return subscribeToRemoteCms(async () => {
      const remoteCms = await fetchRemoteCmsState<CmsState>();
      if (!remoteCms) return;
      const serialized = JSON.stringify(remoteCms);
      if (serialized === lastSnapshotRef.current) return;
      lastSnapshotRef.current = serialized;
      setCms(remoteCms);
      window.localStorage.setItem(STORAGE_KEYS.cms, serialized);
      window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
      addToast("Mise à jour distante reçue depuis Supabase.", "info");
    });
  }, [authReady, isAuthenticated]);

  const selectedPage = useMemo(
    () => cms.pages.find((page) => page.id === selectedPageId) ?? cms.pages[0],
    [cms.pages, selectedPageId],
  );

  const totalBlocks = useMemo(
    () => cms.pages.reduce((sum, page) => sum + page.blocks.length, 0),
    [cms.pages],
  );

  const mediaStats = useMemo(() => {
    const images = cms.media.filter((item) => item.type === "image");
    const videos = cms.media.filter((item) => item.type === "video");
    const documents = cms.media.filter((item) => item.type === "document");

    return {
      total: cms.media.length,
      images: images.length,
      videos: videos.length,
      documents: documents.length,
      imageSize: images.reduce((sum, item) => sum + item.size, 0),
      videoSize: videos.reduce((sum, item) => sum + item.size, 0),
      documentSize: documents.reduce((sum, item) => sum + item.size, 0),
    };
  }, [cms.media]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    const pageResults = cms.pages
      .filter((page) => `${page.title} ${page.slug} ${page.seoTitle}`.toLowerCase().includes(term))
      .map((page) => ({
        id: page.id,
        label: page.title,
        meta: `Page • ${page.slug}`,
        tab: "pages" as const,
        pageId: page.id,
      }));

    const blockResults = cms.pages.flatMap((page) =>
      page.blocks
        .filter((block) => `${block.title} ${block.content} ${block.type}`.toLowerCase().includes(term))
        .map((block) => ({
          id: block.id,
          label: block.title,
          meta: `Bloc ${block.type} • ${page.title}`,
          tab: "content" as const,
          pageId: page.id,
        })),
    );

    const mediaResults = cms.media
      .filter((item) => `${item.name} ${item.category} ${item.type}`.toLowerCase().includes(term))
      .map((item) => ({
        id: item.id,
        label: item.name,
        meta: `Média • ${item.type}`,
        tab: "media" as const,
      }));

    const collectionResults = (Object.entries(cms.collections) as Array<[CollectionKind, CollectionItem[]]>).flatMap(([kind, items]) =>
      items
        .filter((item) => `${item.title} ${item.summary} ${item.category} ${item.label || ""}`.toLowerCase().includes(term))
        .map((item) => ({
          id: item.id,
          label: item.title,
          meta: `Collection • ${kind}`,
          tab: "collections" as const,
          collectionKind: kind,
        })), 
    );

    const settingsResults = [
      { id: "settings-colors", label: "Couleurs du site", meta: "Paramètres • Design", tab: "settings" as const },
      { id: "settings-seo", label: "SEO global", meta: "Paramètres • SEO", tab: "settings" as const },
      { id: "settings-scripts", label: "Scripts personnalisés", meta: "Paramètres • Scripts", tab: "settings" as const },
    ].filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(term));

    return [...pageResults, ...blockResults, ...mediaResults, ...collectionResults, ...settingsResults].slice(0, 12);
  }, [cms.collections, cms.media, cms.pages, searchQuery]);

  function addToast(message: string, type: ToastType) {
    const id = uid("toast");
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function pushActivity(message: string, draft?: CmsState) {
    const target = draft ?? cloneData(cms);
    target.activity = [`${formatDateTime(new Date().toISOString())} — ${message}`, ...target.activity].slice(0, 16);
    return target;
  }

  function mutateCms(updater: (draft: CmsState) => CmsState, activityMessage?: string, toastType: ToastType = "success") {
    setCms((previous) => {
      const before = cloneData(previous);
      let next = updater(cloneData(previous));
      if (activityMessage) {
        next = pushActivity(activityMessage, next);
      }
      if (JSON.stringify(next) === JSON.stringify(before)) {
        return previous;
      }
      setPast((current) => [...current.slice(-19), before]);
      setFuture([]);
      return next;
    });
    if (activityMessage) addToast(activityMessage, toastType);
  }

  async function verifyCode(code: string) {
    const storedHash = window.localStorage.getItem(STORAGE_KEYS.hash);
    return storedHash === (await hashCode(code));
  }

  async function handleLogin(mode: "login" | "unlock") {
    const code = mode === "login" ? loginCode : unlockCode;
    if (!code.trim()) {
      addToast("Veuillez saisir le code d'accès.", "error");
      return;
    }

    const isValid = await verifyCode(code.trim());
    if (!isValid) {
      addToast("Code d'accès incorrect.", "error");
      return;
    }

    const now = new Date().toISOString();
    if (mode === "login") {
      window.localStorage.setItem(STORAGE_KEYS.lastLogin, now);
      setLastLogin(now);
      setLoginCode("");
      addToast("Connexion réussie.", "success");
    } else {
      setUnlockCode("");
      addToast("Session déverrouillée.", "success");
    }

    lastActivityRef.current = Date.now();
    window.localStorage.setItem(STORAGE_KEYS.session, "active");
    setSessionMode("active");
  }

  function handleLogout(message = "Session déconnectée.") {
    window.localStorage.setItem(STORAGE_KEYS.session, "guest");
    setSessionMode("guest");
    setMobileSidebarOpen(false);
    addToast(message, "info");
  }

  function handleLock() {
    window.localStorage.setItem(STORAGE_KEYS.session, "locked");
    setSessionMode("locked");
    setMobileSidebarOpen(false);
    addToast("Session verrouillée manuellement.", "info");
  }

  function undoChange() {
    setCms((current) => {
      const previous = past[past.length - 1];
      if (!previous) return current;
      setPast((items) => items.slice(0, -1));
      setFuture((items) => [cloneData(current), ...items].slice(0, 20));
      return cloneData(previous);
    });
    addToast("Annulation effectuée.", "info");
  }

  function redoChange() {
    setCms((current) => {
      const next = future[0];
      if (!next) return current;
      setFuture((items) => items.slice(1));
      setPast((items) => [...items.slice(-19), cloneData(current)]);
      return cloneData(next);
    });
    addToast("Rétablissement effectué.", "info");
  }

  async function changeAdminCode() {
    if (!changeCodeForm.current || !changeCodeForm.next || !changeCodeForm.confirm) {
      addToast("Veuillez remplir tous les champs.", "error");
      return;
    }
    if (changeCodeForm.next !== changeCodeForm.confirm) {
      addToast("Le nouveau code et sa confirmation ne correspondent pas.", "error");
      return;
    }
    if (changeCodeForm.next.length < 4) {
      addToast("Le nouveau code doit contenir au moins 4 caractères.", "error");
      return;
    }

    const valid = await verifyCode(changeCodeForm.current);
    if (!valid) {
      addToast("Le code actuel est incorrect.", "error");
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.hash, await hashCode(changeCodeForm.next));
    setChangeCodeForm({ current: "", next: "", confirm: "" });
    addToast("Code administrateur modifié de manière sécurisée.", "success");
  }

  function openSearchResult(result: SearchResult) {
    setActiveTab(result.tab);
    if (result.pageId) setSelectedPageId(result.pageId);
    if (result.collectionKind) setSelectedCollectionKind(result.collectionKind);
    setSearchQuery("");
    setMobileSidebarOpen(false);
  }

  function updateSelectedPage(mutator: (page: CmsPage) => CmsPage, message?: string) {
    if (!selectedPage) return;
    mutateCms(
      (draft) => {
        draft.pages = draft.pages.map((page) => (page.id === selectedPage.id ? mutator(cloneData(page)) : page));
        return draft;
      },
      message,
    );
  }

  function addBlock(type: BlockType) {
    if (!selectedPage) return;
    updateSelectedPage(
      (page) => {
        page.blocks.push({
          id: uid("block"),
          type,
          title: `${type} — nouveau bloc`,
          subtitle: "À personnaliser",
          content: "Bloc créé depuis l'éditeur intelligent. Vous pouvez modifier ce texte, associer un média, masquer, dupliquer ou déplacer ce bloc.",
          visible: true,
          published: false,
          updatedAt: new Date().toISOString(),
        });
        return page;
      },
      `Bloc ${type} ajouté.`,
    );
  }

  function updateBlock(blockId: string, patch: Partial<CmsBlock>) {
    if (!selectedPage) return;
    updateSelectedPage((page) => {
      page.blocks = page.blocks.map((block) =>
        block.id === blockId ? { ...block, ...patch, updatedAt: new Date().toISOString() } : block,
      );
      return page;
    });
  }

  function duplicateBlock(blockId: string) {
    if (!selectedPage) return;
    updateSelectedPage(
      (page) => {
        const index = page.blocks.findIndex((block) => block.id === blockId);
        if (index === -1) return page;
        const copy = cloneData(page.blocks[index]);
        copy.id = uid("block");
        copy.title = `${copy.title} (copie)`;
        copy.updatedAt = new Date().toISOString();
        page.blocks.splice(index + 1, 0, copy);
        return page;
      },
      "Bloc dupliqué.",
    );
  }

  function deleteBlock(blockId: string) {
    if (!selectedPage) return;
    updateSelectedPage(
      (page) => {
        page.blocks = page.blocks.filter((block) => block.id !== blockId);
        return page;
      },
      "Bloc supprimé.",
    );
    setSelectedBlockIds((items) => items.filter((item) => item !== blockId));
  }

  function moveBlock(blockId: string, direction: "up" | "down") {
    if (!selectedPage) return;
    updateSelectedPage(
      (page) => {
        const index = page.blocks.findIndex((block) => block.id === blockId);
        if (index === -1) return page;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= page.blocks.length) return page;
        const [current] = page.blocks.splice(index, 1);
        page.blocks.splice(targetIndex, 0, current);
        return page;
      },
      "Ordre des blocs mis à jour.",
    );
  }

  function reorderBlocks(sourceId: string, targetId: string) {
    if (!selectedPage || sourceId === targetId) return;
    updateSelectedPage(
      (page) => {
        const blocks = [...page.blocks];
        const from = blocks.findIndex((block) => block.id === sourceId);
        const to = blocks.findIndex((block) => block.id === targetId);
        if (from === -1 || to === -1) return page;
        const [item] = blocks.splice(from, 1);
        blocks.splice(to, 0, item);
        page.blocks = blocks;
        return page;
      },
      "Blocs réorganisés par glisser-déposer.",
    );
  }

  function bulkBlockAction(action: "hide" | "show" | "publish" | "unpublish" | "delete") {
    if (!selectedPage || selectedBlockIds.length === 0) return;
    updateSelectedPage(
      (page) => {
        if (action === "delete") {
          page.blocks = page.blocks.filter((block) => !selectedBlockIds.includes(block.id));
          return page;
        }
        page.blocks = page.blocks.map((block) => {
          if (!selectedBlockIds.includes(block.id)) return block;
          return {
            ...block,
            visible: action === "hide" ? false : action === "show" ? true : block.visible,
            published: action === "publish" ? true : action === "unpublish" ? false : block.published,
            updatedAt: new Date().toISOString(),
          };
        });
        return page;
      },
      `Action groupée appliquée à ${selectedBlockIds.length} bloc(s).`,
    );
    if (action === "delete") setSelectedBlockIds([]);
  }

  function addNewPage() {
    if (!newPageTitle.trim()) {
      addToast("Saisissez un titre de page.", "error");
      return;
    }
    const slug = `/${newPageTitle
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

    mutateCms(
      (draft) => {
        const page: CmsPage = {
          id: uid("page"),
          title: newPageTitle.trim(),
          slug,
          published: false,
          seoTitle: `${newPageTitle.trim()} | ${school.shortName}`,
          seoDescription: "Page créée depuis l'espace administrateur.",
          blocks: [
            {
              id: uid("block"),
              type: "Texte",
              title: "Introduction",
              subtitle: "Nouveau contenu",
              content: "Commencez la mise en page en ajoutant, déplaçant et personnalisant des blocs.",
              visible: true,
              published: false,
              updatedAt: new Date().toISOString(),
            },
          ],
        };
        draft.pages.push(page);
        return draft;
      },
      "Nouvelle page créée.",
    );
    setNewPageTitle("");
  }

  function duplicatePage(pageId: string) {
    mutateCms(
      (draft) => {
        const source = draft.pages.find((page) => page.id === pageId);
        if (!source) return draft;
        const copy = cloneData(source);
        copy.id = uid("page");
        copy.title = `${copy.title} (copie)`;
        copy.slug = `${copy.slug}-copie`;
        copy.blocks = copy.blocks.map((block) => ({ ...block, id: uid("block") }));
        draft.pages.push(copy);
        return draft;
      },
      "Page dupliquée.",
    );
  }

  function bulkPageAction(action: "publish" | "unpublish" | "delete") {
    if (selectedPageIds.length === 0) return;
    mutateCms(
      (draft) => {
        if (action === "delete") {
          draft.pages = draft.pages.filter((page) => !selectedPageIds.includes(page.id));
          return draft;
        }
        draft.pages = draft.pages.map((page) =>
          selectedPageIds.includes(page.id) ? { ...page, published: action === "publish" } : page,
        );
        return draft;
      },
      `Action groupée appliquée à ${selectedPageIds.length} page(s).`,
    );
    if (action === "delete") setSelectedPageIds([]);
  }

  function addCollectionItem(kind: CollectionKind) {
    mutateCms(
      (draft) => {
        draft.collections[kind].unshift({
          id: uid(kind),
          title: `Nouvel élément ${kind}`,
          summary: "Élément créé depuis l'espace administrateur. Modifiez le titre, le résumé, la catégorie et le média associé.",
          category: kind,
          published: false,
          hidden: false,
          updatedAt: new Date().toISOString(),
          label: "Nouveau",
        });
        return draft;
      },
      `Élément ajouté dans ${kind}.`,
    );
  }

  function updateCollectionItem(kind: CollectionKind, itemId: string, patch: Partial<CollectionItem>) {
    mutateCms((draft) => {
      draft.collections[kind] = draft.collections[kind].map((item) =>
        item.id === itemId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      );
      return draft;
    }, "Collection mise à jour.");
  }

  function duplicateCollectionItem(kind: CollectionKind, itemId: string) {
    mutateCms(
      (draft) => {
        const source = draft.collections[kind].find((item) => item.id === itemId);
        if (!source) return draft;
        draft.collections[kind].unshift({
          ...cloneData(source),
          id: uid(kind),
          title: `${source.title} (copie)`,
          updatedAt: new Date().toISOString(),
        });
        return draft;
      },
      "Élément de collection dupliqué.",
    );
  }

  function bulkCollectionAction(action: "publish" | "unpublish" | "hide" | "show" | "delete" | "category") {
    if (selectedCollectionIds.length === 0) return;
    mutateCms(
      (draft) => {
        if (action === "delete") {
          draft.collections[selectedCollectionKind] = draft.collections[selectedCollectionKind].filter(
            (item) => !selectedCollectionIds.includes(item.id),
          );
          return draft;
        }
        draft.collections[selectedCollectionKind] = draft.collections[selectedCollectionKind].map((item) => {
          if (!selectedCollectionIds.includes(item.id)) return item;
          return {
            ...item,
            published: action === "publish" ? true : action === "unpublish" ? false : item.published,
            hidden: action === "hide" ? true : action === "show" ? false : item.hidden,
            category: action === "category" ? bulkCollectionCategory : item.category,
            updatedAt: new Date().toISOString(),
          };
        });
        return draft;
      },
      `Action groupée appliquée à ${selectedCollectionIds.length} élément(s).`,
    );
    if (action === "delete") setSelectedCollectionIds([]);
  }

  function triggerInput(ref: React.RefObject<HTMLInputElement | null>) {
    ref.current?.click();
  }

  async function registerUploadedFiles(files: FileList | null, preferredType?: MediaType) {
    if (!files || files.length === 0) return;

    const uploadedEntries = await Promise.all(
      Array.from(files).map(async (file) => {
        const inferredType: MediaType = preferredType
          ? preferredType
          : file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
              ? "video"
              : "document";

        const remoteUpload = hasSupabaseConfig ? await uploadMediaToSupabase(file, inferredType === "document" ? "documents" : inferredType === "video" ? "videos" : "gallery") : null;

        return {
          id: uid("media"),
          name: file.name,
          type: inferredType,
          category: inferredType === "video" ? "videos" : inferredType === "document" ? "documents" : "photos",
          src: remoteUpload?.publicUrl || URL.createObjectURL(file),
          size: remoteUpload?.size || file.size || 1024,
          createdAt: new Date().toISOString(),
          hidden: false,
          featured: false,
          source: "upload" as const,
        };
      }),
    );

    mutateCms(
      (draft) => {
        draft.media.unshift(...uploadedEntries);
        return draft;
      },
      `${files.length} média importé${files.length > 1 ? "s" : ""}${hasSupabaseConfig ? " vers Supabase" : ""}.`,
    );
  }

  async function replaceMedia(mediaId: string, file: File | null) {
    if (!file) return;
    const remoteUpload = hasSupabaseConfig
      ? await uploadMediaToSupabase(
          file,
          file.type.startsWith("video/") ? "videos" : file.type.startsWith("image/") ? "gallery" : "documents",
        )
      : null;

    mutateCms(
      (draft) => {
        draft.media = draft.media.map((item) =>
          item.id === mediaId
            ? {
                ...item,
                name: file.name,
                src: remoteUpload?.publicUrl || URL.createObjectURL(file),
                size: remoteUpload?.size || file.size || item.size,
                createdAt: new Date().toISOString(),
                type: file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document",
              }
            : item,
        );
        return draft;
      },
      `Média remplacé${hasSupabaseConfig ? " dans Supabase" : ""}.`,
    );
  }

  async function uploadAndAttachMedia(kind: CollectionKind, itemId: string, file: File | null, preferredType?: MediaType) {
    if (!file) return;

    const inferredType: MediaType = preferredType
      ? preferredType
      : file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "document";

    const remoteUpload = hasSupabaseConfig
      ? await uploadMediaToSupabase(file, inferredType === "document" ? "documents" : inferredType === "video" ? "videos" : "gallery")
      : null;

    const newMediaId = uid("media");

    mutateCms(
      (draft) => {
        draft.media.unshift({
          id: newMediaId,
          name: file.name,
          type: inferredType,
          category: inferredType === "video" ? "videos" : inferredType === "document" ? "documents" : "photos",
          src: remoteUpload?.publicUrl || URL.createObjectURL(file),
          size: remoteUpload?.size || file.size || 1024,
          createdAt: new Date().toISOString(),
          hidden: false,
          featured: false,
          source: "upload",
        });
        draft.collections[kind] = draft.collections[kind].map((item) =>
          item.id === itemId ? { ...item, mediaId: newMediaId, updatedAt: new Date().toISOString() } : item,
        );
        return draft;
      },
      `Média importé et associé à l'élément${hasSupabaseConfig ? " (Supabase)" : ""}.`,
    );
  }

  async function importMediaIntoCollection(kind: CollectionKind, files: FileList | null, preferredType: MediaType) {
    if (!files || files.length === 0) return;

    const entries = await Promise.all(
      Array.from(files).map(async (file) => {
        const remoteUpload = hasSupabaseConfig
          ? await uploadMediaToSupabase(file, preferredType === "video" ? "videos" : "gallery")
          : null;

        const mediaId = uid("media");
        const mediaEntry: CmsMedia = {
          id: mediaId,
          name: file.name,
          type: preferredType,
          category: kind,
          src: remoteUpload?.publicUrl || URL.createObjectURL(file),
          size: remoteUpload?.size || file.size || 1024,
          createdAt: new Date().toISOString(),
          hidden: false,
          featured: false,
          source: "upload",
        };

        const collectionEntry: CollectionItem = {
          id: uid(kind),
          title: file.name.replace(/\.[^/.]+$/, "") || "Nouvel élément importé",
          summary: "Élément importé directement depuis la galerie ou la caméra de l'appareil.",
          category: kind,
          mediaId,
          published: true,
          hidden: false,
          updatedAt: new Date().toISOString(),
          label: preferredType === "video" ? "Vidéo importée" : "Photo importée",
        };

        return { mediaEntry, collectionEntry };
      }),
    );

    mutateCms(
      (draft) => {
        draft.media.unshift(...entries.map((entry) => entry.mediaEntry));
        draft.collections[kind] = [...entries.map((entry) => entry.collectionEntry), ...draft.collections[kind]];
        return draft;
      },
      `${files.length} ${preferredType === "video" ? "vidéo(s)" : "photo(s)"} importée(s) dans ${kind}${hasSupabaseConfig ? " (Supabase)" : ""}.`,
    );
  }

  function bulkMediaAction(action: "hide" | "show" | "delete" | "feature" | "category") {
    if (selectedMediaIds.length === 0) return;
    mutateCms(
      (draft) => {
        if (action === "delete") {
          draft.media = draft.media.filter((item) => !selectedMediaIds.includes(item.id));
          return draft;
        }
        draft.media = draft.media.map((item) => {
          if (!selectedMediaIds.includes(item.id)) return item;
          return {
            ...item,
            hidden: action === "hide" ? true : action === "show" ? false : item.hidden,
            featured: action === "feature" ? true : item.featured,
            category: action === "category" ? bulkMediaCategory : item.category,
          };
        });
        return draft;
      },
      `Action groupée appliquée à ${selectedMediaIds.length} média(s).`,
    );
    if (action === "delete") setSelectedMediaIds([]);
  }

  function restoreVersion(snapshot: string) {
    const parsed = safeJsonParse<CmsState>(snapshot, cms);
    setPast((current) => [...current.slice(-19), cloneData(cms)]);
    setFuture([]);
    setCms(parsed);
    window.localStorage.setItem(STORAGE_KEYS.cms, JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
    if (hasSupabaseConfig) {
      void saveRemoteCmsState(parsed as unknown as Record<string, unknown>);
    }
    addToast("Version restaurée.", "success");
  }

  const themeStyle = {
    "--admin-primary": cms.settings.primaryColor,
    "--admin-secondary": cms.settings.secondaryColor,
    "--admin-accent": cms.settings.accentColor,
  } as CSSProperties;

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081535] px-6 text-white">
        <div className="text-center">
          <BrandLogo className="mx-auto h-24 w-auto rounded-[28px] bg-white p-3 shadow-2xl" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Chargement de l'administration</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLocked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030712] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#0E2A7B]/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#D3132E]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#F4D84E]/12 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="self-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Administration sécurisée
              </div>
              <h1 className="mt-6 text-balance text-5xl font-bold leading-tight sm:text-6xl">
                Espace administrateur premium prêt pour votre futur CMS.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                Connexion par code sécurisé, autosave, historique, médiathèque, page builder, recherche globale et paramètres du site : l'architecture frontend de l'administration est maintenant en place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12">
                  Revenir au site public
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F4D84E]/30 bg-[#F4D84E]/10 px-5 py-3 text-sm font-semibold text-[#F4D84E]">
                  Code initial : {DEFAULT_ADMIN_CODE}
                </span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="rounded-[34px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                  <BrandLogo className="h-18 w-auto rounded-[22px] bg-white p-2 shadow-lg" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">Accès administrateur</p>
                    <h2 className="mt-2 text-2xl font-bold">{school.shortName}</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/70">Code d'accès</span>
                    <input
                      type="password"
                      value={loginCode}
                      onChange={(event) => setLoginCode(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#F4D84E]"
                      placeholder="Saisir le code administrateur"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleLogin("login")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-[#081535] transition hover:-translate-y-0.5"
                  >
                    <KeyRound className="h-4 w-4" />
                    Se connecter
                  </button>
                  <div className="rounded-[24px] border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/65">
                    Le code est stocké localement sous forme de hachage sécurisé. Cette interface frontend est prête à être reliée à Supabase Auth et à une base de données dans la phase suivante.
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Autosave", icon: History },
                      { label: "Médiathèque", icon: ImageIcon },
                      { label: "Page Builder", icon: LayoutTemplate },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/6 p-4 text-center">
                        <item.icon className="mx-auto h-5 w-5 text-[#F4D84E]" />
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/68">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081535] px-4 py-8 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl rounded-[34px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <BrandLogo className="mx-auto h-24 w-auto rounded-[26px] bg-white p-3 shadow-lg" />
          <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.28em] text-white/60">Session verrouillée</p>
          <h1 className="mt-3 text-center text-3xl font-bold">Déverrouiller l'administration</h1>
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-7 text-white/68">
            Entrez le code d'accès pour reprendre votre session. Dernière connexion : {formatDateTime(lastLogin)}.
          </p>
          <input
            type="password"
            value={unlockCode}
            onChange={(event) => setUnlockCode(event.target.value)}
            placeholder="Code administrateur"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#F4D84E]"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleLogin("unlock")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-[#081535]"
            >
              <Lock className="h-4 w-4" />
              Déverrouiller
            </button>
            <button
              type="button"
              onClick={() => handleLogout("Session verrouillée fermée.")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/8 px-5 py-3.5 text-sm font-semibold text-white"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </motion.div>
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark ? "bg-[#030712] text-white" : "bg-[#F8FAFC] text-slate-900",
      )}
      style={themeStyle}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={cn("absolute left-[-5rem] top-20 h-72 w-72 rounded-full blur-3xl", isDark ? "bg-[#0E2A7B]/30" : "bg-[#0E2A7B]/10")} />
        <div className={cn("absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl", isDark ? "bg-[#D3132E]/15" : "bg-[#D3132E]/10")} />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[300px] shrink-0 border-r p-5 transition-transform duration-300 lg:translate-x-0",
            isDark ? "border-white/10 bg-[#07101F]/92" : "border-slate-200 bg-white/92",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandLogo className="h-14 w-auto rounded-[20px] bg-white p-1.5 shadow-sm" />
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-[0.26em]", isDark ? "text-slate-400" : "text-slate-500")}>Administration</p>
                  <p className="text-sm font-extrabold">{school.shortName}</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={cn("mt-6 rounded-[26px] border p-4 text-sm leading-7", isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
              Session active. Dernière connexion : <span className="font-semibold">{formatDateTime(lastLogin)}</span>
            </div>

            <nav className="mt-6 grid gap-2">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                    activeTab === tab.id
                      ? isDark
                        ? "bg-white text-[#081535]"
                        : "bg-[#0E2A7B] text-white"
                      : isDark
                        ? "text-slate-300 hover:bg-white/6"
                        : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-6">
              <Link
                to="/"
                className={cn(
                  "inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                )}
              >
                Voir le site public
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleLock}
                className={cn(
                  "inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                )}
              >
                Verrouiller la session
                <Lock className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-[300px]">
          <header className={cn("sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl sm:px-6", isDark ? "border-white/10 bg-[#030712]/82" : "border-slate-200 bg-white/85") }>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border lg:hidden",
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
                  )}
                >
                  <LayoutTemplate className="h-5 w-5" />
                </button>
                <div className="relative w-full max-w-xl">
                  <Search className={cn("pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className={cn(inputBase(isDark), "pl-11")}
                    placeholder="Recherche globale : pages, blocs, médias, paramètres..."
                  />
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className={cn(
                          "absolute inset-x-0 top-[calc(100%+0.6rem)] overflow-hidden rounded-[24px] border shadow-2xl",
                          isDark ? "border-white/10 bg-[#0E172A]" : "border-slate-200 bg-white",
                        )}
                      >
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => openSearchResult(result)}
                            className={cn(
                              "flex w-full items-start justify-between gap-4 border-b px-4 py-3 text-left last:border-b-0",
                              isDark ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50",
                            )}
                          >
                            <div>
                              <p className="text-sm font-semibold">{result.label}</p>
                              <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{result.meta}</p>
                            </div>
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("rounded-full px-4 py-2 text-xs font-semibold", isDark ? "bg-white/6 text-slate-300" : "bg-slate-100 text-slate-600")}>
                  Dernière sauvegarde : {formatDateTime(lastSavedAt)}
                </span>
                <button
                  type="button"
                  onClick={undoChange}
                  disabled={past.length === 0}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-40",
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
                  )}
                >
                  <Undo2 className="h-4 w-4" />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={redoChange}
                  disabled={future.length === 0}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-40",
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
                  )}
                >
                  <Redo2 className="h-4 w-4" />
                  Rétablir
                </button>
                <button
                  type="button"
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
                  )}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Mode clair" : "Mode sombre"}
                </button>
                <button
                  type="button"
                  onClick={() => handleLogout()}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-800",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {activeTab === "dashboard" && (
              <DashboardTab
                cms={cms}
                totalBlocks={totalBlocks}
                mediaStats={mediaStats}
                versions={versions}
                restoreVersion={restoreVersion}
                isDark={isDark}
                lastSavedAt={lastSavedAt}
              />
            )}
            {activeTab === "content" && selectedPage && (
              <ContentTab
                cms={cms}
                page={selectedPage}
                selectedPageId={selectedPageId}
                setSelectedPageId={setSelectedPageId}
                selectedBlockIds={selectedBlockIds}
                setSelectedBlockIds={setSelectedBlockIds}
                addBlock={addBlock}
                updateBlock={updateBlock}
                duplicateBlock={duplicateBlock}
                deleteBlock={deleteBlock}
                moveBlock={moveBlock}
                bulkBlockAction={bulkBlockAction}
                isDark={isDark}
                setDraggedBlockId={setDraggedBlockId}
                draggedBlockId={draggedBlockId}
                reorderBlocks={reorderBlocks}
              />
            )}
            {activeTab === "pages" && (
              <PagesTab
                cms={cms}
                isDark={isDark}
                selectedPageId={selectedPageId}
                setSelectedPageId={setSelectedPageId}
                selectedPageIds={selectedPageIds}
                setSelectedPageIds={setSelectedPageIds}
                newPageTitle={newPageTitle}
                setNewPageTitle={setNewPageTitle}
                addNewPage={addNewPage}
                bulkPageAction={bulkPageAction}
                duplicatePage={duplicatePage}
                mutateCms={mutateCms}
              />
            )}
            {activeTab === "collections" && (
              <CollectionsTab
                cms={cms}
                isDark={isDark}
                selectedCollectionKind={selectedCollectionKind}
                setSelectedCollectionKind={setSelectedCollectionKind}
                selectedCollectionIds={selectedCollectionIds}
                setSelectedCollectionIds={setSelectedCollectionIds}
                bulkCollectionCategory={bulkCollectionCategory}
                setBulkCollectionCategory={setBulkCollectionCategory}
                addCollectionItem={addCollectionItem}
                updateCollectionItem={updateCollectionItem}
                duplicateCollectionItem={duplicateCollectionItem}
                bulkCollectionAction={bulkCollectionAction}
                uploadAndAttachMedia={uploadAndAttachMedia}
                importMediaIntoCollection={importMediaIntoCollection}
              />
            )}
            {activeTab === "media" && (
              <MediaTab
                cms={cms}
                isDark={isDark}
                selectedMediaIds={selectedMediaIds}
                setSelectedMediaIds={setSelectedMediaIds}
                bulkMediaCategory={bulkMediaCategory}
                setBulkMediaCategory={setBulkMediaCategory}
                bulkMediaAction={bulkMediaAction}
                triggerInput={triggerInput}
                imageInputRef={imageInputRef}
                videoInputRef={videoInputRef}
                documentInputRef={documentInputRef}
                cameraInputRef={cameraInputRef}
                cameraVideoInputRef={cameraVideoInputRef}
                registerUploadedFiles={registerUploadedFiles}
                replaceMedia={replaceMedia}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                cms={cms}
                isDark={isDark}
                mutateCms={mutateCms}
                lastLogin={lastLogin}
                handleLock={handleLock}
                changeCodeForm={changeCodeForm}
                setChangeCodeForm={setChangeCodeForm}
                changeAdminCode={changeAdminCode}
              />
            )}
            {activeTab === "security" && (
              <SecurityTab
                isDark={isDark}
                lastLogin={lastLogin}
                handleLock={handleLock}
                changeCodeForm={changeCodeForm}
                setChangeCodeForm={setChangeCodeForm}
                changeAdminCode={changeAdminCode}
              />
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => registerUploadedFiles(event.target.files, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(event) => registerUploadedFiles(event.target.files, "video")} />
      <input
        ref={documentInputRef}
        type="file"
        accept=".jpg,.png,.webp,.svg,.gif,.mp4,.mov,.avi,.pdf,.docx,.xlsx,.pptx,.zip"
        multiple
        className="hidden"
        onChange={(event) => registerUploadedFiles(event.target.files)}
      />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => registerUploadedFiles(event.target.files, "image")} />
      <input ref={cameraVideoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(event) => registerUploadedFiles(event.target.files, "video")} />

      <ToastStack toasts={toasts} />
    </div>
  );
}

function DashboardTab({
  cms,
  totalBlocks,
  mediaStats,
  versions,
  restoreVersion,
  isDark,
  lastSavedAt,
}: {
  cms: CmsState;
  totalBlocks: number;
  mediaStats: {
    total: number;
    images: number;
    videos: number;
    documents: number;
    imageSize: number;
    videoSize: number;
    documentSize: number;
  };
  versions: SnapshotEntry[];
  restoreVersion: (snapshot: string) => void;
  isDark: boolean;
  lastSavedAt: string | null;
}) {
  const publishedPages = cms.pages.filter((page) => page.published).length;
  const storageUsed = mediaStats.imageSize + mediaStats.videoSize + mediaStats.documentSize;
  const storageQuota = 5 * 1024 * 1024 * 1024;
  const storageRemaining = Math.max(storageQuota - storageUsed, 0);
  const recentVisitors = [
    { id: "visit-1", label: "Visiteur mobile — Android", detail: "Simulation locale prête pour analytics" },
    { id: "visit-2", label: "Visiteur desktop — Chrome", detail: "Section à connecter plus tard" },
    { id: "visit-3", label: "Visiteur iPhone — Safari", detail: "Aucune donnée réelle sans backend" },
  ];

  return (
    <>
      <SectionHeader
        title="Tableau de bord avancé"
        description="Vue d'ensemble des contenus, des médias, du stockage, des dernières activités et de l'historique des sauvegardes automatiques."
        isDark={isDark}
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pages", value: cms.pages.length.toString(), helper: `${publishedPages} publiées`, icon: LayoutTemplate },
          { label: "Blocs", value: totalBlocks.toString(), helper: "Page Builder actif", icon: Wand2 },
          { label: "Médias", value: mediaStats.total.toString(), helper: `${mediaStats.images} images • ${mediaStats.videos} vidéos`, icon: ImageIcon },
          {
            label: "Sauvegarde",
            value: formatDateTime(lastSavedAt),
            helper: `${versions.length} versions locales`,
            icon: History,
          },
        ].map((item) => (
          <AdminCard key={item.label} isDark={isDark} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-[0.24em]", isDark ? "text-slate-400" : "text-slate-500")}>{item.label}</p>
                <p className={cn("mt-4 text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>{item.value}</p>
                <p className={cn("mt-2 text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{item.helper}</p>
              </div>
              <div className={cn("rounded-2xl p-3", isDark ? "bg-white/6 text-white" : "bg-slate-100 text-slate-700")}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Activité récente"
            description="Derniers contenus publiés, dernières modifications et actions système enregistrées localement."
            isDark={isDark}
          />
          <div className="grid gap-3">
            {cms.activity.slice(0, 8).map((line) => (
              <div key={line} className={cn("rounded-[22px] border p-4 text-sm leading-7", isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700")}>
                {line}
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Stockage estimé"
            description="Répartition du stockage utilisé par les images, les vidéos et les documents."
            isDark={isDark}
          />
          <div className="space-y-4">
            {[
              { label: "Images", value: bytesToSize(mediaStats.imageSize), count: mediaStats.images, color: "bg-[#0E2A7B]" },
              { label: "Vidéos", value: bytesToSize(mediaStats.videoSize), count: mediaStats.videos, color: "bg-[#D3132E]" },
              { label: "Documents", value: bytesToSize(mediaStats.documentSize), count: mediaStats.documents, color: "bg-[#F4D84E]" },
            ].map((item) => (
              <div key={item.label} className={cn("rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{item.count} fichier(s)</p>
                  </div>
                  <p className="text-sm font-bold">{item.value}</p>
                </div>
                <div className={cn("mt-4 h-2 overflow-hidden rounded-full", isDark ? "bg-white/8" : "bg-white")}>
                  <div className={cn("h-full rounded-full", item.color)} style={{ width: `${Math.max(item.count * 12, 18)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Derniers médias importés"
            description="Aperçu rapide des médias disponibles dans la bibliothèque."
            isDark={isDark}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {cms.media.slice(0, 4).map((item) => (
              <div key={item.id} className={cn("overflow-hidden rounded-[24px] border", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50") }>
                <div className="relative h-40 overflow-hidden">
                  {item.type === "document" ? (
                    <div className={cn("flex h-full items-center justify-center", isDark ? "bg-white/6" : "bg-slate-100")}>
                      <FileText className="h-10 w-10" />
                    </div>
                  ) : (
                    <img src={item.poster || item.src} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{item.type} • {item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Historique des versions"
            description="Restaurez facilement un état précédent du CMS grâce aux sauvegardes locales."
            isDark={isDark}
          />
          <div className="space-y-3">
            {versions.length === 0 ? (
              <div className={cn("rounded-[22px] border p-4 text-sm", isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500")}>
                Aucune version enregistrée pour le moment.
              </div>
            ) : (
              versions.slice(0, 6).map((version) => (
                <div key={version.id} className={cn("flex items-center justify-between gap-4 rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                  <div>
                    <p className="text-sm font-semibold">Version locale</p>
                    <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{formatDateTime(version.savedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreVersion(version.snapshot)}
                    className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", isDark ? "bg-white text-[#081535]" : "bg-[#0E2A7B] text-white")}
                  >
                    Restaurer
                  </button>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Stockage restant"
            description="Estimation locale du stockage restant avant connexion à Supabase Storage."
            isDark={isDark}
          />
          <div className={cn("rounded-[24px] border p-5", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Quota cible</p>
                <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Prévisualisation pour le futur espace Supabase Storage</p>
              </div>
              <p className="text-lg font-bold">{bytesToSize(storageRemaining)}</p>
            </div>
            <div className={cn("mt-4 h-3 overflow-hidden rounded-full", isDark ? "bg-white/8" : "bg-white")}>
              <div className="h-full rounded-full bg-[#0E2A7B]" style={{ width: `${Math.max((storageUsed / storageQuota) * 100, 6)}%` }} />
            </div>
            <p className={cn("mt-3 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
              Utilisé : {bytesToSize(storageUsed)} / {bytesToSize(storageQuota)}
            </p>
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Derniers visiteurs"
            description="Zone prévue pour les statistiques visiteurs, en mode simulation tant qu'aucune collecte réelle n'est activée."
            isDark={isDark}
          />
          <div className="space-y-3">
            {recentVisitors.map((visitor) => (
              <div key={visitor.id} className={cn("rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{visitor.label}</p>
                    <p className={cn("mt-1 text-xs leading-6", isDark ? "text-slate-400" : "text-slate-500")}>{visitor.detail}</p>
                  </div>
                  <Globe className={cn("h-4 w-4 shrink-0", isDark ? "text-slate-400" : "text-slate-500")} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
}

function ContentTab({
  cms,
  page,
  selectedPageId,
  setSelectedPageId,
  selectedBlockIds,
  setSelectedBlockIds,
  addBlock,
  updateBlock,
  duplicateBlock,
  deleteBlock,
  moveBlock,
  bulkBlockAction,
  isDark,
  draggedBlockId,
  setDraggedBlockId,
  reorderBlocks,
}: {
  cms: CmsState;
  page: CmsPage;
  selectedPageId: string;
  setSelectedPageId: (value: string) => void;
  selectedBlockIds: string[];
  setSelectedBlockIds: (value: string[]) => void;
  addBlock: (type: BlockType) => void;
  updateBlock: (blockId: string, patch: Partial<CmsBlock>) => void;
  duplicateBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: "up" | "down") => void;
  bulkBlockAction: (action: "hide" | "show" | "publish" | "unpublish" | "delete") => void;
  isDark: boolean;
  draggedBlockId: string | null;
  setDraggedBlockId: (value: string | null) => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
}) {
  return (
    <>
      <SectionHeader
        title="Éditeur de contenu intelligent"
        description="Chaque page est composée de blocs indépendants : ajoutez, dupliquez, réorganisez, masquez et personnalisez les sections sans toucher au code."
        isDark={isDark}
        action={
          <select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)} className={inputBase(isDark)}>
            {cms.pages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        }
      />

      <AdminCard isDark={isDark} className="p-6 sm:p-7">
        <SectionHeader
          title="Ajouter un bloc"
          description="Palette de blocs disponible pour enrichir la page sélectionnée."
          isDark={isDark}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {blockPalette.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className={cn(
                "inline-flex items-center justify-between rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition",
                isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-white",
              )}
            >
              <span>{type}</span>
              <Sparkles className="h-4 w-4" />
            </button>
          ))}
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <AdminCard isDark={isDark} className="p-6 sm:p-7">
            <SectionHeader
              title="Sélection multiple"
              description="Supprimez, masquez, publiez ou dépubliez plusieurs blocs simultanément."
              isDark={isDark}
            />
            <div className="mb-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => bulkBlockAction("hide")} className={actionButton(isDark)}>Masquer</button>
              <button type="button" onClick={() => bulkBlockAction("show")} className={actionButton(isDark)}>Afficher</button>
              <button type="button" onClick={() => bulkBlockAction("publish")} className={actionButton(isDark)}>Publier</button>
              <button type="button" onClick={() => bulkBlockAction("unpublish")} className={actionButton(isDark)}>Dépublier</button>
              <button type="button" onClick={() => bulkBlockAction("delete")} className={dangerButton(isDark)}>Supprimer</button>
            </div>
            <div className="space-y-3">
              {page.blocks.map((block) => {
                const selected = selectedBlockIds.includes(block.id);
                return (
                  <label key={block.id} className={cn("flex items-center gap-3 rounded-[22px] border p-4 text-sm", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) =>
                        setSelectedBlockIds(
                          event.target.checked
                            ? [...selectedBlockIds, block.id]
                            : selectedBlockIds.filter((item) => item !== block.id),
                        )
                      }
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{block.title}</p>
                      <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{block.type}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 p-6 sm:p-7">
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-[0.28em]", isDark ? "text-slate-400" : "text-[#0E2A7B]")}>Aperçu public</p>
                <h3 className={cn("mt-2 text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Prévisualisation en direct</h3>
                <p className={cn("mt-2 text-sm leading-7", isDark ? "text-slate-400" : "text-slate-600")}>Consultez la page publique actuelle sans quitter le CMS.</p>
              </div>
              <a href={getPublicPreviewUrl(page.slug)} target="_blank" rel="noreferrer" className={actionButton(isDark)}>
                <Globe className="h-4 w-4" />
                Ouvrir
              </a>
            </div>
            <div className={cn("border-t p-3", isDark ? "border-white/10" : "border-slate-200")}>
              <iframe title={`Aperçu ${page.title}`} src={getPublicPreviewUrl(page.slug)} className="h-[420px] w-full rounded-[22px] border-0 bg-white" />
            </div>
          </AdminCard>
        </div>

        <div className="space-y-5">
          {page.blocks.map((block) => {
            const linkedMedia = cms.media.find((item) => item.id === block.mediaId);
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDraggedBlockId(block.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedBlockId) reorderBlocks(draggedBlockId, block.id);
                  setDraggedBlockId(null);
                }}
              >
                <AdminCard isDark={isDark} className="p-6 sm:p-7">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className={cn("h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
                      <div>
                        <p className="text-lg font-bold">{block.title}</p>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{block.type} • Mise à jour {formatDateTime(block.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveBlock(block.id, "up")} className={iconButton(isDark)} aria-label="Monter le bloc">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveBlock(block.id, "down")} className={iconButton(isDark)} aria-label="Descendre le bloc">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => duplicateBlock(block.id)} className={iconButton(isDark)} aria-label="Dupliquer le bloc">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => updateBlock(block.id, { visible: !block.visible })} className={iconButton(isDark)} aria-label="Masquer ou afficher le bloc">
                        {block.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => deleteBlock(block.id)} className={dangerIconButton(isDark)} aria-label="Supprimer le bloc">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={fieldLabel(isDark)}>Titre</span>
                      <input value={block.title} onChange={(event) => updateBlock(block.id, { title: event.target.value })} className={inputBase(isDark)} />
                    </label>
                    <label className="block">
                      <span className={fieldLabel(isDark)}>Sous-titre</span>
                      <input value={block.subtitle} onChange={(event) => updateBlock(block.id, { subtitle: event.target.value })} className={inputBase(isDark)} />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={fieldLabel(isDark)}>Type de bloc</span>
                      <select value={block.type} onChange={(event) => updateBlock(block.id, { type: event.target.value as BlockType })} className={inputBase(isDark)}>
                        {blockPalette.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={fieldLabel(isDark)}>Média associé</span>
                      <select value={block.mediaId || ""} onChange={(event) => updateBlock(block.id, { mediaId: event.target.value || undefined })} className={inputBase(isDark)}>
                        <option value="">Aucun média</option>
                        {cms.media.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className={fieldLabel(isDark)}>Contenu</span>
                    <textarea
                      rows={6}
                      value={block.content}
                      onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                      className={cn(inputBase(isDark), "min-h-36 resize-y")}
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className={switchLabel(isDark)}>
                      <input type="checkbox" checked={block.visible} onChange={(event) => updateBlock(block.id, { visible: event.target.checked })} />
                      <span>Visible</span>
                    </label>
                    <label className={switchLabel(isDark)}>
                      <input type="checkbox" checked={block.published} onChange={(event) => updateBlock(block.id, { published: event.target.checked })} />
                      <span>Publié</span>
                    </label>
                    {linkedMedia ? (
                      <span className={cn("rounded-full px-4 py-2 text-xs font-semibold", isDark ? "bg-white/6 text-slate-300" : "bg-slate-100 text-slate-600")}>
                        Média : {linkedMedia.name}
                      </span>
                    ) : null}
                  </div>
                </AdminCard>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function PagesTab({
  cms,
  isDark,
  selectedPageId,
  setSelectedPageId,
  selectedPageIds,
  setSelectedPageIds,
  newPageTitle,
  setNewPageTitle,
  addNewPage,
  bulkPageAction,
  duplicatePage,
  mutateCms,
}: {
  cms: CmsState;
  isDark: boolean;
  selectedPageId: string;
  setSelectedPageId: (value: string) => void;
  selectedPageIds: string[];
  setSelectedPageIds: (value: string[]) => void;
  newPageTitle: string;
  setNewPageTitle: (value: string) => void;
  addNewPage: () => void;
  bulkPageAction: (action: "publish" | "unpublish" | "delete") => void;
  duplicatePage: (pageId: string) => void;
  mutateCms: (updater: (draft: CmsState) => CmsState, activityMessage?: string, toastType?: ToastType) => void;
}) {
  const currentPage = cms.pages.find((page) => page.id === selectedPageId) ?? cms.pages[0];

  return (
    <>
      <SectionHeader
        title="Gestion des pages"
        description="Créez, dupliquez, publiez, dépubliez et optimisez les pages du site public."
        isDark={isDark}
      />
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader
            title="Nouveau contenu"
            description="Ajoutez une nouvelle page et appliquez des actions groupées à vos pages existantes."
            isDark={isDark}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={newPageTitle} onChange={(event) => setNewPageTitle(event.target.value)} placeholder="Titre de la nouvelle page" className={inputBase(isDark)} />
            <button type="button" onClick={addNewPage} className={primaryAction(isDark)}>
              Créer
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => bulkPageAction("publish")} className={actionButton(isDark)}>Publier</button>
            <button type="button" onClick={() => bulkPageAction("unpublish")} className={actionButton(isDark)}>Dépublier</button>
            <button type="button" onClick={() => bulkPageAction("delete")} className={dangerButton(isDark)}>Supprimer</button>
          </div>
          <div className="mt-6 space-y-3">
            {cms.pages.map((page) => (
              <label key={page.id} className={cn("flex items-center gap-3 rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <input
                  type="checkbox"
                  checked={selectedPageIds.includes(page.id)}
                  onChange={(event) =>
                    setSelectedPageIds(
                      event.target.checked
                        ? [...selectedPageIds, page.id]
                        : selectedPageIds.filter((item) => item !== page.id),
                    )
                  }
                />
                <button type="button" onClick={() => setSelectedPageId(page.id)} className="flex-1 text-left">
                  <p className="font-semibold">{page.title}</p>
                  <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{page.slug}</p>
                </button>
                <button type="button" onClick={() => duplicatePage(page.id)} className={iconButton(isDark)}>
                  <Copy className="h-4 w-4" />
                </button>
              </label>
            ))}
          </div>
        </AdminCard>

        {currentPage ? (
          <AdminCard isDark={isDark} className="p-6 sm:p-7">
            <SectionHeader
              title={`Édition : ${currentPage.title}`}
              description="Personnalisez les informations de page, le SEO et l'état de publication."
              isDark={isDark}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={fieldLabel(isDark)}>Titre</span>
                <input
                  value={currentPage.title}
                  onChange={(event) =>
                    mutateCms(
                      (draft) => {
                        draft.pages = draft.pages.map((page) =>
                          page.id === currentPage.id ? { ...page, title: event.target.value } : page,
                        );
                        return draft;
                      },
                      "Titre de page mis à jour.",
                    )
                  }
                  className={inputBase(isDark)}
                />
              </label>
              <label className="block">
                <span className={fieldLabel(isDark)}>Slug</span>
                <input
                  value={currentPage.slug}
                  onChange={(event) =>
                    mutateCms(
                      (draft) => {
                        draft.pages = draft.pages.map((page) =>
                          page.id === currentPage.id ? { ...page, slug: event.target.value } : page,
                        );
                        return draft;
                      },
                      "Slug de page mis à jour.",
                    )
                  }
                  className={inputBase(isDark)}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={fieldLabel(isDark)}>SEO Title</span>
                <input
                  value={currentPage.seoTitle}
                  onChange={(event) =>
                    mutateCms(
                      (draft) => {
                        draft.pages = draft.pages.map((page) =>
                          page.id === currentPage.id ? { ...page, seoTitle: event.target.value } : page,
                        );
                        return draft;
                      },
                      "SEO title mis à jour.",
                    )
                  }
                  className={inputBase(isDark)}
                />
              </label>
              <label className="block">
                <span className={fieldLabel(isDark)}>Publié</span>
                <select
                  value={currentPage.published ? "yes" : "no"}
                  onChange={(event) =>
                    mutateCms(
                      (draft) => {
                        draft.pages = draft.pages.map((page) =>
                          page.id === currentPage.id ? { ...page, published: event.target.value === "yes" } : page,
                        );
                        return draft;
                      },
                      "État de publication modifié.",
                    )
                  }
                  className={inputBase(isDark)}
                >
                  <option value="yes">Publié</option>
                  <option value="no">Dépublié</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className={fieldLabel(isDark)}>SEO Description</span>
              <textarea
                rows={5}
                value={currentPage.seoDescription}
                onChange={(event) =>
                  mutateCms(
                    (draft) => {
                      draft.pages = draft.pages.map((page) =>
                        page.id === currentPage.id ? { ...page, seoDescription: event.target.value } : page,
                      );
                      return draft;
                    },
                    "SEO description mise à jour.",
                  )
                }
                className={cn(inputBase(isDark), "min-h-32 resize-y")}
              />
            </label>
          </AdminCard>
        ) : null}
      </div>
    </>
  );
}

function CollectionsTab({
  cms,
  isDark,
  selectedCollectionKind,
  setSelectedCollectionKind,
  selectedCollectionIds,
  setSelectedCollectionIds,
  bulkCollectionCategory,
  setBulkCollectionCategory,
  addCollectionItem,
  updateCollectionItem,
  duplicateCollectionItem,
  bulkCollectionAction,
  uploadAndAttachMedia,
  importMediaIntoCollection,
}: {
  cms: CmsState;
  isDark: boolean;
  selectedCollectionKind: CollectionKind;
  setSelectedCollectionKind: (value: CollectionKind) => void;
  selectedCollectionIds: string[];
  setSelectedCollectionIds: (value: string[]) => void;
  bulkCollectionCategory: string;
  setBulkCollectionCategory: (value: string) => void;
  addCollectionItem: (kind: CollectionKind) => void;
  updateCollectionItem: (kind: CollectionKind, itemId: string, patch: Partial<CollectionItem>) => void;
  duplicateCollectionItem: (kind: CollectionKind, itemId: string) => void;
  bulkCollectionAction: (action: "publish" | "unpublish" | "hide" | "show" | "delete" | "category") => void;
  uploadAndAttachMedia: (kind: CollectionKind, itemId: string, file: File | null, preferredType?: MediaType) => Promise<void>;
  importMediaIntoCollection: (kind: CollectionKind, files: FileList | null, preferredType: MediaType) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "published" | "hidden">("all");
  const items = cms.collections[selectedCollectionKind] ?? [];
  const filteredItems = items.filter((item) => {
    const matchesQuery = `${item.title} ${item.summary} ${item.category} ${item.label || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ? true : filter === "published" ? item.published : item.hidden;
    return matchesQuery && matchesFilter;
  });
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, filter, selectedCollectionKind]);

  return (
    <>
      <SectionHeader
        title="Collections administrables"
        description="Gérez les formations, actualités, événements, enseignants et documents depuis un espace unique avec recherche, pagination et actions groupées."
        isDark={isDark}
      />
      <AdminCard isDark={isDark} className="p-6 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {([
              ["formations", "Formations"],
              ["actualites", "Actualités"],
              ["evenements", "Événements"],
              ["enseignants", "Enseignants"],
              ["documents", "Documents"],
              ["galerie", "Galerie"],
            ] as Array<[CollectionKind, string]>).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                onClick={() => setSelectedCollectionKind(kind)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  selectedCollectionKind === kind
                    ? isDark
                      ? "bg-white text-[#081535]"
                      : "bg-[#0E2A7B] text-white"
                    : isDark
                      ? "bg-white/5 text-white"
                      : "bg-slate-100 text-slate-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => addCollectionItem(selectedCollectionKind)} className={primaryAction(isDark)}>
            Ajouter un élément
          </button>
        </div>

        <div className={cn("mt-5 rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
          <p className="text-sm font-semibold">Importer directement des photos ou vidéos dans cette collection</p>
          <p className={cn("mt-1 text-xs leading-6", isDark ? "text-slate-400" : "text-slate-500")}>
            Choisis plusieurs fichiers depuis la galerie du téléphone/PC, ou filme/prends une photo directement. Chaque média importé devient automatiquement un élément publié de la collection.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className={actionButton(isDark)}>
              <ImageIcon className="h-4 w-4" />
              Importer des photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => void importMediaIntoCollection(selectedCollectionKind, event.target.files, "image")}
              />
            </label>
            <label className={actionButton(isDark)}>
              <Film className="h-4 w-4" />
              Importer des vidéos
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => void importMediaIntoCollection(selectedCollectionKind, event.target.files, "video")}
              />
            </label>
            <label className={actionButton(isDark)}>
              <Smartphone className="h-4 w-4" />
              Prendre une photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => void importMediaIntoCollection(selectedCollectionKind, event.target.files, "image")}
              />
            </label>
            <label className={actionButton(isDark)}>
              <Video className="h-4 w-4" />
              Filmer une vidéo
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={(event) => void importMediaIntoCollection(selectedCollectionKind, event.target.files, "video")}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans la collection" className={inputBase(isDark)} />
          <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | "published" | "hidden")} className={inputBase(isDark)}>
            <option value="all">Tous les éléments</option>
            <option value="published">Publiés</option>
            <option value="hidden">Masqués</option>
          </select>
          <input value={bulkCollectionCategory} onChange={(event) => setBulkCollectionCategory(event.target.value)} placeholder="Catégorie groupée" className={inputBase(isDark)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => bulkCollectionAction("publish")} className={actionButton(isDark)}>Publier</button>
          <button type="button" onClick={() => bulkCollectionAction("unpublish")} className={actionButton(isDark)}>Dépublier</button>
          <button type="button" onClick={() => bulkCollectionAction("hide")} className={actionButton(isDark)}>Masquer</button>
          <button type="button" onClick={() => bulkCollectionAction("show")} className={actionButton(isDark)}>Afficher</button>
          <button type="button" onClick={() => bulkCollectionAction("category")} className={actionButton(isDark)}>Changer catégorie</button>
          <button type="button" onClick={() => bulkCollectionAction("delete")} className={dangerButton(isDark)}>Supprimer</button>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-5">
        {paginatedItems.map((item) => (
          <AdminCard key={item.id} isDark={isDark} className="p-6 sm:p-7">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <label className="inline-flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={selectedCollectionIds.includes(item.id)}
                  onChange={(event) =>
                    setSelectedCollectionIds(
                      event.target.checked
                        ? [...selectedCollectionIds, item.id]
                        : selectedCollectionIds.filter((entry) => entry !== item.id),
                    )
                  }
                />
                Sélectionner
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => duplicateCollectionItem(selectedCollectionKind, item.id)} className={iconButton(isDark)}>
                  <Copy className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => updateCollectionItem(selectedCollectionKind, item.id, { hidden: !item.hidden })} className={iconButton(isDark)}>
                  {item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel(isDark)}>Titre</span>
                <input value={item.title} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { title: event.target.value })} className={inputBase(isDark)} />
              </label>
              <label>
                <span className={fieldLabel(isDark)}>Label / date</span>
                <input value={item.label || ""} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { label: event.target.value })} className={inputBase(isDark)} />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel(isDark)}>Catégorie</span>
                <input value={item.category} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { category: event.target.value })} className={inputBase(isDark)} />
              </label>
              <label>
                <span className={fieldLabel(isDark)}>Média associé (depuis la médiathèque)</span>
                <select value={item.mediaId || ""} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { mediaId: event.target.value || undefined })} className={inputBase(isDark)}>
                  <option value="">Aucun média</option>
                  {cms.media.map((media) => (
                    <option key={media.id} value={media.id}>{media.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={cn("mt-4 rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Importer un nouveau média pour cet élément</p>
                  <p className={cn("mt-1 text-xs leading-6", isDark ? "text-slate-400" : "text-slate-500")}>
                    Depuis la galerie du téléphone/PC ou directement avec l'appareil photo. Le média sera automatiquement associé à cet élément.
                  </p>
                </div>
                {(() => {
                  const linkedMedia = cms.media.find((media) => media.id === item.mediaId);
                  if (!linkedMedia) return null;
                  return (
                    <div className="flex items-center gap-3">
                      {linkedMedia.type === "document" ? (
                        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", isDark ? "bg-white/8" : "bg-white")}>
                          <FileText className="h-6 w-6" />
                        </div>
                      ) : (
                        <img src={linkedMedia.poster || linkedMedia.src} alt={linkedMedia.name} className="h-14 w-14 rounded-2xl object-cover" />
                      )}
                      <span className={cn("text-xs font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{linkedMedia.name}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className={actionButton(isDark)}>
                  <ImageIcon className="h-4 w-4" />
                  Photo (galerie)
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void uploadAndAttachMedia(selectedCollectionKind, item.id, event.target.files?.[0] ?? null, "image")}
                  />
                </label>
                <label className={actionButton(isDark)}>
                  <Film className="h-4 w-4" />
                  Vidéo (galerie)
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(event) => void uploadAndAttachMedia(selectedCollectionKind, item.id, event.target.files?.[0] ?? null, "video")}
                  />
                </label>
                <label className={actionButton(isDark)}>
                  <Smartphone className="h-4 w-4" />
                  Prendre une photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => void uploadAndAttachMedia(selectedCollectionKind, item.id, event.target.files?.[0] ?? null, "image")}
                  />
                </label>
                <label className={actionButton(isDark)}>
                  <Video className="h-4 w-4" />
                  Filmer une vidéo
                  <input
                    type="file"
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => void uploadAndAttachMedia(selectedCollectionKind, item.id, event.target.files?.[0] ?? null, "video")}
                  />
                </label>
              </div>
              {selectedCollectionKind === "documents" ? (
                <label className={cn(actionButton(isDark), "mt-3 w-full justify-center sm:w-auto")}>
                  <Upload className="h-4 w-4" />
                  Importer un document (PDF, Word, Excel...)
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.pptx,.zip"
                    className="hidden"
                    onChange={(event) => void uploadAndAttachMedia(selectedCollectionKind, item.id, event.target.files?.[0] ?? null, "document")}
                  />
                </label>
              ) : null}
            </div>

            <label className="mt-4 block">
              <span className={fieldLabel(isDark)}>Résumé</span>
              <textarea rows={5} value={item.summary} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { summary: event.target.value })} className={cn(inputBase(isDark), "min-h-28 resize-y")} />
            </label>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className={switchLabel(isDark)}>
                <input type="checkbox" checked={item.published} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { published: event.target.checked })} />
                <span>Publié</span>
              </label>
              <label className={switchLabel(isDark)}>
                <input type="checkbox" checked={item.hidden} onChange={(event) => updateCollectionItem(selectedCollectionKind, item.id, { hidden: event.target.checked })} />
                <span>Masqué</span>
              </label>
              <span className={cn("rounded-full px-4 py-2 text-xs font-semibold", isDark ? "bg-white/6 text-slate-300" : "bg-slate-100 text-slate-600")}>
                Mise à jour : {formatDateTime(item.updatedAt)}
              </span>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>Page {page} / {totalPages} • {filteredItems.length} élément(s)</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page === 1} className={actionButton(isDark)}>Précédent</button>
          <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page === totalPages} className={actionButton(isDark)}>Suivant</button>
        </div>
      </div>
    </>
  );
}

function MediaTab({
  cms,
  isDark,
  selectedMediaIds,
  setSelectedMediaIds,
  bulkMediaCategory,
  setBulkMediaCategory,
  bulkMediaAction,
  triggerInput,
  imageInputRef,
  videoInputRef,
  documentInputRef,
  cameraInputRef,
  cameraVideoInputRef,
  registerUploadedFiles,
  replaceMedia,
}: {
  cms: CmsState;
  isDark: boolean;
  selectedMediaIds: string[];
  setSelectedMediaIds: (value: string[]) => void;
  bulkMediaCategory: string;
  setBulkMediaCategory: (value: string) => void;
  bulkMediaAction: (action: "hide" | "show" | "delete" | "feature" | "category") => void;
  triggerInput: (ref: React.RefObject<HTMLInputElement | null>) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  cameraVideoInputRef: React.RefObject<HTMLInputElement | null>;
  registerUploadedFiles: (files: FileList | null, preferredType?: MediaType) => void;
  replaceMedia: (mediaId: string, file: File | null) => void;
}) {
  return (
    <>
      <SectionHeader
        title="Médiathèque complète"
        description="Choisissez, importez, remplacez, supprimez ou capturez des médias depuis un smartphone ou un ordinateur."
        isDark={isDark}
      />

      <AdminCard isDark={isDark} className="p-6 sm:p-7">
        <SectionHeader
          title="Importer ou capturer"
          description="Compatible images, vidéos, documents et capture directe depuis le téléphone."
          isDark={isDark}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <button type="button" onClick={() => triggerInput(imageInputRef)} className={actionButton(isDark)}>
            <ImageIcon className="h-4 w-4" />
            Importer photos
          </button>
          <button type="button" onClick={() => triggerInput(videoInputRef)} className={actionButton(isDark)}>
            <Film className="h-4 w-4" />
            Importer vidéos
          </button>
          <button type="button" onClick={() => triggerInput(documentInputRef)} className={actionButton(isDark)}>
            <Upload className="h-4 w-4" />
            Importer fichiers
          </button>
          <button type="button" onClick={() => triggerInput(cameraInputRef)} className={actionButton(isDark)}>
            <Smartphone className="h-4 w-4" />
            Photo caméra
          </button>
          <button type="button" onClick={() => triggerInput(cameraVideoInputRef)} className={actionButton(isDark)}>
            <Video className="h-4 w-4" />
            Vidéo caméra
          </button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => bulkMediaAction("hide")} className={actionButton(isDark)}>Masquer</button>
          <button type="button" onClick={() => bulkMediaAction("show")} className={actionButton(isDark)}>Publier</button>
          <button type="button" onClick={() => bulkMediaAction("feature")} className={actionButton(isDark)}>Mettre en avant</button>
          <input value={bulkMediaCategory} onChange={(event) => setBulkMediaCategory(event.target.value)} className={cn(inputBase(isDark), "max-w-[220px]")} placeholder="Catégorie / album" />
          <button type="button" onClick={() => bulkMediaAction("category")} className={actionButton(isDark)}>Changer catégorie</button>
          <button type="button" onClick={() => bulkMediaAction("delete")} className={dangerButton(isDark)}>Supprimer</button>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cms.media.map((item) => (
          <AdminCard key={item.id} isDark={isDark} className="overflow-hidden">
            <div className="relative h-56 overflow-hidden">
              {item.type === "document" ? (
                <div className={cn("flex h-full items-center justify-center", isDark ? "bg-white/6" : "bg-slate-100")}>
                  <FileText className="h-12 w-12" />
                </div>
              ) : (
                <img src={item.poster || item.src} alt={item.name} className="h-full w-full object-cover" />
              )}
              <label className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                <input
                  type="checkbox"
                  checked={selectedMediaIds.includes(item.id)}
                  onChange={(event) =>
                    setSelectedMediaIds(
                      event.target.checked
                        ? [...selectedMediaIds, item.id]
                        : selectedMediaIds.filter((mediaId) => mediaId !== item.id),
                    )
                  }
                />
                Sélectionner
              </label>
              {item.hidden ? <span className="absolute right-4 top-4 rounded-full bg-[#D3132E] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white">Masqué</span> : null}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{item.type} • {item.category} • {bytesToSize(item.size)}</p>
                </div>
                {item.featured ? <span className="rounded-full bg-[#F4D84E]/25 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7A5A00]">Vedette</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className={actionButton(isDark)}>
                  <CloudUpload className="h-4 w-4" />
                  Remplacer
                  <input
                    type="file"
                    accept={item.type === "image" ? "image/*" : item.type === "video" ? "video/*" : ".pdf,.docx,.xlsx,.pptx,.zip"}
                    className="hidden"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => replaceMedia(item.id, event.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => registerUploadedFiles(null)}
                  className={cn("hidden")}
                />
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}

function SettingsTab({
  cms,
  isDark,
  mutateCms,
  lastLogin,
  handleLock,
  changeCodeForm,
  setChangeCodeForm,
  changeAdminCode,
}: {
  cms: CmsState;
  isDark: boolean;
  mutateCms: (updater: (draft: CmsState) => CmsState, activityMessage?: string, toastType?: ToastType) => void;
  lastLogin: string | null;
  handleLock: () => void;
  changeCodeForm: { current: string; next: string; confirm: string };
  setChangeCodeForm: (value: { current: string; next: string; confirm: string }) => void;
  changeAdminCode: () => Promise<void>;
}) {
  const settings = cms.settings;

  function updateSetting<K extends keyof CmsSettings>(key: K, value: CmsSettings[K], message = "Paramètres enregistrés.") {
    mutateCms(
      (draft) => {
        draft.settings[key] = value;
        return draft;
      },
      message,
    );
  }

  return (
    <>
      <SectionHeader
        title="Paramètres du site"
        description="Gérez le logo, le favicon, les couleurs, la typographie, les coordonnées, les réseaux sociaux, le SEO global et les scripts personnalisés."
        isDark={isDark}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="Identité visuelle" description="Logo, favicon, palette et typographies." isDark={isDark} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabel(isDark)}>Logo</span>
              <input value={settings.logo} onChange={(event) => updateSetting("logo", event.target.value, "Logo mis à jour.")} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Favicon</span>
              <input value={settings.favicon} onChange={(event) => updateSetting("favicon", event.target.value, "Favicon mis à jour.")} className={inputBase(isDark)} />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label>
              <span className={fieldLabel(isDark)}>Couleur principale</span>
              <input type="color" value={settings.primaryColor} onChange={(event) => updateSetting("primaryColor", event.target.value, "Couleur principale mise à jour.")} className="h-12 w-full rounded-2xl border border-slate-200 p-1" />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Couleur secondaire</span>
              <input type="color" value={settings.secondaryColor} onChange={(event) => updateSetting("secondaryColor", event.target.value, "Couleur secondaire mise à jour.")} className="h-12 w-full rounded-2xl border border-slate-200 p-1" />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Couleur accent</span>
              <input type="color" value={settings.accentColor} onChange={(event) => updateSetting("accentColor", event.target.value, "Couleur accent mise à jour.")} className="h-12 w-full rounded-2xl border border-slate-200 p-1" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabel(isDark)}>Police titres</span>
              <input value={settings.fontHeading} onChange={(event) => updateSetting("fontHeading", event.target.value)} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Police texte</span>
              <input value={settings.fontBody} onChange={(event) => updateSetting("fontBody", event.target.value)} className={inputBase(isDark)} />
            </label>
          </div>
          <label className={cn("mt-4 inline-flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm", isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-700")}>
            <input type="checkbox" checked={settings.animations} onChange={(event) => updateSetting("animations", event.target.checked, "Préférence d'animation mise à jour.")} />
            <span>Animations activées</span>
          </label>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="Coordonnées & réseaux" description="Informations publiques modifiables sans toucher au code." isDark={isDark} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabel(isDark)}>Adresse</span>
              <input value={settings.address} onChange={(event) => updateSetting("address", event.target.value)} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Email</span>
              <input value={settings.email} onChange={(event) => updateSetting("email", event.target.value)} className={inputBase(isDark)} />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabel(isDark)}>WhatsApp</span>
              <input value={settings.whatsapp} onChange={(event) => updateSetting("whatsapp", event.target.value)} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Google Maps</span>
              <input value={settings.mapsUrl} onChange={(event) => updateSetting("mapsUrl", event.target.value)} className={inputBase(isDark)} />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabel(isDark)}>Facebook</span>
              <input value={settings.facebook} onChange={(event) => updateSetting("facebook", event.target.value)} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>TikTok</span>
              <input value={settings.tiktok} onChange={(event) => updateSetting("tiktok", event.target.value)} className={inputBase(isDark)} />
            </label>
          </div>
          <label className="mt-4 block">
            <span className={fieldLabel(isDark)}>Téléphones (un par ligne)</span>
            <textarea
              rows={5}
              value={settings.phones.join("\n")}
              onChange={(event) => updateSetting("phones", event.target.value.split("\n").filter(Boolean), "Téléphones mis à jour.")}
              className={cn(inputBase(isDark), "min-h-28 resize-y")}
            />
          </label>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="SEO global" description="Titres, descriptions et structure globale du site." isDark={isDark} />
          <div className="grid gap-4">
            <label>
              <span className={fieldLabel(isDark)}>Meta Title global</span>
              <input value={settings.globalSeoTitle} onChange={(event) => updateSetting("globalSeoTitle", event.target.value, "SEO global mis à jour.")} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Meta Description globale</span>
              <textarea rows={5} value={settings.globalSeoDescription} onChange={(event) => updateSetting("globalSeoDescription", event.target.value, "Description SEO globale mise à jour.")} className={cn(inputBase(isDark), "min-h-28 resize-y")} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel(isDark)}>Style du menu</span>
                <input value={settings.menuStyle} onChange={(event) => updateSetting("menuStyle", event.target.value)} className={inputBase(isDark)} />
              </label>
              <label>
                <span className={fieldLabel(isDark)}>Texte footer</span>
                <input value={settings.footerText} onChange={(event) => updateSetting("footerText", event.target.value)} className={inputBase(isDark)} />
              </label>
            </div>
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="Scripts personnalisés" description="Head, body, Analytics et Pixel Meta, prêts pour un branchement dynamique." isDark={isDark} />
          <div className="grid gap-4">
            <label>
              <span className={fieldLabel(isDark)}>Google Analytics</span>
              <input value={settings.analytics} onChange={(event) => updateSetting("analytics", event.target.value)} className={inputBase(isDark)} placeholder="G-XXXXXXXXXX" />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Pixel Meta</span>
              <input value={settings.metaPixel} onChange={(event) => updateSetting("metaPixel", event.target.value)} className={inputBase(isDark)} placeholder="Pixel ID" />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Scripts &lt;head&gt;</span>
              <textarea rows={5} value={settings.headScripts} onChange={(event) => updateSetting("headScripts", event.target.value)} className={cn(inputBase(isDark), "min-h-28 resize-y")} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Scripts &lt;body&gt;</span>
              <textarea rows={5} value={settings.bodyScripts} onChange={(event) => updateSetting("bodyScripts", event.target.value)} className={cn(inputBase(isDark), "min-h-28 resize-y")} />
            </label>
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7 xl:col-span-2">
          <SectionHeader
            title="Sécurité de l'administrateur"
            description="Changez le code d'accès directement depuis les paramètres, verrouillez la session et consultez la dernière connexion."
            isDark={isDark}
          />
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className={cn("rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <p className="text-sm font-semibold">Dernière connexion</p>
                <p className={cn("mt-2 text-sm leading-7", isDark ? "text-slate-300" : "text-slate-600")}>{formatDateTime(lastLogin)}</p>
              </div>
              <button type="button" onClick={handleLock} className={primaryAction(isDark)}>
                <Lock className="h-4 w-4" />
                Verrouiller la session
              </button>
            </div>
            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className={fieldLabel(isDark)}>Code actuel</span>
                  <input type="password" value={changeCodeForm.current} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, current: event.target.value })} className={inputBase(isDark)} />
                </label>
                <label>
                  <span className={fieldLabel(isDark)}>Nouveau code</span>
                  <input type="password" value={changeCodeForm.next} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, next: event.target.value })} className={inputBase(isDark)} />
                </label>
                <label>
                  <span className={fieldLabel(isDark)}>Confirmation</span>
                  <input type="password" value={changeCodeForm.confirm} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, confirm: event.target.value })} className={inputBase(isDark)} />
                </label>
              </div>
              <button type="button" onClick={() => void changeAdminCode()} className={cn(primaryAction(isDark), "mt-5")}>
                <KeyRound className="h-4 w-4" />
                Enregistrer le nouveau code
              </button>
              <div className={cn("mt-5 rounded-[22px] border p-4 text-sm leading-7", isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600")}>
                Le code est stocké sous forme de hachage sécurisé (SHA-256), jamais en clair.
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </>
  );
}

function SecurityTab({
  isDark,
  lastLogin,
  handleLock,
  changeCodeForm,
  setChangeCodeForm,
  changeAdminCode,
}: {
  isDark: boolean;
  lastLogin: string | null;
  handleLock: () => void;
  changeCodeForm: { current: string; next: string; confirm: string };
  setChangeCodeForm: (value: { current: string; next: string; confirm: string }) => void;
  changeAdminCode: () => Promise<void>;
}) {
  return (
    <>
      <SectionHeader
        title="Sécurité & authentification"
        description="Changez le code d'accès, verrouillez la session et consultez les informations de sécurité locales."
        isDark={isDark}
      />
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="État de la session" description="Informations principales de sécurité." isDark={isDark} />
          <div className="space-y-4">
            <div className={cn("rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50") }>
              <p className="text-sm font-semibold">Dernière connexion</p>
              <p className={cn("mt-2 text-sm leading-7", isDark ? "text-slate-300" : "text-slate-600")}>{formatDateTime(lastLogin)}</p>
            </div>
            <div className={cn("rounded-[22px] border p-4", isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50") }>
              <p className="text-sm font-semibold">Politique d'inactivité</p>
              <p className={cn("mt-2 text-sm leading-7", isDark ? "text-slate-300" : "text-slate-600")}>Déconnexion automatique après {Math.round(INACTIVITY_LIMIT_MS / 60000)} minutes d'inactivité.</p>
            </div>
            <button type="button" onClick={handleLock} className={primaryAction(isDark)}>
              <Lock className="h-4 w-4" />
              Verrouiller la session
            </button>
          </div>
        </AdminCard>

        <AdminCard isDark={isDark} className="p-6 sm:p-7">
          <SectionHeader title="Changer le code d'accès" description="Le code est conservé localement sous forme de hachage SHA-256." isDark={isDark} />
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className={fieldLabel(isDark)}>Code actuel</span>
              <input type="password" value={changeCodeForm.current} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, current: event.target.value })} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Nouveau code</span>
              <input type="password" value={changeCodeForm.next} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, next: event.target.value })} className={inputBase(isDark)} />
            </label>
            <label>
              <span className={fieldLabel(isDark)}>Confirmation</span>
              <input type="password" value={changeCodeForm.confirm} onChange={(event) => setChangeCodeForm({ ...changeCodeForm, confirm: event.target.value })} className={inputBase(isDark)} />
            </label>
          </div>
          <button type="button" onClick={() => void changeAdminCode()} className={cn(primaryAction(isDark), "mt-5")}>
            <KeyRound className="h-4 w-4" />
            Enregistrer le nouveau code
          </button>
          <div className={cn("mt-6 rounded-[24px] border p-4 text-sm leading-7", isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600") }>
            Cette version frontend prépare l'architecture de sécurité demandée : code modifiable, verrouillage manuel, historique de connexion et stockage non lisible en clair. La connexion serveur et Supabase pourront être ajoutées sans refonte visuelle.
          </div>
        </AdminCard>
      </div>
    </>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl",
              toast.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              toast.type === "error" && "border-rose-200 bg-rose-50 text-rose-800",
              toast.type === "info" && "border-slate-200 bg-white text-slate-700",
            )}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function actionButton(isDark: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
    isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
  );
}

function dangerButton(isDark: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
    isDark ? "bg-[#D3132E] text-white hover:bg-[#BC1028]" : "bg-[#D3132E] text-white hover:bg-[#BC1028]",
  );
}

function primaryAction(isDark: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
    isDark ? "bg-white text-[#081535] hover:-translate-y-0.5" : "bg-[#0E2A7B] text-white hover:-translate-y-0.5",
  );
}

function iconButton(isDark: boolean) {
  return cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
    isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  );
}

function dangerIconButton(isDark: boolean) {
  return cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
    isDark ? "bg-[#D3132E] text-white hover:bg-[#BC1028]" : "bg-[#D3132E] text-white hover:bg-[#BC1028]",
  );
}

function fieldLabel(isDark: boolean) {
  return cn("mb-2 block text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700");
}

function switchLabel(isDark: boolean) {
  return cn(
    "inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium",
    isDark ? "bg-white/6 text-slate-300" : "bg-slate-100 text-slate-700",
  );
}
