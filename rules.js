// Calculs dérivés d'une fiche de personnage.
import {
  ABILITIES, SKILLS, CLASSES, SPECIES, BACKGROUNDS, FEATS,
  FULL_CASTER_SLOTS, PACT_SLOTS, byId,
} from './data.js?v=202610290953';

export const mod = score => Math.floor((score - 10) / 2);
export const fmt = n => (n >= 0 ? `+${n}` : `${n}`);
export const profBonus = level => 2 + Math.floor((Math.max(1, level) - 1) / 4);

// Classe du personnage, avec les réglages faits sur la fiche
// (classe personnalisée ou données d'extension à vérifier).
export function classOf(c) {
  const base = byId(CLASSES, c.classId);
  if (!base) return null;
  const o = c.classOverride ?? {};
  return {
    ...base,
    name: c.classId === 'custom' && c.customClassName ? c.customClassName : base.name,
    hd: Number(o.hd) || base.hd,
    saves: Array.isArray(o.saves) ? o.saves : base.saves,
    caster: o.caster !== undefined ? o.caster || null : base.caster,
    spellAb: o.spellAb !== undefined ? o.spellAb || null : base.spellAb,
  };
}

export function speciesName(c) {
  const sp = byId(SPECIES, c.speciesId);
  return c.speciesId === 'custom' && c.customSpeciesName ? c.customSpeciesName : sp?.name;
}

export function score(c, ab) {
  return (c.base?.[ab] ?? 10) + (c.bgBonus?.[ab] ?? 0) + (c.otherBonus?.[ab] ?? 0);
}

export function abilityMod(c, ab) {
  return mod(score(c, ab));
}

export function saveProficient(c, ab) {
  const cls = classOf(c);
  return (cls?.saves.includes(ab) ?? false) || (c.extraSaves ?? []).includes(ab);
}

export function saveBonus(c, ab) {
  return abilityMod(c, ab) + (saveProficient(c, ab) ? profBonus(c.level) : 0);
}

// Niveau de maîtrise d'une compétence : 0 aucun, 1 maîtrise, 2 expertise.
export function skillBonus(c, skillId) {
  const sk = byId(SKILLS, skillId);
  const lvl = c.skills?.[skillId] ?? 0;
  return abilityMod(c, sk.ab) + lvl * profBonus(c.level);
}

export function passive(c, skillId) {
  return 10 + skillBonus(c, skillId);
}

export function originFeat(c) {
  return c.originFeat || byId(BACKGROUNDS, c.backgroundId)?.feat || null;
}

export function initiative(c) {
  // Le don Vigilant (2024) ajoute le bonus de maîtrise à l'initiative.
  const alert = originFeat(c) === 'alert' ? profBonus(c.level) : 0;
  return abilityMod(c, 'dex') + alert + (Number(c.initMisc) || 0);
}

export function suggestedAC(c) {
  const dex = abilityMod(c, 'dex');
  if (c.classId === 'barbarian') return 10 + dex + abilityMod(c, 'con');
  if (c.classId === 'monk') return 10 + dex + abilityMod(c, 'wis');
  return 10 + dex;
}

export function suggestedMaxHP(c) {
  const cls = classOf(c);
  if (!cls) return 1;
  const lvl = Math.max(1, c.level);
  const con = abilityMod(c, 'con');
  let hp = cls.hd + con + (lvl - 1) * (cls.hd / 2 + 1 + con);
  const sp = byId(SPECIES, c.speciesId);
  if (sp?.hpPerLevel) hp += sp.hpPerLevel * lvl;
  if (originFeat(c) === 'tough') hp += 2 * lvl;
  return Math.max(lvl, hp);
}

export function spellInfo(c) {
  const cls = classOf(c);
  const ab = c.spellAb || cls?.spellAb;
  if (!ab) return null;
  const m = abilityMod(c, ab);
  const pb = profBonus(c.level);
  return { ab, dc: 8 + pb + m, attack: pb + m };
}

