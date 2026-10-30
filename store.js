// Couche de stockage : Supabase (partagé) ou localStorage (mode test).
import { SUPABASE_URL, SUPABASE_KEY } from './config.js?v=202610301000';

const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';

export const mode = SUPABASE_URL && SUPABASE_KEY ? 'supabase' : 'local';

let impl;

export async function init() {
  impl = mode === 'supabase' ? await supabaseImpl() : localImpl();
}

export const onAuth = cb => impl.onAuth(cb);
export const signUp = (...a) => impl.signUp(...a);
export const signIn = (...a) => impl.signIn(...a);
export const signOut = () => impl.signOut();
export const resetPassword = email => impl.resetPassword(email);
export const updateProfile = displayName => impl.updateProfile(displayName);

// Campagnes : chacun peut en créer (il en devient MJ) ou en rejoindre avec un code.
export const listCampaigns = () => impl.listCampaigns();
export const createCampaign = name => impl.createCampaign(name);
export const joinCampaign = code => impl.joinCampaign(code);
export const updateCampaign = (id, patch) => impl.updateCampaign(id, patch);
export const regenerateCode = id => impl.regenerateCode(id);
export const deleteCampaign = id => impl.deleteCampaign(id);
export const listMembers = id => impl.listMembers(id);
export const setMemberRole = (id, uid, role) => impl.setMemberRole(id, uid, role);
export const removeMember = (id, uid) => impl.removeMember(id, uid);

// Fiches d'une campagne
export const watchCharacters = (campaignId, cb) => impl.watchCharacters(campaignId, cb);
export const watchCharacter = (id, cb) => impl.watchCharacter(id, cb);
export const createCharacter = (campaignId, data) => impl.createCharacter(campaignId, data);
export const updateCharacter = (id, data) => impl.updateCharacter(id, data);
export const deleteCharacter = id => impl.deleteCharacter(id);

// Bibliothèque d'une campagne
export const listContent = campaignId => impl.listContent(campaignId);
export const addContent = (campaignId, items) => impl.addContent(campaignId, items);
export const deleteContent = ids => impl.deleteContent(ids);
export const libraryCall = body => impl.libraryCall(body);

export const DEFAULT_CAMPAIGN = { startLevel: 1 };

const sortByName = list => list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

// ── Supabase ────────────────────────────────────────────────

