# Déploiement — Eden Providence

## 1) Ce qu'il te faut

- un compte **GitHub** ;
- un compte **Supabase** ;
- un compte **Vercel** ;
- ce projet en local.

## 2) Quelle clé Supabase le projet utilise

### Côté frontend
Le projet utilise uniquement :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Important
Ne mets **jamais** la `service_role` key dans le frontend ou sur GitHub.

## 3) Configuration Supabase

### A. Créer le projet
1. Ouvre Supabase.
2. Clique sur **New project**.
3. Donne un nom au projet.
4. Attends la création complète.

### B. Récupérer les clés
Dans **Project Settings > API** :
- copie **Project URL** → `VITE_SUPABASE_URL`
- copie **anon / publishable key** → `VITE_SUPABASE_ANON_KEY`

### C. Créer la base et le bucket
1. Ouvre **SQL Editor**.
2. Copie le contenu de `supabase/schema.sql`.
3. Exécute le script.

Cela crée :
- la table `public.site_state`
- le bucket `site-media`
- les policies de lecture/écriture simplifiées
- la publication realtime

## 4) Variables d'environnement locales

### Dans ton cas précis
Tu m'as donné :
- une URL REST finissant par `/rest/v1/`
- une clé `sb_secret_...`
- une clé `sb_publishable_...`

### La bonne configuration frontend est :
- `VITE_SUPABASE_URL = https://nurhywqwccjpktdxcfcp.supabase.co`
- `VITE_SUPABASE_ANON_KEY = ta clé sb_publishable_...`

### Important
- **n'utilise pas** l'URL avec `/rest/v1/` dans `VITE_SUPABASE_URL`
- **n'utilise jamais** la clé `sb_secret_...` dans le frontend, dans Vercel côté client, ni sur GitHub
- comme cette clé secrète a été partagée ici, il est fortement recommandé de la **rotater / régénérer** dans Supabase

Crée un fichier `.env.local` à la racine du projet avec :

```env
VITE_SUPABASE_URL=https://nurhywqwccjpktdxcfcp.supabase.co
VITE_SUPABASE_ANON_KEY=colle_ici_ta_cle_sb_publishable
VITE_SUPABASE_BUCKET=site-media
VITE_SITE_STATE_ID=public-site
```

## 5) Lancer localement

```bash
npm install
npm run dev
```

Ensuite :
- site public : `#/`
- admin : `#/admin`

## 6) Ce qui est maintenant synchronisé

Quand Supabase est configuré :
- les changements admin sont envoyés dans `site_state`
- le site public relit cet état partagé
- les uploads photo/vidéo/document partent dans **Supabase Storage**
- les médias peuvent être réutilisés dans :
  - formations
  - actualités
  - événements
  - galerie
  - documents liés

## 7) Envoyer le projet sur GitHub

### A. Initialiser git si besoin
```bash
git init
git add .
git commit -m "Initial Eden Providence website + admin CMS"
```

### B. Créer un repo GitHub
1. Va sur GitHub.
2. Clique sur **New repository**.
3. Donne un nom, par exemple : `eden-providence-site`.
4. Crée le dépôt **sans** README si tu pousses un projet existant.

### C. Connecter le dépôt local au repo GitHub
Remplace `TON-USER` par ton compte GitHub :

```bash
git branch -M main
git remote add origin https://github.com/TON-USER/eden-providence-site.git
git push -u origin main
```

## 8) Déployer sur Vercel

### A. Importer le repo
1. Connecte-toi à Vercel.
2. Clique sur **Add New > Project**.
3. Sélectionne ton repo GitHub.
4. Vercel détectera automatiquement Vite.

### B. Ajouter les variables d'environnement sur Vercel
Dans **Project Settings > Environment Variables**, ajoute :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_BUCKET`
- `VITE_SITE_STATE_ID`

Valeurs recommandées :
- `VITE_SUPABASE_BUCKET = site-media`
- `VITE_SITE_STATE_ID = public-site`

### C. Déployer
Clique sur **Deploy**.

## 9) Comment l'administrateur travaille ensuite

1. ouvrir `ton-site.vercel.app/#/admin`
2. se connecter avec le code admin
3. modifier contenus / collections / médias
4. les changements sont sauvegardés dans Supabase
5. le site public peut les relire

## 10) Photos et vidéos de galerie

Oui :
- l'admin peut uploader des **photos** et **vidéos** ;
- si Supabase est actif, elles sont envoyées dans le bucket `site-media` ;
- elles peuvent ensuite être associées aux collections administrables ;
- la galerie publique peut relire ces médias.

## 11) Sécurité actuelle

La version actuelle est pensée pour te permettre d'avancer vite.

Les policies du SQL fourni autorisent une écriture frontend simplifiée pour que le CMS fonctionne sans backend serveur dédié.

### Recommandation production
Ensuite, il faudra sécuriser plus fort avec :
- authentification Supabase réelle ;
- policies restreintes aux admins ;
- éventuellement une table `profiles` / `roles` ;
- ou des Edge Functions pour les écritures sensibles.

## 12) Si tu veux m'envoyer tes clés Supabase
Oui, pour une connexion réelle dans ton environnement tu auras besoin de renseigner :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Mais :
- ne les colle pas dans le code source ;
- mets-les dans `.env.local` localement ;
- et dans Vercel côté variables d'environnement.

## 13) Résumé très court

- **clé utilisée côté frontend** : `VITE_SUPABASE_ANON_KEY`
- **URL utilisée côté frontend** : `VITE_SUPABASE_URL`
- **jamais** la `service_role`
- upload galerie : **oui**, prévu via Supabase Storage
- visibilité pour tout le monde : **oui**, via l'état partagé `site_state`
