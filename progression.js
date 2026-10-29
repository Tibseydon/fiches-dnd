// Progression des classes (règles 2024) : capacités gagnées par niveau,
// niveaux d'amélioration de caractéristiques et ressources selon le niveau.

const byLevel = table => level => table[Math.min(20, Math.max(1, level)) - 1];
const from = (start, f) => level => (level >= start ? f(level) : 0);

// Niveaux 4, 8, 12, 16 : amélioration de caractéristiques (ou un don) ; niveau 19 : don épique.
const ASI = [4, 8, 12, 16];
export const EPIC_BOON_LEVEL = 19;
export const SUBCLASS_LEVEL = 3;

export const PROGRESSION = {
  barbarian: {
    features: {
      2: ['Sens du danger', 'Attaque téméraire'], 3: ['Sous-classe', 'Savoir primitif'], 5: ['Attaque supplémentaire', 'Déplacement rapide'],
      6: ['Capacité de sous-classe'], 7: ['Instinct sauvage', 'Bond instinctif'], 9: ['Frappe brutale'], 10: ['Capacité de sous-classe'],
      11: ['Rage implacable'], 13: ['Frappe brutale améliorée'], 14: ['Capacité de sous-classe'], 15: ['Rage persistante'],
      17: ['Frappe brutale améliorée'], 18: ['Puissance indomptable'], 20: ['Champion primitif'],
    },
    resources: [['Rage', byLevel([2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6])]],
    values: l => [`Dégâts de rage +${l >= 16 ? 4 : l >= 9 ? 3 : 2}`],
  },
  bard: {
    features: {
      2: ['Expertise (2 compétences)', 'Touche-à-tout'], 3: ['Sous-classe'], 5: ['Source d\'inspiration'], 6: ['Capacité de sous-classe'],
      7: ['Contre-charme'], 9: ['Expertise (2 compétences)'], 10: ['Secrets magiques'], 14: ['Capacité de sous-classe'],
      18: ['Inspiration supérieure'], 20: ['Mots de création'],
    },
    resources: [['Inspiration bardique', (l, mods) => Math.max(1, mods.cha)]],
    values: l => [`Dé d'inspiration bardique d${l >= 15 ? 12 : l >= 10 ? 10 : l >= 5 ? 8 : 6}`],
  },
  cleric: {
    features: {
      2: ['Conduit divin'], 3: ['Sous-classe'], 5: ['Renvoi des morts-vivants amélioré'], 6: ['Capacité de sous-classe'],
      7: ['Frappes bénies'], 10: ['Intervention divine'], 14: ['Frappes bénies améliorées'], 17: ['Capacité de sous-classe'],
      20: ['Intervention divine supérieure'],
    },
    resources: [['Conduit divin', from(2, l => (l >= 18 ? 4 : l >= 6 ? 3 : 2))]],
  },
  druid: {
    features: {
      2: ['Forme sauvage', 'Compagnon sauvage'], 3: ['Sous-classe'], 5: ['Résurgence sauvage'], 6: ['Capacité de sous-classe'],
      7: ['Fureur élémentaire'], 10: ['Capacité de sous-classe'], 14: ['Capacité de sous-classe'],
      15: ['Fureur élémentaire améliorée'], 18: ['Sorts bestiaux'], 20: ['Archidruide'],
    },
    resources: [['Forme sauvage', from(2, l => (l >= 17 ? 4 : l >= 6 ? 3 : 2))]],
  },
  fighter: {
    asi: [4, 6, 8, 12, 14, 16],
    features: {
      2: ['Sursaut d\'action', 'Esprit tactique'], 3: ['Sous-classe'], 5: ['Attaque supplémentaire', 'Changement tactique'],
      7: ['Capacité de sous-classe'], 9: ['Indomptable', 'Maître tacticien'], 10: ['Capacité de sous-classe'],
      11: ['Deux attaques supplémentaires'], 13: ['Indomptable (2 utilisations)', 'Attaques étudiées'], 15: ['Capacité de sous-classe'],
      17: ['Sursaut d\'action (2 utilisations)', 'Indomptable (3 utilisations)'], 18: ['Capacité de sous-classe'],
      20: ['Trois attaques supplémentaires'],
    },
    resources: [
      ['Second souffle', l => (l >= 10 ? 4 : l >= 4 ? 3 : 2)],
      ['Sursaut d\'action', from(2, l => (l >= 17 ? 2 : 1))],
      ['Indomptable', from(9, l => (l >= 17 ? 3 : l >= 13 ? 2 : 1))],
    ],
  },
  monk: {
    features: {
      2: ['Focus du moine', 'Déplacement sans armure', 'Métabolisme surnaturel'], 3: ['Sous-classe', 'Parade de projectiles'],
      4: ['Chute ralentie'], 5: ['Attaque supplémentaire', 'Frappe étourdissante'], 6: ['Frappes renforcées', 'Capacité de sous-classe'],
      7: ['Dérobade'], 9: ['Déplacement acrobatique'], 10: ['Focus accru', 'Auto-guérison'], 11: ['Capacité de sous-classe'],
      13: ['Parade d\'énergie'], 14: ['Survivant discipliné'], 15: ['Focus parfait'], 17: ['Capacité de sous-classe'],
      18: ['Défense supérieure'], 20: ['Corps et esprit'],
    },
    resources: [['Points de focus', from(2, l => l)]],
    values: l => [`Dé d'arts martiaux d${l >= 17 ? 12 : l >= 11 ? 10 : l >= 5 ? 8 : 6}`],
  },
  paladin: {
    features: {
      2: ['Style de combat', 'Châtiment du paladin'], 3: ['Conduit divin', 'Sous-classe'], 5: ['Attaque supplémentaire', 'Destrier fidèle'],
      6: ['Aura de protection'], 7: ['Capacité de sous-classe'], 9: ['Renvoi des ennemis'], 10: ['Aura de courage'],
      11: ['Frappes radieuses'], 14: ['Toucher restaurateur'], 15: ['Capacité de sous-classe'], 18: ['Extension d\'aura'],
      20: ['Capacité de sous-classe'],
    },
    resources: [
      ['Imposition des mains (PV)', l => 5 * l],
      ['Conduit divin', from(3, l => (l >= 11 ? 3 : 2))],
    ],
  },
  ranger: {
    features: {
      2: ['Explorateur habile (expertise)', 'Style de combat'], 3: ['Sous-classe'], 5: ['Attaque supplémentaire'], 6: ['Vagabond'],
      7: ['Capacité de sous-classe'], 9: ['Expertise (2 compétences)'], 10: ['Infatigable'], 11: ['Capacité de sous-classe'],
      13: ['Chasseur implacable'], 14: ['Voile de la nature'], 15: ['Capacité de sous-classe'], 17: ['Chasseur précis'],
      18: ['Sens sauvages'], 20: ['Tueur d\'ennemis'],
    },
    resources: [['Ennemi juré (Marque du chasseur)', byLevel([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6])]],
  },
  rogue: {
    asi: [4, 8, 10, 12, 16],
    features: {
      2: ['Ruse'], 3: ['Sous-classe', 'Visée stable'], 5: ['Frappe rusée', 'Esquive instinctive'], 6: ['Expertise (2 compétences)'],
      7: ['Dérobade', 'Talent fiable'], 9: ['Capacité de sous-classe'], 11: ['Frappe rusée améliorée'], 13: ['Capacité de sous-classe'],
      14: ['Frappes sournoises'], 15: ['Esprit fuyant'], 17: ['Capacité de sous-classe'], 18: ['Insaisissable'], 20: ['Coup de chance'],
    },
    resources: [],
    values: l => [`Attaque sournoise ${Math.ceil(l / 2)}d6`],
  },
  sorcerer: {
    features: {
      2: ['Source de magie', 'Métamagie'], 3: ['Sous-classe'], 5: ['Restauration ensorcelée'], 6: ['Capacité de sous-classe'],
      7: ['Sorcellerie incarnée'], 10: ['Métamagie'], 14: ['Capacité de sous-classe'], 17: ['Métamagie'],
      18: ['Capacité de sous-classe'], 20: ['Apothéose arcanique'],
    },
    resources: [['Sorcellerie innée', () => 2], ['Points de sorcellerie', from(2, l => l)]],
  },
  warlock: {
    features: {
      2: ['Ruse magique'], 3: ['Sous-classe'], 6: ['Capacité de sous-classe'], 9: ['Contacter son protecteur'],
      10: ['Capacité de sous-classe'], 11: ['Arcanum mystique (niv. 6)'], 13: ['Arcanum mystique (niv. 7)'],
      14: ['Capacité de sous-classe'], 15: ['Arcanum mystique (niv. 8)'], 17: ['Arcanum mystique (niv. 9)'], 20: ['Maître occulte'],
    },
    resources: [],
    values: l => [`Manifestations occultes connues : ${byLevel([1, 3, 3, 3, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10])(l)}`],
  },
  wizard: {
    features: {
      2: ['Érudit (expertise)'], 3: ['Sous-classe'], 5: ['Mémorisation de sort'], 6: ['Capacité de sous-classe'],
      10: ['Capacité de sous-classe'], 14: ['Capacité de sous-classe'], 18: ['Maîtrise des sorts'], 20: ['Sorts de prédilection'],
    },
    resources: [['Restauration arcanique', () => 1]],
  },
};

