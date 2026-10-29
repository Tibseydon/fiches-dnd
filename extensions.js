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
  gunslinger: 'Gunslinger',
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
    id: 'artificer', name: 'Artificier', source: 'eberron', hd: 8, primary: 'INT', saves: ['con', 'int'],
    skillCount: 2, skills: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleight'],
    caster: 'half', spellAb: 'int',
    armor: 'Armures légères et intermédiaires, boucliers', weapons: 'Armes courantes',
    tools: "Outils de voleur, outils de bricoleur, un outil d'artisan",
    features: 'Bricolage magique, Incantation',
    resources: [],
    subclasses: ['Alchimiste', 'Armurier', 'Artilleur', 'Forgeron de guerre', 'Cartographe'],
    desc: 'Inventeur qui insuffle la magie dans les objets.',
  },
  thirdParty('gunslinger', 'Gunslinger', 'gunslinger', {
    hd: 8, primary: 'DEX', saves: ['dex', 'cha'],
    subclasses: ['Deadeye', 'High Roller', 'Secret Agent', 'Spellslinger', 'Trick Shot', 'White Hat'],
    desc: "Tireur d'élite aux armes à feu (version 2024 de Valda's Spire of Secrets).",
  }),
  thirdParty('illrigger', 'Illrigger', 'illrigger', {
    hd: 10, primary: 'FOR ou DEX, CHA', saves: ['con', 'cha'], spellAb: 'cha',
    skills: ['arcana', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'persuasion', 'religion', 'stealth'],
    features: 'Interdit funeste (DD = 8 + maîtrise + CHA)',
    subclasses: ['Architect of Ruin', 'Painkiller', 'Shadowmaster', 'Sanguine Knight'],
    desc: 'Chevalier infernal lié par un contrat diabolique.',
  }),
  thirdParty('monsterhunter', 'Chasseur de monstres', 'grimhollow', {
    hd: 10, primary: 'INT', saves: ['str', 'dex'],
    subclasses: ['Carver', 'Devourer', 'Occultist', 'Trapper'],
    desc: 'Martial intelligent spécialisé dans la traque des monstres.',
  }),
  thirdParty('apothecary', 'Apothicaire', 'drakkenheim', {
    hd: 8, primary: 'INT', saves: ['int', 'wis'], caster: 'full', spellAb: 'int',
    subclasses: ['Alienist', 'Chemist', 'Exorcist', 'Mutagenist', 'Pathogenist'],
    desc: 'Savant des potions et des remèdes occultes.',
  }),
  thirdParty('jaeger', 'Jaeger', 'steinhardt', {
    saves: ['dex', 'int'],
    subclasses: ['Absolute Chapter', 'Heretic Chapter', 'Marauder Chapter', 'Salvation Chapter', 'Sanguine Chapter'],
    desc: 'Chasseur de l’horreur eldritch.',
  }),
  thirdParty('alchemist', 'Alchimiste', 'valda'),
  thirdParty('captain', 'Capitaine', 'valda'),
  thirdParty('craftsman', 'Artisan (Craftsman)', 'valda'),
  thirdParty('investigator', 'Enquêteur', 'valda'),
  thirdParty('martyr', 'Martyr', 'valda'),
  thirdParty('necromancer', 'Nécromancien', 'valda', { hd: 6, saves: ['con', 'int'] }),
  thirdParty('warden', 'Gardien (Warden)', 'valda'),
  thirdParty('warmage', 'Mage de guerre', 'valda', { saves: ['con', 'int'] }),
  thirdParty('witch', 'Sorcière (Witch)', 'valda'),
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
    ['Path of the Lightning Vessel', 'steinhardt'], ['Path of the Titan', 'northlands'],
    ['Fractured', 'grimhollow'], ['Primal Spirit', 'grimhollow'], ['Wrathful Dead', 'grimhollow'],
    ['Path of the Haze Rager', 'drakkenheim'], ['Path of the Old Gods', 'drakkenheim'],
    ['Path of the Experiment', 'crookedmoon'], ['Path of the Demonshard', 'quickstone'],
    ['Path of the Muscle Wizard', 'valda'],
  ],
  bard: [
    ['Skald', 'northlands'], ['College of Adventurers', 'grimhollow'], ['College of Fools', 'grimhollow'],
    ['College of Requiems', 'grimhollow'], ['College of Whistles', 'crookedmoon'], ['College of Wands', 'quickstone'],
    ['College of the Moon', 'faerun'], ['Collège des esprits', 'ravenloft'], ['College of Masks', 'valda'],
  ],
  cleric: [
    ['Nornbound', 'northlands'], ['Eldritch Domain', 'grimhollow'], ['Inquisition Domain', 'grimhollow'],
    ['Purification Domain', 'grimhollow'], ['Harvest Domain', 'crookedmoon'], ['Commerce Domain', 'quickstone'],
    ['Domaine de la connaissance', 'faerun'], ['Domaine de la tombe', 'ravenloft'],
    ['Domaine des arcanes', 'arcana'], ['Dragon Domain', 'valda'],
  ],
  druid: [
    ['Circle of Symbiosis', 'steinhardt'], ['Circle of Fenris', 'northlands'], ['Circle of Blood', 'grimhollow'],
    ['Circle of Entropy', 'grimhollow'], ['Circle of Mutation', 'grimhollow'],
    ['Circle of Contamination', 'drakkenheim'], ['Circle of the Old Ways', 'crookedmoon'],
    ['Circle of Wicker', 'crookedmoon'], ['Urban Druid', 'valda'],
  ],
  fighter: [
    ['Blood Hound', 'steinhardt'], ['Viking', 'northlands'], ['Bulwark Warrior', 'grimhollow'],
    ['Living Crucible', 'grimhollow'], ['Nightwatcher', 'grimhollow'], ['Commander', 'drakkenheim'],
    ['Barrow Guard', 'crookedmoon'], ['Banneret', 'faerun'], ['Archer arcanique', 'arcana'],
    ['Dungeoneer', 'valda'], ['Gunslinger (Matthew Mercer)', 'gunslinger'],
  ],
  monk: [
    ['Way of the Leaden Crown', 'grimhollow'], ['Way of Pride', 'grimhollow'], ['Way of Regret', 'grimhollow'],
    ['Way of the Arcane Hand', 'drakkenheim'], ['Warrior of the Pestilent Haze', 'crookedmoon'],
    ['Warrior of the Mystic Arts', 'arcana'], ['Warrior of the Street', 'valda'],
  ],
  paladin: [
    ['Oath of the Eldritch Hunt', 'steinhardt'], ['Oath of Valhalla', 'northlands'],
    ['Oath of Pestilence', 'grimhollow'], ['Oath of Slaughter', 'grimhollow'], ['Oath of Zeal', 'grimhollow'],
    ['Oath of Hexes', 'drakkenheim'], ['Oath of Castigation', 'crookedmoon'],
    ['Oath of the Noble Genies', 'faerun'], ['Oath of Revelry', 'valda'],
  ],
  ranger: [
    ['Torturer Conclave', 'steinhardt'], ['Green Reaper', 'grimhollow'], ['Primordial Archer', 'grimhollow'],
    ['Vermin Lord', 'grimhollow'], ['Urban Ranger', 'drakkenheim'], ['Grim Harbinger', 'crookedmoon'],
    ['Bloodhound', 'quickstone'], ['Winter Walker', 'faerun'], ['Hollow Warden', 'ravenloft'],
  ],
  rogue: [
    ['Blade of Radiance', 'steinhardt'], ['Highway Rider', 'grimhollow'], ['Misfortune Bringer', 'grimhollow'],
    ['Sanguine Thief', 'grimhollow'], ['Smuggler', 'drakkenheim'], ['Sinner', 'crookedmoon'],
    ['Scion of the Three', 'faerun'], ['Fantôme', 'ravenloft'], ['Arachnoid Stalker', 'valda'],
  ],
  sorcerer: [
    ['Spirit Caller', 'northlands'], ['Apocalypse Bloodline', 'grimhollow'], ['Haunted Bloodline', 'grimhollow'],
    ['Wretched Bloodline', 'grimhollow'], ['Delerium Soul', 'drakkenheim'], ['Crimson Sorcery', 'crookedmoon'],
    ['Nemesis Sorcery', 'quickstone'], ['Spellfire Sorcery', 'faerun'],
    ['Shadow Sorcery', 'ravenloft'],
  ],
  warlock: [
    ['Trickster', 'northlands'], ['The Coven', 'grimhollow'], ['The First Vampire', 'grimhollow'],
    ['The Parasite', 'grimhollow'], ['Great Fool Patron', 'crookedmoon'], ['Horned King Patron', 'crookedmoon'],
    ['Stone Sovereign Patron', 'quickstone'], ['Protecteur le Mort-vivant', 'ravenloft'],
    ['Vestige Patron', 'arcana'], ['Future You', 'valda'],
  ],
  wizard: [
    ['Osteomancer', 'steinhardt'], ['Daemonologist', 'grimhollow'], ['Plague Doctor', 'grimhollow'],
    ['Sangromancer', 'grimhollow'], ['Malfeasant', 'drakkenheim'], ['Occultist', 'crookedmoon'],
    ['Philosopher', 'crookedmoon'], ['Chantelame', 'faerun'], ['Invocateur', 'arcana'],
    ['Enchanteur', 'arcana'], ['Nécromancien', 'arcana'], ['Transmutateur', 'arcana'],
    ['Magic Missile Mage', 'valda'],
  ],
  artificer: [
    ['Reanimator', 'ravenloft'],
  ],
};

