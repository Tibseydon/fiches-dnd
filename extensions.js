// Contenus des extensions (officielles et tierces).
// Seules les données de jeu (noms, dé de vie, jets de sauvegarde…) sont reprises,
// jamais le texte des livres. `verify: true` signale une donnée non confirmée :
// le joueur peut l'ajuster sur sa fiche (« Réglages de classe »).

export const SOURCES = {
  phb: 'Manuel des joueurs 2024',
  eberron: 'Eberron : Forge of the Artificer',
  quickstone: 'Frontiers of Eberron : Quickstone',
  faerun: 'Forgotten Realms : Heroes of Faerûn',
  astarion: "Astarion's Book of Hungers",
  lorwyn: 'Lorwyn : First Light',
  ravenloft: 'Ravenloft : The Horrors Within',
  arcana: 'Arcana Unleashed',
  valda: "Valda's Spire of Secrets",
  gunslinger: 'Pistolero (Gunslinger)',
  steinhardt: "Steinhardt's Guide to the Eldritch Hunt",
  northlands: 'Northlands Worldbook',
  illrigger: 'Illrigger (MCDM)',
  grimhollow: "Grim Hollow : Player's Guide",
  drakkenheim: "Sebastian Crowe's Guide to Drakkenheim",
  crookedmoon: 'The Crooked Moon',
  custom: 'Personnalisé',
};

const ALL = ['acrobatics', 'arcana', 'athletics', 'stealth', 'animal', 'sleight', 'history', 'intimidation',
  'insight', 'investigation', 'medicine', 'nature', 'perception', 'persuasion', 'religion', 'performance',
  'survival', 'deception'];

// Classe dont seuls le nom et les sous-classes sont confirmés.
const thirdParty = (id, name, source, extra = {}) => ({
  id, name, source,
  hd: 8, primary: '—', saves: [], skillCount: 2, skills: ALL,
  caster: null, spellAb: null,
  armor: `Voir ${SOURCES[source]}`, weapons: `Voir ${SOURCES[source]}`, tools: '',
  features: `Voir ${SOURCES[source]}`,
  resources: [], subclasses: [],
  desc: `Classe de ${SOURCES[source]}.`,
  verify: true,
  ...extra,
});

export const EXTRA_CLASSES = [
  {
    id: 'artificer', name: 'Artificier', source: 'eberron', original: 'Artificer', hd: 8, primary: 'INT', saves: ['con', 'int'],
    skillCount: 2, skills: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleight'],
    caster: 'half', spellAb: 'int',
    armor: 'Armures légères et intermédiaires, boucliers', weapons: 'Armes courantes',
    tools: "Outils de voleur, outils de bricoleur, un outil d'artisan",
    features: 'Bricolage magique, Incantation',
    resources: [],
    subclasses: ['Alchimiste', 'Armurier', 'Artilleur', 'Forgeron de guerre', 'Cartographe'],
    desc: 'Inventeur qui insuffle la magie dans les objets.',
  },
  thirdParty('gunslinger', 'Pistolero', 'gunslinger', {
    original: 'Gunslinger', hd: 8, primary: 'DEX', saves: ['dex', 'cha'],
    subclasses: ['Œil de lynx', 'Flambeur', 'Agent secret', 'Tireur arcanique', 'Tir acrobatique', 'Chapeau blanc'],
    desc: "Tireur d'élite aux armes à feu (version 2024 de Valda's Spire of Secrets).",
  }),
  thirdParty('illrigger', 'Illrigger', 'illrigger', {
    hd: 10, primary: 'FOR ou DEX, CHA', saves: ['con', 'cha'], spellAb: 'cha',
    skills: ['arcana', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'persuasion', 'religion', 'stealth'],
    features: 'Interdit funeste (DD = 8 + maîtrise + CHA)',
    subclasses: ['Architecte de la ruine', 'Briseur de douleur', 'Maître des ombres', 'Chevalier sanguin'],
    desc: 'Chevalier infernal lié par un contrat diabolique.',
  }),
  thirdParty('monsterhunter', 'Chasseur de monstres', 'grimhollow', {
    original: 'Monster Hunter',
    hd: 10, primary: 'INT', saves: ['str', 'dex'],
    subclasses: ['Découpeur', 'Dévoreur', 'Occultiste', 'Trappeur'],
    desc: 'Martial intelligent spécialisé dans la traque des monstres.',
  }),
  thirdParty('apothecary', 'Apothicaire', 'drakkenheim', {
    original: 'Apothecary',
    hd: 8, primary: 'INT', saves: ['int', 'wis'], caster: 'full', spellAb: 'int',
    subclasses: ['Aliéniste', 'Chimiste', 'Exorciste', 'Mutagéniste', 'Pathogéniste'],
    desc: 'Savant des potions et des remèdes occultes.',
  }),
  thirdParty('jaeger', 'Jaeger', 'steinhardt', {
    saves: ['dex', 'int'],
    subclasses: ['Chapitre absolu', 'Chapitre hérétique', 'Chapitre maraudeur', 'Chapitre du salut', 'Chapitre sanguin'],
    desc: 'Chasseur de l’horreur eldritch.',
  }),
  thirdParty('alchemist', 'Alchimiste', 'valda', { original: 'Alchemist' }),
  thirdParty('captain', 'Capitaine', 'valda', { original: 'Captain' }),
  thirdParty('craftsman', 'Artisan', 'valda', { original: 'Craftsman' }),
  thirdParty('investigator', 'Enquêteur', 'valda', { original: 'Investigator' }),
  thirdParty('martyr', 'Martyr', 'valda', { original: 'Martyr' }),
  thirdParty('necromancer', 'Nécromancien', 'valda', { original: 'Necromancer', hd: 6, saves: ['con', 'int'] }),
  thirdParty('warden', 'Gardien', 'valda', { original: 'Warden' }),
  thirdParty('warmage', 'Mage de guerre', 'valda', { original: 'Warmage', saves: ['con', 'int'] }),
  thirdParty('witch', 'Sorcière', 'valda', { original: 'Witch' }),
  {
    id: 'custom', name: 'Autre classe (personnalisée)', source: 'custom', hd: 8, primary: '—', saves: [],
    skillCount: 2, skills: ALL, caster: null, spellAb: null,
    armor: '', weapons: '', tools: '', features: '', resources: [], subclasses: [],
    desc: "Pour une classe absente de la liste : tu règles toi-même le dé de vie, les jets de sauvegarde et la magie sur la fiche.",
    verify: true,
  },
];

