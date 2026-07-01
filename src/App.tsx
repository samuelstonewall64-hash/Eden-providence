import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BadgeInfo,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Compass,
  FileDown,
  GraduationCap,
  Mail,
  MapPinned,
  Menu,
  MessageCircle,
  Phone,
  PlayCircle,
  Printer,
  Quote,
  School,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  X,
} from "lucide-react";
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { cn } from "./utils/cn";
import AdminPanel from "./AdminPanel";
import { BrandLogo } from "./BrandLogo";
import { getPublishedCollection, getRuntimeMedia, useRuntimeCms } from "./runtimeCms";
import {
  eventItems,
  formations,
  galleryItems,
  legalHighlights,
  mediaLibrary,
  navigation,
  newsItems,
  objectives,
  pricingTables,
  quickHighlights,
  school,
  stats,
  values,
  type GalleryItem,
} from "./siteData";

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Groupe Scolaire Eden Providence | L'apprentissage commence ici",
    description:
      "Découvrez le site officiel du Groupe Scolaire Eden Providence : mission, formations, tarifs, galerie, actualités, événements et contact.",
  },
  "/presentation": {
    title: "Présentation | Groupe Scolaire Eden Providence",
    description:
      "Mission, valeurs, objectifs, vision et présentation institutionnelle du Groupe Scolaire Eden Providence.",
  },
  "/formations": {
    title: "Nos formations | Groupe Scolaire Eden Providence",
    description:
      "Crèche, garderie, maternelle et primaire : découvrez les parcours proposés par le Groupe Scolaire Eden Providence.",
  },
  "/tarifs": {
    title: "Tarifs | Groupe Scolaire Eden Providence",
    description:
      "Consultez la page tarifs du Groupe Scolaire Eden Providence. Les tableaux HTML premium sont prêts à recevoir les données officielles.",
  },
  "/galerie": {
    title: "Galerie | Groupe Scolaire Eden Providence",
    description:
      "Explorez une galerie moderne avec photos et vidéos d'ambiance en attendant les médias officiels de l'école.",
  },
  "/actualites": {
    title: "Actualités | Groupe Scolaire Eden Providence",
    description:
      "Suivez les actualités et les informations familles du Groupe Scolaire Eden Providence.",
  },
  "/eden-event": {
    title: "Eden Event | Groupe Scolaire Eden Providence",
    description:
      "Découvrez l'espace événementiel premium du Groupe Scolaire Eden Providence, prêt pour affiches, calendriers et médias.",
  },
  "/contact": {
    title: "Contact | Groupe Scolaire Eden Providence",
    description:
      "Adresse, téléphones, WhatsApp, email, Google Maps et formulaire de contact du Groupe Scolaire Eden Providence.",
  },
  "/mentions-legales": {
    title: "Mentions légales | Groupe Scolaire Eden Providence",
    description: "Mentions légales du site public du Groupe Scolaire Eden Providence.",
  },
  "/politique-de-confidentialite": {
    title: "Politique de confidentialité | Groupe Scolaire Eden Providence",
    description: "Politique de confidentialité du site public du Groupe Scolaire Eden Providence.",
  },
  "/admin": {
    title: "Administration | Groupe Scolaire Eden Providence",
    description:
      "Espace administrateur premium du Groupe Scolaire Eden Providence : contenus, médias, paramètres, sécurité et autosave.",
  },
  "*": {
    title: "Page introuvable | Groupe Scolaire Eden Providence",
    description: "La page demandée est introuvable. Revenez à l'accueil du Groupe Scolaire Eden Providence.",
  },
};

const primaryButtonClass =
  "button-focus inline-flex items-center justify-center gap-2 rounded-full bg-[#0E2A7B] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0E2A7B]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0B2365]";
const secondaryButtonClass =
  "button-focus inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/12 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/20";
const lightButtonClass =
  "button-focus inline-flex items-center justify-center gap-2 rounded-full border border-[#0E2A7B]/12 bg-white px-5 py-3 text-sm font-semibold text-[#0E2A7B] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#0E2A7B]/25 hover:shadow-lg";

function sanitizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

function App() {
  return (
    <HashRouter>
      <SiteApp />
    </HashRouter>
  );
}

function SiteApp() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className={cn("relative min-h-screen overflow-x-clip text-slate-900", isAdminRoute && "bg-[#030712] text-white")}>
      <SeoSync />
      {!isAdminRoute && <BackgroundDecor />}
      <LoaderOverlay visible={loading} />
      {!isAdminRoute && <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      <AnimatedRoutes />
      {!isAdminRoute && <WhatsAppFloatingButton />}
    </div>
  );
}

function SeoSync() {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta[location.pathname] ?? routeMeta["*"];
    document.title = meta.title;

    const description = document.getElementById("meta-description") as HTMLMetaElement | null;
    const ogTitle = document.getElementById("og-title") as HTMLMetaElement | null;
    const ogDescription = document.getElementById("og-description") as HTMLMetaElement | null;
    const twitterTitle = document.getElementById("twitter-title") as HTMLMetaElement | null;
    const twitterDescription = document.getElementById("twitter-description") as HTMLMetaElement | null;

    if (description) description.content = meta.description;
    if (ogTitle) ogTitle.content = meta.title;
    if (ogDescription) ogDescription.content = meta.description;
    if (twitterTitle) twitterTitle.content = meta.title;
    if (twitterDescription) twitterDescription.content = meta.description;
  }, [location.pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageLayout>
              <HomePage />
            </PageLayout>
          }
        />
        <Route
          path="/presentation"
          element={
            <PageLayout>
              <PresentationPage />
            </PageLayout>
          }
        />
        <Route
          path="/formations"
          element={
            <PageLayout>
              <FormationsPage />
            </PageLayout>
          }
        />
        <Route
          path="/tarifs"
          element={
            <PageLayout>
              <TarifsPage />
            </PageLayout>
          }
        />
        <Route
          path="/galerie"
          element={
            <PageLayout>
              <GalleryPage />
            </PageLayout>
          }
        />
        <Route
          path="/actualites"
          element={
            <PageLayout>
              <ActualitesPage />
            </PageLayout>
          }
        />
        <Route
          path="/eden-event"
          element={
            <PageLayout>
              <EdenEventPage />
            </PageLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PageLayout>
              <ContactPage />
            </PageLayout>
          }
        />
        <Route
          path="/mentions-legales"
          element={
            <PageLayout>
              <LegalPage />
            </PageLayout>
          }
        />
        <Route
          path="/politique-de-confidentialite"
          element={
            <PageLayout>
              <PrivacyPage />
            </PageLayout>
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="*"
          element={
            <PageLayout>
              <NotFoundPage />
            </PageLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function PageLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <main className="pt-20 sm:pt-24">{children}</main>
      <Footer />
    </motion.div>
  );
}

