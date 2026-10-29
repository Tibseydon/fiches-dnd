// Données de règles D&D 5.5 (Manuel des joueurs 2024), en français.
import { SOURCES, EXTRA_CLASSES, EXTRA_SUBCLASSES, EXTRA_SPECIES, EXTRA_LINEAGES } from './extensions.js';

export { SOURCES };

export const ABILITIES = [
  { id: 'str', short: 'FOR', name: 'Force' },
  { id: 'dex', short: 'DEX', name: 'Dextérité' },
  { id: 'con', short: 'CON', name: 'Constitution' },
  { id: 'int', short: 'INT', name: 'Intelligence' },
  { id: 'wis', short: 'SAG', name: 'Sagesse' },
  { id: 'cha', short: 'CHA', name: 'Charisme' },
];

export const SKILLS = [
  { id: 'acrobatics', name: 'Acrobaties', ab: 'dex' },
  { id: 'arcana', name: 'Arcanes', ab: 'int' },
  { id: 'athletics', name: 'Athlétisme', ab: 'str' },
  { id: 'stealth', name: 'Discrétion', ab: 'dex' },
  { id: 'animal', name: 'Dressage', ab: 'wis' },
  { id: 'sleight', name: 'Escamotage', ab: 'dex' },
  { id: 'history', name: 'Histoire', ab: 'int' },
  { id: 'intimidation', name: 'Intimidation', ab: 'cha' },
  { id: 'insight', name: 'Intuition', ab: 'wis' },
  { id: 'investigation', name: 'Investigation', ab: 'int' },
  { id: 'medicine', name: 'Médecine', ab: 'wis' },
  { id: 'nature', name: 'Nature', ab: 'int' },
  { id: 'perception', name: 'Perception', ab: 'wis' },
  { id: 'persuasion', name: 'Persuasion', ab: 'cha' },
  { id: 'religion', name: 'Religion', ab: 'int' },
  { id: 'performance', name: 'Représentation', ab: 'cha' },
  { id: 'survival', name: 'Survie', ab: 'wis' },
  { id: 'deception', name: 'Tromperie', ab: 'cha' },
];

const ALL_SKILLS = SKILLS.map(s => s.id);

