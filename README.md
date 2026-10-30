# Fiches de personnage D&D 5.5

Site de création et de suivi des fiches de personnage **Donjons & Dragons 5.5** (règles du Manuel des joueurs 2024) pour toute la table.

- Chacun **crée son compte**, puis **crée une campagne** (il en devient automatiquement le MJ) ou **rejoint** celle d'un ami avec son **code d'invitation**. On peut faire partie de plusieurs campagnes et passer de l'une à l'autre depuis « Mes campagnes ».
- Dans chaque campagne, les joueurs créent **leurs personnages** avec un assistant en 7 étapes : classe, espèce, historique (bonus +2/+1 ou +1/+1/+1 et don d'origine), caractéristiques (tableau standard, achat de points ou dés), compétences, niveau, finalisation.
- **Fiche complète** : caractéristiques, jets de sauvegarde, compétences (maîtrise / expertise), PV avec dégâts/soins rapides, dés de vie, jets contre la mort, états, attaques, ressources de classe, sorts et emplacements (lanceurs complets, semi-lanceurs, magie de pacte), bourse, équipement, histoire. Les valeurs dérivées (modificateurs, maîtrise, initiative, perception passive, DD des sorts…) sont calculées automatiquement.
- **Vue du groupe** : toutes les fiches du groupe, PV, CA et états **en direct**, ainsi qu'un tableau comparatif des caractéristiques et des perceptions passives.
- Chacun peut **consulter** toutes les fiches de sa campagne, mais seul son propriétaire peut les **modifier**. Le **MJ** de la campagne peut modifier toutes ses fiches (pratique pour les PV en combat). Les campagnes sont séparées : on ne voit que celles dont on est membre.

Le site est 100 % statique (HTML/CSS/JS, hébergé sur GitHub Pages). Les comptes et les fiches sont stockés dans **Supabase** (offre gratuite, largement suffisante pour un groupe).

---

## Mise en place (≈ 10 minutes, une seule fois)

### 1. Créer le projet Supabase

1. Va sur <https://supabase.com> → **Start your project** → connecte-toi (avec GitHub, c'est le plus simple).
2. **New project** : choisis un nom, un mot de passe de base de données (garde-le de côté, il ne sert pas au site) et la région **Europe (Paris ou Frankfurt)**.
3. Attends 1 à 2 minutes que le projet soit prêt.

### 2. Créer les tables et la sécurité

Dans Supabase : menu **SQL Editor** → **New query** → colle tout le contenu de [`schema.sql`](schema.sql) → **Run**. Le message attendu est « Success. No rows returned ».

> Ce script crée les tables (profils, campagnes, membres, fiches, bibliothèque), les règles de sécurité (chacun ne voit que ses campagnes, ne modifie que ses fiches, le MJ de la campagne peut tout modifier) et les mises à jour en direct. On peut le relancer sans risque.

### 3. Réglages de connexion

Dans **Authentication** :

1. **Sign In / Providers → Email** : désactive **Confirm email**, puis **Save**. *(Recommandé : sur l'offre gratuite, Supabase n'envoie que quelques e-mails par heure. Si tu la laisses activée, chaque joueur devra cliquer sur un lien reçu par e-mail avant de se connecter.)*
2. **URL Configuration** → **Site URL** : `https://tibseydon.github.io/fiches-dnd/` (sert aux liens « mot de passe oublié »). Ajoute la même adresse dans **Redirect URLs**.

### 4. Brancher le site sur Supabase

Dans Supabase, bouton **Connect** en haut (ou **Project Settings → API**), récupère :

- **Project URL** (ex. `https://abcdefgh.supabase.co`) ;
- la clé publique **anon** (ou **publishable**). ⚠️ **Jamais** la clé `service_role` / `secret`.

Ouvre [`config.js`](config.js) (sur GitHub : bouton ✏️ *Edit*), colle ces deux valeurs dans `SUPABASE_URL` et `SUPABASE_KEY`, puis **Commit changes**.

> La clé anon est faite pour être publique : la sécurité est assurée par les règles de la base (RLS).

### 5. Activer GitHub Pages

Dans le dépôt GitHub : **Settings → Pages** → *Source* : **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
Au bout d'une minute, le site est en ligne sur <https://tibseydon.github.io/fiches-dnd/>.

### 6. Créer ta campagne et inviter les joueurs

1. Crée ton compte sur le site, puis, sur la page **Mes campagnes**, choisis **Créer une campagne** : tu en deviens automatiquement le **MJ**.
2. L'onglet **Campagne** affiche le **code d'invitation** (ex. `K7QM-2XWD`) : envoie-le à tes joueurs avec l'adresse du site, ou utilise **Copier le lien d'invitation**. Chaque joueur crée son compte, puis **Rejoindre une campagne** avec ce code.
3. Toujours dans **Campagne** : niveau de départ, liste des membres (nommer un autre MJ, retirer un joueur), **Nouveau code** si l'ancien a trop circulé, suppression de la campagne.

> Projet inactif : sur l'offre gratuite, Supabase met en pause un projet sans aucune activité pendant 7 jours. Il suffit de le relancer d'un clic depuis le tableau de bord (les données sont conservées).

---

## Mise à jour : plusieurs campagnes

Si ta base Supabase a été créée avant cette mise à jour, exécute **une fois** [`maj-multi-campagnes.sql`](maj-multi-campagnes.sql) dans **SQL Editor → New query → Run** (après `maj-pseudo-campagne.sql` et `maj-bibliotheque.sql`). Tes données existantes sont rangées dans une campagne « Notre campagne », avec les mêmes MJ et joueurs ; son code d'invitation apparaît dans l'onglet **Campagne**. L'inscription n'a plus besoin de code : on rejoint une campagne depuis le site.

## Mise à jour : pseudo modifiable et niveau de départ

Si ta base Supabase a été créée avant cette mise à jour, exécute **une fois** le fichier [`maj-pseudo-campagne.sql`](maj-pseudo-campagne.sql) dans **SQL Editor → New query → Run**. Il ne touche pas aux fiches.

- **Pseudo** : chaque joueur le change dans « Mon profil » (clic sur son nom en haut à droite). Ses fiches affichent automatiquement le nouveau nom.
- **Niveau de départ** : le MJ le règle dans l'onglet **Campagne**. Les nouveaux personnages sont créés à ce niveau (PV, maîtrise, emplacements de sorts, ressources et capacités calculés), et l'assistant demande au joueur sa sous-classe et ses améliorations de caractéristiques ou dons. Sorts et autres options restent à remplir sur la fiche.

## Bibliothèque : importer automatiquement les livres du MJ

Le MJ peut déposer le PDF d'un livre qu'il possède, une archive **.zip** de plusieurs PDF (décompressée dans le navigateur, sans limite de taille côté serveur, un livre par fichier), un texte collé, ou un lien direct vers un PDF ou une page web publique) dans l'onglet **Bibliothèque**. Le site lit le texte dans le navigateur, puis une fonction Supabase demande à **Claude** (Haiku 5.5 par défaut) d'en extraire les classes, sous-classes, espèces, historiques et dons : données de jeu exactes et résumés reformulés en français, jamais le texte du livre recopié. Le MJ vérifie et corrige le résultat avant de l'enregistrer. Les contenus restent dans Supabase, visibles uniquement par les membres de la campagne, et ne sont jamais publiés sur GitHub.

