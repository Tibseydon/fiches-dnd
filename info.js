// Aides de jeu affichées par les icônes « i ».
// Résumés rédigés pour ce site (règles 2024) : ils ne remplacent pas le texte des livres.

export const ABILITY_INFO = {
  str: 'Puissance physique : Athlétisme, attaques avec la plupart des armes de corps à corps, porter et pousser.',
  dex: 'Agilité et réflexes : Acrobaties, Discrétion, Escamotage, armes à distance et à finesse, initiative et CA.',
  con: 'Endurance : points de vie (le modificateur s\'ajoute à chaque niveau) et maintien de la concentration.',
  int: 'Raisonnement et mémoire : Arcanes, Histoire, Investigation, Nature, Religion. Incantation des magiciens et artificiers.',
  wis: 'Perception et intuition : Dressage, Intuition, Médecine, Perception, Survie. Incantation des clercs, druides et rôdeurs.',
  cha: 'Présence et force de personnalité : Intimidation, Persuasion, Représentation, Tromperie. Incantation des bardes, ensorceleurs, occultistes et paladins.',
};

export const SKILL_INFO = {
  acrobatics: 'Garder l\'équilibre, faire des cabrioles, se sortir d\'une prise en se tortillant.',
  arcana: 'Connaissances sur les sorts, objets magiques, symboles occultes et plans d\'existence.',
  athletics: 'Grimper, sauter, nager, pousser ou lutter.',
  stealth: 'Se déplacer sans être vu ni entendu, se cacher.',
  animal: 'Calmer, dresser ou comprendre un animal, guider une monture.',
  sleight: 'Vol à la tire, tours de passe-passe, dissimuler un objet sur soi.',
  history: 'Événements passés, légendes, royaumes, guerres et personnages célèbres.',
  intimidation: 'Influencer par la menace ou la force de caractère.',
  insight: 'Deviner les intentions, repérer un mensonge, sentir l\'humeur de quelqu\'un.',
  investigation: 'Chercher des indices, déduire, repérer un piège ou un mécanisme.',
  medicine: 'Stabiliser un mourant, diagnostiquer une maladie ou une cause de mort.',
  nature: 'Terrains, plantes, animaux, météo et cycles naturels.',
  perception: 'Remarquer quelque chose avec ses sens : vue, ouïe, odorat.',
  persuasion: 'Convaincre avec tact, diplomatie ou bonne foi.',
  religion: 'Divinités, rites, prières, hiérarchies religieuses et symboles sacrés.',
  performance: 'Divertir un public : musique, danse, comédie, récit.',
  survival: 'Suivre une piste, chasser, s\'orienter, prévoir le temps.',
  deception: 'Mentir de façon convaincante, se déguiser, tromper par la parole.',
};