// caster: 'full' | 'half' | 'pact' | null
export const CLASSES = [
  {
    id: 'barbarian', name: 'Barbare', hd: 12, primary: 'FOR', saves: ['str', 'con'],
    skillCount: 2, skills: ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    caster: null, spellAb: null,
    armor: 'Armures légères et intermédiaires, boucliers', weapons: 'Armes courantes et de guerre', tools: '',
    features: 'Rage, Défense sans armure, Maîtrise des armes',
    resources: [{ name: 'Rage', max: 2 }],
    subclasses: ['Voie du berserker', 'Voie du cœur sauvage', "Voie de l'arbre-monde", 'Voie du zélateur'],
    desc: 'Guerrier farouche porté par une rage primitive.',
  },
  {
    id: 'bard', name: 'Barde', hd: 8, primary: 'CHA', saves: ['dex', 'cha'],
    skillCount: 3, skills: ALL_SKILLS,
    caster: 'full', spellAb: 'cha',
    armor: 'Armures légères', weapons: 'Armes courantes', tools: '3 instruments de musique',
    features: 'Inspiration bardique, Incantation',
    resources: [{ name: 'Inspiration bardique', max: 'cha' }],
    subclasses: ['Collège de la danse', 'Collège du charme', 'Collège du savoir', 'Collège de la vaillance'],
    desc: 'Artiste inspirant dont la musique tisse la magie.',
  },
  {
    id: 'cleric', name: 'Clerc', hd: 8, primary: 'SAG', saves: ['wis', 'cha'],
    skillCount: 2, skills: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    caster: 'full', spellAb: 'wis',
    armor: 'Armures légères et intermédiaires, boucliers', weapons: 'Armes courantes', tools: '',
    features: 'Incantation, Ordre divin',
    resources: [],
    subclasses: ['Domaine de la vie', 'Domaine de la lumière', 'Domaine de la duperie', 'Domaine de la guerre'],
    desc: 'Prêtre investi du pouvoir de sa divinité.',
  },
  {
    id: 'druid', name: 'Druide', hd: 8, primary: 'SAG', saves: ['int', 'wis'],
    skillCount: 2, skills: ['arcana', 'animal', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    caster: 'full', spellAb: 'wis',
    armor: 'Armures légères, boucliers', weapons: 'Armes courantes', tools: "Matériel d'herboriste",
    features: 'Incantation, Druidique, Ordre primitif',
    resources: [],
    subclasses: ['Cercle de la terre', 'Cercle de la lune', 'Cercle de la mer', 'Cercle des étoiles'],
    desc: 'Gardien de la nature aux pouvoirs primordiaux.',
  },
  {
    id: 'fighter', name: 'Guerrier', hd: 10, primary: 'FOR ou DEX', saves: ['str', 'con'],
    skillCount: 2, skills: ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'persuasion', 'perception', 'survival'],
    caster: null, spellAb: null,
    armor: 'Toutes les armures, boucliers', weapons: 'Armes courantes et de guerre', tools: '',
    features: 'Style de combat, Second souffle, Maîtrise des armes',
    resources: [{ name: 'Second souffle', max: 2 }],
    subclasses: ['Maître de guerre', 'Champion', 'Chevalier occulte', 'Guerrier psi'],
    desc: 'Expert du combat sous toutes ses formes.',
  },
  {
    id: 'monk', name: 'Moine', hd: 8, primary: 'DEX et SAG', saves: ['str', 'dex'],
    skillCount: 2, skills: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    caster: null, spellAb: null,
    armor: 'Aucune', weapons: 'Armes courantes, armes de guerre légères', tools: "Un outil d'artisan ou un instrument de musique",
    features: 'Arts martiaux, Défense sans armure',
    resources: [],
    subclasses: ['Credo de la miséricorde', "Credo de l'ombre", 'Credo des éléments', 'Credo de la paume'],
    desc: 'Artiste martial canalisant son énergie intérieure.',
  },
  {
    id: 'paladin', name: 'Paladin', hd: 10, primary: 'FOR et CHA', saves: ['wis', 'cha'],
    skillCount: 2, skills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    caster: 'half', spellAb: 'cha',
    armor: 'Toutes les armures, boucliers', weapons: 'Armes courantes et de guerre', tools: '',
    features: 'Imposition des mains, Incantation, Maîtrise des armes',
    resources: [{ name: 'Imposition des mains (PV)', max: 'lay' }],
    subclasses: ['Serment de dévotion', 'Serment de gloire', 'Serment des anciens', 'Serment de vengeance'],
    desc: 'Champion sacré lié par un serment.',
  },
  {
    id: 'ranger', name: 'Rôdeur', hd: 10, primary: 'DEX et SAG', saves: ['str', 'dex'],
    skillCount: 3, skills: ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    caster: 'half', spellAb: 'wis',
    armor: 'Armures légères et intermédiaires, boucliers', weapons: 'Armes courantes et de guerre', tools: '',
    features: 'Incantation, Ennemi juré, Maîtrise des armes',
    resources: [],
    subclasses: ['Maître des bêtes', 'Vagabond féerique', 'Traqueur des ténèbres', 'Chasseur'],
    desc: 'Pisteur des terres sauvages, mêlant armes et magie.',
  },
  {
    id: 'rogue', name: 'Roublard', hd: 8, primary: 'DEX', saves: ['dex', 'int'],
    skillCount: 4, skills: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleight', 'stealth'],
    caster: null, spellAb: null,
    armor: 'Armures légères', weapons: 'Armes courantes, armes de guerre légères ou à finesse', tools: 'Outils de voleur',
    features: 'Expertise, Attaque sournoise, Argot des voleurs, Maîtrise des armes',
    resources: [],
    subclasses: ['Escroc arcanique', 'Assassin', "Lame de l'âme", 'Voleur'],
    desc: 'Spécialiste de la discrétion et des coups précis.',
  },
  {
    id: 'sorcerer', name: 'Ensorceleur', hd: 6, primary: 'CHA', saves: ['con', 'cha'],
    skillCount: 2, skills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    caster: 'full', spellAb: 'cha',
    armor: 'Aucune', weapons: 'Armes courantes', tools: '',
    features: 'Incantation, Sorcellerie innée',
    resources: [{ name: 'Sorcellerie innée', max: 2 }],
    subclasses: ['Sorcellerie aberrante', 'Sorcellerie mécanique', 'Sorcellerie draconique', 'Magie sauvage'],
    desc: 'Lanceur de sorts à la magie innée.',
  },
  {
    id: 'warlock', name: 'Occultiste', hd: 8, primary: 'CHA', saves: ['wis', 'cha'],
    skillCount: 2, skills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    caster: 'pact', spellAb: 'cha',
    armor: 'Armures légères', weapons: 'Armes courantes', tools: '',
    features: 'Manifestations occultes, Magie de pacte',
    resources: [],
    subclasses: ["Protecteur l'Archifée", 'Protecteur le Céleste', 'Protecteur le Fiélon', 'Protecteur le Grand Ancien'],
    desc: 'Détenteur de pouvoirs octroyés par un pacte.',
  },
  {
    id: 'wizard', name: 'Magicien', hd: 6, primary: 'INT', saves: ['int', 'wis'],
    skillCount: 2, skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion'],
    caster: 'full', spellAb: 'int',
    armor: 'Aucune', weapons: 'Armes courantes', tools: '',
    features: 'Incantation, Adepte des rituels, Restauration arcanique',
    resources: [{ name: 'Restauration arcanique', max: 1 }],
    subclasses: ['Abjurateur', 'Devin', 'Évocateur', 'Illusionniste'],
    desc: 'Érudit des arcanes, maître de son grimoire.',
  },
];

