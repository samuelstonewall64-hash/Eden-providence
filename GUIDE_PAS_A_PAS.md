# Guide complet pas à pas
Groupe Scolaire Eden Providence — Site + Admin + Supabase + GitHub + Vercel

Suis les étapes dans l'ordre, sans en sauter. Chaque étape indique exactement où cliquer.

---

## À PROPOS DE L'ERREUR SQL QUE TU AS EUE

Le fichier `supabase/schema.sql` a été **corrigé**.

La cause de l'erreur : PostgreSQL n'accepte pas la syntaxe `create policy if not exists`.
Cette syntaxe n'existe tout simplement pas en SQL PostgreSQL (contrairement à `create table if not exists`, qui lui est valide).

La version corrigée utilise maintenant :
```sql
drop policy if exists "nom" on ma_table;
create policy "nom" on ma_table ...;
```

Cela revient au même résultat, mais fonctionne réellement et peut être relancé plusieurs fois sans erreur.

**Utilise bien la nouvelle version du fichier `supabase/schema.sql` du projet.**

---

## ÉTAPE 0 — Ce qu'il te faut avant de commencer

- un compte GitHub ;
- un compte Supabase (projet déjà créé : `nurhywqwccjpktdxcfcp`) ;
- un compte Vercel ;
- le projet en local sur ton ordinateur (téléchargé/exporté).

---

## ÉTAPE 1 — Sécuriser tes clés Supabase

Tu as précédemment partagé une clé qui commence par `sb_secret_...`. Cette clé est **sensible** et ne doit jamais être utilisée dans le site.

1. Ouvre ton projet Supabase.
2. Va dans **Project Settings**.
3. Clique sur **API** (ou **API Keys**).
4. Repère la clé secrète (`service_role` / `sb_secret_...`).
5. Clique sur **Regenerate** (ou **Roll**) pour la remplacer par une nouvelle.

