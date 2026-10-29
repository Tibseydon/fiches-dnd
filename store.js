// Couche de stockage : Supabase (partagé) ou localStorage (mode test).
import { SUPABASE_URL, SUPABASE_KEY } from './config.js?v=202610290953';

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
export const watchCharacters = cb => impl.watchCharacters(cb);
export const watchCharacter = (id, cb) => impl.watchCharacter(id, cb);
export const createCharacter = data => impl.createCharacter(data);
export const updateCharacter = (id, data) => impl.updateCharacter(id, data);
export const deleteCharacter = id => impl.deleteCharacter(id);

// ── Supabase ────────────────────────────────────────────────

async function supabaseImpl() {
  const { createClient } = await import(SUPABASE_JS);
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const T = 'characters';

  const messages = [
    [/CAMPAIGN_CODE_INVALID|Database error saving new user/i, 'Code de campagne invalide.'],
    [/Invalid login credentials/i, 'E-mail ou mot de passe incorrect.'],
    [/Email not confirmed/i, "Confirme d'abord ton adresse e-mail (lien reçu par mail)."],
    [/already registered|already been registered/i, 'Cet e-mail est déjà utilisé.'],
    [/Password should be at least/i, 'Mot de passe trop faible (6 caractères minimum).'],
    [/rate limit|too many/i, 'Trop de tentatives, réessaie dans quelques minutes.'],
    [/invalid.*email|validate email/i, 'Adresse e-mail invalide.'],
  ];
  const wrap = e => new Error(messages.find(([re]) => re.test(e?.message ?? ''))?.[1] ?? e?.message ?? String(e));
  const check = ({ data, error }) => { if (error) throw wrap(error); return data; };

  // Une ligne = { id, owner_id, data (la fiche), created_at, updated_at }
  const fromRow = r => ({
    ...r.data, id: r.id, ownerUid: r.owner_id,
    createdAt: Date.parse(r.created_at), updatedAt: Date.parse(r.updated_at),
  });
  const toData = c => {
    const { id, ownerUid, createdAt, updatedAt, ...rest } = c;
    return rest;
  };

  async function loadProfile(user) {
    const { data } = await sb.from('profiles').select('display_name, role').eq('id', user.id).maybeSingle();
    if (!data) return { uid: user.id, email: user.email, displayName: user.email, role: 'joueur', noProfile: true };
    return { uid: user.id, email: user.email, displayName: data.display_name, role: data.role };
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
    async signUp(email, password, displayName, code) {
      const data = check(await sb.auth.signUp({
        email, password,
        options: { data: { display_name: displayName, campaign_code: code }, emailRedirectTo: siteUrl() },
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
    watchCharacters(cb) {
      let alive = true;
      const load = async () => {
        const { data, error } = await sb.from(T).select('*');
        if (!alive) return;
        if (error) return cb([], wrap(error));
        cb(data.map(fromRow).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      };
      load();
      const unsub = subscribe('groupe', null, debounce(load));
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
    async createCharacter(c) {
      return check(await sb.from(T).insert({ data: toData(c) }).select('id').single()).id;
    },
    async updateCharacter(id, c) {
      const rows = check(await sb.from(T).update({ data: toData(c) }).eq('id', id).select('id'));
      if (!rows.length) throw new Error('Accès refusé.');
    },
    async deleteCharacter(id) {
      const rows = check(await sb.from(T).delete().eq('id', id).select('id'));
      if (!rows.length) throw new Error('Accès refusé.');
    },
  };
}

// ── Mode local (localStorage) ───────────────────────────────

function localImpl() {
  const K = { users: 'dnd55.users', chars: 'dnd55.chars', session: 'dnd55.session' };
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
  const current = () => {
    const s = read(K.session, null);
    const u = s && read(K.users, {})[s];
    return u ? { uid: u.uid, email: u.email, displayName: u.displayName, role: u.role } : null;
  };
  const emitAuth = () => authListeners.forEach(f => f());
  const sorted = () => Object.values(read(K.chars, {})).sort((a, b) => a.name.localeCompare(b.name));

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
      // Le premier compte créé devient MJ en mode local.
      const role = Object.keys(users).length ? 'joueur' : 'mj';
      users[email] = { uid: uid(), email, displayName, role, pass: await hash(password) };
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
    watchCharacters(cb) {
      const f = () => cb(sorted());
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
    async createCharacter(data) {
      const all = read(K.chars, {});
      const id = uid();
      all[id] = { ...data, id, createdAt: Date.now(), updatedAt: Date.now() };
      write(K.chars, all);
      notify();
      return id;
    },
    async updateCharacter(id, data) {
      const all = read(K.chars, {});
      all[id] = { ...data, id, updatedAt: Date.now() };
      write(K.chars, all);
    },
    async deleteCharacter(id) {
      const all = read(K.chars, {});
      delete all[id];
      write(K.chars, all);
      notify();
    },
  };
}