// Sous-classes ajoutées aux classes existantes : [nom, source]
export const EXTRA_SUBCLASSES = {
  barbarian: [
    ['Voie du réceptacle de foudre', 'steinhardt', 'Path of the Lightning Vessel'], ['Voie du titan', 'northlands', 'Path of the Titan'],
    ['Voie du fracturé', 'grimhollow', 'Fractured'], ["Voie de l'esprit primordial", 'grimhollow', "Primal Spirit"], ['Voie des morts courroucés', 'grimhollow', 'Wrathful Dead'],
    ['Voie de la rage brumeuse', 'drakkenheim', 'Path of the Haze Rager'], ['Voie des anciens dieux', 'drakkenheim', 'Path of the Old Gods'],
    ["Voie de l'expérience", 'crookedmoon', "Path of the Experiment"], ["Voie de l'éclat démoniaque", 'quickstone', "Path of the Demonshard"],
    ['Voie du mage musclé', 'valda', 'Path of the Muscle Wizard'],
  ],
  bard: [
    ['Scalde', 'northlands', 'Skald'], ['Collège des aventuriers', 'grimhollow', 'College of Adventurers'], ['Collège des bouffons', 'grimhollow', 'College of Fools'],
    ['Collège des requiems', 'grimhollow', 'College of Requiems'], ['Collège des sifflets', 'crookedmoon', 'College of Whistles'], ['Collège des baguettes', 'quickstone', 'College of Wands'],
    ['Collège de la lune', 'faerun', 'College of the Moon'], ['Collège des esprits', 'ravenloft'], ['Collège des masques', 'valda', 'College of Masks'],
  ],
  cleric: [
    ['Lié aux Nornes', 'northlands', 'Nornbound'], ['Domaine occulte', 'grimhollow', 'Eldritch Domain'], ["Domaine de l'inquisition", 'grimhollow', "Inquisition Domain"],
    ['Domaine de la purification', 'grimhollow', 'Purification Domain'], ['Domaine de la moisson', 'crookedmoon', 'Harvest Domain'], ['Domaine du commerce', 'quickstone', 'Commerce Domain'],
    ['Domaine de la connaissance', 'faerun'], ['Domaine de la tombe', 'ravenloft'],
    ['Domaine des arcanes', 'arcana'], ['Domaine du dragon', 'valda', 'Dragon Domain'],
  ],
  druid: [
    ['Cercle de la symbiose', 'steinhardt', 'Circle of Symbiosis'], ['Cercle de Fenris', 'northlands', 'Circle of Fenris'], ['Cercle du sang', 'grimhollow', 'Circle of Blood'],
    ["Cercle de l'entropie", 'grimhollow', "Circle of Entropy"], ['Cercle de la mutation', 'grimhollow', 'Circle of Mutation'],
    ['Cercle de la contamination', 'drakkenheim', 'Circle of Contamination'], ['Cercle des anciennes voies', 'crookedmoon', 'Circle of the Old Ways'],
    ["Cercle de l'osier", 'crookedmoon', "Circle of Wicker"], ['Druide urbain', 'valda', 'Urban Druid'],
  ],
  fighter: [
    ['Limier de sang', 'steinhardt', 'Blood Hound'], ['Viking', 'northlands'], ['Guerrier rempart', 'grimhollow', 'Bulwark Warrior'],
    ['Creuset vivant', 'grimhollow', 'Living Crucible'], ['Veilleur de nuit', 'grimhollow', 'Nightwatcher'], ['Commandant', 'drakkenheim', 'Commander'],
    ['Garde des tumulus', 'crookedmoon', 'Barrow Guard'], ['Banneret', 'faerun'], ['Archer arcanique', 'arcana'],
    ['Explorateur de donjons', 'valda', 'Dungeoneer'], ['Pistolero (Matthew Mercer)', 'gunslinger', 'Gunslinger (Matthew Mercer)'],
  ],
  monk: [
    ['Voie de la couronne de plomb', 'grimhollow', 'Way of the Leaden Crown'], ["Voie de l'orgueil", 'grimhollow', "Way of Pride"], ['Voie du regret', 'grimhollow', 'Way of Regret'],
    ['Voie de la main arcanique', 'drakkenheim', 'Way of the Arcane Hand'], ['Combattant de la brume pestilentielle', 'crookedmoon', 'Warrior of the Pestilent Haze'],
    ['Combattant des arts mystiques', 'arcana', 'Warrior of the Mystic Arts'], ['Combattant de la rue', 'valda', 'Warrior of the Street'],
  ],
  paladin: [
    ['Serment de la chasse occulte', 'steinhardt', 'Oath of the Eldritch Hunt'], ['Serment du Valhalla', 'northlands', 'Oath of Valhalla'],
    ['Serment de la pestilence', 'grimhollow', 'Oath of Pestilence'], ['Serment du carnage', 'grimhollow', 'Oath of Slaughter'], ['Serment du zèle', 'grimhollow', 'Oath of Zeal'],
    ['Serment des maléfices', 'drakkenheim', 'Oath of Hexes'], ['Serment du châtiment', 'crookedmoon', 'Oath of Castigation'],
    ['Serment des nobles génies', 'faerun', 'Oath of the Noble Genies'], ['Serment des réjouissances', 'valda', 'Oath of Revelry'],
  ],
  ranger: [
    ['Conclave du tortionnaire', 'steinhardt', 'Torturer Conclave'], ['Faucheur vert', 'grimhollow', 'Green Reaper'], ['Archer primordial', 'grimhollow', 'Primordial Archer'],
    ['Seigneur de la vermine', 'grimhollow', 'Vermin Lord'], ['Rôdeur urbain', 'drakkenheim', 'Urban Ranger'], ['Sinistre présage', 'crookedmoon', 'Grim Harbinger'],
    ['Limier', 'quickstone', 'Bloodhound'], ["Arpenteur de l'hiver", 'faerun', "Winter Walker"], ['Gardien du creux', 'ravenloft', 'Hollow Warden'],
  ],
  rogue: [
    ['Lame radieuse', 'steinhardt', 'Blade of Radiance'], ['Bandit de grand chemin', 'grimhollow', 'Highway Rider'], ['Porte-malheur', 'grimhollow', 'Misfortune Bringer'],
    ['Voleur sanguin', 'grimhollow', 'Sanguine Thief'], ['Contrebandier', 'drakkenheim', 'Smuggler'], ['Pécheur', 'crookedmoon', 'Sinner'],
    ['Héritier des Trois', 'faerun', 'Scion of the Three'], ['Fantôme', 'ravenloft'], ['Traqueur arachnide', 'valda', 'Arachnoid Stalker'],
  ],
  sorcerer: [
    ["Invocateur d'esprits", 'northlands', "Spirit Caller"], ["Lignée de l'apocalypse", 'grimhollow', "Apocalypse Bloodline"], ['Lignée hantée', 'grimhollow', 'Haunted Bloodline'],
    ['Lignée misérable', 'grimhollow', 'Wretched Bloodline'], ['Âme du délirium', 'drakkenheim', 'Delerium Soul'], ['Sorcellerie écarlate', 'crookedmoon', 'Crimson Sorcery'],
    ['Sorcellerie de la némésis', 'quickstone', 'Nemesis Sorcery'], ['Sorcellerie du feu magique', 'faerun', 'Spellfire Sorcery'],
    ["Sorcellerie de l'ombre", 'ravenloft', "Shadow Sorcery"],
  ],
  warlock: [
    ['Le Trompeur', 'northlands', 'Trickster'], ['Le Cercle de sorcières', 'grimhollow', 'The Coven'], ['Le Premier Vampire', 'grimhollow', 'The First Vampire'],
    ['Le Parasite', 'grimhollow', 'The Parasite'], ['Protecteur le Grand Fou', 'crookedmoon', 'Great Fool Patron'], ['Protecteur le Roi cornu', 'crookedmoon', 'Horned King Patron'],
    ['Protecteur le Souverain de pierre', 'quickstone', 'Stone Sovereign Patron'], ['Protecteur le Mort-vivant', 'ravenloft'],
    ['Protecteur le Vestige', 'arcana', 'Vestige Patron'], ['Toi du futur', 'valda', 'Future You'],
  ],
  wizard: [
    ['Ostéomancien', 'steinhardt', 'Osteomancer'], ['Démonologue', 'grimhollow', 'Daemonologist'], ['Médecin de peste', 'grimhollow', 'Plague Doctor'],
    ['Sangromancien', 'grimhollow', 'Sangromancer'], ['Malfaisant', 'drakkenheim', 'Malfeasant'], ['Occultiste', 'crookedmoon', 'Occultist'],
    ['Philosophe', 'crookedmoon', 'Philosopher'], ['Chantelame', 'faerun'], ['Invocateur', 'arcana'],
    ['Enchanteur', 'arcana'], ['Nécromancien', 'arcana'], ['Transmutateur', 'arcana'],
    ['Mage des projectiles magiques', 'valda', 'Magic Missile Mage'],
  ],
  artificer: [
    ['Réanimateur', 'ravenloft', 'Reanimator'],
  ],
};