export const STAT_INFO = {
  ac: ['Classe d\'armure (CA)', 'Le résultat qu\'un jet d\'attaque doit égaler ou dépasser pour te toucher. Sans armure : 10 + mod. DEX (barbare : + CON, moine : + SAG). Avec une armure, la CA dépend de l\'armure ; un bouclier ajoute +2.'],
  init: ['Initiative', 'Jet de d20 + mod. DEX au début d\'un combat pour fixer l\'ordre des tours. Le don Vigilant ajoute ton bonus de maîtrise.'],
  speed: ['Vitesse', 'Distance parcourue à ton tour (1,5 m = 1 case). L\'action Foncer double cette distance pour le tour.'],
  prof: ['Bonus de maîtrise', 'S\'ajoute aux jets d\'attaque avec les armes maîtrisées, aux compétences et jets de sauvegarde maîtrisés et au DD de tes sorts. +2 aux niveaux 1-4, puis +1 tous les 4 niveaux (+6 au niveau 17).'],
  passive: ['Perception passive', '10 + ton bonus de Perception. Le MJ la compare au DD d\'une chose cachée sans que tu lances de dé. Même principe pour l\'Intuition et l\'Investigation passives.'],
  inspiration: ['Inspiration héroïque', 'Donnée par le MJ (ou par certains traits, comme l\'humain après un repos long). Dépense-la pour relancer un dé que tu viens de lancer et garder le nouveau résultat. On ne peut en avoir qu\'une à la fois.'],
  hp: ['Points de vie', 'À 0 PV, tu tombes inconscient et fais des jets contre la mort. Les PV temporaires absorbent les dégâts en premier et ne se cumulent pas (garde la valeur la plus haute). Les soins ne dépassent pas le maximum.'],
  hitdice: ['Dés de vie et repos', 'Repos court (1 heure) : dépense autant de dés de vie que tu veux ; lance chacun + mod. CON et regagne ces PV. Repos long (8 heures) : tous les PV, la moitié de tes dés de vie (au moins 1), tous les emplacements de sorts, et un niveau d\'épuisement en moins.'],
  death: ['Jets contre la mort', 'À 0 PV, au début de ton tour, lance un d20 : 10 ou plus = réussite, sinon échec. 3 réussites : tu es stabilisé. 3 échecs : tu meurs. Un 1 compte pour 2 échecs, un 20 te rend 1 PV. Subir des dégâts à 0 PV = 1 échec (un critique = 2).'],
  conditions: ['États', 'Effets qui modifient ce que peut faire un personnage. Clique sur l\'icône d\'un état pour son détail.'],
  spells: ['Incantation', 'DD de sauvegarde des sorts = 8 + maîtrise + mod. de la caractéristique d\'incantation. Bonus d\'attaque de sort = maîtrise + même modificateur. Lancer un sort de niveau 1 ou plus dépense un emplacement de ce niveau ou plus ; les emplacements reviennent au repos long (au repos court pour la magie de pacte). Les sorts mineurs ne coûtent rien.'],
  resources: ['Ressources de classe', 'Utilisations limitées de capacités (Rage, Second souffle, Inspiration bardique…). Note ici le nombre restant ; le bouton Repos long les remet au maximum.'],
  attacks: ['Attaques', 'Bonus d\'attaque d\'une arme = mod. FOR (ou DEX pour les armes à distance et à finesse) + maîtrise si tu maîtrises l\'arme. Dégâts = dé de l\'arme + le même modificateur.'],
  saves: ['Jets de sauvegarde', 'd20 + mod. de la caractéristique, + maîtrise si ta classe la maîtrise (point rempli). Ta classe te donne 2 jets de sauvegarde maîtrisés.'],
  skills: ['Compétences', 'd20 + mod. de la caractéristique, + maîtrise si tu maîtrises la compétence (point rouge), ou deux fois la maîtrise avec l\'expertise (point doré).'],
  subclass: ['Sous-classe', 'Spécialisation choisie au niveau 3 (pour toutes les classes en 2024). Elle donne des capacités supplémentaires à certains niveaux.'],
  bgbonus: ['Bonus d\'historique', 'En 2024, c\'est l\'historique (et non l\'espèce) qui augmente les caractéristiques : +2 et +1, ou +1 à trois caractéristiques, parmi les trois qu\'il propose. Aucune ne peut dépasser 20.'],
  methods: ['Méthodes de génération', 'Tableau standard : 15, 14, 13, 12, 10, 8 à répartir. Achat de points : 27 points, valeurs de 8 à 15 (le 14 coûte 7, le 15 coûte 9). Dés : 4d6 en gardant les 3 meilleurs, six fois.'],
  longrest: ['Repos', 'Repos court (1 heure) : dépenser des dés de vie, certaines capacités reviennent. Repos long (8 heures) : tous les PV, la moitié des dés de vie, tous les emplacements de sorts, et un niveau d\'épuisement en moins.'],
};

