# Fiches de personnage D&D 5.5

Site de création et de suivi des fiches de personnage **Donjons & Dragons 5.5** (règles du Manuel des joueurs 2024) pour toute la table.

- Chaque joueur **crée son compte** (protégé par un code de campagne) et **ses personnages**, avec un assistant en 6 étapes : classe, espèce, historique (bonus +2/+1 ou +1/+1/+1 et don d'origine), caractéristiques (tableau standard, achat de points ou dés), compétences, finalisation.
- **Fiche complète** : caractéristiques, jets de sauvegarde, compétences (maîtrise / expertise), PV avec dégâts/soins rapides, dés de vie, jets contre la mort, états, attaques, ressources de classe, sorts et emplacements (lanceurs complets, semi-lanceurs, magie de pacte), bourse, équipement, histoire. Les valeurs dérivées (modificateurs, maîtrise, initiative, perception passive, DD des sorts…) sont calculées automatiquement.
- **Vue du groupe** : toutes les fiches du groupe, PV, CA et états **en direct**, ainsi qu'un tableau comparatif des caractéristiques et des perceptions passives.
- Chacun peut **consulter** toutes les fiches, mais seul son propriétaire peut les **modifier**. Le **MJ** peut modifier toutes les fiches (pratique pour les PV en combat).

Le site est 100 % statique (HTML/CSS/JS, hébergé sur GitHub Pages). Les comptes et les fiches sont stockés dans **Supabase** (offre gratuite, largement suffisante pour un groupe).

---

## Mise en place (≈ 10 minutes, une seule fois)

### 1. Créer le projet Supabase

1. Va sur <https://supabase.com> → **Start your project** → connecte-toi (avec GitHub, c'est le plus simple).
2. **New project** : choisis un nom, un mot de passe de base de données (garde-le de côté, il ne sert pas au site) et la région **Europe (Paris ou Frankfurt)**.
3. Attends 1 à 2 minutes que le projet soit prêt.

### 2. Créer les tables et la sécurité

1. Ouvre le fichier [`supabase/schema.sql`](supabase/schema.sql) et **remplace `CHANGE-MOI` par ton code de campagne** (ex. `dragon-rouge-2026`).
2. Dans Supabase : menu **SQL Editor** → **New query** → colle tout le contenu du fichier → **Run**. Le message attendu est « Success. No rows returned ».

> Ce script crée les tables `profiles` et `characters`, les règles de sécurité (chacun lit tout le groupe, ne modifie que ses fiches, le MJ peut tout modifier), la vérification du code de campagne à l'inscription et les mises à jour en direct. On peut le relancer sans risque (par exemple pour changer le code).

### 3. Réglages de connexion

Dans **Authentication** :

1. **Sign In / Providers → Email** : désactive **Confirm email**, puis **Save**. *(Recommandé : sur l'offre gratuite, Supabase n'envoie que quelques e-mails par heure. Si tu la laisses activée, chaque joueur devra cliquer sur un lien reçu par e-mail avant de se connecter.)*
2. **URL Configuration** → **Site URL** : `https://tibseydon.github.io/fiches-dnd/` (sert aux liens « mot de passe oublié »). Ajoute la même adresse dans **Redirect URLs**.

### 4. Brancher le site sur Supabase

Dans Supabase, bouton **Connect** en haut (ou **Project Settings → API**), récupère :

- **Project URL** (ex. `https://abcdefgh.supabase.co`) ;
- la clé publique **anon** (ou **publishable**). ⚠️ **Jamais** la clé `service_role` / `secret`.

Ouvre [`js/config.js`](js/config.js) (sur GitHub : bouton ✏️ *Edit*), colle ces deux valeurs dans `SUPABASE_URL` et `SUPABASE_KEY`, change éventuellement `CAMPAIGN_NAME`, puis **Commit changes**.

> La clé anon est faite pour être publique : la sécurité est assurée par les règles de la base (RLS) et le code de campagne.

### 5. Activer GitHub Pages

Dans le dépôt GitHub : **Settings → Pages** → *Source* : **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
Au bout d'une minute, le site est en ligne sur <https://tibseydon.github.io/fiches-dnd/>.

### 6. Devenir MJ

1. Crée ton compte sur le site, comme un joueur.
2. Supabase → **SQL Editor** → exécute (avec ton pseudo) :

   ```sql
   update public.profiles set role = 'mj' where display_name = 'TonPseudo';
   ```

   (ou **Table Editor** → `profiles` → colonne `role` → `mj`).
3. Recharge le site : le badge **MJ** apparaît, et tu peux modifier toutes les fiches.

### 7. Inviter les joueurs

Envoie-leur l'adresse du site et le **code de campagne**. Sans ce code, l'inscription est refusée par la base de données.

> Projet inactif : sur l'offre gratuite, Supabase met en pause un projet sans aucune activité pendant 7 jours. Il suffit de le relancer d'un clic depuis le tableau de bord (les données sont conservées).

---

## Mode local (test)

Tant que `SUPABASE_URL` et `SUPABASE_KEY` sont vides dans `js/config.js`, le site fonctionne en **mode local** : comptes et fiches sont enregistrés uniquement dans le navigateur (le premier compte créé est MJ). Pratique pour essayer, mais **rien n'est partagé** avec le groupe.

Pour tester sur ton ordinateur : `python3 -m http.server` dans le dossier, puis <http://localhost:8000>.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique |
| `css/style.css` | Style (thème clair/sombre automatique, impression) |
| `js/config.js` | **Configuration Supabase et nom de la campagne** |
| `js/data.js` | Données de règles 2024 : classes, espèces, historiques, compétences, emplacements de sorts |
| `js/rules.js` | Calculs (modificateurs, maîtrise, PV, CA, DD des sorts…) |
| `js/store.js` | Stockage : Supabase ou localStorage |
| `js/app.js` | Interface : connexion, groupe, assistant de création, fiche |
| `supabase/schema.sql` | Tables, sécurité et code de campagne, à exécuter dans Supabase |
