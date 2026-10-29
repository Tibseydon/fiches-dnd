import * as store from './store.js?v=202610291038';
import { CAMPAIGN_NAME } from './config.js?v=202610291038';
import {
  ABILITIES, SKILLS, CLASSES, SPECIES, BACKGROUNDS, ALIGNMENTS, CONDITIONS, FEATS,
  STANDARD_ARRAY, POINT_BUY_COST, POINT_BUY_BUDGET, SOURCES, LIB_INFO, applyLibrary, byId,
} from './data.js?v=202610291038';
import * as R from './rules.js?v=202610291038';
import {
  ABILITY_INFO, SKILL_INFO, STAT_INFO, CONDITION_INFO, FEAT_INFO, CLASS_FEATURE_INFO, SPECIES_INFO,
} from './info.js?v=202610291038';
import { featuresUpTo, scalingValues, asiLevels, EPIC_BOON_LEVEL, SUBCLASS_LEVEL } from './progression.js?v=202610291038';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');
let me = null;
let teardown = [];

// ── Utilitaires ─────────────────────────────────────────────

const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

function toast(msg, kind = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

function mount(html) {
  const root = document.createElement('div');
  root.className = 'view';
  root.innerHTML = html;
  $app.replaceChildren(root);
  return root;
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setPath(obj, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k, i) => {
    if (o[k] == null) o[k] = /^\d+$/.test(keys[i + 1] ?? last) ? [] : {};
    return o[k];
  }, obj);
  target[last] = val;
}

function initials(name) {
  return (name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Regroupe une liste (classes, espèces) par livre source, dans l'ordre de SOURCES.
function bySource(list) {
  return Object.keys(SOURCES)
    .map(src => [src, list.filter(x => x.source === src)])
    .filter(([, items]) => items.length);
}

// ── Fiches d'information (icônes « i ») ─────────────────────

// Personnage affiché sur la fiche : les infos de classe tiennent compte de ses réglages.
let infoCharacter = null;

const infoBtn = (key, label = '') =>
  `<button type="button" class="info-btn" data-info="${esc(key)}" aria-label="Informations${label ? ` : ${esc(label)}` : ''}" title="Informations">i</button>`;

const infoRows = rows => `<dl class="info-rows">${rows.filter(([, v]) => v).map(([k, v]) =>
  `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
const infoList = items => `<ul class="info-list">${items.map(([k, v]) =>
  `<li><b>${esc(k)}</b>${v ? ` — ${esc(v)}` : ''}</li>`).join('')}</ul>`;
const srcLine = src => (src && src !== 'phb' && src !== 'custom' ? `<p class="info-src">Source : ${esc(SOURCES[src])}</p>` : '');
const skillName = id => byId(SKILLS, id)?.name ?? id;
const casterLabel = { full: 'Lanceur complet', half: 'Semi-lanceur', pact: 'Magie de pacte' };

function classInfo(id) {
  const base = byId(CLASSES, id);
  if (!base) return null;
  const cls = infoCharacter?.classId === id ? R.classOf(infoCharacter) : base;
  const subs = bySource(cls.subclasses.map(n => ({ name: n, source: cls.subclassSources?.[n] ?? cls.source })));
  return [cls.name, `
    ${srcLine(cls.source)}
    ${cls.verify ? '<p class="notice wide">Données non toutes confirmées : vérifie-les dans ton livre et ajuste-les dans « Réglages de classe » sur la fiche.</p>' : ''}
    <p>${esc(cls.desc)}</p>
    ${infoRows([
      ['Dé de vie', `d${cls.hd} (PV au niveau 1 : ${cls.hd} + mod. CON ; ensuite ${cls.hd / 2 + 1} + mod. CON par niveau)`],
      ['Caractéristique principale', cls.primary !== '—' ? esc(cls.primary) : ''],
      ['Jets de sauvegarde', cls.saves.length ? cls.saves.map(a => byId(ABILITIES, a).name).join(', ') : 'à définir sur la fiche'],
      ['Compétences', `${cls.skillCount} au choix parmi : ${cls.skills.length === SKILLS.length ? 'toutes' : cls.skills.map(skillName).join(', ')}`],
      ['Armures', esc(cls.armor)],
      ['Armes', esc(cls.weapons)],
      ['Outils', esc(cls.tools)],
      ['Magie', cls.caster ? `${casterLabel[cls.caster]}${cls.spellAb ? ` (${byId(ABILITIES, cls.spellAb).name})` : ''}` : cls.spellAb ? `DD basé sur ${byId(ABILITIES, cls.spellAb).name}` : 'Aucune'],
    ])}
    ${infoCharacter?.classId === id ? `<p class="small muted">Niveau actuel : ${infoCharacter.level}${scalingValues(id, infoCharacter.level).length ? ` · ${esc(scalingValues(id, infoCharacter.level).join(' · '))}` : ''}</p>` : ''}
    <h4>Capacités de niveau 1</h4>
    ${CLASS_FEATURE_INFO[id] ? infoList(CLASS_FEATURE_INFO[id])
      : cls.libFeatures ? infoList(cls.libFeatures.filter(f => f.level <= 1).map(f => [f.name, f.summary]))
      : `<p>${esc(cls.features || 'À recopier depuis ton livre.')}</p>`}
    ${cls.libFeatures?.some(f => f.level > 1) ? `<h4>Capacités par niveau</h4>${infoList(cls.libFeatures.filter(f => f.level > 1)
      .sort((a, b) => a.level - b.level).map(f => [`Niv. ${f.level} — ${f.name}`, f.summary]))}` : ''}
    ${!cls.libFeatures && featuresUpTo(id, 20).length ? `<h4>Progression</h4><ul class="info-list">${featuresUpTo(id, 20).map(([l, names]) =>
      `<li class="${infoCharacter?.classId === id && l <= infoCharacter.level ? 'reached' : ''}"><b>Niv. ${l}</b> — ${esc(names.join(', '))}</li>`).join('')}</ul>` : ''}
    ${subs.length ? `<h4>Sous-classes (niveau 3)</h4>${subs.map(([src, items]) =>
      `<p class="small"><b>${esc(SOURCES[src])} :</b> ${items.map(x => esc(x.name)).join(', ')}</p>`).join('')}` : ''}`];
}

function speciesInfo(id) {
  const sp = byId(SPECIES, id);
  if (!sp) return null;
  const traits = SPECIES_INFO[id] ?? (sp.traitsInfo?.length ? sp.traitsInfo : null);
  return [sp.name, `
    ${srcLine(sp.source)}
    ${infoRows([
      ['Taille', sp.size !== '—' ? esc(sp.size) : ''],
      ['Vitesse', `${String(sp.speed).replace('.', ',')} m`],
      ['Vision dans le noir', sp.darkvision ? `${sp.darkvision} m` : ''],
      [sp.lineageLabel ?? 'Lignages', sp.lineages ? esc(sp.lineages.join(', ')) : ''],
    ])}
    ${traits ? `<h4>Traits</h4>${infoList(traits)}`
      : id === 'custom' ? '<p>Renseigne le nom de ton espèce, puis recopie ses traits dans « Capacités, traits &amp; dons » sur la fiche.</p>'
      : `<p>Les traits de cette espèce ne sont pas repris ici (texte protégé). Recopie-les depuis <i>${esc(SOURCES[sp.source])}</i> dans « Capacités, traits &amp; dons » sur ta fiche, et ajuste la vitesse si besoin.</p>`}
    <p class="small muted">En 2024, l'espèce ne donne pas de bonus de caractéristiques : ils viennent de l'historique.</p>`];
}

function backgroundInfo(id) {
  const bg = byId(BACKGROUNDS, id);
  if (!bg) return null;
  return [bg.name, `
    ${infoRows([
      ['Caractéristiques', `${bg.abilities.map(a => byId(ABILITIES, a).name).join(', ')} : +2 / +1 ou +1 / +1 / +1`],
      ['Don d\'origine', `<b>${esc(FEATS[bg.feat])}</b> — ${esc(FEAT_INFO[bg.feat] ?? LIB_INFO.feats[bg.feat] ?? '')}`],
      ['Compétences', bg.skills.map(skillName).join(', ')],
      ['Outil', esc(bg.tool)],
    ])}
    <p class="small muted">L'historique donne aussi de l'équipement de départ (ou 50 po), à voir dans le Manuel des joueurs.</p>`];
}

function infoContent(key) {
  const [type, id] = key.split(':');
  switch (type) {
    case 'class': return classInfo(id);
    case 'species': return speciesInfo(id);
    case 'bg': return backgroundInfo(id);
    case 'feat': return FEATS[id] ? [FEATS[id], `<p>${esc(FEAT_INFO[id] ?? LIB_INFO.feats[id] ?? '')}</p><p class="small muted">Don d'origine (niveau 1).</p>`] : null;
    case 'skill': {
      const sk = byId(SKILLS, id);
      return sk && [sk.name, `<p class="info-src">Caractéristique : ${byId(ABILITIES, sk.ab).name}</p><p>${esc(SKILL_INFO[id])}</p>`];
    }
    case 'ability': {
      const ab = byId(ABILITIES, id);
      return ab && [ab.name, `<p>${esc(ABILITY_INFO[id])}</p>
        <p class="small muted">Modificateur = (valeur − 10) ÷ 2, arrondi à l'inférieur. Compétences : ${SKILLS.filter(x => x.ab === id).map(x => x.name).join(', ') || 'aucune'}.</p>`];
    }
    case 'stat': return STAT_INFO[id] && [STAT_INFO[id][0], `<p>${esc(STAT_INFO[id][1])}</p>`];
    case 'cond': return CONDITION_INFO[id] && [id, `<p>${esc(CONDITION_INFO[id])}</p>`];
    case 'conds': return ['États', infoList(Object.entries(CONDITION_INFO))];
    case 'subclass': {
      const c = infoCharacter;
      const cls = c && R.classOf(c);
      const src = cls?.subclassSources?.[c.subclass];
      const lib = LIB_INFO.subclasses[c?.subclass];
      return [c?.subclass || 'Sous-classe', `${src ? srcLine(src) : ''}
        ${lib ? `${lib.summary ? `<p>${esc(lib.summary)}</p>` : ''}${lib.features.length ? infoList(lib.features
          .sort((a, b) => a.level - b.level).map(f => [`Niv. ${f.level} — ${f.name}`, f.summary])) : ''}`
          : `<p>${esc(STAT_INFO.subclass[1])}</p>
        ${src && src !== 'phb' ? '<p class="small muted">Capacités à recopier depuis le livre dans « Capacités, traits &amp; dons ».</p>' : ''}`}`];
    }
  }
  return null;
}

function openInfo(key) {
  const content = infoContent(key);
  if (!content) return;
  let dlg = document.getElementById('info-dialog');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'info-dialog';
    dlg.addEventListener('click', e => {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    });
    document.body.append(dlg);
  }
  dlg.innerHTML = `<div class="info-body">
    <header><h2>${esc(content[0])}</h2><button type="button" class="icon" data-close aria-label="Fermer">✕</button></header>
    ${content[1]}
  </div>`;
  dlg.showModal();
}

// En phase de capture : l'icône ne déclenche pas le clic de la carte qui la contient.
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-info]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  openInfo(btn.dataset.info);
}, true);

function portrait(c, cls = '') {
  const url = /^https?:\/\//.test(c.portrait || '') ? c.portrait : '';
  return url
    ? `<div class="portrait ${cls}"><img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>`
    : `<div class="portrait ${cls}">${esc(initials(c.name))}</div>`;
}

function hpBar(c) {
  const max = Math.max(1, Number(c.hp?.max) || 1);
  const cur = Math.max(0, Number(c.hp?.current) || 0);
  const temp = Math.max(0, Number(c.hp?.temp) || 0);
  const pct = Math.min(100, (cur / max) * 100);
  const state = pct <= 25 ? 'low' : pct <= 50 ? 'mid' : 'ok';
  return `<div class="hpbar ${state}" data-hpbar>
    <div class="fill" style="width:${pct}%"></div>
    <span>${cur} / ${max} PV${temp ? ` <b>+${temp}</b>` : ''}</span>
  </div>`;
}

// ── Navigation ──────────────────────────────────────────────

function renderNav() {
  if (!me) { $nav.innerHTML = ''; return; }
  const h = location.hash;
  $nav.innerHTML = `
    <a href="#/groupe" class="${h.startsWith('#/groupe') || h === '' ? 'active' : ''}">Le groupe</a>
    <a href="#/nouveau" class="${h.startsWith('#/nouveau') ? 'active' : ''}">+ Nouveau personnage</a>
    ${me.role === 'mj' ? `<a href="#/campagne" class="${h.startsWith('#/campagne') ? 'active' : ''}">Campagne</a>
      <a href="#/bibliotheque" class="${h.startsWith('#/bibliotheque') ? 'active' : ''}">Bibliothèque</a>` : ''}
    <a href="#/profil" class="who ${h.startsWith('#/profil') ? 'active' : ''}" title="Mon profil">${esc(me.displayName)}${me.role === 'mj' ? ' <span class="badge gm">MJ</span>' : ''}</a>
    <button class="btn ghost small" id="logout">Déconnexion</button>`;
  $nav.querySelector('#logout').onclick = () => { location.hash = '#/groupe'; store.signOut(); };
}