// États (règles 2024)
export const CONDITION_INFO = {
  'À terre': 'Tu ne peux te déplacer qu\'en rampant (ou te relever en dépensant la moitié de ta vitesse). Désavantage à tes jets d\'attaque. Les attaques contre toi ont l\'avantage à 1,5 m, le désavantage au-delà.',
  'Agrippé': 'Vitesse 0. Désavantage aux attaques contre toute autre cible que celui qui t\'agrippe. Il peut te déplacer avec lui. Pour te libérer : test d\'Athlétisme ou d\'Acrobaties contre son DD.',
  'Assourdi': 'Tu n\'entends rien et échoues automatiquement aux tests basés sur l\'ouïe.',
  'Aveuglé': 'Tu ne vois rien et échoues aux tests basés sur la vue. Désavantage à tes attaques ; avantage aux attaques contre toi.',
  'Charmé': 'Tu ne peux pas attaquer celui qui t\'a charmé ni le cibler avec des effets nuisibles. Il a l\'avantage à ses tests d\'interaction sociale avec toi.',
  'Empoisonné': 'Désavantage aux jets d\'attaque et aux tests de caractéristique.',
  'Entravé': 'Vitesse 0. Désavantage à tes attaques et à tes jets de sauvegarde de DEX ; avantage aux attaques contre toi.',
  'Épuisement': 'Niveaux cumulables de 1 à 6 : chaque niveau donne −2 à tous tes tests d20 et −1,5 m de vitesse. Au niveau 6 tu meurs. Un repos long retire un niveau.',
  'Étourdi': 'Tu es neutralisé. Échec automatique aux jets de sauvegarde de FOR et de DEX ; avantage aux attaques contre toi.',
  'Effrayé': 'Désavantage aux tests et aux attaques tant que la source de ta peur est en vue. Tu ne peux pas t\'en approcher volontairement.',
  'Inconscient': 'Neutralisé et à terre, tu lâches ce que tu tiens. Vitesse 0, échec aux JS de FOR et DEX, avantage aux attaques contre toi, et toute attaque qui te touche à 1,5 m est un coup critique.',
  'Invisible': 'On ne te voit pas sans magie. Avantage à l\'initiative et à tes attaques ; désavantage aux attaques contre toi, sauf si l\'attaquant te perçoit autrement.',
  'Neutralisé': 'Aucune action, action bonus ni réaction. Ta concentration est rompue et tu ne peux pas parler.',
  'Paralysé': 'Neutralisé, vitesse 0, échec aux JS de FOR et DEX. Avantage aux attaques contre toi, et toute attaque qui te touche à 1,5 m est un coup critique.',
  'Pétrifié': 'Transformé en pierre (ou autre matière inerte) : neutralisé, vitesse 0, échec aux JS de FOR et DEX, avantage aux attaques contre toi, résistance à tous les dégâts et immunité au poison.',
};