**Installation (une fois) :**

1. **Base** : exécute [`maj-bibliotheque.sql`](maj-bibliotheque.sql) dans Supabase → **SQL Editor → New query → Run**.
2. **Clé API** : sur <https://console.anthropic.com>, crée un compte, ajoute un peu de crédit (*Billing*), puis crée une clé (*API Keys*). Elle commence par `sk-ant-`. Ne la mets jamais dans le code du site.
3. **Secret** : Supabase → **Edge Functions → Secrets** → ajoute `ANTHROPIC_API_KEY` avec ta clé.
4. **Fonction** : Supabase → **Edge Functions → Deploy a new function → Via Editor**, nomme-la exactement `extraire-livre`, remplace tout le code par celui de [`edge-function/index.ts`](edge-function/index.ts), puis **Deploy**. Laisse l'option *Verify JWT* activée.

**Modèle** : la fonction utilise **Claude Haiku 5.5** (quelques centimes par livre). Pour une extraction plus fiable mais environ 40 fois plus chère, ajoute le secret `CLAUDE_MODEL` = `claude-opus-5-5` (Edge Functions → Secrets) ; supprime-le pour revenir à Haiku. Aucun réglage n'est à faire sur la console Anthropic.

**Coût** : facturé sur ta clé Anthropic. Le site affiche une estimation avant de lancer, puis le coût réel. Avec Haiku, compte environ 0,10 à 0,20 $ pour un livre complet de 300 pages (3 à 7 $ avec Opus) ; indique une plage de pages (le chapitre des options de joueur) pour payer moins. Les PDF scannés (images sans texte) ne peuvent pas être lus.