async function supabaseImpl() {
  const { createClient } = await import(SUPABASE_JS);
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const T = 'characters';

  const messages = [
    [/CODE_INVALIDE/, "Code d'invitation inconnu : vérifie-le auprès de ton MJ."],
    [/RESERVE_AU_MJ/, 'Réservé au MJ de la campagne.'],
    [/NON_CONNECTE/, 'Reconnecte-toi puis réessaie.'],
    [/campaigns|campaign_members|create_campaign|join_campaign|schema cache/i, "La base n'est pas à jour : exécute « maj-multi-campagnes.sql » dans Supabase (voir README)."],
    [/Invalid login credentials/i, 'E-mail ou mot de passe incorrect.'],
    [/Email not confirmed/i, "Confirme d'abord ton adresse e-mail (lien reçu par mail)."],
    [/already registered|already been registered/i, 'Cet e-mail est déjà utilisé.'],
    [/Password should be at least/i, 'Mot de passe trop faible (6 caractères minimum).'],
    [/rate limit|too many/i, 'Trop de tentatives, réessaie dans quelques minutes.'],
    [/invalid.*email|validate email/i, 'Adresse e-mail invalide.'],
  ];
  const wrap = e => new Error(messages.find(([re]) => re.test(e?.message ?? ''))?.[1] ?? e?.message ?? String(e));
  const check = ({ data, error }) => { if (error) throw wrap(error); return data; };

  // Une ligne = { id, owner_id, campaign_id, data (la fiche), created_at, updated_at }
  const fromRow = r => ({
    ...r.data, id: r.id, ownerUid: r.owner_id, campaignId: r.campaign_id,
    createdAt: Date.parse(r.created_at), updatedAt: Date.parse(r.updated_at),
  });
  const toData = c => {
    const { id, ownerUid, campaignId, createdAt, updatedAt, ...rest } = c;
    return rest;
  };
  const fromCampaign = (c, role) => ({
    id: c.id, name: c.name, joinCode: c.join_code, settings: { ...DEFAULT_CAMPAIGN, ...c.settings },
    createdBy: c.created_by, role,
  });

  async function uid() {
    const { data: { session } } = await sb.auth.getSession();
    return session?.user?.id;
  }

  async function loadProfile(user) {
    const { data } = await sb.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
    if (!data) return { uid: user.id, email: user.email, displayName: user.email, noProfile: true };
    return { uid: user.id, email: user.email, displayName: data.display_name };
  }

  async function promptNewPassword() {
    const pass = prompt('Choisis ton nouveau mot de passe (6 caractères minimum) :');
    if (!pass) return;
    const { error } = await sb.auth.updateUser({ password: pass });
    alert(error ? wrap(error).message : 'Mot de passe modifié.');
  }

  const siteUrl = () => location.href.split('#')[0];
  const debounce = (fn, ms = 150) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

  function subscribe(name, filter, onChange) {
    const ch = sb.channel(`${name}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: T, ...(filter ? { filter } : {}) }, onChange)
      .subscribe();
    return () => sb.removeChannel(ch);
  }

  return {
    onAuth(cb) {
      const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
        // Pas d'appel Supabase directement dans ce rappel (risque de blocage).
        setTimeout(async () => {
          if (event === 'PASSWORD_RECOVERY') await promptNewPassword();
          cb(session?.user ? await loadProfile(session.user) : null);
        });
      });
      return () => subscription.unsubscribe();
    },
    async signUp(email, password, displayName) {
      const data = check(await sb.auth.signUp({
        email, password,
        options: { data: { display_name: displayName }, emailRedirectTo: siteUrl() },
      }));
      // Confirmation par e-mail activée dans Supabase : pas encore de session.
      if (!data.session) return { needsConfirm: true };
    },
    async signIn(email, password) {
      check(await sb.auth.signInWithPassword({ email, password }));
    },
    async signOut() { await sb.auth.signOut(); },
    async resetPassword(email) {
      check(await sb.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() }));
    },
    async updateProfile(displayName) {
      const rows = check(await sb.from('profiles').update({ display_name: displayName }).eq('id', await uid()).select('id'));
      if (!rows.length) throw new Error("Impossible de changer le pseudo (mise à jour SQL « maj-pseudo-campagne.sql » pas encore faite ?).");
    },

    async listCampaigns() {
      const me = await uid();
      const roles = check(await sb.from('campaign_members').select('campaign_id, role').eq('user_id', me));
      if (!roles.length) return [];
      const list = check(await sb.from('campaigns').select('id, name, join_code, settings, created_by').in('id', roles.map(r => r.campaign_id)));
      return sortByName(list.map(c => fromCampaign(c, roles.find(r => r.campaign_id === c.id)?.role ?? 'joueur')));
    },
    async createCampaign(name) {
      return fromCampaign(check(await sb.rpc('create_campaign', { p_name: name })), 'mj');
    },
    async joinCampaign(code) {
      const c = check(await sb.rpc('join_campaign', { p_code: code }));
      return (await this.listCampaigns()).find(x => x.id === c.id) ?? fromCampaign(c, 'joueur');
    },
    async updateCampaign(id, patch) {
      const rows = check(await sb.from('campaigns').update(patch).eq('id', id).select('id'));
      if (!rows.length) throw new Error('Réservé au MJ de la campagne.');
    },
    async regenerateCode(id) {
      return check(await sb.rpc('regenerate_join_code', { p_campaign: id }));
    },
    async deleteCampaign(id) {
      const rows = check(await sb.from('campaigns').delete().eq('id', id).select('id'));
      if (!rows.length) throw new Error('Réservé au MJ de la campagne.');
    },
    async listMembers(id) {
      const members = check(await sb.from('campaign_members').select('user_id, role, joined_at').eq('campaign_id', id));
      const names = check(await sb.from('profiles').select('id, display_name').in('id', members.map(m => m.user_id)));
      return members
        .map(m => ({ uid: m.user_id, role: m.role, displayName: names.find(n => n.id === m.user_id)?.display_name ?? '?' }))
        .sort((a, b) => (a.role === b.role ? a.displayName.localeCompare(b.displayName) : a.role === 'mj' ? -1 : 1));
    },
    async setMemberRole(id, memberId, role) {
      const rows = check(await sb.from('campaign_members').update({ role }).eq('campaign_id', id).eq('user_id', memberId).select('user_id'));
      if (!rows.length) throw new Error('Réservé au MJ de la campagne.');
    },
    async removeMember(id, memberId) {
      const rows = check(await sb.from('campaign_members').delete().eq('campaign_id', id).eq('user_id', memberId).select('user_id'));
      if (!rows.length) throw new Error('Action refusée.');
    },

    watchCharacters(campaignId, cb) {
      let alive = true;
      const load = async () => {
        const { data, error } = await sb.from(T).select('*').eq('campaign_id', campaignId);
        if (!alive) return;
        if (error) return cb([], wrap(error));
        cb(sortByName(data.map(fromRow)));
      };
      load();
      const unsub = subscribe('groupe', `campaign_id=eq.${campaignId}`, debounce(load));
      return () => { alive = false; unsub(); };
    },
    watchCharacter(id, cb) {
      let alive = true;
      const load = async () => {
        const { data, error } = await sb.from(T).select('*').eq('id', id).maybeSingle();
        if (!alive) return;
        if (error) return cb(null, wrap(error));
        cb(data ? fromRow(data) : null);
      };
      load();
      const unsub = subscribe('fiche', `id=eq.${id}`, debounce(load));
      return () => { alive = false; unsub(); };
    },
    async createCharacter(campaignId, c) {
      return check(await sb.from(T).insert({ campaign_id: campaignId, data: toData(c) }).select('id').single()).id;
    },
    async updateCharacter(id, c) {
      const rows = check(await sb.from(T).update({ data: toData(c) }).eq('id', id).select('id'));
      if (!rows.length) throw new Error('Accès refusé.');
    },
    async deleteCharacter(id) {
      const rows = check(await sb.from(T).delete().eq('id', id).select('id'));
      if (!rows.length) throw new Error('Accès refusé.');
    },

    async listContent(campaignId) {
      const { data, error } = await sb.from('content_items').select('id, kind, name, source_title, data')
        .eq('campaign_id', campaignId).order('created_at');
      // Table absente (mise à jour SQL pas encore faite) : bibliothèque vide.
      return error ? [] : data;
    },
    async addContent(campaignId, items) {
      const rows = check(await sb.from('content_items').insert(items.map(it => ({ ...it, campaign_id: campaignId }))).select('id'));
      if (rows.length !== items.length) throw new Error("Enregistrement refusé (réservé au MJ de la campagne).");
    },
    async deleteContent(ids) {
      check(await sb.from('content_items').delete().in('id', ids));
    },
    // Appel de la fonction serveur « extraire-livre » (voir edge-function/index.ts).
    async libraryCall(body) {
      const { data, error } = await sb.functions.invoke('extraire-livre', { body });
      if (error) {
        let msg = error.message;
        let retry = false;
        try {
          const j = await error.context.json();
          msg = j.error ?? msg;
          retry = !!j.retry;
        } catch {
          if (/Failed to send|not found|404/i.test(msg)) msg = "Fonction « extraire-livre » introuvable : installe-la dans Supabase (voir README).";
        }
        throw Object.assign(new Error(msg), { retry });
      }
      return data;
    },
  };
}

// ── Mode local (localStorage) ───────────────────────────────

function localImpl() {
  const K = {
    users: 'dnd55.users', chars: 'dnd55.chars', session: 'dnd55.session',
    campaigns: 'dnd55.campaigns', members: 'dnd55.members', content: 'dnd55.content',
  };
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const listeners = new Set();
  const authListeners = new Set();
  const notify = () => listeners.forEach(f => f());

  window.addEventListener('storage', e => {
    if (e.key === K.chars) notify();
    if (e.key === K.session) authListeners.forEach(f => f());
  });

  async function hash(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const uid = () => Math.random().toString(36).slice(2, 12);
  const newCode = () => {
    const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const c = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => alphabet[b % 32]).join('');
    return `${c.slice(0, 4)}-${c.slice(4)}`;
  };
  const current = () => {
    const s = read(K.session, null);
    const u = s && read(K.users, {})[s];
    return u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null;
  };
  const me = () => {
    const u = current();
    if (!u) throw new Error('Non connecté.');
    return u.uid;
  };
  const roleIn = (cid, u = current()?.uid) => read(K.members, []).find(m => m.campaign_id === cid && m.user_id === u)?.role;
  const requireGM = cid => { if (roleIn(cid) !== 'mj') throw new Error('Réservé au MJ de la campagne.'); };
  const emitAuth = () => authListeners.forEach(f => f());
  const fromCampaign = c => ({ ...c, settings: { ...DEFAULT_CAMPAIGN, ...c.settings }, role: roleIn(c.id) });

  return {
    onAuth(cb) {
      const f = () => cb(current());
      authListeners.add(f);
      setTimeout(f);
      return () => authListeners.delete(f);
    },
    async signUp(email, password, displayName) {
      email = email.trim().toLowerCase();
      const users = read(K.users, {});
      if (users[email]) throw new Error('Cet e-mail est déjà utilisé.');
      if (password.length < 6) throw new Error('Mot de passe trop faible (6 caractères minimum).');
      users[email] = { uid: uid(), email, displayName, pass: await hash(password) };
      write(K.users, users);
      write(K.session, email);
      emitAuth();
    },
    async signIn(email, password) {
      email = email.trim().toLowerCase();
      const u = read(K.users, {})[email];
      if (!u || u.pass !== await hash(password)) throw new Error('E-mail ou mot de passe incorrect.');
      write(K.session, email);
      emitAuth();
    },
    async signOut() { localStorage.removeItem(K.session); emitAuth(); },
    async resetPassword() { throw new Error('Indisponible en mode local.'); },
    async updateProfile(displayName) {
      const users = read(K.users, {});
      const u = users[read(K.session, null)];
      if (!u) throw new Error('Non connecté.');
      u.displayName = displayName;
      write(K.users, users);
      const all = read(K.chars, {});
      Object.values(all).filter(c => c.ownerUid === u.uid).forEach(c => (c.ownerName = displayName));
      write(K.chars, all);
      notify();
      emitAuth();
    },

    async listCampaigns() {
      const mine = read(K.members, []).filter(m => m.user_id === me()).map(m => m.campaign_id);
      return sortByName(Object.values(read(K.campaigns, {})).filter(c => mine.includes(c.id)).map(fromCampaign));
    },
    async createCampaign(name) {
      const c = { id: uid(), name: name.trim(), joinCode: newCode(), settings: { ...DEFAULT_CAMPAIGN }, createdBy: me() };
      write(K.campaigns, { ...read(K.campaigns, {}), [c.id]: c });
      write(K.members, [...read(K.members, []), { campaign_id: c.id, user_id: me(), role: 'mj' }]);
      return fromCampaign(c);
    },
    async joinCampaign(code) {
      const clean = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const c = Object.values(read(K.campaigns, {})).find(x => x.joinCode.replace('-', '') === clean);
      if (!c) throw new Error("Code d'invitation inconnu : vérifie-le auprès de ton MJ.");
      if (!roleIn(c.id)) write(K.members, [...read(K.members, []), { campaign_id: c.id, user_id: me(), role: 'joueur' }]);
      return fromCampaign(c);
    },
    async updateCampaign(id, patch) {
      requireGM(id);
      const all = read(K.campaigns, {});
      Object.assign(all[id], patch);
      write(K.campaigns, all);
    },
    async regenerateCode(id) {
      requireGM(id);
      const all = read(K.campaigns, {});
      all[id].joinCode = newCode();
      write(K.campaigns, all);
      return all[id].joinCode;
    },
    async deleteCampaign(id) {
      requireGM(id);
      const all = read(K.campaigns, {});
      delete all[id];
      write(K.campaigns, all);
      write(K.members, read(K.members, []).filter(m => m.campaign_id !== id));
      write(K.chars, Object.fromEntries(Object.entries(read(K.chars, {})).filter(([, c]) => c.campaignId !== id)));
      notify();
    },
    async listMembers(id) {
      const users = Object.values(read(K.users, {}));
      return read(K.members, []).filter(m => m.campaign_id === id)
        .map(m => ({ uid: m.user_id, role: m.role, displayName: users.find(u => u.uid === m.user_id)?.displayName ?? '?' }));
    },
    async setMemberRole(id, memberId, role) {
      requireGM(id);
      write(K.members, read(K.members, []).map(m => (m.campaign_id === id && m.user_id === memberId ? { ...m, role } : m)));
    },
    async removeMember(id, memberId) {
      if (memberId !== me()) requireGM(id);
      write(K.members, read(K.members, []).filter(m => !(m.campaign_id === id && m.user_id === memberId)));
    },

    watchCharacters(campaignId, cb) {
      const f = () => cb(sortByName(Object.values(read(K.chars, {})).filter(c => c.campaignId === campaignId)));
      listeners.add(f);
      setTimeout(f);
      return () => listeners.delete(f);
    },
    watchCharacter(id, cb) {
      let last = null;
      const f = () => {
        const c = read(K.chars, {})[id] ?? null;
        const json = JSON.stringify(c);
        if (json !== last) { last = json; cb(c && structuredClone(c)); }
      };
      listeners.add(f);
      setTimeout(f);
      return () => listeners.delete(f);
    },
    async createCharacter(campaignId, data) {
      const all = read(K.chars, {});
      const id = uid();
      all[id] = { ...data, id, campaignId, createdAt: Date.now(), updatedAt: Date.now() };
      write(K.chars, all);
      notify();
      return id;
    },
    async updateCharacter(id, data) {
      const all = read(K.chars, {});
      all[id] = { ...data, id, campaignId: all[id]?.campaignId, updatedAt: Date.now() };
      write(K.chars, all);
    },
    async deleteCharacter(id) {
      const all = read(K.chars, {});
      delete all[id];
      write(K.chars, all);
      notify();
    },

    async listContent(campaignId) { return read(K.content, []).filter(it => it.campaign_id === campaignId); },
    async addContent(campaignId, items) {
      requireGM(campaignId);
      write(K.content, [...read(K.content, []), ...items.map(it => ({ ...it, campaign_id: campaignId, id: uid() }))]);
    },
    async deleteContent(ids) {
      write(K.content, read(K.content, []).filter(it => !ids.includes(it.id)));
    },
    async libraryCall() { throw new Error("L'extraction automatique nécessite Supabase (mode local)."); },
  };
}