// Dons d'origine des historiques
export const FEAT_INFO = {
  alert: 'Ajoute ton bonus de maîtrise à l\'initiative. Après avoir lancé l\'initiative, tu peux échanger ton résultat avec un allié consentant.',
  crafter: 'Maîtrise de trois outils d\'artisan, 20 % de réduction sur les objets non magiques, et fabrication rapide d\'un objet pendant un repos long.',
  healer: 'Avec une trousse de soins, soigne un allié qui dépense un dé de vie (+ ton bonus de maîtrise). Tu relances les 1 sur tes dés de soins.',
  lucky: 'Points de chance égaux à ton bonus de maîtrise (repos long) : dépense-en un pour avoir l\'avantage à un de tes tests d20, ou imposer le désavantage à une attaque contre toi.',
  'mi-cleric': 'Deux sorts mineurs et un sort de niveau 1 de la liste du clerc. Tu lances ce sort une fois gratuitement par repos long (et avec tes emplacements). Caractéristique au choix : INT, SAG ou CHA.',
  'mi-druid': 'Deux sorts mineurs et un sort de niveau 1 de la liste du druide. Tu lances ce sort une fois gratuitement par repos long (et avec tes emplacements). Caractéristique au choix : INT, SAG ou CHA.',
  'mi-wizard': 'Deux sorts mineurs et un sort de niveau 1 de la liste du magicien. Tu lances ce sort une fois gratuitement par repos long (et avec tes emplacements). Caractéristique au choix : INT, SAG ou CHA.',
  musician: 'Maîtrise de trois instruments. Après un repos, en jouant, tu donnes l\'Inspiration héroïque à un nombre d\'alliés égal à ton bonus de maîtrise.',
  savage: 'Une fois par tour, quand tu touches avec une arme, lance deux fois les dés de dégâts et garde le meilleur résultat.',
  skilled: 'Maîtrise de trois compétences ou outils au choix.',
  brawler: 'Frappe à mains nues à 1d4 + FOR, relance des 1 aux dégâts à mains nues, maîtrise des armes improvisées, et repousse la cible de 1,5 m une fois par tour.',
  tough: 'Tes PV maximum augmentent de 2 par niveau (déjà compté dans les PV suggérés).',
};

// Capacités de niveau 1 des classes du Manuel des joueurs
export const CLASS_FEATURE_INFO = {
  barbarian: [
    ['Rage', 'Action bonus. Résistance aux dégâts contondants, perforants et tranchants, bonus aux dégâts avec la FOR, avantage aux tests et JS de FOR. Pas de sorts ni de concentration. Dure jusqu\'à la fin de ton prochain tour, prolongeable jusqu\'à 10 minutes.'],
    ['Défense sans armure', 'Sans armure, CA = 10 + DEX + CON (bouclier autorisé).'],
    ['Maîtrise des armes', 'Tu utilises la propriété de maîtrise de deux types d\'armes (Brisure, Sape, Poussée…).'],
  ],
  bard: [
    ['Inspiration bardique', 'Action bonus : un allié reçoit un d6 qu\'il peut ajouter à un test d20 dans l\'heure. Utilisations = mod. CHA par repos long.'],
    ['Incantation', 'Sorts de barde, caractéristique CHA. Tu peux utiliser un instrument comme focaliseur.'],
  ],
  cleric: [
    ['Incantation', 'Sorts de clerc préparés, caractéristique SAG. Symbole sacré comme focaliseur.'],
    ['Ordre divin', 'Protecteur (armures lourdes et armes de guerre) ou Thaumaturge (un sort mineur de plus et bonus en Arcanes et Religion).'],
  ],
  druid: [
    ['Incantation', 'Sorts de druide préparés, caractéristique SAG.'],
    ['Druidique', 'Langue secrète des druides ; Communication avec les animaux toujours préparé.'],
    ['Ordre primitif', 'Magicien (un sort mineur de plus et bonus en Arcanes et Nature) ou Gardien (armes de guerre et armures intermédiaires).'],
  ],
  fighter: [
    ['Style de combat', 'Un don de style de combat au choix (Archerie, Défense, Duel…).'],
    ['Second souffle', 'Action bonus : regagne 1d10 + niveau de guerrier PV. 2 utilisations, une revient au repos court.'],
    ['Maîtrise des armes', 'Tu utilises la propriété de maîtrise de trois types d\'armes.'],
  ],
  monk: [
    ['Arts martiaux', 'Frappes à mains nues et armes de moine avec la DEX, dé de dégâts d6, et une frappe à mains nues en action bonus.'],
    ['Défense sans armure', 'Sans armure ni bouclier, CA = 10 + DEX + SAG.'],
  ],
  paladin: [
    ['Imposition des mains', 'Réserve de PV = 5 × niveau. Action bonus : soigne au toucher, ou dépense 5 points pour retirer l\'état empoisonné.'],
    ['Incantation', 'Sorts de paladin préparés, caractéristique CHA.'],
    ['Maîtrise des armes', 'Tu utilises la propriété de maîtrise de deux types d\'armes.'],
  ],
  ranger: [
    ['Incantation', 'Sorts de rôdeur préparés, caractéristique SAG.'],
    ['Ennemi juré', 'Marque du chasseur toujours préparé ; tu peux le lancer deux fois par repos long sans emplacement.'],
    ['Maîtrise des armes', 'Tu utilises la propriété de maîtrise de deux types d\'armes.'],
  ],
  rogue: [
    ['Expertise', 'Double bonus de maîtrise sur deux compétences maîtrisées (clique deux fois sur leur point).'],
    ['Attaque sournoise', 'Une fois par tour, +1d6 dégâts avec une arme à finesse ou à distance si tu as l\'avantage, ou si un allié est à 1,5 m de la cible.'],
    ['Argot des voleurs', 'Langage secret des voleurs, plus une langue au choix.'],
    ['Maîtrise des armes', 'Tu utilises la propriété de maîtrise de deux types d\'armes.'],
  ],
  sorcerer: [
    ['Incantation', 'Sorts d\'ensorceleur, caractéristique CHA.'],
    ['Sorcellerie innée', 'Action bonus, 1 minute : +1 au DD de tes sorts et avantage à tes attaques de sort. 2 fois par repos long.'],
  ],
  warlock: [
    ['Manifestations occultes', 'Une invocation au niveau 1 (par exemple un pacte), davantage aux niveaux suivants.'],
    ['Magie de pacte', 'Peu d\'emplacements, toujours du plus haut niveau disponible, récupérés au repos court. Caractéristique CHA.'],
  ],
  wizard: [
    ['Incantation', 'Sorts de magicien préparés depuis ton grimoire, caractéristique INT.'],
    ['Adepte des rituels', 'Tu lances en rituel les sorts rituels de ton grimoire sans les préparer.'],
    ['Restauration arcanique', 'Une fois par jour, après un repos court, récupère des emplacements dont le total des niveaux vaut au plus la moitié de ton niveau (arrondi au supérieur), sans niveau 6 ou plus.'],
  ],
};