// Espèces dont les traits ne sont pas repris : le joueur les recopie depuis son livre.
const sp = (id, name, source, extra = {}) => ({
  id, name, source, speed: 9, size: '—', darkvision: 0,
  traits: `Traits : voir ${SOURCES[source]}`,
  ...extra,
});

export const EXTRA_SPECIES = [
  sp('changeling', 'Changelin', 'eberron'),
  sp('kalashtar', 'Kalashtar', 'eberron'),
  sp('khoravar', 'Khoravar', 'eberron'),
  sp('shifter', 'Shifter', 'eberron'),
  sp('warforged', 'Forgelier', 'eberron'),
  sp('gargoyle', 'Gargouille', 'quickstone'),
  sp('gnoll', 'Gnoll', 'quickstone'),
  sp('harpy', 'Harpie', 'quickstone'),
  sp('medusa', 'Méduse', 'quickstone'),
  sp('worg', 'Worg', 'quickstone'),
  sp('dhampir', 'Dhampir', 'ravenloft', { traits: "Traits : voir Ravenloft : The Horrors Within (aussi dans Astarion's Book of Hungers)" }),
  sp('hexblood', 'Hexblood', 'ravenloft'),
  sp('lupin', 'Lupin', 'ravenloft'),
  sp('reborn', 'Reborn', 'ravenloft'),
  sp('lorwyn-changeling', 'Changelin de Lorwyn', 'lorwyn'),
  sp('rimekin', 'Rimekin', 'lorwyn'),
  sp('boggart', 'Boggart', 'lorwyn'),
  sp('faerie', 'Faerie', 'lorwyn'),
  sp('flamekin', 'Flamekin', 'lorwyn'),
  sp('kithkin', 'Kithkin', 'lorwyn'),
  sp('geppettin', 'Geppettin', 'valda'),
  sp('mandrake', 'Mandrake', 'valda'),
  sp('manikin', 'Manikin', 'steinhardt'),
  sp('scourgeborne', 'Scourgeborne', 'steinhardt'),
  sp('demidritch', 'Demidritch', 'steinhardt'),
  sp('bearfolk', 'Bearfolk', 'northlands'),
  sp('beastkin', 'Beastkin', 'northlands', { lineages: ['Avian', 'Agile', 'Aquatic', 'Sturdy'], lineageLabel: 'Adaptation' }),
  sp('giantkin', 'Giantkin', 'northlands'),
  sp('trollkin', 'Trollkin', 'northlands'),
  sp('werekin', 'Werekin', 'northlands'),
  sp('dreamer', 'Dreamer', 'grimhollow'),
  sp('grudgel', 'Grudgel', 'grimhollow'),
  sp('laneshi', 'Laneshi', 'grimhollow'),
  sp('ogresh', 'Ogresh', 'grimhollow'),
  sp('accursed', 'Accursed', 'grimhollow'),
  sp('arisen', 'Arisen', 'grimhollow'),
  sp('disembodied', 'Disembodied', 'grimhollow'),
  sp('downcast', 'Downcast', 'grimhollow'),
  sp('wechselkind', 'Wechselkind', 'grimhollow'),
  sp('wulven', 'Wulven', 'grimhollow'),
  ...['Ashborn', 'Azureborn', 'Bogborn', 'Curseborn', 'Deepborn', 'Gnarlborn', 'Graveborn',
    'Harvestborn', 'Plagueborn', 'Relicborn', 'Silkborn', 'Stoneborn', 'Threadborn']
    .map(n => sp(n.toLowerCase(), n, 'crookedmoon')),
  {
    id: 'custom', name: 'Autre espèce (personnalisée)', source: 'custom', speed: 9, size: '—', darkvision: 0,
    traits: '', desc: 'Pour une espèce absente de la liste.',
  },
];

// Lignages ajoutés aux espèces du Manuel des joueurs.
export const EXTRA_LINEAGES = {
  elf: ['Elfe de Lorwyn', 'Elfe de Shadowmoor', 'Elfe de lune', 'Elfe de soleil'],
};