// Vitesse en mètres.
export const SPECIES = [
  {
    id: 'aasimar', name: 'Aasimar', speed: 9, size: 'P ou M', darkvision: 18,
    traits: 'Résistance céleste (nécrotique, radiant), Vision dans le noir 18 m, Mains guérisseuses, Porteur de lumière, Révélation céleste (niv. 3)',
  },
  {
    id: 'dragonborn', name: 'Drakéide', speed: 9, size: 'M', darkvision: 18,
    lineages: ['Noir (acide)', 'Bleu (foudre)', 'Airain (feu)', 'Bronze (foudre)', 'Cuivre (acide)', 'Or (feu)', 'Vert (poison)', 'Rouge (feu)', 'Argent (froid)', 'Blanc (froid)'],
    lineageLabel: 'Ascendance draconique',
    traits: 'Ascendance draconique, Souffle, Résistance aux dégâts, Vision dans le noir 18 m, Vol draconique (niv. 5)',
  },
  {
    id: 'dwarf', name: 'Nain', speed: 9, size: 'M', darkvision: 36, hpPerLevel: 1,
    traits: 'Vision dans le noir 36 m, Résilience naine (poison), Robustesse naine (+1 PV/niveau), Connaissance de la pierre',
  },
  {
    id: 'elf', name: 'Elfe', speed: 9, size: 'M', darkvision: 18,
    lineages: ['Drow', 'Haut-elfe', 'Elfe sylvestre'],
    lineageLabel: 'Lignage elfique',
    keenSenses: ['insight', 'perception', 'survival'],
    traits: 'Vision dans le noir 18 m, Lignage elfique, Ascendance féerique, Sens aiguisés, Transe',
  },
  {
    id: 'gnome', name: 'Gnome', speed: 9, size: 'P', darkvision: 18,
    lineages: ['Gnome des forêts', 'Gnome des roches'],
    lineageLabel: 'Lignage gnome',
    traits: 'Vision dans le noir 18 m, Ruse gnome (avantage aux JS INT/SAG/CHA), Lignage gnome',
  },
  {
    id: 'goliath', name: 'Goliath', speed: 10.5, size: 'M', darkvision: 0,
    lineages: ['Nuage', 'Feu', 'Givre', 'Colline', 'Pierre', 'Tempête'],
    lineageLabel: 'Ascendance géante',
    traits: 'Ascendance géante, Forme gigantesque (niv. 5), Carrure puissante',
  },
  {
    id: 'halfling', name: 'Halfelin', speed: 9, size: 'P', darkvision: 0,
    traits: 'Brave, Agilité halfeline, Chanceux, Discrétion naturelle',
  },
  {
    id: 'human', name: 'Humain', speed: 9, size: 'P ou M', darkvision: 0, skillful: true,
    traits: 'Ingénieux (Inspiration héroïque à chaque repos long), Talentueux (1 compétence), Polyvalent (1 don d\'origine)',
  },
  {
    id: 'orc', name: 'Orc', speed: 9, size: 'M', darkvision: 36,
    traits: "Poussée d'adrénaline, Vision dans le noir 36 m, Endurance implacable",
  },
  {
    id: 'tiefling', name: 'Tieffelin', speed: 9, size: 'P ou M', darkvision: 18,
    lineages: ['Abyssal', 'Chthonien', 'Infernal'],
    lineageLabel: 'Héritage fiélon',
    traits: 'Vision dans le noir 18 m, Héritage fiélon, Présence surnaturelle (Thaumaturgie)',
  },
];

export const FEATS = {
  alert: 'Vigilant',
  crafter: 'Artisan',
  healer: 'Guérisseur',
  lucky: 'Chanceux',
  'mi-cleric': 'Initié à la magie (clerc)',
  'mi-druid': 'Initié à la magie (druide)',
  'mi-wizard': 'Initié à la magie (magicien)',
  musician: 'Musicien',
  savage: 'Attaquant sauvage',
  skilled: 'Doué',
  brawler: 'Bagarreur de taverne',
  tough: 'Robuste',
};