// Espèces dont les traits ne sont pas repris : le joueur les recopie depuis son livre.
const sp = (id, name, source, extra = {}) => ({
  id, name, source, speed: 9, size: '—', darkvision: 0,
  traits: `Traits : voir ${SOURCES[source]}`,
  ...extra,
});

export const EXTRA_SPECIES = [
  sp('changeling', 'Changelin', 'eberron', { original: 'Changeling' }),
  sp('kalashtar', 'Kalashtar', 'eberron'),
  sp('khoravar', 'Khoravar', 'eberron'),
  sp('shifter', 'Changeforme', 'eberron', { original: 'Shifter' }),
  sp('warforged', 'Forgelier', 'eberron', { original: 'Warforged' }),
  sp('gargoyle', 'Gargouille', 'quickstone', { original: 'Gargoyle' }),
  sp('gnoll', 'Gnoll', 'quickstone'),
  sp('harpy', 'Harpie', 'quickstone', { original: 'Harpy' }),
  sp('medusa', 'Méduse', 'quickstone', { original: 'Medusa' }),
  sp('worg', 'Worg', 'quickstone'),
  sp('dhampir', 'Dhampir', 'ravenloft', { traits: "Traits : voir Ravenloft : The Horrors Within (aussi dans Astarion's Book of Hungers)" }),
  sp('hexblood', 'Sang-maléfice', 'ravenloft', { original: 'Hexblood' }),
  sp('lupin', 'Lupin', 'ravenloft'),
  sp('reborn', 'Ressuscité', 'ravenloft', { original: 'Reborn' }),
  sp('lorwyn-changeling', 'Changelin de Lorwyn', 'lorwyn', { original: 'Lorwyn Changeling' }),
  sp('rimekin', 'Givrin', 'lorwyn', { original: 'Rimekin' }),
  sp('boggart', 'Boggart', 'lorwyn'),
  sp('faerie', 'Fée', 'lorwyn', { original: 'Faerie' }),
  sp('flamekin', 'Flammelin', 'lorwyn', { original: 'Flamekin' }),
  sp('kithkin', 'Kithkin', 'lorwyn'),
  sp('geppettin', 'Geppettin', 'valda'),
  sp('mandrake', 'Mandragore', 'valda', { original: 'Mandrake' }),
  sp('manikin', 'Mannequin', 'steinhardt', { original: 'Manikin' }),
  sp('scourgeborne', 'Né du fléau', 'steinhardt', { original: 'Scourgeborne' }),
  sp('demidritch', 'Demidritch', 'steinhardt'),
  sp('bearfolk', 'Peuple-ours', 'northlands', { original: 'Bearfolk' }),
  sp('beastkin', 'Sang-de-bête', 'northlands', { original: 'Beastkin', lineages: ['Aviaire', 'Agile', 'Aquatique', 'Robuste'], lineageLabel: 'Adaptation' }),
  sp('giantkin', 'Sang-de-géant', 'northlands', { original: 'Giantkin' }),
  sp('trollkin', 'Sang-de-troll', 'northlands', { original: 'Trollkin' }),
  sp('werekin', 'Sang-garou', 'northlands', { original: 'Werekin' }),
  sp('dreamer', 'Rêveur', 'grimhollow', { original: 'Dreamer' }),
  sp('grudgel', 'Grudgel', 'grimhollow'),
  sp('laneshi', 'Laneshi', 'grimhollow'),
  sp('ogresh', 'Ogresh', 'grimhollow'),
  sp('accursed', 'Maudit', 'grimhollow', { original: 'Accursed' }),
  sp('arisen', 'Relevé', 'grimhollow', { original: 'Arisen' }),
  sp('disembodied', 'Désincarné', 'grimhollow', { original: 'Disembodied' }),
  sp('downcast', 'Déchu', 'grimhollow', { original: 'Downcast' }),
  sp('wechselkind', 'Wechselkind', 'grimhollow'),
  sp('wulven', 'Wulven', 'grimhollow'),
  ...Object.entries({
    Ashborn: 'Né des cendres',
    Azureborn: "Né de l'azur",
    Bogborn: 'Né des marais',
    Curseborn: 'Né de la malédiction',
    Deepborn: 'Né des profondeurs',
    Gnarlborn: 'Né du bois noueux',
    Graveborn: 'Né des tombes',
    Harvestborn: 'Né des moissons',
    Plagueborn: 'Né de la peste',
    Relicborn: 'Né des reliques',
    Silkborn: 'Né de la soie',
    Stoneborn: 'Né de la pierre',
    Threadborn: 'Né du fil',
  }).map(([en, fr]) => sp(en.toLowerCase(), fr, 'crookedmoon', { original: en })),
  {
    id: 'custom', name: 'Autre espèce (personnalisée)', source: 'custom', speed: 9, size: '—', darkvision: 0,
    traits: '', desc: 'Pour une espèce absente de la liste.',
  },
];