// Emplacements de sorts : tableau de 9 niveaux.
export function spellSlots(c) {
  const cls = classOf(c);
  const lvl = Math.min(20, Math.max(1, c.level));
  const slots = Array(9).fill(0);
  if (cls?.caster === 'full') {
    FULL_CASTER_SLOTS[lvl].forEach((n, i) => (slots[i] = n));
  } else if (cls?.caster === 'half') {
    FULL_CASTER_SLOTS[Math.ceil(lvl / 2)].forEach((n, i) => (slots[i] = n));
  } else if (cls?.caster === 'pact') {
    const [n, sl] = PACT_SLOTS[lvl];
    slots[sl - 1] = n;
  }
  // Ajustements manuels (sous-classes lanceuses de sorts, multiclassage…)
  (c.slotsMisc ?? []).forEach((n, i) => (slots[i] = Math.max(0, slots[i] + (Number(n) || 0))));
  return slots;
}

export function resourceMax(c, max) {
  if (max === 'cha') return Math.max(1, abilityMod(c, 'cha'));
  if (max === 'lay') return 5 * Math.max(1, c.level);
  return max;
}

export function labelFor(c) {
  const cls = classOf(c);
  return [speciesName(c), cls ? `${cls.name} ${c.level}` : null].filter(Boolean).join(' · ');
}

export function featName(id) {
  return FEATS[id] ?? '';
}

export function abilityShort(id) {
  return byId(ABILITIES, id)?.short ?? id;
}

// Construit une fiche complète à partir des choix de l'assistant de création.
export function buildCharacter(w) {
  const cls = byId(CLASSES, w.classId);
  const sp = byId(SPECIES, w.speciesId);
  const bg = byId(BACKGROUNDS, w.backgroundId);
  const skills = {};
  [...bg.skills, ...w.classSkills, ...(w.extraSkills ?? [])].forEach(s => (skills[s] = 1));

  const c = {
    name: w.name.trim(),
    classId: cls.id,
    customClassName: w.customClassName?.trim() || '',
    subclass: '',
    level: w.level,
    speciesId: sp.id,
    customSpeciesName: w.customSpeciesName?.trim() || '',
    lineage: w.lineage || '',
    backgroundId: bg.id,
    originFeat: bg.feat,
    alignment: w.alignment || '',
    xp: 0,
    base: { ...w.base },
    bgBonus: { ...w.bgBonus },
    otherBonus: {},
    skills,
    extraSaves: [],
    initMisc: 0,
    speed: sp.id === 'elf' && w.lineage === 'Elfe sylvestre' ? 10.5 : sp.speed,
    inspiration: false,
    conditions: [],
    deathSaves: { success: 0, fail: 0 },
    hitDiceUsed: 0,
    attacks: [],
    resources: [],
    spells: [],
    slotsUsed: Array(9).fill(0),
    slotsMisc: Array(9).fill(0),
    coins: { pc: 0, pa: 0, pe: 0, po: 0, pp: 0 },
    equipment: '',
    features: [
      cls.features && `Classe : ${cls.features}`,
      sp.traits && `Espèce : ${sp.traits}${w.lineage ? ` (${w.lineage})` : ''}`,
      `Don d'origine : ${FEATS[bg.feat]}`,
    ].filter(Boolean).join('\n'),
    proficiencies: [
      cls.armor && `Armures : ${cls.armor}`,
      cls.weapons && `Armes : ${cls.weapons}`,
      `Outils : ${[cls.tools, bg.tool].filter(Boolean).join(', ')}`,
    ].filter(Boolean).join('\n'),
    languages: 'Commun, ',
    personality: w.personality || '',
    backstory: w.backstory || '',
    appearance: '',
    notes: '',
    portrait: w.portrait || '',
  };
  c.ac = suggestedAC(c);
  c.hp = { max: suggestedMaxHP(c), current: 0, temp: 0 };
  c.hp.current = c.hp.max;
  c.resources = cls.resources.map(r => {
    const max = resourceMax(c, r.max);
    return { name: r.name, max, value: max };
  });
  return c;
}