function route() {
  teardown.forEach(f => f());
  teardown = [];
  renderNav();
  if (!me) return authView();
  if (me.noProfile) return noProfileView();
  const h = location.hash || '#/groupe';
  const m = h.match(/^#\/perso\/([\w-]+)/);
  if (m) return sheetView(m[1]);
  if (h.startsWith('#/nouveau')) return wizardView();
  if (h.startsWith('#/profil')) return profileView();
  if (h.startsWith('#/campagne')) return campaignView();
  if (h.startsWith('#/bibliotheque')) return libraryView();
  partyView();
}

// ── Connexion / inscription ─────────────────────────────────

function authView() {
  const local = store.mode === 'local';
  const root = mount(`
    <section class="auth">
      <div class="auth-hero">
        <div class="d20">20</div>
        <h1>${esc(CAMPAIGN_NAME)}</h1>
        <p>Fiches de personnage D&amp;D 5.5 — crée ton héros et suis toute la troupe.</p>
      </div>
      ${local ? `<div class="notice">Mode local : les données restent dans ce navigateur. Configure Supabase (voir README) pour partager les fiches avec le groupe.</div>` : ''}
      <div class="card auth-card">
        <div class="tabs">
          <button class="tab active" data-tab="login">Connexion</button>
          <button class="tab" data-tab="signup">Créer un compte</button>
        </div>
        <form id="login">
          <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
          <label>Mot de passe<input name="password" type="password" required autocomplete="current-password"></label>
          <button class="btn primary block">Se connecter</button>
          ${local ? '' : '<button type="button" class="link" id="forgot">Mot de passe oublié ?</button>'}
        </form>
        <form id="signup" hidden>
          <label>Pseudo (nom du joueur)<input name="displayName" required maxlength="40" autocomplete="nickname"></label>
          <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
          <label>Mot de passe<input name="password" type="password" required minlength="6" autocomplete="new-password"></label>
          ${local ? '' : '<label>Code de campagne <small>(donné par le MJ)</small><input name="code" required autocomplete="off"></label>'}
          <button class="btn primary block">Créer mon compte</button>
        </form>
        <p class="error" id="err"></p>
        <p class="info" id="info"></p>
      </div>
    </section>`);

  const err = root.querySelector('#err');
  const info = root.querySelector('#info');
  root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
    root.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x === b));
    root.querySelector('#login').hidden = b.dataset.tab !== 'login';
    root.querySelector('#signup').hidden = b.dataset.tab !== 'signup';
    err.textContent = '';
    info.textContent = '';
  });

  const busy = async (form, fn) => {
    const btn = form.querySelector('button.primary');
    btn.disabled = true;
    err.textContent = '';
    try { await fn(new FormData(form)); } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; }
  };
  root.querySelector('#login').onsubmit = e => {
    e.preventDefault();
    busy(e.target, f => store.signIn(f.get('email'), f.get('password')));
  };
  root.querySelector('#signup').onsubmit = e => {
    e.preventDefault();
    busy(e.target, async f => {
      const r = await store.signUp(f.get('email'), f.get('password'), f.get('displayName').trim(), (f.get('code') || '').trim());
      if (r?.needsConfirm) {
        root.querySelector('[data-tab=login]').click();
        info.textContent = 'Compte créé ! Clique sur le lien reçu par e-mail, puis connecte-toi.';
      }
    });
  };
  const forgot = root.querySelector('#forgot');
  if (forgot) forgot.onclick = async () => {
    const email = root.querySelector('#login [name=email]').value;
    if (!email) { err.textContent = 'Indique ton e-mail ci-dessus.'; return; }
    try { await store.resetPassword(email); toast('E-mail de réinitialisation envoyé.'); } catch (e) { err.textContent = e.message; }
  };
}

function noProfileView() {
  mount(`<section class="card narrow">
    <h2>Profil introuvable</h2>
    <p>Ton compte existe mais n'est pas rattaché à la campagne (code de campagne refusé ?). Contacte le MJ ou recrée un compte.</p>
    <button class="btn primary" id="out">Se déconnecter</button>
  </section>`).querySelector('#out').onclick = () => store.signOut();
}

// ── Vue du groupe ───────────────────────────────────────────