function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="section-shell pt-4">
          <div className="glass-panel eden-border flex items-center justify-between rounded-[28px] px-4 py-3 sm:px-5 lg:px-6">
            <Link to="/" className="button-focus flex items-center gap-3 rounded-2xl">
              <BrandLogo className="h-12 w-auto rounded-2xl bg-white/80 p-1.5 shadow-sm sm:h-14" />
              <div className="hidden sm:block">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#0E2A7B]/60">Groupe scolaire</p>
                <p className="text-sm font-extrabold text-[#081535] sm:text-base">EDEN PROVIDENCE</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "button-focus rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/65 hover:text-[#0E2A7B]",
                      isActive && "bg-white text-[#0E2A7B] shadow-sm",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/admin" className="hidden lg:inline-flex">
                <span className={cn(lightButtonClass, "border-[#0E2A7B]/18 bg-[#0E2A7B] text-white hover:bg-[#0B2365]")}>
                  Admin
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <a href={school.whatsappLink} target="_blank" rel="noreferrer" className="hidden lg:inline-flex">
                <span className={lightButtonClass}>
                  WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="button-focus inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#0E2A7B]/12 bg-white text-[#0E2A7B] shadow-sm transition hover:shadow-md lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-[#081535]/55 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
              className="section-shell pt-24"
            >
              <div className="glass-panel rounded-[32px] px-5 py-5 shadow-premium">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200/70 pb-5">
                  <BrandLogo className="h-14 w-auto rounded-2xl bg-white/80 p-1.5 shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E2A7B]/60">Navigation</p>
                    <p className="text-base font-bold text-[#081535]">{school.shortName}</p>
                  </div>
                </div>
                <nav className="grid gap-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "button-focus flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#0E2A7B]/20 hover:text-[#0E2A7B]",
                          isActive && "border-[#0E2A7B]/20 text-[#0E2A7B] shadow-sm",
                        )
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link to="/admin" className={cn(lightButtonClass, "w-full justify-center bg-[#0E2A7B] text-white hover:bg-[#0B2365]")}>
                    Admin
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={school.whatsappLink} target="_blank" rel="noreferrer" className={cn(lightButtonClass, "w-full justify-center")}>
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <Link to="/contact" className={cn(primaryButtonClass, "w-full justify-center sm:col-span-2")}>
                    Nous contacter
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid-soft opacity-35" />
      <div className="animate-floaty absolute left-[-6rem] top-[8rem] h-64 w-64 rounded-full bg-[#0E2A7B]/10 blur-3xl" />
      <div className="animate-floaty-delay absolute right-[-4rem] top-[14rem] h-72 w-72 rounded-full bg-[#D3132E]/10 blur-3xl" />
      <div className="animate-pulse-soft absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-[#F4D84E]/18 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white/80 to-transparent" />
    </div>
  );
}

function LoaderOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#081535]"
        >
          <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
            <div className="absolute h-44 w-44 rounded-full bg-[#F4D84E]/15 blur-3xl" />
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <BrandLogo className="h-28 w-auto rounded-[28px] bg-white/95 p-3 shadow-2xl shadow-black/20 sm:h-32" />
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55 }}
                className="font-display text-3xl font-semibold text-white sm:text-4xl"
              >
                Eden Providence
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.55 }}
                className="mt-2 text-sm font-medium tracking-[0.3em] text-white/70 uppercase"
              >
                L'apprentissage commence ici
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 180 }}
              transition={{ delay: 0.36, duration: 0.85 }}
              className="h-1.5 overflow-hidden rounded-full bg-white/14"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.4, ease: "easeInOut" }}
                className="h-full w-24 rounded-full bg-gradient-to-r from-[#F4D84E] via-white to-[#D3132E]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,21,53,0.82),rgba(8,21,53,0.55),rgba(14,42,123,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,216,78,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(211,19,46,0.22),transparent_24%)]" />
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0E2A7B]/12 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#0E2A7B] shadow-sm">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h2 className="font-display text-4xl font-semibold leading-tight text-[#081535] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-balance text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
    </div>
  );
}

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let animationFrame = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCurrentValue(Math.round(progress * value));
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {currentValue}
      {suffix}
    </span>
  );
}