// Noms d'origine des sous-classes des classes d'extension (pour les retrouver dans le livre).
export const SUBCLASS_ORIGINAL = {
  'Œil de lynx': 'Deadeye',
  'Flambeur': 'High Roller',
  'Agent secret': 'Secret Agent',
  'Tireur arcanique': 'Spellslinger',
  'Tir acrobatique': 'Trick Shot',
  'Chapeau blanc': 'White Hat',
  'Architecte de la ruine': 'Architect of Ruin',
  'Briseur de douleur': 'Painkiller',
  'Maître des ombres': 'Shadowmaster',
  'Chevalier sanguin': 'Sanguine Knight',
  'Découpeur': 'Carver',
  'Dévoreur': 'Devourer',
  'Occultiste': 'Occultist',
  'Trappeur': 'Trapper',
  'Aliéniste': 'Alienist',
  'Chimiste': 'Chemist',
  'Exorciste': 'Exorcist',
  'Mutagéniste': 'Mutagenist',
  'Pathogéniste': 'Pathogenist',
  'Chapitre absolu': 'Absolute Chapter',
  'Chapitre hérétique': 'Heretic Chapter',
  'Chapitre maraudeur': 'Marauder Chapter',
  'Chapitre du salut': 'Salvation Chapter',
  'Chapitre sanguin': 'Sanguine Chapter',
};

// Lignages ajoutés aux espèces du Manuel des joueurs.
export const EXTRA_LINEAGES = {
  elf: ['Elfe de Lorwyn', 'Elfe de Shadowmoor', 'Elfe de lune', 'Elfe de soleil'],
};