Retiens uniquement :
- **Project URL** → `https://nurhywqwccjpktdxcfcp.supabase.co`
- **anon / publishable key** → celle qui commence par `sb_publishable_...` (ou `eyJ...` selon l'affichage Supabase)

Ce sont les **deux seules valeurs** utilisées par le site.

---

## ÉTAPE 2 — Exécuter le script SQL corrigé

1. Ouvre ton projet Supabase.
2. Dans le menu de gauche, clique sur **SQL Editor**.
3. Clique sur **New query**.
4. Ouvre le fichier du projet : `supabase/schema.sql`.
5. Copie **tout** son contenu (version corrigée).
6. Colle-le dans l'éditeur SQL de Supabase.
7. Clique sur **Run**.

### Résultat attendu
Un message de succès, sans texte rouge d'erreur.

Cela crée :
- la table `public.site_state` (état partagé du site) ;
- les autorisations de lecture/écriture ;
- l'activation du temps réel (realtime) ;
- le bucket de stockage `site-media` (photos, vidéos, documents) ;
- les autorisations d'accès au bucket.

### Si tu obtiens encore une erreur
Copie le message d'erreur exact affiché par Supabase (texte en rouge) : il indique la ligne concernée. Envoie-le-moi et je corrige immédiatement le script.

---

## ÉTAPE 3 — Vérifier que la table existe

1. Dans Supabase, va dans **Table Editor**.
2. Tu dois voir une table nommée **site_state** dans le schéma `public`.
3. Va dans **Storage**.
4. Tu dois voir un bucket nommé **site-media**.

Si les deux existent : l'étape SQL est réussie.

---

## ÉTAPE 4 — Configurer le projet en local

1. Ouvre le dossier du projet sur ton ordinateur.
2. Crée un fichier à la racine nommé exactement :
   ```
   .env.local
   ```
3. Colle ce contenu :

```env
VITE_SUPABASE_URL=https://nurhywqwccjpktdxcfcp.supabase.co
VITE_SUPABASE_ANON_KEY=colle_ici_ta_cle_publishable
VITE_SUPABASE_BUCKET=site-media
VITE_SITE_STATE_ID=public-site
```

4. Remplace `colle_ici_ta_cle_publishable` par ta vraie clé publique.
5. Sauvegarde.

Ce fichier ne doit **jamais** être envoyé sur GitHub (déjà protégé par le `.gitignore` du projet).

---

## ÉTAPE 5 — Tester en local

Dans un terminal, à la racine du projet :

```bash
npm install
npm run dev
```

Ouvre le lien affiché (en général `http://localhost:5173`).

Teste :
- le site public (page d'accueil) ;
- l'administration en ajoutant `#/admin` à la fin de l'URL.

Code d'accès admin par défaut :
```
1234567890
```

### Vérifier que Supabase fonctionne bien
1. Connecte-toi à `#/admin`.
2. Modifie un contenu (par exemple un titre d'actualité).
3. Attends quelques secondes.
4. Ouvre `#/` dans un autre navigateur (ou navigation privée).
5. Le changement doit apparaître.

Si ça fonctionne : Supabase est bien branché.

---

## ÉTAPE 6 — Envoyer le projet sur GitHub

### A. Créer le dépôt

1. Va sur GitHub.
2. Clique sur **New repository**.
3. Nom suggéré : `eden-providence-site`.
4. Ne coche pas "Add a README" (le projet existe déjà en local).
5. Clique sur **Create repository**.

### B. Envoyer le projet

Dans le terminal, à la racine du projet :

```bash
git init
git add .
git commit -m "Site Eden Providence avec admin et Supabase"
git branch -M main
```

Puis (remplace `TON-USER`) :

```bash
git remote add origin https://github.com/TON-USER/eden-providence-site.git
git push -u origin main
```

Si Git demande une connexion, connecte-toi avec ton compte GitHub.

---

## ÉTAPE 7 — Déployer sur Vercel

### A. Importer le projet

1. Va sur Vercel.
2. Clique sur **Add New...**
3. Clique sur **Project**.
4. Choisis **Import Git Repository**.
5. Sélectionne `eden-providence-site`.

Vercel détecte automatiquement Vite.

### B. Ajouter les variables d'environnement

Avant ou juste après l'import, va dans **Environment Variables** et ajoute :

| Nom | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://nurhywqwccjpktdxcfcp.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ta clé publishable |
| `VITE_SUPABASE_BUCKET` | `site-media` |
| `VITE_SITE_STATE_ID` | `public-site` |

Coche les environnements : **Production**, **Preview**, **Development**.

### C. Déployer

1. Clique sur **Deploy**.
2. Attends la fin du build.
3. Ouvre le lien fourni par Vercel.

---

## ÉTAPE 8 — Vérifier en ligne

1. Ouvre ton site Vercel.
2. Ajoute `#/admin`.
3. Connecte-toi avec le code admin.
4. Modifie un contenu ou importe une photo.
5. Ouvre le site public dans un autre appareil ou navigateur.
6. Vérifie que le changement est visible pour tout le monde.

---

## ÉTAPE 9 — Ajouter des photos/vidéos dans les Collections

1. Va dans `#/admin`.
2. Ouvre l'onglet **Collections**.
3. Choisis une catégorie : Formations, Actualités, Événements, Documents ou **Galerie**.
4. Utilise :
   - **Importer des photos** (plusieurs à la fois) ;
   - **Importer des vidéos** ;
   - **Prendre une photo** (caméra) ;
   - **Filmer une vidéo** (caméra).
5. Chaque média importé devient automatiquement un élément publié de la collection.

---

## ÉTAPE 10 — Mettre à jour le site plus tard

Après une modification locale du projet :

```bash
git add .
git commit -m "Mise à jour du site"
git push
```

Vercel redéploie automatiquement à chaque `push` sur `main`.

---

## Récapitulatif express

- URL Supabase : `https://nurhywqwccjpktdxcfcp.supabase.co`
- Clé à utiliser : clé publique (`sb_publishable_...`)
- Clé à ne jamais utiliser côté site : clé secrète (`sb_secret_...`)
- Fichier SQL corrigé à exécuter : `supabase/schema.sql`
- Fichier d'environnement local : `.env.local`
- Variables Vercel : les 4 variables `VITE_...`
- Code admin par défaut : `1234567890`
- Logo officiel : dépose `logo-eden-providence.png` dans `public/`