function HomePage() {
  const runtimeCms = useRuntimeCms();
  const runtimeFormations = getPublishedCollection(runtimeCms?.collections, "formations");
  const runtimeNews = getPublishedCollection(runtimeCms?.collections, "actualites");
  const runtimeEvents = getPublishedCollection(runtimeCms?.collections, "evenements");

  return (
    <>
      <section className="section-shell pt-6 sm:pt-8">
        <div className="noise-overlay relative min-h-[88svh] overflow-hidden rounded-[36px] px-6 py-14 shadow-premium sm:px-8 sm:py-16 lg:min-h-[92svh] lg:px-12 lg:py-20">
          <HeroVideo src={mediaLibrary.heroVideo.src} poster={mediaLibrary.heroVideo.poster} />
          <div className="relative z-10 flex min-h-[76svh] flex-col justify-between gap-12 lg:min-h-[78svh]">
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] backdrop-blur-sm">
                Site public premium
              </span>
              <span className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm">
                Médias d'ambiance temporaires remplaçables plus tard
              </span>
            </div>

            <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.7 }}
                  className="mb-6 inline-flex items-center gap-4 rounded-[28px] border border-white/18 bg-white/10 p-3 pr-5 backdrop-blur-md"
                >
                  <BrandLogo className="h-16 w-auto rounded-2xl bg-white/95 p-1.5 shadow-sm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Établissement</p>
                    <p className="text-base font-extrabold text-white sm:text-lg">{school.name}</p>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.8 }}
                  className="text-balance font-display text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl"
                >
                  Une expérience scolaire chaleureuse, immersive et résolument moderne.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.8 }}
                  className="mt-6 max-w-2xl text-balance text-base leading-8 text-white/82 sm:text-lg"
                >
                  {school.slogan}. {school.mission}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.7 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <Link to="/presentation" className={primaryButtonClass}>
                    Découvrir l'école
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/contact" className={secondaryButtonClass}>
                    Nous contacter
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.8 }}
                className="glass-panel-dark rounded-[32px] p-6 text-white shadow-2xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Repères essentiels</p>
                <div className="mt-6 space-y-5">
                  <div className="flex gap-4">
                    <div className="mt-1 rounded-2xl bg-white/12 p-3">
                      <MapPinned className="h-5 w-5 text-[#F4D84E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/70">Adresse</p>
                      <p className="mt-1 text-sm leading-7 text-white/90">{school.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 rounded-2xl bg-white/12 p-3">
                      <GraduationCap className="h-5 w-5 text-[#F4D84E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/70">Parcours proposés</p>
                      <p className="mt-1 text-sm leading-7 text-white/90">Crèche, garderie, maternelle et primaire.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 rounded-2xl bg-white/12 p-3">
                      <MessageCircle className="h-5 w-5 text-[#F4D84E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/70">Contact rapide</p>
                      <p className="mt-1 text-sm leading-7 text-white/90">WhatsApp officiel disponible pour vos demandes d'information.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="section-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="glass-panel gradient-border rounded-[32px] p-7 sm:p-10">
              <SectionTitle
                eyebrow="Présentation rapide"
                title="Une école pensée pour accompagner, rassurer et faire grandir."
                description="Le Groupe Scolaire Eden Providence place l'enfant au centre de son projet éducatif et construit un cadre propice à la réussite, à la confiance et à l'épanouissement."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {quickHighlights.map((item) => (
                  <motion.article
                    key={item.title}
                    whileHover={{ y: -6 }}
                    className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm transition"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E2A7B]/8 text-[#0E2A7B]">
                      <Star className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#081535]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6">
              <div className="glass-panel rounded-[32px] p-7 sm:p-8">
                <div className="mb-4 inline-flex rounded-full bg-[#D3132E]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#D3132E]">
                  Mission
                </div>
                <p className="text-base leading-8 text-slate-700">{school.mission}</p>
              </div>

              <div className="overflow-hidden rounded-[32px] bg-[#081535] shadow-premium">
                <div className="relative h-72 sm:h-80">
                  <HeroVideo src={mediaLibrary.scienceVideo.src} poster={mediaLibrary.scienceVideo.poster} />
                  <div className="relative z-10 flex h-full flex-col justify-end p-7 text-white sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Vision du parcours</p>
                    <h3 className="mt-3 font-display text-3xl font-semibold">Une progression continue de la petite enfance au primaire.</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                      Le site est structuré pour accueillir plus tard les contenus officiels détaillés, sans refonte de l'expérience visuelle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell">
          <Reveal className="mb-10">
            <SectionTitle
              eyebrow="Pourquoi choisir Eden Providence"
              title="Des repères clairs pour inspirer confiance aux familles."
              description="Une identité éducative chaleureuse, une structure lisible et une expérience digitale haut de gamme conçue pour valoriser l'établissement et faciliter la prise de contact."
              align="center"
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: School,
                title: "Cadre accueillant",
                text: "Une atmosphère pensée pour mettre les familles en confiance dès la première visite.",
              },
              {
                icon: ShieldCheck,
                title: "Accompagnement bienveillant",
                text: "Un suivi attentif pour aider chaque enfant à apprendre et à s'épanouir sereinement.",
              },
              {
                icon: Target,
                title: "Objectifs éducatifs clairs",
                text: "Des bases solides pour progresser avec méthode, confiance et régularité.",
              },
              {
                icon: Users,
                title: "Lien école-famille",
                text: "Des canaux de contact directs pour fluidifier l'information et les échanges.",
              },
            ].map((item) => (
              <Reveal key={item.title}>
                <motion.article whileHover={{ y: -8 }} className="glass-panel rounded-[30px] p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#0E2A7B] text-white shadow-lg shadow-[#0E2A7B]/15">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#081535]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Nos formations"
              title="Un parcours éducatif progressif, dès les premiers pas."
              description="Le Groupe Scolaire Eden Providence propose quatre niveaux d'accompagnement pour répondre aux besoins de l'enfant selon son âge et son étape d'apprentissage."
            />
            <Link to="/formations" className={lightButtonClass}>
              Voir toutes les formations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {(runtimeFormations.length > 0
              ? runtimeFormations.slice(0, 4).map((item) => ({
                  title: item.title,
                  description: item.summary,
                  image:
                    getRuntimeMedia(runtimeCms?.media, item.mediaId)?.poster ||
                    getRuntimeMedia(runtimeCms?.media, item.mediaId)?.src ||
                    formations[0]?.image,
                  alt: `Média associé à ${item.title}`,
                  objectives: [item.category, item.label || "Contenu administrable", "Média hérité de la galerie si disponible"],
                }))
              : formations
            ).map((formation) => (
              <Reveal key={formation.title}>
                <motion.article
                  whileHover={{ y: -8 }}
                  className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-premium"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img src={formation.image} alt={formation.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B] backdrop-blur-sm">
                      {runtimeFormations.length > 0 ? "Depuis l'admin" : "Visuel temporaire"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4D84E]/30 text-[#0E2A7B]">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#081535]">{formation.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{formation.description}</p>
                    <ul className="mt-5 space-y-3 text-sm text-slate-700">
                      {formation.objectives.map((objective) => (
                        <li key={objective} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D3132E]" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/formations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0E2A7B] transition hover:gap-3">
                      En savoir plus
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] px-6 py-14 shadow-premium sm:px-10 sm:py-16">
              <HeroVideo src={mediaLibrary.scienceVideo.src} poster={mediaLibrary.scienceVideo.poster} />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div className="text-white">
                  <p className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] backdrop-blur-sm">
                    Chiffres clés
                  </p>
                  <h2 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">Une école connectée à l'essentiel.</h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-white/80">
                    Des repères simples, lisibles et immédiatement utiles pour aider les parents à découvrir rapidement l'établissement et ses points de contact.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {stats.map((item) => (
                    <div key={item.label} className="glass-panel-dark rounded-[28px] p-5 text-white">
                      <p className="text-4xl font-extrabold text-white sm:text-5xl">
                        <AnimatedCounter value={item.value} suffix={item.suffix} />
                      </p>
                      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#F4D84E]">{item.label}</p>
                      <p className="mt-3 text-sm leading-7 text-white/75">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Galerie d'aperçu"
              title="Une galerie moderne prête à accueillir les médias officiels."
              description="Les visuels actuellement affichés sont des illustrations temporaires d'ambiance. La structure est prête pour l'intégration des photos et vidéos réelles de l'école."
            />
            <Link to="/galerie" className={lightButtonClass}>
              Ouvrir la galerie
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {galleryItems.slice(0, 4).map((item) => (
              <Reveal key={item.id}>
                <article className="overflow-hidden rounded-[30px] border border-white/60 bg-white shadow-premium">
                  <div className="relative h-72">
                    <img src={item.type === "video" ? item.poster : item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/88 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B] backdrop-blur-sm">
                        {item.type === "video" ? "Vidéo" : "Photo"}
                      </span>
                      {item.type === "video" && (
                        <span className="rounded-full bg-[#081535]/72 p-2 text-white backdrop-blur-sm">
                          <PlayCircle className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#081535]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell grid gap-8 xl:grid-cols-2">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0E2A7B]">Actualités</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-[#081535]">Informations récentes</h3>
                </div>
                <Link to="/actualites" className="text-sm font-semibold text-[#0E2A7B]">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-5">
                {(runtimeNews.length > 0
                  ? runtimeNews.slice(0, 3).map((item) => ({
                      title: item.title,
                      summary: item.summary,
                      badge: item.label || "Depuis l'admin",
                      image:
                        getRuntimeMedia(runtimeCms?.media, item.mediaId)?.poster ||
                        getRuntimeMedia(runtimeCms?.media, item.mediaId)?.src ||
                        newsItems[0]?.image,
                      alt: `Média associé à ${item.title}`,
                    }))
                  : newsItems.slice(0, 3)
                ).map((item) => (
                  <article key={item.title} className="flex gap-4 rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-sm">
                    <img src={item.image} alt={item.alt} loading="lazy" className="h-24 w-24 rounded-2xl object-cover" />
                    <div>
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#D3132E]">{item.badge}</p>
                      <h4 className="mt-2 text-base font-bold text-[#081535]">{item.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0E2A7B]">Eden Event</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-[#081535]">Temps forts et événements</h3>
                </div>
                <Link to="/eden-event" className="text-sm font-semibold text-[#0E2A7B]">
                  Explorer
                </Link>
              </div>
              <div className="space-y-5">
                {(runtimeEvents.length > 0
                  ? runtimeEvents.slice(0, 3).map((item) => ({
                      title: item.title,
                      summary: item.summary,
                      badge: item.category || "Événement",
                      date: item.label || "Date à définir",
                    }))
                  : eventItems.slice(0, 3)
                ).map((item) => (
                  <article key={item.title} className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#0E2A7B]/8 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B]">
                        {item.badge}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.date}</span>
                    </div>
                    <h4 className="mt-4 text-xl font-bold text-[#081535]">{item.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <SectionTitle
                eyebrow="Localisation"
                title="Visitez l'établissement et préparez votre itinéraire."
                description="Retrouvez l'adresse de l'école, les moyens de contact et un accès direct à Google Maps pour planifier votre déplacement."
              />
              <div className="mt-8 grid gap-4">
                <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Adresse</p>
                  <p className="mt-2 text-base font-semibold text-[#081535]">{school.address}</p>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Téléphones</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {school.phones.map((phone) => (
                      <a key={phone} href={`tel:${sanitizePhone(phone)}`} className="rounded-full border border-[#0E2A7B]/10 px-3 py-2 text-sm font-semibold text-[#0E2A7B] transition hover:bg-[#0E2A7B]/5">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={school.mapsUrl} target="_blank" rel="noreferrer" className={lightButtonClass}>
                  Itinéraire
                  <Compass className="h-4 w-4" />
                </a>
                <Link to="/contact" className={cn(primaryButtonClass, "px-5 py-3")}>Page contact</Link>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-premium">
              <iframe
                title="Carte Google Maps - Groupe Scolaire Eden Providence"
                src={school.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[480px] w-full border-0"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PageHero({
  eyebrow,
  title,
  description,
  video,
  poster,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  video?: string;
  poster?: string;
  children?: ReactNode;
}) {
  return (
    <section className="section-shell pt-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-[36px] px-6 py-14 shadow-premium sm:px-8 sm:py-16 lg:px-12 lg:py-18">
        {video ? (
          <HeroVideo src={video} poster={poster} />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#081535,#0E2A7B_58%,#D3132E_130%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,216,78,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_30%)]" />
        <div className="relative z-10 max-w-4xl text-white">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] backdrop-blur-sm">
            {eyebrow}
          </p>
          <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[0.96] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-balance text-base leading-8 text-white/84 sm:text-lg">{description}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

function PresentationPage() {
  return (
    <>
      <PageHero
        eyebrow="Présentation"
        title="Une école qui place l'épanouissement de l'enfant au cœur de sa mission."
        description="Cette page met en valeur les repères institutionnels essentiels. Les sections où les informations détaillées n'ont pas été communiquées restent clairement identifiées comme temporaires."
        video={mediaLibrary.communityVideo.src}
        poster={mediaLibrary.communityVideo.poster}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className={primaryButtonClass}>
            Planifier un contact
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/formations" className={secondaryButtonClass}>
            Voir les formations
          </Link>
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell grid gap-8 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#0E2A7B] text-white shadow-lg shadow-[#0E2A7B]/15">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-[#081535]">Mission</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">{school.mission}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#D3132E] text-white shadow-lg shadow-[#D3132E]/15">
                <BadgeInfo className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-[#081535]">Vision</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Contenu temporaire à compléter. Cette section est prête à accueillir la vision officielle de l'établissement sans modification de structure.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#F4D84E]/60 text-[#081535] shadow-lg shadow-[#F4D84E]/20">
                <ScrollText className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-[#081535]">Historique</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Contenu temporaire à compléter. La chronologie de l'école pourra être ajoutée ici avec dates, étapes clés et archives visuelles officielles.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#0E2A7B]/8 text-[#0E2A7B] shadow-sm">
                <Quote className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-[#081535]">Mot de la direction</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Contenu temporaire à compléter. Le message officiel de la direction pourra être intégré ici avec photo, signature et version audio ou vidéo si souhaité.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell grid gap-8 xl:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <SectionTitle
                eyebrow="Valeurs"
                title="Des principes éducatifs lisibles et rassurants."
                description="Les valeurs ci-dessous sont formulées à partir de la mission communiquée, afin de donner une lecture claire de l'identité éducative du groupe scolaire."
              />
              <div className="mt-8 grid gap-4">
                {values.map((value) => (
                  <div key={value.title} className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-[#0E2A7B]/8 p-3 text-[#0E2A7B]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#081535]">{value.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{value.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <SectionTitle
                eyebrow="Objectifs"
                title="Des intentions éducatives concrètes pour chaque étape."
                description="Chaque objectif renforce la vocation de l'école : apprendre, grandir et s'épanouir dans un environnement structuré."
              />
              <div className="mt-8 grid gap-4">
                {objectives.map((objective) => (
                  <div key={objective.title} className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-[#D3132E]/8 p-3 text-[#D3132E]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#081535]">{objective.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{objective.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function FormationsPage() {
  const runtimeCms = useRuntimeCms();
  const runtimeFormations = getPublishedCollection(runtimeCms?.collections, "formations");

  return (
    <>
      <PageHero
        eyebrow="Nos formations"
        title="Crèche, garderie, maternelle, primaire : une progression pensée avec cohérence."
        description="Chaque cycle est présenté avec une description claire, des objectifs lisibles et des visuels d'illustration temporaires en attendant les médias officiels de l'école."
        video={mediaLibrary.digitalVideo.src}
        poster={mediaLibrary.digitalVideo.poster}
      >
        <div className="flex flex-wrap gap-3">
          <a href={school.whatsappLink} target="_blank" rel="noreferrer" className={primaryButtonClass}>
            Demander des informations
            <MessageCircle className="h-4 w-4" />
          </a>
          <Link to="/tarifs" className={secondaryButtonClass}>
            Consulter les tarifs
          </Link>
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell grid gap-6 xl:grid-cols-2">
          {(runtimeFormations.length > 0
            ? runtimeFormations.map((item, index) => {
                const media = getRuntimeMedia(runtimeCms?.media, item.mediaId);
                return {
                  title: item.title,
                  description: item.summary,
                  objectives: [item.category, item.label || "Depuis l'administration", media?.type === "document" ? "Document joint disponible" : "Média galerie associé"],
                  image: media?.type === "image" || media?.type === "video" ? media.poster || media.src : formations[index % formations.length]?.image,
                  alt: `Média associé à ${item.title}`,
                  linkedDocument: media?.type === "document" ? media.src : null,
                };
              })
            : formations.map((formation) => ({ ...formation, linkedDocument: null }))
          ).map((formation, index) => (
            <Reveal key={formation.title}>
              <article className="grid overflow-hidden rounded-[34px] border border-white/65 bg-white shadow-premium lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[280px] lg:min-h-full">
                  <img src={formation.image} alt={formation.alt} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/88 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B] backdrop-blur-sm">
                      Cycle {index + 1}
                    </span>
                    <span className="rounded-full bg-[#081535]/72 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                      {runtimeFormations.length > 0 ? "Depuis l'admin" : "Illustration temporaire"}
                    </span>
                  </div>
                </div>
                <div className="p-7 sm:p-8">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#0E2A7B]/8 text-[#0E2A7B]">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-4xl font-semibold text-[#081535]">{formation.title}</h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">{formation.description}</p>
                  <div className="mt-6 rounded-[26px] bg-slate-50 p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0E2A7B]">Objectifs</p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-700">
                      {formation.objectives.map((objective) => (
                        <li key={objective} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D3132E]" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/contact" className={cn(primaryButtonClass, "px-5 py-3")}>En savoir plus</Link>
                    <Link to="/tarifs" className={cn(lightButtonClass, "px-5 py-3")}>Voir les tarifs</Link>
                    {formation.linkedDocument ? (
                      <a href={formation.linkedDocument} target="_blank" rel="noreferrer" className={cn(lightButtonClass, "px-5 py-3")}>
                        Document lié
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function TarifsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tarifs"
        title="Des tableaux modernes, lisibles et prêts à recevoir la grille officielle."
        description="Les montants n'ayant pas été fournis dans l'espace de travail, la page présente une structure HTML premium, responsive et immédiatement administrable pour intégrer les données officielles sans refaire le design."
      >
        <div className="flex flex-wrap gap-3">
          <a href="/documents/tarifs-eden-providence-a-completer.txt" download className={primaryButtonClass}>
            <FileDown className="h-4 w-4" />
            Télécharger
          </a>
          <button type="button" onClick={() => window.print()} className={secondaryButtonClass}>
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell">
          <Reveal>
            <div className="mb-8 flex gap-4 rounded-[30px] border border-[#F4D84E]/40 bg-[#FFF9DB] p-5 text-[#6A4D00] shadow-sm">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-7">
                Les chiffres du document officiel des frais de scolarité ne sont pas disponibles dans l'espace de travail actuel. Les tableaux ci-dessous sont donc volontairement laissés en mode prêt-à-remplir.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-8">
            {pricingTables.map((table) => (
              <Reveal key={table.title}>
                <div className="overflow-hidden rounded-[34px] border border-white/65 bg-white shadow-premium">
                  <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
                    <h2 className="font-display text-3xl font-semibold text-[#081535]">{table.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{table.note}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#0E2A7B] text-white">
                        <tr>
                          {table.columns.map((column) => (
                            <th key={column} className="px-5 py-4 font-semibold">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row) => (
                          <tr key={row[0]} className="border-b border-slate-100 last:border-b-0 even:bg-slate-50/80">
                            {row.map((cell, index) => (
                              <td key={`${row[0]}-${index}`} className="px-5 py-4 align-top text-slate-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <h3 className="font-display text-3xl font-semibold text-[#081535]">Besoin d'une précision ?</h3>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                Contactez l'école par téléphone, par email ou via WhatsApp pour obtenir les renseignements complémentaires le temps d'intégrer le document tarifaire officiel dans le site.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact" className={primaryButtonClass}>
                  Contacter l'école
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={school.whatsappLink} target="_blank" rel="noreferrer" className={cn(lightButtonClass, "px-5 py-3")}>
                  WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function GalleryPage() {
  const runtimeCms = useRuntimeCms();
  const [activeFilter, setActiveFilter] = useState<"all" | GalleryItem["category"]>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const runtimeGalleryItems: GalleryItem[] =
    runtimeCms?.media
      ?.filter((item): item is NonNullable<typeof runtimeCms.media>[number] & { type: "image" | "video" } => !item.hidden && (item.type === "image" || item.type === "video"))
      .map((item) => ({
        id: item.id,
        type: item.type,
        category: item.type === "video" ? "video" : "photo",
        title: item.name,
        description: `Média administré • ${item.category}`,
        src: item.src,
        poster: item.poster,
        alt: `Média administré ${item.name}`,
      })) ?? [];

  const gallerySource = runtimeGalleryItems.length > 0 ? runtimeGalleryItems : galleryItems;
  const filteredItems = gallerySource.filter((item) => activeFilter === "all" || item.category === activeFilter || item.type === activeFilter);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filters: Array<{ label: string; value: "all" | GalleryItem["category"] }> = [
    { label: "Tout", value: "all" },
    { label: "Photos", value: "photo" },
    { label: "Vidéos", value: "video" },
    { label: "Classe", value: "classe" },
    { label: "Bibliothèque", value: "bibliotheque" },
    { label: "Sciences", value: "science" },
    { label: "Numérique", value: "numerique" },
    { label: "Sport / groupe", value: "sport" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Une médiathèque élégante, immersive et prête pour les contenus officiels."
        description="Photos, vidéos, filtres et visionneuse premium sont déjà en place. Les médias affichés sont provisoires et servent d'illustration en attendant les ressources officielles de l'école."
        video={mediaLibrary.heroVideo.src}
        poster={mediaLibrary.heroVideo.poster}
      >
        <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm">
          Lazy loading, filtres, visionneuse et architecture prête pour un futur CMS.
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell">
          <Reveal>
            <div className="mb-8 flex gap-4 rounded-[30px] border border-[#0E2A7B]/10 bg-white p-5 shadow-sm">
              <BadgeInfo className="mt-0.5 h-5 w-5 shrink-0 text-[#0E2A7B]" />
              <p className="text-sm leading-7 text-slate-600">
                Les visuels et vidéos ci-dessous sont des médias d'ambiance temporaires. Ils ne représentent pas officiellement les locaux ni les élèves de l'établissement et pourront être remplacés depuis une future interface d'administration.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mb-8 flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "button-focus rounded-full border px-4 py-2 text-sm font-semibold transition",
                    activeFilter === filter.value
                      ? "border-[#0E2A7B] bg-[#0E2A7B] text-white"
                      : "border-[#0E2A7B]/12 bg-white text-[#0E2A7B] hover:border-[#0E2A7B]/25 hover:bg-[#0E2A7B]/5",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Reveal key={item.id}>
                <motion.button
                  type="button"
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedItem(item)}
                  className="group w-full overflow-hidden rounded-[30px] border border-white/65 bg-white text-left shadow-premium"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={item.type === "video" ? item.poster : item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081535]/82 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B] backdrop-blur-sm">
                        {item.type === "video" ? "Vidéo" : "Photo"}
                      </span>
                      {item.type === "video" ? (
                        <span className="rounded-full bg-[#081535]/72 p-2 text-white backdrop-blur-sm">
                          <PlayCircle className="h-5 w-5" />
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-5 bottom-5 text-white">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/80">{item.description}</p>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#081535]/90 px-4 py-6 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <div className="flex h-full items-center justify-center">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950"
              >
                <button
                  type="button"
                  aria-label="Fermer la visionneuse"
                  onClick={() => setSelectedItem(null)}
                  className="button-focus absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="max-h-[78svh] overflow-auto">
                  {selectedItem.type === "video" ? (
                    <video controls autoPlay poster={selectedItem.poster} className="max-h-[68svh] w-full bg-black object-contain">
                      <source src={selectedItem.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={selectedItem.src} alt={selectedItem.alt} className="max-h-[68svh] w-full object-contain bg-black" />
                  )}
                  <div className="glass-panel-dark p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F4D84E]">
                      {selectedItem.temporary ? "Média temporaire" : "Média"}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold">{selectedItem.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/78">{selectedItem.description}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActualitesPage() {
  const runtimeCms = useRuntimeCms();
  const runtimeNews = getPublishedCollection(runtimeCms?.collections, "actualites");

  return (
    <>
      <PageHero
        eyebrow="Actualités"
        title="Une vitrine éditoriale premium prête pour les annonces officielles."
        description="Les cartes ci-dessous illustrent la structure de publication. Elles sont volontairement temporaires et clairement identifiées comme telles jusqu'à l'intégration des contenus réels."
        video={mediaLibrary.scienceVideo.src}
        poster={mediaLibrary.scienceVideo.poster}
      >
        <Link to="/contact" className={primaryButtonClass}>
          Demander une information
          <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHero>

      <section className="section-space">
        <div className="section-shell grid gap-6 xl:grid-cols-3">
          {(runtimeNews.length > 0
            ? runtimeNews.map((item, index) => {
                const media = getRuntimeMedia(runtimeCms?.media, item.mediaId);
                return {
                  title: item.title,
                  summary: item.summary,
                  badge: item.label || "Depuis l'admin",
                  image: media?.poster || media?.src || newsItems[index % newsItems.length]?.image,
                  alt: `Média associé à ${item.title}`,
                  document: media?.type === "document" ? media.src : null,
                };
              })
            : newsItems.map((item) => ({ ...item, document: null }))
          ).map((item) => (
            <Reveal key={item.title}>
              <article className="overflow-hidden rounded-[32px] border border-white/65 bg-white shadow-premium">
                <img src={item.image} alt={item.alt} loading="lazy" className="h-72 w-full object-cover" />
                <div className="p-7">
                  <span className="rounded-full bg-[#D3132E]/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#D3132E]">
                    {item.badge}
                  </span>
                  <h2 className="mt-4 text-2xl font-bold text-[#081535]">{item.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E2A7B]">
                      Publication à venir
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    {item.document ? (
                      <a href={item.document} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#0E2A7B] underline-offset-4 hover:underline">
                        Ouvrir le document
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function EdenEventPage() {
  const runtimeCms = useRuntimeCms();
  const runtimeEvents = getPublishedCollection(runtimeCms?.collections, "evenements");

  return (
    <>
      <PageHero
        eyebrow="Eden Event"
        title="Une page événementielle immersive pour les moments forts de l'école."
        description="Affiches, vidéos, photos, descriptions et calendrier sont déjà prévus. Les contenus affichés ici sont temporaires et servent à préparer une expérience haut de gamme prête à être alimentée."
        video={mediaLibrary.communityVideo.src}
        poster={mediaLibrary.communityVideo.poster}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/galerie" className={primaryButtonClass}>
            Explorer la galerie
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className={secondaryButtonClass}>
            Contacter l'école
          </Link>
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            {(() => {
              const heroEvent = runtimeEvents[0];
              const heroMedia = getRuntimeMedia(runtimeCms?.media, heroEvent?.mediaId);
              const fallback = eventItems[0];
              return (
                <article className="overflow-hidden rounded-[34px] border border-white/65 bg-white shadow-premium">
                  <img src={heroMedia?.poster || heroMedia?.src || fallback.image} alt={heroEvent ? `Média associé à ${heroEvent.title}` : fallback.alt} loading="lazy" className="h-80 w-full object-cover" />
                  <div className="p-7 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#0E2A7B]/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B]">
                        {heroEvent?.category || fallback.badge}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{heroEvent?.label || fallback.date}</span>
                    </div>
                    <h2 className="mt-4 font-display text-4xl font-semibold text-[#081535]">{heroEvent?.title || fallback.title}</h2>
                    <p className="mt-4 text-base leading-8 text-slate-600">{heroEvent?.summary || fallback.summary}</p>
                    {heroMedia?.type === "document" ? (
                      <a href={heroMedia.src} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-semibold text-[#0E2A7B] underline-offset-4 hover:underline">
                        Ouvrir le document lié
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })()}
          </Reveal>

          <Reveal>
            <div className="glass-panel rounded-[34px] p-7 sm:p-8">
              <SectionTitle
                eyebrow="Calendrier"
                title="Agenda prêt à être administré."
                description="La structure ci-dessous permet d'afficher à terme les dates, lieux, affiches et descriptifs détaillés des futurs événements de l'établissement."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { month: "Janvier", note: "Programmation à compléter" },
                  { month: "Mars", note: "Programmation à compléter" },
                  { month: "Juin", note: "Programmation à compléter" },
                ].map((slot) => (
                  <div key={slot.month} className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#D3132E]">{slot.month}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{slot.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="section-shell grid gap-6 xl:grid-cols-3">
          {(runtimeEvents.length > 0
            ? runtimeEvents.map((item, index) => {
                const media = getRuntimeMedia(runtimeCms?.media, item.mediaId);
                return {
                  title: item.title,
                  summary: item.summary,
                  date: item.label || "Date à définir",
                  image: media?.poster || media?.src || eventItems[index % eventItems.length]?.image,
                  alt: `Média associé à ${item.title}`,
                };
              })
            : eventItems
          ).map((item) => (
            <Reveal key={item.title}>
              <article className="overflow-hidden rounded-[32px] border border-white/65 bg-white shadow-premium">
                <img src={item.image} alt={item.alt} loading="lazy" className="h-64 w-full object-cover" />
                <div className="p-6">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0E2A7B]">{item.date}</p>
                  <h3 className="mt-3 text-xl font-bold text-[#081535]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Rencontrez l'école, échangez avec l'équipe et préparez votre visite."
        description="Toutes les informations essentielles sont réunies ici : adresse, téléphones, WhatsApp, email, carte Google Maps, réseaux sociaux et formulaire de contact prêt à être connecté."
        video={mediaLibrary.digitalVideo.src}
        poster={mediaLibrary.digitalVideo.poster}
      >
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${sanitizePhone(school.phones[0])}`} className={primaryButtonClass}>
            <Phone className="h-4 w-4" />
            Appeler
          </a>
          <a href={school.whatsappLink} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={school.mapsUrl} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
            <Compass className="h-4 w-4" />
            Itinéraire
          </a>
        </div>
      </PageHero>

      <section className="section-space">
        <div className="section-shell grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="grid gap-5">
              <div className="glass-panel rounded-[32px] p-6 sm:p-7">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#0E2A7B] text-white shadow-lg shadow-[#0E2A7B]/15">
                  <MapPinned className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#081535]">Adresse</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{school.address}</p>
              </div>
              <div className="glass-panel rounded-[32px] p-6 sm:p-7">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#D3132E] text-white shadow-lg shadow-[#D3132E]/15">
                  <Phone className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#081535]">Téléphones</h2>
                <div className="mt-4 grid gap-3">
                  {school.phones.map((phone) => (
                    <a key={phone} href={`tel:${sanitizePhone(phone)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0E2A7B] transition hover:border-[#0E2A7B]/20 hover:bg-[#0E2A7B]/5">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-[32px] p-6 sm:p-7">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#F4D84E]/60 text-[#081535] shadow-lg shadow-[#F4D84E]/20">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#081535]">Email</h2>
                <a href={`mailto:${school.email}`} className="mt-3 inline-flex text-sm font-semibold text-[#0E2A7B] hover:underline">
                  {school.email}
                </a>
              </div>
              <div className="glass-panel rounded-[32px] p-6 sm:p-7">
                <h2 className="text-2xl font-bold text-[#081535]">Réseaux sociaux</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={school.facebookUrl} target="_blank" rel="noreferrer" className={lightButtonClass}>
                    <BadgeInfo className="h-4 w-4" />
                    {school.facebookLabel}
                  </a>
                  <a href={school.tiktokUrl} target="_blank" rel="noreferrer" className={lightButtonClass}>
                    <Video className="h-4 w-4" />
                    {school.tiktokLabel}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6">
              <div className="glass-panel rounded-[32px] p-7 sm:p-9">
                <SectionTitle
                  eyebrow="Formulaire"
                  title="Écrivez-nous en quelques instants."
                  description="Le formulaire est prêt à être connecté à un service de messagerie ou à Supabase dans une seconde étape."
                />
                <form
                  className="mt-8 grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="Nom du parent"
                      className="button-focus rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-[#0E2A7B]"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      className="button-focus rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-[#0E2A7B]"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Adresse email"
                    className="button-focus rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-[#0E2A7B]"
                  />
                  <textarea
                    required
                    rows={6}
                    placeholder="Votre message"
                    className="button-focus rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-[#0E2A7B]"
                  />
                  <div className="flex flex-wrap items-center gap-4">
                    <button type="submit" className={primaryButtonClass}>
                      <Send className="h-4 w-4" />
                      Envoyer
                    </button>
                    {submitted ? (
                      <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        Formulaire de démonstration envoyé localement. Connexion serveur à activer plus tard.
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">Aucun backend n'est activé à cette étape du projet.</p>
                    )}
                  </div>
                </form>
              </div>
              <div className="overflow-hidden rounded-[32px] border border-white/65 bg-white shadow-premium">
                <iframe
                  title="Carte Google Maps - Adresse du Groupe Scolaire Eden Providence"
                  src={school.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[420px] w-full border-0"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function LegalPage() {
  return (
    <>
      <PageHero
        eyebrow="Mentions légales"
        title="Informations légales du site public."
        description="Cette page présente les informations disponibles. Les éléments non fournis restent explicitement signalés comme à compléter afin d'éviter toute invention de données."
      />
      <section className="section-space">
        <div className="section-shell grid gap-6">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <h2 className="font-display text-3xl font-semibold text-[#081535]">Informations principales</h2>
              <ul className="mt-6 space-y-4 text-sm text-slate-700">
                {legalHighlights.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0E2A7B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Politique de confidentialité"
        title="Protection des données et usage du site."
        description="La présente page décrit le fonctionnement actuel du site public. Les modules avancés de collecte et d'administration seront détaillés lors de leur mise en service effective."
      />
      <section className="section-space">
        <div className="section-shell grid gap-6">
          <Reveal>
            <div className="glass-panel rounded-[32px] p-7 sm:p-9">
              <div className="space-y-6 text-sm leading-8 text-slate-700">
                <p>
                  Le site public présente actuellement les informations institutionnelles du Groupe Scolaire Eden Providence. Aucun espace administrateur connecté ni traitement serveur avancé n'est actif à cette étape.
                </p>
                <p>
                  Le formulaire de contact visible sur le site est une démonstration d'interface prête à être reliée à un service de messagerie ou à une base de données lors d'une seconde phase de développement.
                </p>
                <p>
                  Les coordonnées officielles utilisées sur le site sont celles fournies : adresse, téléphones, WhatsApp, email et liens de présence en ligne. Les médias temporaires utilisés à titre d'illustration pourront être remplacés par les ressources officielles de l'établissement.
                </p>
                <p>
                  Pour toute question relative à l'utilisation des données ou à une demande de contact, veuillez écrire à <a className="font-semibold text-[#0E2A7B]" href={`mailto:${school.email}`}>{school.email}</a>.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="section-shell section-space">
      <Reveal>
        <div className="relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#081535,#0E2A7B_58%,#D3132E_125%)] px-6 py-16 text-white shadow-premium sm:px-10 sm:py-20">
          <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-[#F4D84E]/18 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.32em] text-white/70">Erreur 404</p>
            <h1 className="mt-5 font-display text-6xl font-semibold sm:text-7xl">Page introuvable</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
              Cette page n'existe pas ou a été déplacée. Revenez à l'accueil pour poursuivre votre découverte du Groupe Scolaire Eden Providence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className={primaryButtonClass}>
                Retour à l'accueil
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className={secondaryButtonClass}>
                Contacter l'école
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="section-shell pb-6 pt-4 sm:pb-8">
      <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#081535,#0E2A7B_65%,#142a5e_100%)] px-6 py-10 text-white shadow-premium sm:px-8 sm:py-12 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
          <div>
            <div className="flex items-center gap-4">
              <BrandLogo className="h-20 w-auto rounded-[24px] bg-white p-2" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">{school.slogan}</p>
                <h2 className="mt-2 text-2xl font-extrabold">{school.shortName}</h2>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-8 text-white/76">{school.mission}</p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#F4D84E]">Coordonnées</p>
            <div className="mt-5 space-y-4 text-sm text-white/82">
              <p>{school.address}</p>
              <a href={`mailto:${school.email}`} className="block transition hover:text-white">{school.email}</a>
              <div className="space-y-2">
                {school.phones.map((phone) => (
                  <a key={phone} href={`tel:${sanitizePhone(phone)}`} className="block transition hover:text-white">
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#F4D84E]">Liens rapides</p>
            <div className="mt-5 grid gap-3 text-sm text-white/82">
              {navigation.map((item) => (
                <Link key={item.path} to={item.path} className="inline-flex items-center gap-2 transition hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link to="/mentions-legales" className="inline-flex items-center gap-2 transition hover:text-white">
                <ChevronRight className="h-4 w-4" />
                Mentions légales
              </Link>
              <Link to="/politique-de-confidentialite" className="inline-flex items-center gap-2 transition hover:text-white">
                <ChevronRight className="h-4 w-4" />
                Politique de confidentialité
              </Link>
              <Link to="/admin" className="inline-flex items-center gap-2 transition hover:text-white">
                <ChevronRight className="h-4 w-4" />
                Administration
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/12 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <a href={school.whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 transition hover:bg-white/12">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a href={school.facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 transition hover:bg-white/12">
              <BadgeInfo className="h-4 w-4" />
              Facebook
            </a>
            <a href={school.tiktokUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 transition hover:bg-white/12">
              <Video className="h-4 w-4" />
              TikTok
            </a>
          </div>
          <p>© {new Date().getFullYear()} {school.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloatingButton() {
  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      <div className="group relative">
        <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 rounded-2xl bg-[#081535] px-4 py-2 text-xs font-medium text-white shadow-xl transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:block sm:opacity-0">
          Besoin d'informations ? Contactez-nous sur WhatsApp.
        </span>
        <motion.a
          href={school.whatsappLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Contacter l'école sur WhatsApp"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="button-focus relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAF38] text-white shadow-2xl shadow-[#1FAF38]/30 transition hover:scale-105"
        >
          <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          <MessageCircle className="relative h-7 w-7" />
        </motion.a>
      </div>
    </div>
  );
}

export default App;