// Niveaux où le joueur choisit une amélioration de caractéristiques (ou un don).
export function asiLevels(classId, level) {
  return (PROGRESSION[classId]?.asi ?? ASI).filter(l => l <= level);
}

// Capacités gagnées entre le niveau 2 et `level` (le niveau 1 est décrit à part).
// `libFeatures` : capacités d'une classe importée depuis la bibliothèque du MJ.
export function featuresUpTo(classId, level, libFeatures = null) {
  const f = Object.fromEntries(Object.entries(PROGRESSION[classId]?.features ?? {}).map(([l, n]) => [l, [...n]]));
  if (libFeatures) {
    libFeatures.forEach(x => {
      if (x.level >= 2) (f[x.level] = f[x.level] ?? []).push(x.name);
    });
  }
  const out = [];
  for (let l = 2; l <= level; l++) {
    const names = [...(f[l] ?? [])];
    if (!PROGRESSION[classId] && !libFeatures && l === SUBCLASS_LEVEL) names.push('Sous-classe');
    if (asiLevels(classId, l).includes(l)) names.push('Amélioration de caractéristiques');
    if (l === EPIC_BOON_LEVEL) names.push('Don épique');
    if (names.length) out.push([l, names]);
  }
  return out;
}

export function scalingValues(classId, level) {
  return PROGRESSION[classId]?.values?.(level) ?? [];
}

// Ressources de classe au niveau donné : [[nom, max], …] (max > 0 uniquement).
export function resourcesAt(classId, level, mods) {
  return (PROGRESSION[classId]?.resources ?? [])
    .map(([name, f]) => [name, f(level, mods)])
    .filter(([, max]) => max > 0);
}