function partyView() {
  const root = mount('<div class="loading">Chargement du groupe…</div>');
  let filter = 'all';

  const render = (list, error) => {
    if (error) { root.innerHTML = `<p class="error">${esc(error.message)}</p>`; return; }
    const shown = filter === 'mine' ? list.filter(c => c.ownerUid === me.uid) : list;
    root.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Le groupe</h1>
          <p class="muted">${list.length} personnage${list.length > 1 ? 's' : ''} · mise à jour en direct</p>
        </div>
        <div class="row">
          <div class="seg">
            <button data-f="all" class="${filter === 'all' ? 'active' : ''}">Tous</button>
            <button data-f="mine" class="${filter === 'mine' ? 'active' : ''}">Les miens</button>
          </div>
          <a class="btn primary" href="#/nouveau">+ Nouveau personnage</a>
        </div>
      </div>
      ${shown.length ? `<div class="grid cards">${shown.map(partyCard).join('')}</div>` : `
        <div class="empty card">
          <div class="d20 small">20</div>
          <p>${filter === 'mine' ? "Tu n'as pas encore de personnage." : "Aucun personnage dans le groupe pour l'instant."}</p>
          <a class="btn primary" href="#/nouveau">Créer un personnage</a>
        </div>`}
      ${shown.length > 0 ? partyTable(shown) : ''}`;
    root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; render(list); });
  };

  let latest = [];
  teardown.push(store.watchCharacters((list, e) => { latest = list; render(latest, e); }));
}

function partyCard(c) {
  const sp = R.spellInfo(c);
  const mine = c.ownerUid === me.uid;
  const sub = c.subclass ? ` — ${esc(c.subclass)}` : '';
  return `<a class="card char-card${mine ? ' mine' : ''}" href="#/perso/${esc(c.id)}">
    <div class="cc-head">
      ${portrait(c)}
      <div class="cc-title">
        <h3>${esc(c.name)} ${c.inspiration ? '<span title="Inspiration héroïque" class="insp">★</span>' : ''}</h3>
        <div class="muted">${esc(R.labelFor(c))}${sub}</div>
        <div class="player">Joué par ${esc(c.ownerName)}${mine ? ' <span class="badge">moi</span>' : ''}</div>
      </div>
    </div>
    ${hpBar(c)}
    <div class="mini-stats">
      <div><b>${esc(c.ac)}</b><span>CA</span></div>
      <div><b>${R.fmt(R.initiative(c))}</b><span>Init.</span></div>
      <div><b>${R.passive(c, 'perception')}</b><span>Perc. passive</span></div>
      <div><b>${sp ? sp.dc : '—'}</b><span>DD sorts</span></div>
    </div>
    ${(c.conditions ?? []).length ? `<div class="conds">${c.conditions.map(x => `<span class="badge warn" title="${esc(CONDITION_INFO[x] ?? '')}">${esc(x)}</span>`).join('')}</div>` : ''}
  </a>`;
}

function partyTable(list) {
  const best = {};
  ABILITIES.forEach(a => (best[a.id] = Math.max(...list.map(c => R.score(c, a.id)))));
  const bestPP = Math.max(...list.map(c => R.passive(c, 'perception')));
  return `<section class="card table-card">
    <h2>Comparatif du groupe</h2>
    <div class="table-wrap"><table class="party">
      <thead><tr>
        <th>Personnage</th><th>Niv.</th><th>PV</th><th>CA</th><th>Init.</th><th>Vit.</th>
        ${ABILITIES.map(a => `<th title="${a.name}">${a.short}</th>`).join('')}
        <th title="Perception passive">Perc.</th><th title="Intuition passive">Intu.</th><th title="Investigation passive">Inv.</th><th>DD</th>
      </tr></thead>
      <tbody>${list.map(c => {
        const sp = R.spellInfo(c);
        const pp = R.passive(c, 'perception');
        return `<tr>
          <td><a href="#/perso/${esc(c.id)}">${esc(c.name)}</a><div class="muted small">${esc(R.classOf(c)?.name ?? '')}</div></td>
          <td>${esc(c.level)}</td>
          <td class="nowrap">${esc(c.hp?.current)}/${esc(c.hp?.max)}${c.hp?.temp ? ` <small>+${esc(c.hp.temp)}</small>` : ''}</td>
          <td>${esc(c.ac)}</td>
          <td>${R.fmt(R.initiative(c))}</td>
          <td class="nowrap">${esc(c.speed)} m</td>
          ${ABILITIES.map(a => {
            const s = R.score(c, a.id);
            return `<td class="${s === best[a.id] && list.length > 1 ? 'best' : ''}">${R.fmt(R.mod(s))}<small> ${s}</small></td>`;
          }).join('')}
          <td class="${pp === bestPP && list.length > 1 ? 'best' : ''}">${pp}</td>
          <td>${R.passive(c, 'insight')}</td>
          <td>${R.passive(c, 'investigation')}</td>
          <td>${sp ? sp.dc : '—'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </section>`;
}

// ── Mon profil ──────────────────────────────────────────────

function profileView() {
  const root = mount(`<section class="card narrow">
    <h1>Mon profil</h1>
    <form id="profile">
      <label>Pseudo (affiché au groupe et sur tes fiches)
        <input name="displayName" value="${esc(me.displayName)}" required maxlength="40" autocomplete="nickname"></label>
      <p class="small muted">E-mail : ${esc(me.email ?? '')} · Rôle : ${me.role === 'mj' ? 'MJ' : 'joueur'}</p>
      <button class="btn primary">Enregistrer</button>
      <p class="error" id="err"></p>
    </form>
  </section>`);
  root.querySelector('#profile').onsubmit = async e => {
    e.preventDefault();
    const name = new FormData(e.target).get('displayName').trim();
    const err = root.querySelector('#err');
    err.textContent = '';
    if (!name) { err.textContent = 'Le pseudo ne peut pas être vide.'; return; }
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    try {
      await store.updateProfile(name);
      me.displayName = name;
      renderNav();
      toast('Pseudo mis à jour.', 'ok');
    } catch (ex) { err.textContent = ex.message; } finally { btn.disabled = false; }
  };
}

// ── Réglages de la campagne (MJ) ────────────────────────────

function campaignView() {
  const root = mount('<div class="loading">Chargement…</div>');
  const gm = me.role === 'mj';
  store.getCampaign().then(cfg => {
    root.innerHTML = `<section class="card narrow">
      <h1>Campagne</h1>
      <form id="campaign">
        <label>Niveau de départ des personnages
          <select name="startLevel" ${gm ? '' : 'disabled'}>${Array.from({ length: 20 }, (_, i) =>
            `<option value="${i + 1}" ${cfg.startLevel === i + 1 ? 'selected' : ''}>Niveau ${i + 1}</option>`).join('')}</select></label>
        <p class="small muted">Les nouveaux personnages sont créés directement à ce niveau : PV, bonus de maîtrise, emplacements de sorts,
          ressources et capacités de classe sont calculés automatiquement. Le joueur choisit lui-même sa sous-classe
          (dès le niveau ${SUBCLASS_LEVEL}), ses améliorations de caractéristiques ou dons, puis ses sorts et autres options sur sa fiche.
          Les personnages déjà créés ne changent pas.</p>
        ${gm ? '<button class="btn primary">Enregistrer</button>' : '<p class="notice wide">Seul le MJ peut modifier ces réglages.</p>'}
        <p class="error" id="err"></p>
      </form>
    </section>`;
    const form = root.querySelector('#campaign');
    form.onsubmit = async e => {
      e.preventDefault();
      const err = root.querySelector('#err');
      err.textContent = '';
      try {
        await store.saveCampaign({ ...cfg, startLevel: Number(new FormData(form).get('startLevel')) });
        toast('Réglages de campagne enregistrés.', 'ok');
      } catch (ex) { err.textContent = ex.message; }
    };
  });
}

// ── Bibliothèque du MJ (import de livres) ───────────────────

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38';
const CHUNK_CHARS = 20000;
const PARALLEL = 3;
// Claude Opus 5.5 : 4 $ par million d'unités lues, 20 $ par million écrites.
const PRICE_IN = 4 / 1e6;
const PRICE_OUT = 20 / 1e6;
const KIND_LABEL = { class: 'Classe', subclass: 'Sous-classe', species: 'Espèce', background: 'Historique', feat: 'Don' };

async function reloadLibrary() {
  applyLibrary(await store.listContent().catch(() => []));
}

async function readPdf(bytes, from, to, onPage) {
  const pdfjs = await import(`${PDFJS}/pdf.min.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.mjs`;
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const first = Math.max(1, from || 1);
  const last = Math.min(doc.numPages, to || doc.numPages);
  const pages = [];
  for (let n = first; n <= last; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    pages.push({ page: n, text: content.items.map(i => i.str + (i.hasEOL ? '\n' : ' ')).join('').replace(/[ \t]+/g, ' ') });
    onPage?.(n - first + 1, last - first + 1);
  }
  return { pages, total: doc.numPages };
}

function htmlToText(html) {
  const marked = html.replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/tr)[^>]*>/gi, '$&\n');
  const doc = new DOMParser().parseFromString(marked, 'text/html');
  doc.querySelectorAll('script, style, noscript').forEach(n => n.remove());
  return (doc.body?.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

// Découpe en parties d'environ CHUNK_CHARS caractères, en gardant les numéros de page.
function makeChunks(pages) {
  const chunks = [];
  let cur = { from: null, to: null, text: '' };
  const push = () => { if (cur.text.trim()) chunks.push(cur); cur = { from: null, to: null, text: '' }; };
  pages.forEach(({ page, text }) => {
    for (let i = 0; i < text.length; i += CHUNK_CHARS) {
      const piece = text.slice(i, i + CHUNK_CHARS);
      if (cur.text.length + piece.length > CHUNK_CHARS) push();
      cur.from ??= page;
      cur.to = page;
      cur.text += (page ? `\n[Page ${page}]\n` : '\n') + piece;
    }
  });
  push();
  return chunks;
}

const itemKey = it => `${it.kind}|${String(it.name).trim().toLowerCase()}`;

// Fusionne les éléments d'une partie avec ceux déjà trouvés (une option peut chevaucher deux parties).
function mergeItems(acc, items) {
  items.forEach(raw => {
    if (!raw?.name?.trim() || !KIND_LABEL[raw.kind]) return;
    const old = acc.find(x => itemKey(x) === itemKey(raw));
    if (!old) { acc.push({ ...raw, include: true }); return; }
    Object.entries(raw).forEach(([k, v]) => {
      if (k === 'features') {
        v.forEach(f => {
          if (!old.features.some(o => o.level === f.level && o.name.toLowerCase() === f.name.toLowerCase())) old.features.push(f);
        });
      } else if (Array.isArray(v)) old[k] = [...new Set([...(old[k] ?? []), ...v])];
      else if ((old[k] === '' || old[k] === 0 || old[k] == null || old[k] === 'none' || old[k] === 'other') && v) old[k] = v;
      else if (k === 'summary' && v.length > (old.summary?.length ?? 0) * 1.5) old.summary = v;
    });
  });
  return acc;
}

function estimateCost(chars, parts) {
  const input = chars / 3.5 + parts * 2500;
  const output = parts * 3000;
  const mid = input * PRICE_IN + output * PRICE_OUT;
  return [mid * 0.6, mid * 1.6];
}
const usd = n => `${n < 1 ? n.toFixed(2) : n.toFixed(1)} $`;

function libraryView() {
  if (me.role !== 'mj') {
    mount('<section class="card narrow"><h1>Bibliothèque</h1><p>Réservée au MJ.</p></section>');
    return;
  }
  const root = mount('<div class="loading">Chargement…</div>');
  const st = { phase: 'form', title: '', from: '', to: '', url: '', file: null, chunks: [], items: [], done: 0, failed: [], usage: { in: 0, out: 0 }, cancel: false, log: '' };
  let saved = [];

  const reviewRow = (it, i) => `<div class="card lib-item ${it.include ? '' : 'off'}">
      <div class="row">
        <label class="check"><input type="checkbox" data-inc="${i}" ${it.include ? 'checked' : ''}> garder</label>
        <select data-it="${i}" data-f="kind">${Object.entries(KIND_LABEL).map(([k, l]) => `<option value="${k}" ${it.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <input data-it="${i}" data-f="name" value="${esc(it.name)}" class="lib-name">
        ${it.kind === 'subclass' ? `<select data-it="${i}" data-f="parent_class">${CLASSES.filter(c => c.source === 'phb' || c.id === 'artificer').map(c =>
          `<option value="${c.id}" ${it.parent_class === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          <option value="other" ${it.parent_class === 'other' ? 'selected' : ''}>Autre : ${esc(it.parent_class_name || '?')}</option></select>` : ''}
      </div>
      <textarea data-it="${i}" data-f="summary" rows="2">${esc(it.summary)}</textarea>
      <p class="small muted">${[
        it.kind === 'class' && `DV d${it.hit_die || '?'} · JS ${(it.saving_throws ?? []).map(R.abilityShort).join(', ') || '?'} · ${it.skill_count || '?'} compétences · magie : ${{ none: 'aucune', full: 'complète', half: 'semi', third: 'tiers', pact: 'pacte' }[it.spellcasting] ?? it.spellcasting}`,
        it.kind === 'species' && `Taille ${it.size || '?'} · ${it.speed_m || '?'} m · vision ${it.darkvision_m || 0} m`,
        it.kind === 'background' && `${(it.ability_options ?? []).map(R.abilityShort).join(', ')} · don : ${it.origin_feat || '?'} · ${(it.skills ?? []).map(x => byId(SKILLS, x)?.name).join(', ')}`,
        it.features?.length && `${it.features.length} capacité(s) : ${it.features.slice(0, 6).map(f => `${f.name}${f.level > 1 ? ` (niv. ${f.level})` : ''}`).join(', ')}${it.features.length > 6 ? '…' : ''}`,
      ].filter(Boolean).map(esc).join('<br>')}</p>
    </div>`;

  function render() {
    const kept = st.items.filter(x => x.include).length;
    const byBook = {};
    saved.forEach(x => (byBook[x.source_title] ??= []).push(x));
    const [lo, hi] = estimateCost(st.chunks.reduce((n, c) => n + c.text.length, 0), st.chunks.length);
    root.innerHTML = `
      <div class="page-head"><div><h1>Bibliothèque</h1>
        <p class="muted">Importe les livres que tu possèdes : leurs classes, sous-classes, espèces, historiques et dons apparaissent ensuite dans l'assistant et sur les fiches. Les contenus restent privés, visibles seulement par les membres de la campagne.</p></div></div>

      ${st.phase === 'form' ? `<section class="card">
        <h2>Importer un livre</h2>
        <form id="lib-form">
          <label>Titre du livre (affiché comme source)<input name="title" required value="${esc(st.title)}" placeholder="ex. Tasha's Cauldron of Everything"></label>
          <div class="grid two">
            <label>Fichier (PDF, ou texte .txt / .md / .html)<input type="file" name="file" accept=".pdf,.txt,.md,.html,.htm,application/pdf,text/*"></label>
            <label>… ou lien direct vers un PDF ou une page web publique<input name="url" type="url" value="${esc(st.url)}" placeholder="https://…"></label>
          </div>
          <div class="row">
            <label>Pages, de<input type="number" name="from" min="1" value="${esc(st.from)}" class="tiny"></label>
            <label>à<input type="number" name="to" min="1" value="${esc(st.to)}" class="tiny"></label>
            <p class="small muted">Facultatif (PDF) : limite l'analyse au chapitre des options de joueur pour réduire le coût.</p>
          </div>
          <button class="btn primary">Lire le document</button>
          <p class="error" id="lib-err">${esc(st.log)}</p>
        </form>
      </section>` : ''}

      ${st.phase === 'reading' ? `<section class="card"><h2>Lecture du document…</h2><p class="muted" id="lib-progress">${esc(st.log)}</p></section>` : ''}

      ${st.phase === 'ready' ? `<section class="card">
        <h2>${esc(st.title)}</h2>
        <p>${esc(st.log)} → <b>${st.chunks.length}</b> partie${st.chunks.length > 1 ? 's' : ''} à analyser.</p>
        <p>Coût estimé avec Claude Opus 5.5 : <b>${usd(lo)} à ${usd(hi)}</b> (facturé sur ta clé API Anthropic).</p>
        <div class="row">
          <button class="btn primary" data-a="lib-run">Lancer l'extraction</button>
          <button class="btn ghost" data-a="lib-reset">Annuler</button>
        </div>
      </section>` : ''}

      ${st.phase === 'running' || st.phase === 'review' ? `<section class="card">
        <h2>${esc(st.title)}</h2>
        <div class="progress"><div style="width:${st.chunks.length ? (st.done / st.chunks.length) * 100 : 0}%"></div></div>
        <p class="small">${st.done} / ${st.chunks.length} parties · ${st.items.length} élément(s) trouvé(s) · coût réel : ${usd(st.usage.in * PRICE_IN + st.usage.out * PRICE_OUT)}
          ${st.failed.length ? ` · <span class="error">${st.failed.length} partie(s) en échec</span>` : ''}</p>
        ${st.log ? `<p class="error">${esc(st.log)}</p>` : ''}
        ${st.phase === 'running'
          ? '<button class="btn ghost" data-a="lib-stop">Arrêter</button>'
          : `<div class="row">${st.failed.length ? '<button class="btn ghost" data-a="lib-retry">Relancer les parties en échec</button>' : ''}
              <button class="btn ghost" data-a="lib-reset">Abandonner</button></div>`}
      </section>` : ''}

      ${st.phase === 'review' ? `<section>
        <h2 class="src-head">Vérification — ${kept} élément(s) gardé(s)</h2>
        <p class="muted small">Relis et corrige avant d'enregistrer : l'extraction automatique peut se tromper. Les résumés sont reformulés, pas recopiés du livre.</p>
        ${st.items.length ? st.items.map(reviewRow).join('') : '<p class="muted">Aucune option de joueur trouvée dans ce document.</p>'}
        <div class="wizard-nav"><span></span><button class="btn primary" data-a="lib-save" ${kept ? '' : 'disabled'}>Enregistrer ${kept} élément(s) dans la campagne</button></div>
      </section>` : ''}

      <section class="card table-card">
        <h2>Contenus de la campagne</h2>
        ${Object.keys(byBook).length ? Object.entries(byBook).map(([book, list]) => `
          <details class="lib-book"><summary><b>${esc(book)}</b> — ${list.length} élément(s)
            <button class="btn danger small" data-a="lib-del-book" data-k="${esc(book)}">Supprimer le livre</button></summary>
            ${Object.entries(KIND_LABEL).map(([k, l]) => {
              const xs = list.filter(x => x.kind === k);
              return xs.length ? `<p class="small"><b>${l}s :</b> ${xs.map(x => `${esc(x.name)} <button class="icon" data-a="lib-del" data-k="${x.id}" title="Supprimer">✕</button>`).join(' · ')}</p>` : '';
            }).join('')}
          </details>`).join('') : '<p class="muted small">Aucun livre importé pour l\'instant.</p>'}
      </section>`;
  }

  async function runParts(indexes) {
    st.phase = 'running';
    st.cancel = false;
    st.log = '';
    render();
    const queue = [...indexes];
    const worker = async () => {
      while (queue.length && !st.cancel) {
        const i = queue.shift();
        let attempt = 0;
        for (;;) {
          try {
            const res = await store.libraryCall({
              action: 'extract', title: st.title, text: st.chunks[i].text,
              known: st.items.map(x => ({ kind: x.kind, name: x.name })),
            });
            st.usage.in += res.usage?.input_tokens ?? 0;
            st.usage.out += res.usage?.output_tokens ?? 0;
            if (res.error) { st.failed.push(i); st.log = `Partie ${i + 1} : ${res.error}`; } else mergeItems(st.items, res.items ?? []);
            break;
          } catch (e) {
            if (e.retry && attempt++ < 2) { await new Promise(r => setTimeout(r, 20000)); continue; }
            st.failed.push(i);
            st.log = `Partie ${i + 1} : ${e.message}`;
            // Erreur de configuration (clé, fonction absente) : inutile de continuer.
            if (!e.retry) st.cancel = true;
            break;
          }
        }
        st.done++;
        render();
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    queue.forEach(i => st.failed.push(i));
    st.phase = 'review';
    render();
  }

  root.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    Object.assign(st, { title: f.get('title').trim(), url: f.get('url').trim(), from: f.get('from'), to: f.get('to'), log: '' });
    const file = f.get('file');
    if (!file?.size && !st.url) { st.log = 'Choisis un fichier ou colle un lien.'; render(); return; }
    st.phase = 'reading';
    render();
    const progress = t => { const el = root.querySelector('#lib-progress'); if (el) el.textContent = t; };
    try {
      let bytes;
      if (file?.size) bytes = new Uint8Array(await file.arrayBuffer());
      else {
        progress('Téléchargement du lien…');
        bytes = new Uint8Array(await (await store.libraryCall({ action: 'fetch', url: st.url })).arrayBuffer());
      }
      const isPdf = String.fromCharCode(...bytes.slice(0, 4)) === '%PDF';
      let pages;
      if (isPdf) {
        const res = await readPdf(bytes, Number(st.from) || 0, Number(st.to) || 0, (n, total) => progress(`Lecture de la page ${n} / ${total}…`));
        pages = res.pages;
        const chars = pages.reduce((n, p) => n + p.text.trim().length, 0);
        if (chars < pages.length * 50) throw new Error('Ce PDF ne contient presque pas de texte (PDF scanné en images ?) : il ne peut pas être analysé.');
        st.log = `${pages.length} page(s) lue(s) sur ${res.total}`;
      } else {
        const raw = new TextDecoder().decode(bytes);
        const text = /<html|<body|<div|<p[ >]/i.test(raw) ? htmlToText(raw) : raw;
        pages = [{ page: null, text }];
        st.log = `${Math.round(text.length / 1000)} 000 caractères lus`;
      }
      st.chunks = makeChunks(pages);
      if (!st.chunks.length) throw new Error('Aucun texte trouvé dans ce document.');
      Object.assign(st, { phase: 'ready', items: [], done: 0, failed: [], usage: { in: 0, out: 0 } });
    } catch (ex) {
      st.phase = 'form';
      st.log = ex.message;
    }
    render();
  });

  root.addEventListener('click', async e => {
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const { a: act, k } = a.dataset;
    if (act === 'lib-run') runParts(st.chunks.map((_, i) => i));
    if (act === 'lib-retry') { const again = st.failed; st.failed = []; st.done -= again.length; runParts(again); }
    if (act === 'lib-stop') { st.cancel = true; st.log = 'Extraction arrêtée.'; }
    if (act === 'lib-reset') { Object.assign(st, { phase: 'form', chunks: [], items: [], log: '' }); render(); }
    if (act === 'lib-save') {
      a.disabled = true;
      const rows = st.items.filter(x => x.include).map(({ include, kind, name, ...data }) =>
        ({ kind, name: name.trim(), source_title: st.title, data }));
      try {
        await store.addContent(rows);
        await reloadLibrary();
        saved = await store.listContent();
        Object.assign(st, { phase: 'form', chunks: [], items: [], log: '', url: '', from: '', to: '' });
        toast(`${rows.length} élément(s) ajouté(s) à la campagne.`, 'ok');
        render();
      } catch (ex) { toast(ex.message, 'error'); a.disabled = false; }
    }
    if (act === 'lib-del' || act === 'lib-del-book') {
      e.preventDefault();
      const ids = act === 'lib-del' ? [k] : saved.filter(x => x.source_title === k).map(x => x.id);
      if (!confirm(act === 'lib-del' ? 'Supprimer cet élément ?' : `Supprimer tout le contenu de « ${k} » ?`)) return;
      try {
        await store.deleteContent(ids);
        await reloadLibrary();
        saved = await store.listContent();
        render();
      } catch (ex) { toast(ex.message, 'error'); }
    }
  });

  root.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.inc) { st.items[Number(t.dataset.inc)].include = t.checked; render(); }
    else if (t.dataset.it) { st.items[Number(t.dataset.it)][t.dataset.f] = t.value; if (t.dataset.f === 'kind') render(); }
  });
  root.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.it && t.tagName !== 'SELECT') st.items[Number(t.dataset.it)][t.dataset.f] = t.value;
  });

  store.listContent().then(list => { saved = list; render(); });
}

// ── Assistant de création ──────────────────────────────────

const PRIORITY = {
  barbarian: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
  bard: ['cha', 'dex', 'con', 'wis', 'int', 'str'],
  cleric: ['wis', 'con', 'str', 'cha', 'int', 'dex'],
  druid: ['wis', 'con', 'dex', 'int', 'cha', 'str'],
  fighter: ['str', 'con', 'dex', 'wis', 'int', 'cha'],
  monk: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
  paladin: ['str', 'cha', 'con', 'wis', 'dex', 'int'],
  ranger: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
  rogue: ['dex', 'con', 'wis', 'int', 'cha', 'str'],
  sorcerer: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
  warlock: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
  wizard: ['int', 'con', 'dex', 'wis', 'cha', 'str'],
};

const STEPS = ['Classe', 'Espèce', 'Historique', 'Caractéristiques', 'Compétences', 'Niveau', 'Finalisation'];

function wizardView() {
  const w = {
    step: 0, classId: null, speciesId: null, lineage: '', backgroundId: null,
    bgMode: '21', bgPicks: [], method: 'standard',
    base: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    classSkills: [], keenSense: '', skillful: '',
    name: '', level: 1, alignment: '', portrait: '', personality: '', backstory: '',
    customClassName: '', customSpeciesName: '', source: 'all',
    subclass: '', levelChoices: [],
  };
  const root = mount('');

  const cls = () => byId(CLASSES, w.classId);
  const sp = () => byId(SPECIES, w.speciesId);
  const bg = () => byId(BACKGROUNDS, w.backgroundId);
  const order = () => PRIORITY[w.classId] ?? ABILITIES.map(a => a.id);

  const suggestStandard = () => order().forEach((ab, i) => (w.base[ab] = STANDARD_ARRAY[i]));
  const defaultBgPicks = () => {
    const opts = bg().abilities;
    const sorted = [...opts].sort((a, b) => order().indexOf(a) - order().indexOf(b));
    w.bgPicks = w.bgMode === '21' ? sorted.slice(0, 2) : [...opts];
  };
  const bgBonus = () => {
    const b = {};
    if (!bg()) return b;
    if (w.bgMode === '21') {
      if (w.bgPicks[0]) b[w.bgPicks[0]] = 2;
      if (w.bgPicks[1]) b[w.bgPicks[1]] = (b[w.bgPicks[1]] ?? 0) + 1;
    } else bg().abilities.forEach(a => (b[a] = 1));
    return b;
  };
  const pbSpent = () => ABILITIES.reduce((s, a) => s + (POINT_BUY_COST[w.base[a.id]] ?? 99), 0);
  const ownedSkills = () => new Set([...(bg()?.skills ?? [])]);
  const extraSkills = () => [w.keenSense, w.skillful].filter(Boolean);

  // Choix liés au niveau de départ : une entrée par amélioration de caractéristiques (+ don épique).
  const syncChoices = () => {
    if (!w.classId) return;
    const levels = [...asiLevels(w.classId, w.level), ...(w.level >= EPIC_BOON_LEVEL ? [EPIC_BOON_LEVEL] : [])];
    const [a, b] = order();
    w.levelChoices = levels.map(l => w.levelChoices.find(ch => ch.level === l)
      ?? (l === EPIC_BOON_LEVEL ? { level: l, kind: 'boon', feat: '' } : { level: l, kind: 'asi', mode: '2', a, b, feat: '' }));
  };
  const totals = () => {
    const bg = bgBonus();
    const ch = R.choiceBonus(w.levelChoices);
    return Object.fromEntries(ABILITIES.map(x => [x.id, w.base[x.id] + (bg[x.id] ?? 0) + (ch[x.id] ?? 0)]));
  };
  const needsSubclass = () => w.level >= SUBCLASS_LEVEL && (cls()?.subclasses.length ?? 0) > 0;
  const choicesValid = () => w.levelChoices.every(ch =>
    ch.kind === 'asi' ? !!ch.a && (ch.mode === '2' || (!!ch.b && ch.b !== ch.a)) : !!ch.feat?.trim())
    && Object.values(totals()).every(v => v <= 20);

  function valid(step = w.step) {
    switch (step) {
      case 0: return !!w.classId && (w.classId !== 'custom' || !!w.customClassName.trim());
      case 1: return !!w.speciesId && (!sp().lineages || !!w.lineage)
        && (w.speciesId !== 'custom' || !!w.customSpeciesName.trim());
      case 2: return !!w.backgroundId && (w.bgMode === '111' || (w.bgPicks[0] && w.bgPicks[1] && w.bgPicks[0] !== w.bgPicks[1]));
      case 3: return w.method !== 'pointbuy' || pbSpent() <= POINT_BUY_BUDGET;
      case 4: return w.classSkills.length === cls().skillCount
        && (!sp().keenSenses || !!w.keenSense) && (!sp().skillful || !!w.skillful);
      case 5: return (!needsSubclass() || !!w.subclass) && choicesValid();
      case 6: return !!w.name.trim();
    }
    return true;
  }

  // Une étape est accessible si toutes celles d'avant sont complètes.
  const reachable = i => {
    for (let k = 0; k < i; k++) if (!valid(k)) return false;
    return true;
  };
  const goTo = i => {
    w.step = i;
    if (i === 3 && w.method === 'standard' && Object.values(w.base).every(x => x === 8)) suggestStandard();
    window.scrollTo(0, 0);
  };
  const stepperBar = () => `<ol class="stepper-bar">${STEPS.map((s, i) => `<li>
      <button class="${i === w.step ? 'current' : i < w.step ? 'done' : ''}" data-a="goto" data-v="${i}"
        ${i !== w.step && reachable(i) ? '' : 'disabled'} ${i === w.step ? 'aria-current="step"' : ''}>${i + 1}. ${s}</button>
    </li>`).join('')}</ol>`;

  const infoKey = { classId: 'class', speciesId: 'species', backgroundId: 'bg' };
  const optionCard = (field, o, body) => `
    <div class="card option${w[field] === o.id ? ' selected' : ''}" role="button" tabindex="0" aria-pressed="${w[field] === o.id}" data-pick="${field}" data-val="${o.id}">
      <div class="option-head"><h3>${esc(o.name)}</h3>${infoBtn(`${infoKey[field]}:${o.id}`, o.name)}</div>${body}
    </div>`;

  // Filtre par livre + cartes groupées par livre.
  const sourcePicker = list => {
    const used = bySource(list).map(([src]) => src);
    return `<label class="source-filter">Livre
      <select data-w="source"><option value="all">Tous les livres</option>
        ${used.map(src => `<option value="${src}" ${w.source === src ? 'selected' : ''}>${esc(SOURCES[src])}</option>`).join('')}
      </select></label>`;
  };
  // Un livre sans contenu pour cette étape (ex. pas d'espèce) revient à « Tous ».
  const groupedCards = (list, field, body) => bySource(list)
    .filter(([src], _, all) => !all.some(([x]) => x === w.source) || w.source === src)
    .map(([src, items]) => `<h3 class="src-head">${esc(SOURCES[src])}</h3>
      <div class="grid options">${items.map(o => optionCard(field, o, body(o))).join('')}</div>`).join('');
  const verifyBadge = '<span class="badge warn" title="Données non confirmées : à ajuster sur la fiche">à vérifier</span>';

  const steps = [
    () => `<p class="muted">Choisis la classe de ton personnage. L'icône <span class="info-btn static">i</span> donne le détail de chaque choix.</p>
      ${groupedCards(CLASSES, 'classId', c => `
        <p>${esc(c.desc)}</p>
        <div class="tags">
          <span class="badge">DV d${c.hd}</span>
          ${c.primary !== '—' ? `<span class="badge">${esc(c.primary)}</span>` : ''}
          ${c.saves.length ? `<span class="badge">JS ${c.saves.map(R.abilityShort).join(', ')}</span>` : ''}
          ${c.spellAb ? `<span class="badge magic">Sorts (${R.abilityShort(c.spellAb)})</span>` : ''}
          ${c.verify ? verifyBadge : ''}
        </div>`)}
      ${w.classId === 'custom' ? `<div class="card sub-choice">
        <label>Nom de la classe<input data-w="customClassName" value="${esc(w.customClassName)}" maxlength="40" placeholder="ex. Blood Hunter"></label>
        <p class="small muted">Tu régleras le dé de vie, les jets de sauvegarde et la magie dans « Réglages de classe » sur la fiche.</p>
      </div>` : ''}
      ${cls()?.verify && w.classId !== 'custom' ? `<p class="notice wide">Les données de cette classe (dé de vie, jets de sauvegarde, compétences, magie) ne sont pas toutes confirmées. Vérifie-les dans ton livre et ajuste-les dans « Réglages de classe » sur la fiche.</p>` : ''}`,

    () => `<p class="muted">Choisis l'espèce de ton personnage. En 5.5, l'espèce ne donne plus de bonus de caractéristiques : ceux-ci viennent de l'historique.</p>
      ${groupedCards(SPECIES, 'speciesId', s => `
        <div class="tags">${s.size !== '—' ? `<span class="badge">Taille ${esc(s.size)}</span>` : ''}<span class="badge">${String(s.speed).replace('.', ',')} m</span></div>
        <p class="small">${esc(s.traits || s.desc || '')}</p>`)}
      ${w.speciesId === 'custom' ? `<div class="card sub-choice">
        <label>Nom de l'espèce<input data-w="customSpeciesName" value="${esc(w.customSpeciesName)}" maxlength="40"></label>
      </div>` : ''}
      ${sp()?.lineages ? `<div class="card sub-choice">
        <label><span>${esc(sp().lineageLabel)} ${infoBtn(`species:${w.speciesId}`, sp().name)}</span>
          <select data-w="lineage"><option value="">— Choisir —</option>
            ${sp().lineages.map(l => `<option ${w.lineage === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}
          </select></label></div>` : ''}`,

    () => `<p class="muted">L'historique donne les bonus de caractéristiques, un don d'origine, deux compétences et un outil.</p>
      <div class="grid options">${BACKGROUNDS.map(b => optionCard('backgroundId', b, `
        <div class="tags">${b.abilities.map(a => `<span class="badge">${R.abilityShort(a)}</span>`).join('')}</div>
        <p class="small"><b>Don :</b> ${esc(FEATS[b.feat])} ${infoBtn(`feat:${b.feat}`, FEATS[b.feat])}<br>
        <b>Compétences :</b> ${b.skills.map(s => byId(SKILLS, s).name).join(', ')}<br>
        <b>Outil :</b> ${esc(b.tool)}</p>`)).join('')}</div>
      ${bg() ? `<div class="card sub-choice">
        <h3>Bonus de caractéristiques (${bg().abilities.map(R.abilityShort).join(', ')}) ${infoBtn('stat:bgbonus')}</h3>
        <div class="seg">
          <button data-a="bgmode" data-v="21" class="${w.bgMode === '21' ? 'active' : ''}">+2 / +1</button>
          <button data-a="bgmode" data-v="111" class="${w.bgMode === '111' ? 'active' : ''}">+1 / +1 / +1</button>
        </div>
        ${w.bgMode === '21' ? `<div class="row">
          <label>+2 en <select data-bg="0">${bg().abilities.map(a => `<option value="${a}" ${w.bgPicks[0] === a ? 'selected' : ''}>${byId(ABILITIES, a).name}</option>`).join('')}</select></label>
          <label>+1 en <select data-bg="1">${bg().abilities.map(a => `<option value="${a}" ${w.bgPicks[1] === a ? 'selected' : ''}>${byId(ABILITIES, a).name}</option>`).join('')}</select></label>
        </div>${w.bgPicks[0] === w.bgPicks[1] ? '<p class="error">Choisis deux caractéristiques différentes.</p>' : ''}` : ''}
      </div>` : ''}`,

    () => {
      const bonus = bgBonus();
      const spent = pbSpent();
      return `<div class="seg">${infoBtn('stat:methods', 'méthodes')}
          <button data-a="method" data-v="standard" class="${w.method === 'standard' ? 'active' : ''}">Tableau standard</button>
          <button data-a="method" data-v="pointbuy" class="${w.method === 'pointbuy' ? 'active' : ''}">Achat de points</button>
          <button data-a="method" data-v="manual" class="${w.method === 'manual' ? 'active' : ''}">Manuel / dés</button>
        </div>
        <p class="muted">${{
          standard: 'Répartis les valeurs 15, 14, 13, 12, 10 et 8.',
          pointbuy: `Dépense ${POINT_BUY_BUDGET} points (valeurs de 8 à 15). Points restants : <b class="${spent > POINT_BUY_BUDGET ? 'error' : ''}">${POINT_BUY_BUDGET - spent}</b>`,
          manual: 'Saisis tes valeurs, ou lance 4d6 en gardant les 3 meilleurs.',
        }[w.method]}</p>
        <div class="row">
          ${w.method === 'standard' ? '<button class="btn ghost small" data-a="suggest">Répartition conseillée pour la classe</button>' : ''}
          ${w.method === 'manual' ? '<button class="btn ghost small" data-a="roll">🎲 Lancer 4d6 ×6</button>' : ''}
        </div>
        <table class="abil-table">
          <thead><tr><th>Caractéristique</th><th>Base</th><th>Historique</th><th>Total</th><th>Mod.</th></tr></thead>
          <tbody>${ABILITIES.map(a => {
            const v = w.base[a.id];
            const total = v + (bonus[a.id] ?? 0);
            let input;
            if (w.method === 'standard') {
              input = `<select data-std="${a.id}">${STANDARD_ARRAY.map(n => `<option ${n === v ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
            } else if (w.method === 'pointbuy') {
              input = `<div class="stepper"><button data-a="pb" data-k="${a.id}" data-v="-1" ${v <= 8 ? 'disabled' : ''}>−</button><b>${v}</b><button data-a="pb" data-k="${a.id}" data-v="1" ${v >= 15 ? 'disabled' : ''}>+</button></div>`;
            } else {
              input = `<input type="number" min="3" max="20" value="${v}" data-man="${a.id}">`;
            }
            const prim = order()[0] === a.id ? ' <span class="badge magic">principale</span>' : '';
            return `<tr><td>${a.name} ${infoBtn(`ability:${a.id}`, a.name)}${prim}</td><td>${input}</td><td>${bonus[a.id] ? `+${bonus[a.id]}` : '—'}</td>
              <td><b>${total}</b></td><td>${R.fmt(R.mod(total))}</td></tr>`;
          }).join('')}</tbody>
        </table>`;
    },

    () => {
      const owned = ownedSkills();
      const c = cls();
      const s = sp();
      const n = w.classSkills.length;
      return `<div class="card sub-choice">
          <h3>Historique (${esc(bg().name)})</h3>
          <p>${bg().skills.map(x => `<span class="badge ok">✓ ${byId(SKILLS, x).name}</span> ${infoBtn(`skill:${x}`, byId(SKILLS, x).name)}`).join(' ')}</p>
        </div>
        <div class="card sub-choice">
          <h3>Classe (${esc(c.name)}) — choisis ${c.skillCount} compétence${c.skillCount > 1 ? 's' : ''} <span class="muted">(${n}/${c.skillCount})</span></h3>
          <div class="checks">${c.skills.map(id => {
            const sk = byId(SKILLS, id);
            const already = owned.has(id);
            const on = w.classSkills.includes(id);
            return `<label class="check ${already ? 'locked' : ''}"><input type="checkbox" data-cs="${id}" ${on || already ? 'checked' : ''}
              ${already || (!on && n >= c.skillCount) ? 'disabled' : ''}> ${sk.name} <small>(${R.abilityShort(sk.ab)})</small> ${infoBtn(`skill:${id}`, sk.name)}</label>`;
          }).join('')}</div>
        </div>
        ${s.keenSenses ? `<div class="card sub-choice"><h3>Sens aiguisés (elfe) — 1 compétence</h3>
          <div class="checks">${s.keenSenses.map(id => {
            const taken = owned.has(id) || w.classSkills.includes(id);
            return `<label class="check"><input type="radio" name="keen" data-keen="${id}" ${w.keenSense === id ? 'checked' : ''} ${taken ? 'disabled' : ''}> ${byId(SKILLS, id).name} ${infoBtn(`skill:${id}`, byId(SKILLS, id).name)}</label>`;
          }).join('')}</div></div>` : ''}
        ${s.skillful ? `<div class="card sub-choice"><h3>Talentueux (humain) — 1 compétence au choix</h3>
          <select data-skillful><option value="">— Choisir —</option>${SKILLS.filter(x => !owned.has(x.id) && !w.classSkills.includes(x.id)).map(x =>
            `<option value="${x.id}" ${w.skillful === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select></div>` : ''}`;
    },

    () => {
      const c = cls();
      const t = totals();
      const feats = featuresUpTo(c.id, w.level, c.libFeatures);
      const vals = scalingValues(c.id, w.level);
      const subs = bySource(c.subclasses.map(n => ({ id: n, name: n, source: c.subclassSources?.[n] ?? c.source })));
      return `<p class="muted">Ton MJ a fixé le niveau de départ à <b>${w.level}</b>. PV, bonus de maîtrise (${R.fmt(R.profBonus(w.level))}),
          emplacements de sorts et ressources sont calculés pour ce niveau ; il te reste à faire les choix ci-dessous.</p>
        <div class="card sub-choice">
          <h3>Capacités de ${esc(c.name)} jusqu'au niveau ${w.level} ${infoBtn(`class:${c.id}`, c.name)}</h3>
          <p class="small"><b>Niv. 1 :</b> ${esc(c.features || '—')}</p>
          ${feats.map(([l, names]) => `<p class="small"><b>Niv. ${l} :</b> ${esc(names.join(', '))}</p>`).join('')}
          ${vals.length ? `<p class="small"><b>Au niveau ${w.level} :</b> ${esc(vals.join(' · '))}</p>` : ''}
          ${c.source !== 'phb' ? `<p class="small muted">Classe d'extension : vérifie sa progression dans ${esc(SOURCES[c.source] ?? 'ton livre')}.</p>` : ''}
        </div>
        ${needsSubclass() ? `<div class="card sub-choice">
          <label><span class="lbl-row">Sous-classe (niveau ${SUBCLASS_LEVEL}) ${infoBtn(`class:${c.id}`, 'sous-classes')}</span>
            <select data-w="subclass"><option value="">— Choisir —</option>${subs.map(([src, items]) =>
              `<optgroup label="${esc(SOURCES[src])}">${items.map(x => `<option ${w.subclass === x.name ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}
            </select></label>
        </div>` : w.level >= SUBCLASS_LEVEL ? `<div class="card sub-choice"><label>Sous-classe (niveau ${SUBCLASS_LEVEL})
          <input data-w="subclass" value="${esc(w.subclass)}" placeholder="Nom de la sous-classe (facultatif)"></label></div>` : ''}
        ${w.levelChoices.map(ch => {
          const abilitySelect = (key, val) => `<select data-ch="${ch.level}" data-chk="${key}">${ABILITIES.map(a =>
            `<option value="${a.id}" ${val === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}</select>`;
          if (ch.kind === 'boon') {
            return `<div class="card sub-choice"><h3>Niveau ${ch.level} — Don épique</h3>
              <label>Nom du don épique<input data-ch="${ch.level}" data-chk="feat" value="${esc(ch.feat)}" placeholder="ex. Faveur de rapidité"></label></div>`;
          }
          return `<div class="card sub-choice">
            <h3>Niveau ${ch.level} — Amélioration de caractéristiques ou don</h3>
            <div class="seg">
              <button data-a="chmode" data-l="${ch.level}" data-v="2" class="${ch.kind === 'asi' && ch.mode === '2' ? 'active' : ''}">+2 à une caractéristique</button>
              <button data-a="chmode" data-l="${ch.level}" data-v="11" class="${ch.kind === 'asi' && ch.mode === '11' ? 'active' : ''}">+1 à deux caractéristiques</button>
              <button data-a="chmode" data-l="${ch.level}" data-v="feat" class="${ch.kind === 'feat' ? 'active' : ''}">Un don</button>
            </div>
            ${ch.kind === 'feat'
              ? `<label>Nom du don<input data-ch="${ch.level}" data-chk="feat" value="${esc(ch.feat)}" placeholder="ex. Maître des armes d'hast"></label>
                 <p class="small muted">Si ce don augmente une caractéristique, ajuste la valeur sur ta fiche.</p>`
              : ch.mode === '2'
                ? `<div class="row"><label>+2 en ${abilitySelect('a', ch.a)}</label></div>`
                : `<div class="row"><label>+1 en ${abilitySelect('a', ch.a)}</label><label>+1 en ${abilitySelect('b', ch.b)}</label></div>
                   ${ch.a === ch.b ? '<p class="error">Choisis deux caractéristiques différentes.</p>' : ''}`}
          </div>`;
        }).join('')}
        ${w.levelChoices.length ? `<div class="mini-abils">${ABILITIES.map(a =>
          `<div class="${t[a.id] > 20 ? 'over' : ''}"><span>${a.short}</span><b>${t[a.id]}</b><small>${R.fmt(R.mod(t[a.id]))}</small></div>`).join('')}</div>
          ${Object.values(t).some(v => v > 20) ? '<p class="error">Une caractéristique ne peut pas dépasser 20.</p>' : ''}` : ''}
        <p class="notice wide">Les autres options (sorts connus ou préparés, expertises, style de combat, manifestations occultes, métamagie…)
          restent à ton choix : renseigne-les sur ta fiche une fois le personnage créé.</p>`;
    },

    () => `<div class="grid two">
        <div class="card">
          <label>Nom du personnage<input data-w="name" value="${esc(w.name)}" maxlength="60" required></label>
          <div class="row">
            <label>Niveau<input value="${w.level} (fixé par le MJ)" disabled></label>
            <label>Alignement<select data-w="alignment"><option value="">—</option>${ALIGNMENTS.map(a => `<option ${w.alignment === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
          </div>
          <label>Portrait (URL d'image, facultatif)<input data-w="portrait" value="${esc(w.portrait)}" placeholder="https://…"></label>
          <label>Personnalité<textarea data-w="personality" rows="3">${esc(w.personality)}</textarea></label>
          <label>Histoire<textarea data-w="backstory" rows="4">${esc(w.backstory)}</textarea></label>
        </div>
        <div class="card summary">
          <h3>Récapitulatif</h3>
          ${(() => {
            const preview = R.buildCharacter({ ...w, name: w.name || '?', bgBonus: bgBonus(), extraSkills: extraSkills() });
            return `<p><b>${esc(R.classOf(preview).name)}</b> ${infoBtn(`class:${w.classId}`)} · ${esc(R.speciesName(preview))}${w.lineage ? ` (${esc(w.lineage)})` : ''} ${infoBtn(`species:${w.speciesId}`)} · ${esc(bg().name)} ${infoBtn(`bg:${w.backgroundId}`)}</p>
              <div class="mini-stats">
                <div><b>${preview.hp.max}</b><span>PV max</span></div>
                <div><b>${preview.ac}</b><span>CA</span></div>
                <div><b>${R.fmt(R.initiative(preview))}</b><span>Init.</span></div>
                <div><b>${R.fmt(R.profBonus(preview.level))}</b><span>Maîtrise</span></div>
              </div>
              <div class="mini-abils">${ABILITIES.map(a => `<div><span>${a.short}</span><b>${R.score(preview, a.id)}</b><small>${R.fmt(R.abilityMod(preview, a.id))}</small></div>`).join('')}</div>
              <p class="small"><b>Compétences :</b> ${Object.keys(preview.skills).map(s => byId(SKILLS, s).name).join(', ')}</p>
              <p class="small"><b>Don d'origine :</b> ${esc(FEATS[bg().feat])} ${infoBtn(`feat:${bg().feat}`)}</p>`;
          })()}
        </div>
      </div>`,
  ];

  function render() {
    root.innerHTML = `
      <div class="page-head"><h1>Nouveau personnage</h1></div>
      <div class="wizard-top">
        ${stepperBar()}
        ${w.step === 0 ? sourcePicker(CLASSES) : w.step === 1 ? sourcePicker(SPECIES) : ''}
      </div>
      <section class="wizard-body">${steps[w.step]()}</section>
      <div class="wizard-nav">
        <button class="btn ghost" data-a="prev" ${w.step === 0 ? 'disabled' : ''}>← Retour</button>
        ${w.step < STEPS.length - 1
          ? `<button class="btn primary" data-a="next" ${valid() ? '' : 'disabled'}>Suivant →</button>`
          : `<button class="btn primary" data-a="create" ${valid() ? '' : 'disabled'}>Créer le personnage</button>`}
      </div>`;
  }

  const refreshNav = () => {
    const btn = root.querySelector('[data-a=next],[data-a=create]');
    if (btn) btn.disabled = !valid();
    root.querySelector('.stepper-bar')?.replaceWith(Object.assign(document.createElement('div'), { innerHTML: stepperBar() }).firstElementChild);
  };

  root.addEventListener('click', async e => {
    const pick = e.target.closest('[data-pick]');
    if (pick) {
      const { pick: field, val } = pick.dataset;
      if (w[field] !== val) {
        w[field] = val;
        if (field === 'classId') {
          w.classSkills = [];
          w.subclass = '';
          w.levelChoices = [];
          if (w.method === 'standard') suggestStandard();
          syncChoices();
        }
        if (field === 'speciesId') { w.lineage = ''; w.keenSense = ''; w.skillful = ''; }
        if (field === 'backgroundId') { defaultBgPicks(); w.classSkills = w.classSkills.filter(s => !ownedSkills().has(s)); }
      }
      render();
      return;
    }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const { a: act, v, k } = a.dataset;
    if (act === 'next' && valid()) goTo(w.step + 1);
    if (act === 'goto' && reachable(Number(v))) goTo(Number(v));
    if (act === 'prev') { w.step--; window.scrollTo(0, 0); }
    if (act === 'bgmode') { w.bgMode = v; defaultBgPicks(); }
    if (act === 'method') {
      w.method = v;
      if (v === 'standard') suggestStandard();
      if (v === 'pointbuy') ABILITIES.forEach(x => (w.base[x.id] = 8));
    }
    if (act === 'suggest') suggestStandard();
    if (act === 'chmode') {
      const ch = w.levelChoices.find(x => x.level === Number(a.dataset.l));
      if (v === 'feat') ch.kind = 'feat';
      else { ch.kind = 'asi'; ch.mode = v; }
    }
    if (act === 'pb') {
      const nv = w.base[k] + Number(v);
      if (nv >= 8 && nv <= 15) w.base[k] = nv;
    }
    if (act === 'roll') {
      ABILITIES.forEach(x => {
        const d = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => (n % 6) + 1).sort((p, q) => q - p);
        w.base[x.id] = d[0] + d[1] + d[2];
      });
    }
    if (act === 'create') {
      if (!valid()) return;
      a.disabled = true;
      try {
        const c = R.buildCharacter({ ...w, level: Math.min(20, Math.max(1, Number(w.level) || 1)), bgBonus: bgBonus(), extraSkills: extraSkills() });
        c.ownerUid = me.uid;
        c.ownerName = me.displayName;
        const id = await store.createCharacter(c);
        toast('Personnage créé !', 'ok');
        location.hash = `#/perso/${id}`;
      } catch (err) {
        toast(err.message, 'error');
        a.disabled = false;
      }
      return;
    }
    render();
  });

  root.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.std) {
      const ab = t.dataset.std;
      const nv = Number(t.value);
      const other = ABILITIES.find(x => x.id !== ab && w.base[x.id] === nv);
      if (other) w.base[other.id] = w.base[ab];
      w.base[ab] = nv;
    } else if (t.dataset.man) {
      w.base[t.dataset.man] = Math.min(20, Math.max(3, Number(t.value) || 10));
    } else if (t.dataset.bg) {
      w.bgPicks[Number(t.dataset.bg)] = t.value;
    } else if (t.dataset.cs) {
      const id = t.dataset.cs;
      w.classSkills = t.checked ? [...w.classSkills, id] : w.classSkills.filter(x => x !== id);
      if (w.keenSense === id) w.keenSense = '';
      if (w.skillful === id) w.skillful = '';
    } else if (t.dataset.keen) {
      w.keenSense = t.dataset.keen;
    } else if (t.hasAttribute('data-skillful')) {
      w.skillful = t.value;
    } else if (t.dataset.ch) {
      w.levelChoices.find(x => x.level === Number(t.dataset.ch))[t.dataset.chk] = t.value;
      if (t.dataset.chk === 'feat') { refreshNav(); return; }
    } else if (t.dataset.w) {
      w[t.dataset.w] = t.dataset.w === 'level' ? Number(t.value) : t.value;
      if (['lineage', 'level', 'source'].includes(t.dataset.w)) render();
      refreshNav();
      return;
    } else return;
    render();
  });

  // Les cartes sont des <div role="button"> : Entrée et Espace les sélectionnent.
  root.addEventListener('keydown', e => {
    const card = e.target.closest?.('[data-pick]');
    if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      card.click();
    }
  });

  root.addEventListener('input', e => {
    const t = e.target;
    if (['name', 'customClassName', 'customSpeciesName', 'subclass'].includes(t.dataset.w) && t.tagName === 'INPUT') {
      w[t.dataset.w] = t.value;
      refreshNav();
    } else if (t.dataset.chk === 'feat') {
      w.levelChoices.find(x => x.level === Number(t.dataset.ch)).feat = t.value;
      refreshNav();
    }
  });

  render();
  // Niveau de départ fixé par le MJ.
  store.getCampaign().then(cfg => {
    w.level = Math.min(20, Math.max(1, Number(cfg.startLevel) || 1));
    syncChoices();
    render();
  });
}

// ── Fiche de personnage ─────────────────────────────────────

const TABS = [['combat', 'Combat & stats'], ['spells', 'Sorts'], ['gear', 'Équipement'], ['story', 'Histoire']];

function sheetView(id) {
  const root = mount('<div class="loading">Chargement de la fiche…</div>');
  let c = null;
  let tab = 'combat';
  let saveTimer = null;
  let saving = false;
  let canEdit = false;
  let settingsOpen = null; // panneau « Réglages de classe » ouvert par le joueur

  const dis = () => (canEdit ? '' : 'disabled');
  const val = p => getPath(c, p) ?? '';
  const inp = (p, { type = 'text', cls = '', attrs = '' } = {}) =>
    `<input type="${type}" data-p="${p}" ${type === 'number' ? 'data-t="num"' : ''} value="${esc(val(p))}" class="${cls}" ${attrs} ${dis()}>`;
  const area = (p, rows = 4, ph = '') =>
    `<textarea data-p="${p}" rows="${rows}" placeholder="${esc(canEdit ? ph : '')}" ${dis()}>${esc(val(p))}</textarea>`;
  const sel = (p, opts, { rerender = true, empty = true, emptyLabel = '—' } = {}) =>
    `<select data-p="${p}" ${rerender ? 'data-r' : ''} ${dis()}>${empty ? `<option value="">${esc(emptyLabel)}</option>` : ''}${opts.map(([v, l]) =>
      `<option value="${esc(v)}" ${String(val(p)) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  // Liste déroulante groupée par livre (classes, espèces).
  const selGrouped = (p, list) =>
    `<select data-p="${p}" data-r ${dis()}>${bySource(list).map(([src, items]) =>
      `<optgroup label="${esc(SOURCES[src])}">${items.map(x =>
        `<option value="${esc(x.id)}" ${val(p) === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>`;
  const pips = (n, filled, act, extra = '') => Array.from({ length: n }, (_, i) =>
    `<button class="pip ${i < filled ? 'on' : ''}" data-a="${act}" data-n="${i + 1}" ${extra} ${dis()}></button>`).join('');

  function setStatus(text, kind = '') {
    const el = root.querySelector('#save-status');
    if (el) { el.textContent = text; el.className = `save-status ${kind}`; }
  }

  async function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    saving = true;
    setStatus('Enregistrement…');
    try {
      await store.updateCharacter(id, c);
      setStatus('Enregistré ✓', 'ok');
    } catch (e) {
      setStatus('Erreur : ' + e.message, 'error');
    } finally { saving = false; }
  }
  function save(delay = 600) {
    if (!canEdit) return;
    clearTimeout(saveTimer);
    setStatus('Modifications non enregistrées…');
    saveTimer = setTimeout(saveNow, delay);
  }
  teardown.push(() => { if (saveTimer) saveNow(); infoCharacter = null; });

  function derived() {
    const d = {};
    ABILITIES.forEach(a => {
      d[`score-${a.id}`] = R.score(c, a.id);
      d[`mod-${a.id}`] = R.fmt(R.abilityMod(c, a.id));
      d[`save-${a.id}`] = R.fmt(R.saveBonus(c, a.id));
    });
    SKILLS.forEach(s => (d[`skill-${s.id}`] = R.fmt(R.skillBonus(c, s.id))));
    d.prof = R.fmt(R.profBonus(c.level));
    d.init = R.fmt(R.initiative(c));
    d.pp = R.passive(c, 'perception');
    d.pi = R.passive(c, 'insight');
    d.pinv = R.passive(c, 'investigation');
    d['ac-sug'] = R.suggestedAC(c);
    d['hp-sug'] = R.suggestedMaxHP(c);
    d.label = R.labelFor(c);
    const cls = R.classOf(c);
    d.hd = `${Math.max(0, c.level - (Number(c.hitDiceUsed) || 0))} / ${c.level} d${cls?.hd ?? '?'}`;
    const sp = R.spellInfo(c);
    d.dc = sp ? sp.dc : '—';
    d.atk = sp ? R.fmt(sp.attack) : '—';
    return d;
  }

  function updateDerived() {
    const d = derived();
    root.querySelectorAll('[data-d]').forEach(el => { el.textContent = d[el.dataset.d] ?? ''; });
    const bar = root.querySelector('[data-hpbar]');
    if (bar) bar.outerHTML = hpBar(c);
  }

  // ── Blocs de la fiche ──

  function header() {
    const cls = R.classOf(c);
    const sp = byId(SPECIES, c.speciesId);
    return `<header class="sheet-head card">
      ${portrait(c, 'big')}
      <div class="sh-main">
        <input class="char-name" data-p="name" value="${esc(c.name)}" ${dis()} aria-label="Nom du personnage">
        <div class="muted"><span data-d="label"></span>${c.subclass ? ` — ${esc(c.subclass)}` : ''} · joué par ${esc(c.ownerName)}</div>
        <div class="sh-fields">
          <label><span class="lbl-row">Classe ${infoBtn(`class:${c.classId}`)}</span>${selGrouped('classId', CLASSES)}</label>
          ${c.classId === 'custom' ? `<label>Nom de la classe ${inp('customClassName')}</label>` : ''}
          <label><span class="lbl-row">Sous-classe ${infoBtn('subclass')}</span><input data-p="subclass" list="subclasses" value="${esc(c.subclass)}" ${dis()} placeholder="${c.level >= 3 ? 'Niveau 3+' : 'Au niveau 3'}">
            <datalist id="subclasses">${(cls?.subclasses ?? []).map(s =>
              `<option value="${esc(s)}" label="${esc(SOURCES[cls.subclassSources?.[s]] ?? '')}">`).join('')}</datalist></label>
          <label>Niveau ${inp('level', { type: 'number', attrs: 'min="1" max="20" data-r' })}</label>
          <label><span class="lbl-row">Espèce ${infoBtn(`species:${c.speciesId}`)}</span>${selGrouped('speciesId', SPECIES)}</label>
          ${c.speciesId === 'custom' ? `<label>Nom de l'espèce ${inp('customSpeciesName')}</label>` : ''}
          ${sp?.lineages ? `<label>${esc(sp.lineageLabel)} ${sel('lineage', sp.lineages.map(l => [l, l]), { rerender: false })}</label>` : ''}
          <label><span class="lbl-row">Historique ${infoBtn(`bg:${c.backgroundId}`)}</span>${sel('backgroundId', BACKGROUNDS.map(x => [x.id, x.name]), { empty: false })}</label>
          <label>Alignement ${sel('alignment', ALIGNMENTS.map(a => [a, a]), { rerender: false })}</label>
          <label>XP ${inp('xp', { type: 'number', attrs: 'min="0"' })}</label>
        </div>
      </div>
      <div class="sh-actions">
        <span id="save-status" class="save-status">${canEdit ? '' : 'Lecture seule'}</span>
        <button class="btn ghost small" data-a="print">Imprimer</button>
        <button class="btn ghost small" data-a="export">Exporter</button>
        ${canEdit ? '<button class="btn ghost small" data-a="longrest" title="PV, emplacements et ressources restaurés">Repos long</button>' : ''}
        ${c.ownerUid === me.uid || me.role === 'mj' ? '<button class="btn danger small" data-a="delete">Supprimer</button>' : ''}
      </div>
    </header>`;
  }

  function topStats() {
    return `<div class="top-stats">
      <div class="stat card"><span class="lbl">Classe d'armure ${infoBtn('stat:ac')}</span>${inp('ac', { type: 'number', cls: 'big' })}
        ${canEdit ? `<button class="hint" data-a="ac-sug" title="Sans armure">suggestion : <b data-d="ac-sug"></b></button>` : ''}</div>
      <div class="stat card"><span class="lbl">Initiative ${infoBtn('stat:init')}</span><b class="big" data-d="init"></b>
        ${canEdit ? `<label class="hint">divers ${inp('initMisc', { type: 'number', cls: 'tiny' })}</label>` : ''}</div>
      <div class="stat card"><span class="lbl">Vitesse (m) ${infoBtn('stat:speed')}</span>${inp('speed', { type: 'number', cls: 'big', attrs: 'step="1.5" min="0"' })}</div>
      <div class="stat card"><span class="lbl">Bonus de maîtrise ${infoBtn('stat:prof')}</span><b class="big" data-d="prof"></b></div>
      <div class="stat card"><span class="lbl">Perception passive ${infoBtn('stat:passive')}</span><b class="big" data-d="pp"></b>
        <span class="hint">Intu. <b data-d="pi"></b> · Inv. <b data-d="pinv"></b></span></div>
      <div class="stat card"><span class="lbl">Inspiration héroïque ${infoBtn('stat:inspiration')}</span>
        <button class="insp-toggle ${c.inspiration ? 'on' : ''}" data-a="insp" ${dis()}>★</button></div>
    </div>`;
  }

  function abilitiesBlock() {
    return `<section class="card">
      <h2>Caractéristiques ${infoBtn('stat:saves', 'jets de sauvegarde')}</h2>
      <div class="abilities">${ABILITIES.map(a => {
        const prof = R.saveProficient(c, a.id);
        const classSave = R.classOf(c)?.saves.includes(a.id);
        const bonusTxt = [c.bgBonus?.[a.id] ? `historique +${c.bgBonus[a.id]}` : '', c.otherBonus?.[a.id] ? `autres ${R.fmt(c.otherBonus[a.id])}` : ''].filter(Boolean).join(', ');
        return `<div class="ability">
          <span class="lbl" title="${a.name}">${a.short} ${infoBtn(`ability:${a.id}`, a.name)}</span>
          <b class="mod" data-d="mod-${a.id}"></b>
          <input type="number" class="score" data-score="${a.id}" value="${R.score(c, a.id)}" min="1" max="30" ${dis()} title="${esc(bonusTxt || a.name)}">
          <button class="save ${prof ? 'on' : ''}" data-a="save" data-k="${a.id}" ${classSave || !canEdit ? 'disabled' : ''} title="Jet de sauvegarde${classSave ? ' (classe)' : ''}">
            <i></i>JS <span data-d="save-${a.id}"></span></button>
        </div>`;
      }).join('')}</div>
    </section>`;
  }

  function skillsBlock() {
    return `<section class="card">
      <h2>Compétences ${infoBtn('stat:skills')} <small class="muted">${canEdit ? 'clic : maîtrise → expertise' : ''}</small></h2>
      <ul class="skills">${SKILLS.map(s => {
        const lvl = c.skills?.[s.id] ?? 0;
        return `<li><button class="prof p${lvl}" data-a="skill" data-k="${s.id}" ${dis()} title="${['Non maîtrisée', 'Maîtrise', 'Expertise'][lvl]}"></button>
          <span class="sk-bonus" data-d="skill-${s.id}"></span>
          <span>${s.name}</span> ${infoBtn(`skill:${s.id}`, s.name)}<small class="muted">${R.abilityShort(s.ab)}</small></li>`;
      }).join('')}</ul>
    </section>`;
  }

  function hpBlock() {
    const ds = c.deathSaves ?? { success: 0, fail: 0 };
    return `<section class="card hp-card">
      <h2>Points de vie ${infoBtn('stat:hp')}</h2>
      ${hpBar(c)}
      <div class="hp-fields">
        <label>Actuels ${inp('hp.current', { type: 'number', cls: 'big' })}</label>
        <label>Max ${inp('hp.max', { type: 'number' })}</label>
        <label>Temporaires ${inp('hp.temp', { type: 'number', attrs: 'min="0"' })}</label>
      </div>
      ${canEdit ? `<div class="hp-quick">
        <input type="number" id="hp-delta" min="0" placeholder="0" aria-label="Montant">
        <button class="btn danger small" data-a="dmg">Dégâts</button>
        <button class="btn ok small" data-a="heal">Soins</button>
        <button class="hint" data-a="hp-sug">PV max suggérés : <b data-d="hp-sug"></b></button>
      </div>` : ''}
      <div class="row spread">
        <div><span class="lbl">Dés de vie ${infoBtn('stat:hitdice')}</span> <b data-d="hd"></b>
          ${canEdit ? `<label class="hint">utilisés ${inp('hitDiceUsed', { type: 'number', cls: 'tiny', attrs: 'min="0"' })}</label>` : ''}</div>
        <div class="death">
          <span class="lbl">Jets contre la mort ${infoBtn('stat:death')}</span>
          <div>✓ ${pips(3, ds.success, 'death', 'data-k="success"')}</div>
          <div>✗ ${pips(3, ds.fail, 'death', 'data-k="fail"')}</div>
        </div>
      </div>
      <div class="conditions">
        <span class="lbl">États ${infoBtn('conds', 'tous les états')}</span>
        <div class="chips">${CONDITIONS.map(x => {
          const on = (c.conditions ?? []).includes(x);
          return canEdit || on ? `<button class="chip ${on ? 'on' : ''}" data-a="cond" data-k="${esc(x)}" title="${esc(CONDITION_INFO[x])}" ${dis()}>${esc(x)}</button>` : '';
        }).join('') || '<span class="muted small">Aucun</span>'}</div>
      </div>
    </section>`;
  }

  function attacksBlock() {
    const list = c.attacks ?? [];
    return `<section class="card">
      <h2>Attaques ${infoBtn('stat:attacks')}</h2>
      ${list.length ? `<table class="list-table"><thead><tr><th>Nom</th><th>Bonus</th><th>Dégâts / type</th><th>Notes</th>${canEdit ? '<th></th>' : ''}</tr></thead>
        <tbody>${list.map((_, i) => `<tr>
          <td>${inp(`attacks.${i}.name`)}</td><td>${inp(`attacks.${i}.bonus`, { cls: 'tiny' })}</td>
          <td>${inp(`attacks.${i}.damage`)}</td><td>${inp(`attacks.${i}.notes`)}</td>
          ${canEdit ? `<td><button class="icon" data-a="del" data-k="attacks" data-n="${i}" title="Supprimer">✕</button></td>` : ''}
        </tr>`).join('')}</tbody></table>` : '<p class="muted small">Aucune attaque.</p>'}
      ${canEdit ? '<button class="btn ghost small" data-a="add" data-k="attacks">+ Ajouter une attaque</button>' : ''}
    </section>`;
  }

  function resourcesBlock() {
    const list = c.resources ?? [];
    return `<section class="card">
      <h2>Ressources de classe ${infoBtn('stat:resources')}</h2>
      ${list.length ? `<table class="list-table"><thead><tr><th>Nom</th><th>Restant</th><th>Max</th>${canEdit ? '<th></th>' : ''}</tr></thead>
        <tbody>${list.map((_, i) => `<tr>
          <td>${inp(`resources.${i}.name`)}</td>
          <td>${inp(`resources.${i}.value`, { type: 'number', cls: 'tiny' })}</td>
          <td>${inp(`resources.${i}.max`, { type: 'number', cls: 'tiny' })}</td>
          ${canEdit ? `<td><button class="icon" data-a="del" data-k="resources" data-n="${i}" title="Supprimer">✕</button></td>` : ''}
        </tr>`).join('')}</tbody></table>` : '<p class="muted small">Rage, Inspiration bardique, Conduit divin, Focus…</p>'}
      ${canEdit ? '<button class="btn ghost small" data-a="add" data-k="resources">+ Ajouter une ressource</button>' : ''}
    </section>`;
  }

  function classSettingsBlock() {
    const cls = R.classOf(c);
    if (!cls) return '';
    const o = c.classOverride ?? {};
    const changed = Object.keys(o).length > 0;
    return `<section class="card">
      <details id="class-settings" ${settingsOpen ?? cls.verify ? 'open' : ''}>
        <summary><b>Réglages de classe</b>${cls.verify ? ' <span class="badge warn">à vérifier</span>' : ''}${changed ? ' <span class="badge">modifiés</span>' : ''}</summary>
        ${cls.verify ? `<p class="small muted">Ces données ne sont pas toutes confirmées pour ${esc(cls.name)}${cls.source !== 'custom' ? ` (${esc(SOURCES[cls.source])})` : ''} : vérifie-les dans ton livre.</p>` : ''}
        <label>Dé de vie
          <select data-p="classOverride.hd" data-t="num" data-r ${dis()}>${[6, 8, 10, 12].map(n =>
            `<option value="${n}" ${cls.hd === n ? 'selected' : ''}>d${n}</option>`).join('')}</select></label>
        <span class="lbl">Jets de sauvegarde de classe</span>
        <div class="chips">${ABILITIES.map(a => `<button class="chip ${cls.saves.includes(a.id) ? 'on' : ''}" data-a="ovsave" data-k="${a.id}" ${dis()}>${a.short}</button>`).join('')}</div>
        <label>Magie
          <select data-p="classOverride.caster" data-r ${dis()}>${[['', 'Aucune'], ['full', 'Lanceur complet'], ['half', 'Semi-lanceur'], ['pact', 'Magie de pacte']].map(([v, l]) =>
            `<option value="${v}" ${(cls.caster ?? '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <p class="small muted">La caractéristique d'incantation se règle dans l'onglet Sorts.</p>
        ${canEdit && changed ? '<button class="btn ghost small" data-a="ovreset">Revenir aux valeurs par défaut</button>' : ''}
      </details>
    </section>`;
  }

  function featuresBlock() {
    return `${classSettingsBlock()}<section class="card">
      <h2>Capacités, traits &amp; dons ${infoBtn(`class:${c.classId}`, 'capacités de classe')}</h2>
      <label><span class="lbl-row">Don d'origine ${c.originFeat ? infoBtn(`feat:${c.originFeat}`) : ''}</span>${sel('originFeat', Object.entries(FEATS), { rerender: true })}</label>
      <p class="small muted">Traits d'espèce ${infoBtn(`species:${c.speciesId}`, R.speciesName(c))} · capacités de classe ${infoBtn(`class:${c.classId}`, 'classe')}</p>
      ${area('features', 10, 'Capacités de classe, traits d\'espèce, dons…')}
    </section>
    <section class="card">
      <h2>Maîtrises &amp; langues</h2>
      ${area('proficiencies', 4)}
      <label>Langues ${inp('languages')}</label>
    </section>`;
  }

  function combatTab() {
    return `${topStats()}
      <div class="sheet-grid">
        <div class="col">${abilitiesBlock()}${skillsBlock()}</div>
        <div class="col">${hpBlock()}${attacksBlock()}${resourcesBlock()}</div>
        <div class="col">${featuresBlock()}</div>
      </div>`;
  }

  function spellsTab() {
    const slots = R.spellSlots(c);
    const used = c.slotsUsed ?? Array(9).fill(0);
    const cls = R.classOf(c);
    const spells = (c.spells ?? []).map((s, i) => ({ ...s, i }));
    const levels = [...new Set(spells.map(s => Number(s.level) || 0))].sort((a, b) => a - b);
    return `<div class="top-stats">
        <div class="stat card"><span class="lbl">Caractéristique</span>
          ${sel('spellAb', ABILITIES.map(a => [a.id, a.name]), { rerender: true, emptyLabel: 'Selon la classe' })}
          <span class="hint">${cls?.spellAb ? `classe : ${byId(ABILITIES, cls.spellAb).name}` : 'classe non lanceuse'}</span></div>
        <div class="stat card"><span class="lbl">DD de sauvegarde ${infoBtn('stat:spells')}</span><b class="big" data-d="dc"></b></div>
        <div class="stat card"><span class="lbl">Bonus d'attaque</span><b class="big" data-d="atk"></b></div>
      </div>
      <section class="card">
        <h2>Emplacements de sorts ${cls?.caster === 'pact' ? '<small class="muted">(magie de pacte : récupérés après un repos court)</small>' : ''}</h2>
        <div class="slots">${slots.map((n, l) => n ? `<div class="slot">
            <span class="lbl">Niv. ${l + 1}</span>
            <div>${pips(n, n - Math.min(n, used[l] || 0), 'slot', `data-k="${l}"`)}</div>
            <small class="muted">${n - Math.min(n, used[l] || 0)} / ${n}</small>
          </div>` : '').join('') || '<p class="muted small">Aucun emplacement à ce niveau.</p>'}</div>
        ${canEdit ? `<details><summary class="small">Ajuster les emplacements (sous-classe, multiclassage…)</summary>
          <div class="slot-adjust">${Array.from({ length: 9 }, (_, l) => `<label>Niv. ${l + 1} ${inp(`slotsMisc.${l}`, { type: 'number', cls: 'tiny', attrs: 'data-r' })}</label>`).join('')}</div>
        </details>
        ${cls?.caster === 'pact' ? '<button class="btn ghost small" data-a="shortrest">Repos court (récupérer les emplacements)</button>' : ''}` : ''}
      </section>
      <section class="card">
        <h2>Sorts</h2>
        ${spells.length ? levels.map(l => `
          <h3 class="spell-level">${l === 0 ? 'Sorts mineurs' : `Niveau ${l}`}</h3>
          <table class="list-table spells"><thead><tr><th class="w-prep" title="Préparé">Prép.</th><th>Nom</th><th class="w-lvl">Niv.</th><th>Notes (portée, durée, effet…)</th>${canEdit ? '<th></th>' : ''}</tr></thead>
          <tbody>${spells.filter(s => (Number(s.level) || 0) === l).map(s => `<tr>
            <td><input type="checkbox" data-p="spells.${s.i}.prepared" data-t="bool" ${s.prepared ? 'checked' : ''} ${dis()}></td>
            <td>${inp(`spells.${s.i}.name`)}</td>
            <td><select data-p="spells.${s.i}.level" data-t="num" data-r ${dis()}>${Array.from({ length: 10 }, (_, n) => `<option value="${n}" ${n === l ? 'selected' : ''}>${n === 0 ? 'Mineur' : n}</option>`).join('')}</select></td>
            <td>${inp(`spells.${s.i}.notes`)}</td>
            ${canEdit ? `<td><button class="icon" data-a="del" data-k="spells" data-n="${s.i}" title="Supprimer">✕</button></td>` : ''}
          </tr>`).join('')}</tbody></table>`).join('') : '<p class="muted small">Aucun sort pour l\'instant.</p>'}
        ${canEdit ? '<button class="btn ghost small" data-a="add" data-k="spells">+ Ajouter un sort</button>' : ''}
      </section>`;
  }

  function gearTab() {
    const coins = [['pp', 'Platine'], ['po', 'Or'], ['pe', 'Électrum'], ['pa', 'Argent'], ['pc', 'Cuivre']];
    return `<section class="card">
        <h2>Bourse</h2>
        <div class="coins">${coins.map(([k, n]) => `<label class="coin ${k}">${n} (${k}) ${inp(`coins.${k}`, { type: 'number', attrs: 'min="0"' })}</label>`).join('')}</div>
      </section>
      <section class="card">
        <h2>Équipement</h2>
        ${area('equipment', 14, 'Armes, armure, sac d\'aventurier, objets magiques…')}
      </section>`;
  }

  function storyTab() {
    return `<div class="grid two">
      <section class="card"><h2>Personnalité</h2>${area('personality', 6, 'Traits, idéaux, liens, défauts…')}</section>
      <section class="card"><h2>Apparence</h2>${area('appearance', 6)}
        <label>Portrait (URL d'image) ${inp('portrait', { attrs: 'placeholder="https://…" data-r' })}</label></section>
      <section class="card"><h2>Histoire</h2>${area('backstory', 10)}</section>
      <section class="card"><h2>Notes de campagne</h2>${area('notes', 10, 'PNJ rencontrés, quêtes, indices…')}</section>
    </div>`;
  }

  function render() {
    infoCharacter = c;
    const y = window.scrollY;
    const body = { combat: combatTab, spells: spellsTab, gear: gearTab, story: storyTab }[tab]();
    root.innerHTML = `${header()}
      <nav class="tabs sheet-tabs">${TABS.map(([k, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-a="tab" data-k="${k}">${l}</button>`).join('')}</nav>
      <div class="tab-body">${body}</div>`;
    updateDerived();
    window.scrollTo(0, y);
  }

  const toNum = v => (v === '' ? 0 : Number(v));

  // « toggle » ne remonte pas : on l'écoute en phase de capture.
  root.addEventListener('toggle', e => {
    if (e.target.id === 'class-settings') settingsOpen = e.target.open;
  }, true);

  root.addEventListener('input', e => {
    const t = e.target;
    if (!canEdit || !c) return;
    if (t.dataset.score) {
      const ab = t.dataset.score;
      const total = toNum(t.value);
      c.base[ab] = total - (c.bgBonus?.[ab] ?? 0) - (c.otherBonus?.[ab] ?? 0);
    } else if (t.dataset.p) {
      const v = t.dataset.t === 'num' ? toNum(t.value) : t.dataset.t === 'bool' ? t.checked : t.value;
      setPath(c, t.dataset.p, v);
    } else return;
    updateDerived();
    save();
  });

  root.addEventListener('change', e => {
    const t = e.target;
    if (!canEdit || !c) return;
    if (t.dataset.p === 'level') {
      c.level = Math.min(20, Math.max(1, toNum(t.value) || 1));
      R.syncResources(c);
    }
    if (t.dataset.p === 'speciesId') c.lineage = '';
    // Nouvelle classe : on repart de ses valeurs par défaut.
    if (t.dataset.p === 'classId') { delete c.classOverride; c.subclass = ''; }
    if (t.hasAttribute('data-r')) render();
    save(200);
  });

  root.addEventListener('click', async e => {
    const a = e.target.closest('[data-a]');
    if (!a || !c) return;
    const { a: act, k } = a.dataset;
    const n = Number(a.dataset.n);
    if (act === 'tab') { tab = k; render(); return; }
    if (act === 'print') { window.print(); return; }
    if (act === 'export') {
      const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${c.name || 'personnage'}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }
    if (!canEdit) return;
    switch (act) {
      case 'skill': {
        c.skills = c.skills ?? {};
        c.skills[k] = ((c.skills[k] ?? 0) + 1) % 3;
        break;
      }
      case 'save': {
        const s = new Set(c.extraSaves ?? []);
        s.has(k) ? s.delete(k) : s.add(k);
        c.extraSaves = [...s];
        break;
      }
      case 'insp': c.inspiration = !c.inspiration; break;
      case 'ovsave': {
        const saves = new Set(R.classOf(c).saves);
        saves.has(k) ? saves.delete(k) : saves.add(k);
        c.classOverride = { ...c.classOverride, saves: ABILITIES.map(a => a.id).filter(a => saves.has(a)) };
        break;
      }
      case 'ovreset': delete c.classOverride; break;
      case 'cond': {
        const s = new Set(c.conditions ?? []);
        s.has(k) ? s.delete(k) : s.add(k);
        c.conditions = CONDITIONS.filter(x => s.has(x));
        break;
      }
      case 'death': {
        c.deathSaves = c.deathSaves ?? { success: 0, fail: 0 };
        c.deathSaves[k] = c.deathSaves[k] === n ? n - 1 : n;
        break;
      }
      case 'slot': {
        // Les pastilles pleines représentent les emplacements restants.
        const l = Number(k);
        const total = R.spellSlots(c)[l];
        c.slotsUsed = c.slotsUsed ?? Array(9).fill(0);
        const remaining = total - Math.min(total, c.slotsUsed[l] || 0);
        c.slotsUsed[l] = total - (remaining === n ? n - 1 : n);
        break;
      }
      case 'dmg':
      case 'heal': {
        const amt = Math.abs(Number(root.querySelector('#hp-delta').value) || 0);
        if (!amt) return;
        const hp = c.hp;
        if (act === 'dmg') {
          const absorbed = Math.min(Number(hp.temp) || 0, amt);
          hp.temp = (Number(hp.temp) || 0) - absorbed;
          hp.current = Math.max(0, (Number(hp.current) || 0) - (amt - absorbed));
        } else {
          hp.current = Math.min(Number(hp.max) || 0, (Number(hp.current) || 0) + amt);
          if (hp.current > 0) c.deathSaves = { success: 0, fail: 0 };
        }
        break;
      }
      case 'hp-sug': c.hp.max = R.suggestedMaxHP(c); c.hp.current = Math.min(c.hp.current, c.hp.max); break;
      case 'ac-sug': c.ac = R.suggestedAC(c); break;
      case 'add': {
        const blank = { attacks: { name: '', bonus: '', damage: '', notes: '' }, resources: { name: '', value: 1, max: 1 }, spells: { name: '', level: 0, prepared: false, notes: '' } }[k];
        c[k] = [...(c[k] ?? []), blank];
        break;
      }
      case 'del': c[k].splice(n, 1); break;
      case 'longrest': {
        if (!confirm('Repos long : restaurer PV, emplacements de sorts, ressources et la moitié des dés de vie ?')) return;
        c.hp.current = c.hp.max;
        c.hp.temp = 0;
        c.slotsUsed = Array(9).fill(0);
        c.deathSaves = { success: 0, fail: 0 };
        c.hitDiceUsed = Math.max(0, (Number(c.hitDiceUsed) || 0) - Math.max(1, Math.floor(c.level / 2)));
        (c.resources ?? []).forEach(r => (r.value = r.max));
        toast('Repos long effectué.', 'ok');
        break;
      }
      case 'shortrest': c.slotsUsed = Array(9).fill(0); toast('Emplacements de pacte récupérés.', 'ok'); break;
      case 'delete': {
        if (!confirm(`Supprimer définitivement ${c.name} ?`)) return;
        clearTimeout(saveTimer);
        saveTimer = null;
        await store.deleteCharacter(id);
        toast('Personnage supprimé.');
        location.hash = '#/groupe';
        return;
      }
      default: return;
    }
    render();
    save(300);
  });

  const strip = o => { const { updatedAt, createdAt, ...rest } = o ?? {}; return JSON.stringify(rest); };

  teardown.push(store.watchCharacter(id, (data, err) => {
    if (err) { root.innerHTML = `<p class="error">${esc(err.message)}</p>`; return; }
    if (!data) {
      root.innerHTML = '<section class="card narrow"><h2>Personnage introuvable</h2><a class="btn primary" href="#/groupe">Retour au groupe</a></section>';
      return;
    }
    // Ne pas écraser une saisie en cours avec l'écho de notre propre sauvegarde.
    if (c && (saveTimer || saving)) return;
    if (c && strip(c) === strip(data)) return;
    const first = !c;
    c = data;
    c.id = id;
    canEdit = c.ownerUid === me.uid || me.role === 'mj';
    if (!first && document.activeElement?.closest?.('.view') && canEdit) {
      // Modification distante (ex. le MJ) pendant qu'on édite : on rafraîchit quand même.
      toast('Fiche mise à jour par un autre joueur.');
    }
    render();
  }));
}

// ── Démarrage ───────────────────────────────────────────────

document.getElementById('brand').textContent = CAMPAIGN_NAME;
document.title = `${CAMPAIGN_NAME} — Fiches D&D 5.5`;

window.addEventListener('hashchange', () => { if (me) route(); else renderNav(); });

store.init().then(() => {
  store.onAuth(async u => {
    const changed = (u?.uid ?? null) !== (me?.uid ?? null) || !!u?.noProfile !== !!me?.noProfile;
    me = u;
    if (u && !u.noProfile && changed) await reloadLibrary();
    if (changed || !u) route();
  });
}).catch(e => {
  $app.innerHTML = `<p class="error">Impossible de charger le site : ${esc(e.message)}</p>`;
});