// Traits des espèces du Manuel des joueurs
export const SPECIES_INFO = {
  aasimar: [
    ['Résistance céleste', 'Résistance aux dégâts nécrotiques et radiants.'],
    ['Vision dans le noir', '18 m.'],
    ['Mains guérisseuses', 'Action : soigne une créature touchée d\'un nombre de d4 égal à ton bonus de maîtrise. Une fois par repos long.'],
    ['Porteur de lumière', 'Tu connais le sort mineur Lumière (CHA).'],
    ['Révélation céleste', 'Niveau 3 : action bonus, 1 minute, une fois par repos long. Ailes célestes (vol), Rayonnement intérieur (lumière et dégâts radiants autour de toi) ou Voile nécrotique (effroi). Une fois par tour, dégâts supplémentaires égaux à ton bonus de maîtrise.'],
  ],
  dragonborn: [
    ['Ascendance draconique', 'La couleur de ton dragon fixe le type de dégâts de ton souffle et de ta résistance.'],
    ['Souffle', 'Remplace une attaque : cône de 4,5 m ou ligne de 9 m. JS de DEX (DD 8 + CON + maîtrise), 1d10 dégâts (2d10 au niv. 5, 3d10 au 11, 4d10 au 17). Utilisations = bonus de maîtrise par repos long.'],
    ['Résistance aux dégâts', 'Résistance au type de dégâts de ton ascendance.'],
    ['Vision dans le noir', '18 m.'],
    ['Vol draconique', 'Niveau 5 : action bonus, ailes pendant 10 minutes (vitesse de vol = ta vitesse). Une fois par repos long.'],
  ],
  dwarf: [
    ['Vision dans le noir', '36 m.'],
    ['Résilience naine', 'Résistance aux dégâts de poison et avantage pour éviter ou terminer l\'état empoisonné.'],
    ['Robustesse naine', '+1 PV maximum par niveau (déjà compté dans les PV suggérés).'],
    ['Connaissance de la pierre', 'Action bonus : perception des vibrations (18 m) pendant 10 minutes sur une surface de pierre. Utilisations = bonus de maîtrise par repos long.'],
  ],
  elf: [
    ['Vision dans le noir', '18 m (36 m pour les drows).'],
    ['Lignage elfique', 'Drow : Lumières dansantes, puis Lueurs féeriques (niv. 3) et Ténèbres (niv. 5). Haut-elfe : Prestidigitation, puis Détection de la magie et Foulée brumeuse. Sylvestre : vitesse 10,5 m, Druidisme, puis Grande foulée et Passage sans trace.'],
    ['Ascendance féerique', 'Avantage pour éviter ou terminer l\'état charmé.'],
    ['Sens aiguisés', 'Maîtrise d\'Intuition, de Perception ou de Survie.'],
    ['Transe', 'Ton repos long ne dure que 4 heures, en méditation consciente.'],
  ],
  gnome: [
    ['Vision dans le noir', '18 m.'],
    ['Ruse gnome', 'Avantage aux jets de sauvegarde d\'INT, de SAG et de CHA.'],
    ['Lignage gnome', 'Des forêts : Illusion mineure et Communication avec les animaux. Des roches : Réparation, Prestidigitation et petits mécanismes d\'horlogerie.'],
  ],
  goliath: [
    ['Ascendance géante', 'Un pouvoir de géant (nuage, feu, givre, colline, pierre ou tempête) : téléportation, dégâts en plus, renversement, réduction de dégâts… Utilisations = bonus de maîtrise par repos long.'],
    ['Forme gigantesque', 'Niveau 5 : action bonus, tu deviens de taille G pendant 10 minutes (avantage aux tests de FOR, +3 m de vitesse). Une fois par repos long.'],
    ['Carrure puissante', 'Avantage pour te libérer d\'une prise ; tu comptes comme une taille au-dessus pour porter.'],
  ],
  halfling: [
    ['Brave', 'Avantage pour éviter ou terminer l\'état effrayé.'],
    ['Agilité halfeline', 'Tu peux traverser l\'espace d\'une créature plus grande que toi.'],
    ['Chanceux', 'Quand tu obtiens 1 au d20 d\'un test, relance-le et garde le nouveau résultat.'],
    ['Discrétion naturelle', 'Tu peux te cacher derrière une créature plus grande que toi.'],
  ],
  human: [
    ['Ingénieux', 'Tu gagnes l\'Inspiration héroïque à chaque repos long.'],
    ['Talentueux', 'Maîtrise d\'une compétence au choix.'],
    ['Polyvalent', 'Un don d\'origine au choix, en plus de celui de l\'historique.'],
  ],
  orc: [
    ['Poussée d\'adrénaline', 'Foncer en action bonus et gagner des PV temporaires égaux à ton bonus de maîtrise. Utilisations = bonus de maîtrise par repos court ou long.'],
    ['Vision dans le noir', '36 m.'],
    ['Endurance implacable', 'Quand tu tombes à 0 PV sans être tué, tu restes à 1 PV. Une fois par repos long.'],
  ],
  tiefling: [
    ['Vision dans le noir', '18 m.'],
    ['Héritage fiélon', 'Abyssal : résistance au poison, Bouffée de poison, puis Rayon empoisonné et Immobilisation de personne. Chthonien : résistance nécrotique, Contact glacial, puis Simulacre de vie et Rayon affaiblissant. Infernal : résistance au feu, Trait de feu, puis Représailles infernales et Ténèbres.'],
    ['Présence surnaturelle', 'Tu connais le sort mineur Thaumaturgie.'],
  ],
};