## Extensions incluses

En plus du Manuel des joueurs 2024, l'assistant de création et la fiche proposent les classes, sous-classes et espèces de :

- **Officiel** : Eberron : Forge of the Artificer (Artificier et ses sous-classes, espèces d'Eberron), Frontiers of Eberron : Quickstone, Forgotten Realms : Heroes of Faerûn, Astarion's Book of Hungers, Lorwyn : First Light, Ravenloft : The Horrors Within, Arcana Unleashed.
- **Tiers** : Valda's Spire of Secrets, Gunslinger, Steinhardt's Guide to the Eldritch Hunt, Northlands Worldbook, Illrigger (MCDM), Grim Hollow : Player's Guide, Sebastian Crowe's Guide to Drakkenheim, The Crooked Moon.

Seules les données de jeu (noms, dé de vie, jets de sauvegarde…) sont reprises, pas le texte des livres : les traits des espèces et capacités des classes d'extension sont à recopier depuis ton livre. Les classes marquées **« à vérifier »** ont des données non confirmées ; chaque joueur peut ajuster le dé de vie, les jets de sauvegarde et la magie dans **Réglages de classe** sur sa fiche. Les options **Autre classe / Autre espèce (personnalisée)** couvrent tout ce qui manque.

La liste se trouve dans `extensions.js`.

## Mode local (test)

Tant que `SUPABASE_URL` et `SUPABASE_KEY` sont vides dans `config.js`, le site fonctionne en **mode local** : comptes, campagnes et fiches sont enregistrés uniquement dans le navigateur. Pratique pour essayer, mais **rien n'est partagé** avec le groupe.

Pour tester sur ton ordinateur : `python3 -m http.server` dans le dossier, puis <http://localhost:8000>.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page unique |
| `style.css` | Style (thème clair/sombre automatique, impression) |
| `config.js` | **Configuration Supabase** |
| `data.js`, `extensions.js`, `progression.js`, `info.js` | Règles 2024 et extensions : classes, espèces, historiques, dons, progression, fiches d'aide |
| `rules.js` | Calculs (modificateurs, maîtrise, PV, CA, DD des sorts…) |
| `store.js` | Stockage : Supabase ou localStorage |
| `app.js` | Interface : connexion, campagnes, groupe, assistant de création, fiche, bibliothèque |
| `schema.sql` | Tables et sécurité, à exécuter dans Supabase (nouvelle installation) |
| `maj-*.sql` | Mises à jour d'une base existante |
| `edge-function/index.ts` | Fonction Supabase « extraire-livre » (bibliothèque) |
