// Lancer de dés : expressions du type « d20 », « 2d6+3 », « 1d8 + 1d6 - 1 », « 4d6kh3 »
// (kh3 : garder les 3 meilleurs, kl1 : garder le plus faible).

// Entier uniforme de 1 à n (tirage cryptographique, sans biais de modulo).
export function rollDie(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  let x;
  do { x = crypto.getRandomValues(new Uint32Array(1))[0]; } while (x >= limit);
  return (x % n) + 1;
}

const TERM = /([+-]?)(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/gi;

// « 2d6+3 » → [{ sign: 1, n: 2, sides: 6 }, { sign: 1, flat: 3 }] ; null si l'expression est invalide.
export function parseDice(expr) {
  const s = String(expr ?? '').toLowerCase().replace(/\s+/g, '').replace(/^\+/, '');
  if (!s || !/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(s)) return null;
  const terms = [];
  for (const m of s.matchAll(TERM)) {
    const sign = m[1] === '-' ? -1 : 1;
    if (m[6] !== undefined) { terms.push({ sign, flat: Number(m[6]) }); continue; }
    const n = m[2] === '' ? 1 : Number(m[2]);
    const sides = Number(m[3]);
    if (n < 1 || n > 100 || sides < 2 || sides > 1000) return null;
    const t = { sign, n, sides };
    if (m[4]) t.keep = { mode: m[4], count: Math.min(n, Math.max(1, Number(m[5]))) };
    terms.push(t);
  }
  return terms.length ? terms : null;
}

export function formatDice(terms) {
  return terms.map((t, i) => {
    const sign = t.sign < 0 ? '-' : i ? '+' : '';
    if (t.flat !== undefined) return `${sign}${t.flat}`;
    return `${sign}${t.n}d${t.sides}${t.keep ? `k${t.keep.mode}${t.keep.count}` : ''}`;
  }).join('');
}

// Ajoute un dé à l'expression (« 1d20 » + d6 → « 1d20+1d6 », « 1d6 » + d6 → « 2d6 »).
export function addDie(expr, sides) {
  const terms = parseDice(expr) ?? [];
  const same = terms.find(t => t.sides === sides && t.sign > 0 && !t.keep);
  if (same) same.n = Math.min(100, same.n + 1);
  else {
    const flatAt = terms.findIndex(t => t.flat !== undefined);
    terms.splice(flatAt < 0 ? terms.length : flatAt, 0, { sign: 1, n: 1, sides });
  }
  return formatDice(terms);
}

// Change le modificateur fixe de l'expression.
export function addModifier(expr, delta) {
  const terms = (parseDice(expr) ?? []).filter(t => t.flat === undefined);
  const flat = (parseDice(expr) ?? []).filter(t => t.flat !== undefined).reduce((s, t) => s + t.sign * t.flat, 0) + delta;
  if (flat) terms.push({ sign: flat < 0 ? -1 : 1, flat: Math.abs(flat) });
  return formatDice(terms);
}

// Lance une expression. mode « adv » / « dis » : avantage ou désavantage sur un d20 seul.
// Renvoie { expr, total, groups: [{ sign, sides, rolls: [{ v, kept }] }], flat, nat, mode } ou null.
export function rollDice(expr, mode = 'normal') {
  const terms = parseDice(expr);
  if (!terms) return null;
  let usedMode = 'normal';
  let nat = null;
  const groups = [];
  let flat = 0;
  terms.forEach(t => {
    if (t.flat !== undefined) { flat += t.sign * t.flat; return; }
    let n = t.n;
    let keep = t.keep;
    // Avantage / désavantage : sur le premier d20 lancé seul.
    if (mode !== 'normal' && t.sides === 20 && t.n === 1 && !keep && usedMode === 'normal') {
      n = 2;
      keep = { mode: mode === 'adv' ? 'h' : 'l', count: 1 };
      usedMode = mode;
    }
    const rolls = Array.from({ length: n }, () => ({ v: rollDie(t.sides), kept: true }));
    if (keep) {
      const order = rolls.map((r, i) => i).sort((a, b) => (keep.mode === 'h' ? rolls[b].v - rolls[a].v : rolls[a].v - rolls[b].v));
      const kept = new Set(order.slice(0, keep.count));
      rolls.forEach((r, i) => (r.kept = kept.has(i)));
    }
    groups.push({ sign: t.sign, sides: t.sides, rolls });
  });
  const total = groups.reduce((s, g) => s + g.sign * g.rolls.filter(r => r.kept).reduce((a, r) => a + r.v, 0), 0) + flat;
  // 20 ou 1 naturel : un seul d20 compté dans le jet.
  const d20 = groups.filter(g => g.sides === 20).flatMap(g => g.rolls.filter(r => r.kept));
  if (d20.length === 1 && (d20[0].v === 20 || d20[0].v === 1)) nat = d20[0].v;
  return { expr: formatDice(terms), total, groups, flat, nat, mode: usedMode };
}

// Première expression de dés trouvée dans un texte libre (« 1d8+3 tranchant » → « 1d8+3 »).
export function findDice(text) {
  const m = String(text ?? '').replace(/\s+(?=[+-])|(?<=[+-])\s+/g, '').match(/\d*d\d+(?:[+-](?:\d*d\d+|\d+))*/i);
  return m && parseDice(m[0]) ? m[0] : null;
}
