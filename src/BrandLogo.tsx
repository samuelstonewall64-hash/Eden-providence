import { useState, type CSSProperties } from "react";

// Emplacement attendu du vrai logo officiel (fichier fourni par l'école).
// Dépose le fichier exact ici : public/logo-eden-providence.png
// Dès que ce fichier existe dans le projet, il est automatiquement utilisé
// partout (header, footer, loader, admin) sans aucune autre modification.
const PRIMARY_LOGO_SRC = "/logo-eden-providence.png";
// Solution de secours utilisée uniquement si le fichier ci-dessus est absent.
const FALLBACK_LOGO_SRC = "/logo-eden-providence.svg";

type BrandLogoProps = {
  className?: string;
  alt?: string;
  style?: CSSProperties;
};

export function BrandLogo({ className, alt = "Logo du Groupe Scolaire Eden Providence", style }: BrandLogoProps) {
  const [src, setSrc] = useState(PRIMARY_LOGO_SRC);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (src !== FALLBACK_LOGO_SRC) setSrc(FALLBACK_LOGO_SRC);
      }}
    />
  );
}

export default BrandLogo;