export const BACKGROUNDS = [
  { id: 'acolyte', name: 'Acolyte', abilities: ['int', 'wis', 'cha'], feat: 'mi-cleric', skills: ['insight', 'religion'], tool: 'Matériel de calligraphie' },
  { id: 'artisan', name: 'Artisan', abilities: ['str', 'dex', 'int'], feat: 'crafter', skills: ['investigation', 'persuasion'], tool: "Un outil d'artisan" },
  { id: 'charlatan', name: 'Charlatan', abilities: ['dex', 'con', 'cha'], feat: 'skilled', skills: ['deception', 'sleight'], tool: 'Matériel de contrefaçon' },
  { id: 'criminal', name: 'Criminel', abilities: ['dex', 'con', 'int'], feat: 'alert', skills: ['sleight', 'stealth'], tool: 'Outils de voleur' },
  { id: 'entertainer', name: 'Artiste', abilities: ['str', 'dex', 'cha'], feat: 'musician', skills: ['acrobatics', 'performance'], tool: 'Un instrument de musique' },
  { id: 'farmer', name: 'Fermier', abilities: ['str', 'con', 'wis'], feat: 'tough', skills: ['animal', 'nature'], tool: 'Outils de charpentier' },
  { id: 'guard', name: 'Garde', abilities: ['str', 'int', 'wis'], feat: 'alert', skills: ['athletics', 'perception'], tool: 'Un jeu' },
  { id: 'guide', name: 'Guide', abilities: ['dex', 'con', 'wis'], feat: 'mi-druid', skills: ['stealth', 'survival'], tool: 'Instruments de cartographe' },
  { id: 'hermit', name: 'Ermite', abilities: ['con', 'wis', 'cha'], feat: 'healer', skills: ['medicine', 'religion'], tool: "Matériel d'herboriste" },
  { id: 'merchant', name: 'Marchand', abilities: ['con', 'int', 'cha'], feat: 'lucky', skills: ['animal', 'persuasion'], tool: 'Instruments de navigateur' },
  { id: 'noble', name: 'Noble', abilities: ['str', 'int', 'cha'], feat: 'skilled', skills: ['history', 'persuasion'], tool: 'Un jeu' },
  { id: 'sage', name: 'Sage', abilities: ['con', 'int', 'wis'], feat: 'mi-wizard', skills: ['arcana', 'history'], tool: 'Matériel de calligraphie' },
  { id: 'sailor', name: 'Marin', abilities: ['str', 'dex', 'wis'], feat: 'brawler', skills: ['acrobatics', 'perception'], tool: 'Instruments de navigateur' },
  { id: 'scribe', name: 'Scribe', abilities: ['dex', 'int', 'wis'], feat: 'skilled', skills: ['investigation', 'perception'], tool: 'Matériel de calligraphie' },
  { id: 'soldier', name: 'Soldat', abilities: ['str', 'dex', 'con'], feat: 'savage', skills: ['athletics', 'intimidation'], tool: 'Un jeu' },
  { id: 'wayfarer', name: 'Voyageur', abilities: ['dex', 'wis', 'cha'], feat: 'lucky', skills: ['insight', 'stealth'], tool: 'Outils de voleur' },
];

export const ALIGNMENTS = [
  'Loyal Bon', 'Neutre Bon', 'Chaotique Bon',
  'Loyal Neutre', 'Neutre', 'Chaotique Neutre',
  'Loyal Mauvais', 'Neutre Mauvais', 'Chaotique Mauvais',
];

export const CONDITIONS = [
  'À terre', 'Agrippé', 'Assourdi', 'Aveuglé', 'Charmé', 'Empoisonné', 'Entravé',
  'Épuisement', 'Étourdi', 'Effrayé', 'Inconscient', 'Invisible', 'Neutralisé', 'Paralysé', 'Pétrifié',
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const POINT_BUY_BUDGET = 27;

// Emplacements de sorts d'un lanceur complet, par niveau de personnage.
export const FULL_CASTER_SLOTS = [
  [],
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

// Magie de pacte : [nombre d'emplacements, niveau des emplacements].
export const PACT_SLOTS = [
  [0, 0],
  [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
  [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5],
];

export const byId = (list, id) => list.find(x => x.id === id);

// Ajout des contenus des extensions (voir extensions.js).
CLASSES.forEach(c => (c.source = 'phb'));
CLASSES.push(...EXTRA_CLASSES);
CLASSES.forEach(c => {
  c.subclassSources = Object.fromEntries(c.subclasses.map(n => [n, c.source]));
  (EXTRA_SUBCLASSES[c.id] ?? []).forEach(([n, src]) => {
    c.subclasses.push(n);
    c.subclassSources[n] = src;
  });
});
SPECIES.forEach(s => (s.source = 'phb'));
SPECIES.push(...EXTRA_SPECIES);
Object.entries(EXTRA_LINEAGES).forEach(([id, l]) => byId(SPECIES, id).lineages.push(...l));
