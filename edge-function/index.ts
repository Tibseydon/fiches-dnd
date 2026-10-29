// Fonction Supabase « extraire-livre » (voir README : Bibliothèque).
// À coller dans Supabase → Edge Functions → Deploy a new function → Via Editor.
// Secret requis : ANTHROPIC_API_KEY (Edge Functions → Secrets).
// Secret facultatif : CLAUDE_MODEL = claude-opus-5-5 pour une extraction plus fiable mais plus chère
// (par défaut : claude-haiku-5-5).
//
// Actions, réservées au MJ :
//   { action: "info" }                            → modèle utilisé (pour estimer le coût)
//   { action: "fetch", url }                      → renvoie le fichier (PDF ou page web) tel quel
//   { action: "extract", text, title, known }     → extrait les options de joueur d'un extrait de livre

import Anthropic from "npm:@anthropic-ai/sdk@0.134.0";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const MODEL = Deno.env.get("CLAUDE_MODEL")?.trim() || "claude-haiku-5-5";
// Le relais automatique en cas de refus n'existe que pour la gamme Opus.
const FALLBACK = MODEL.startsWith("claude-opus-")
  ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
  : {};
const MAX_FETCH_BYTES = 30 * 1024 * 1024;
const MAX_TEXT_CHARS = 120_000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const SKILLS = [
  "acrobatics", "arcana", "athletics", "stealth", "animal", "sleight", "history", "intimidation", "insight",
  "investigation", "medicine", "nature", "perception", "persuasion", "religion", "performance", "survival", "deception",
];
const CLASS_IDS = [
  "barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer",
  "warlock", "wizard", "artificer", "other",
];

const str = { type: "string" };
const int = { type: "integer" };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "kind", "name", "original_name", "parent_class", "parent_class_name", "summary", "hit_die", "primary_ability",
          "saving_throws", "skill_count", "skill_options", "spellcasting", "spell_ability", "armor", "weapons",
          "tools", "size", "speed_m", "darkvision_m", "ability_options", "origin_feat", "skills", "features",
        ],
        properties: {
          kind: { type: "string", enum: ["class", "subclass", "species", "background", "feat"] },
          name: str,
          original_name: str,
          parent_class: { type: "string", enum: CLASS_IDS },
          parent_class_name: str,
          summary: str,
          hit_die: int,
          primary_ability: str,
          saving_throws: { type: "array", items: { type: "string", enum: ABILITIES } },
          skill_count: int,
          skill_options: { type: "array", items: { type: "string", enum: SKILLS } },
          spellcasting: { type: "string", enum: ["none", "full", "half", "third", "pact"] },
          spell_ability: { type: "string", enum: ["", ...ABILITIES] },
          armor: str,
          weapons: str,
          tools: str,
          size: str,
          speed_m: { type: "number" },
          darkvision_m: { type: "number" },
          ability_options: { type: "array", items: { type: "string", enum: ABILITIES } },
          origin_feat: str,
          skills: { type: "array", items: { type: "string", enum: SKILLS } },
          features: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["level", "name", "summary"],
              properties: { level: int, name: str, summary: str },
            },
          },
        },
      },
    },
  },
};

const SYSTEM = `You extract player options from an excerpt of a Dungeons & Dragons 5th edition (2014 or 2024) sourcebook, so a tabletop group can use them in their private character-sheet app.

Extract only player options: classes, subclasses, species (races), backgrounds and feats. Ignore monsters, adventures, lore, spells lists, magic items and GM advice.

Rules:
- Write every "summary" in French, in your own words, in one or two short sentences describing what the option or feature does in play. Never copy the book's sentences.
- Keep game data exact: hit die, saving throws, skill choices, levels, distances. Convert feet to metres (5 ft = 1.5 m).
- "name": the option's name in French (use the official French name if one exists, otherwise translate it naturally). "original_name": the name exactly as printed in the book. Translate feature names into French too.
- Use 0, "" or [] for anything that does not apply or is not in the excerpt. Never invent data.
- "kind" = class: fill hit_die, primary_ability, saving_throws, skill_count, skill_options, spellcasting (third = one-third caster such as Eldritch Knight), spell_ability, armor, weapons, tools, and every class feature with its level in "features".
- "kind" = subclass: set parent_class to the matching class id (barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard, artificer) or "other" with parent_class_name set to the class name. List its features with their levels.
- "kind" = species: fill size, speed_m, darkvision_m and each trait in "features" (level 1, or the level at which it unlocks).
- "kind" = background: fill ability_options (the abilities it can raise), origin_feat (feat name), skills, tools.
- "kind" = feat: summary of the benefit; features may list prerequisites as a feature named "Prérequis".
- The excerpt may start or end in the middle of an option. If it continues an option listed under "Already found" (listed by original name), reuse exactly the same kind and original_name and give only the new information.
- If the excerpt contains no player option, return {"items": []}.`;

function isPrivateHost(host: string) {
  return /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$)/i.test(host)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

// Liens de partage Google → lien de téléchargement direct.
function directUrl(url: URL): URL {
  const h = url.hostname;
  const docId = url.pathname.match(/\/document\/d\/([\w-]{20,})/)?.[1];
  if (h === "docs.google.com" && docId && docId !== "e") {
    return new URL(`https://docs.google.com/document/d/${docId}/export?format=txt`);
  }
  const fileId = url.pathname.match(/\/file\/d\/([\w-]{20,})/)?.[1] ?? url.searchParams.get("id");
  if (h === "drive.google.com" && fileId) {
    return new URL(`https://drive.google.com/uc?export=download&id=${fileId}`);
  }
  return url;
}

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept": "application/pdf,text/html,text/plain;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  // Seul le MJ de la campagne peut utiliser la bibliothèque.
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: isGm, error: gmError } = await supabase.rpc("is_gm");
  if (gmError || !isGm) return json({ error: "Réservé au MJ de la campagne." }, 403);

  let body: { action?: string; url?: string; text?: string; title?: string; known?: { kind: string; name: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Requête invalide." }, 400); }

  if (body.action === "info") return json({ model: MODEL });

  if (body.action === "fetch") {
    let url: URL;
    try { url = new URL(body.url ?? ""); } catch { return json({ error: "Lien invalide." }, 400); }
    if (!["http:", "https:"].includes(url.protocol) || isPrivateHost(url.hostname)) {
      return json({ error: "Lien non autorisé." }, 400);
    }
    const res = await fetch(directUrl(url), { headers: FETCH_HEADERS, redirect: "follow", signal: AbortSignal.timeout(30_000) })
      .catch(() => null);
    if (!res || !res.ok) {
      const status = res?.status;
      const why = status === 401 || status === 403
        ? "le site refuse le téléchargement automatique, ou le document n'est pas partagé publiquement"
        : status === 404 ? "page introuvable" : status ? `erreur ${status}` : "site injoignable";
      return json({
        error: `Impossible de télécharger ce lien (${why}). Télécharge le fichier sur ton ordinateur, puis importe-le avec « Fichier ».`,
      }, 502);
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > MAX_FETCH_BYTES) return json({ error: "Fichier trop gros (30 Mo maximum)." }, 413);
    return new Response(buf, { headers: { ...CORS, "Content-Type": "application/octet-stream" } });
  }

  if (body.action === "extract") {
    const text = (body.text ?? "").slice(0, MAX_TEXT_CHARS);
    if (!text.trim()) return json({ items: [], usage: { input_tokens: 0, output_tokens: 0 } });
    const known = (body.known ?? []).slice(0, 400).map((k) => `- ${k.kind}: ${k.name}`).join("\n") || "(none yet)";

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "Secret ANTHROPIC_API_KEY manquant dans Supabase." }, 500);
    const client = new Anthropic({ apiKey });

    try {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        // Extraction structurée : un effort faible suffit et limite le coût.
        output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
        ...FALLBACK,
        system: SYSTEM,
        messages: [{
          role: "user",
          content: `Book: ${body.title ?? "Unknown"}\n\nAlready found in previous excerpts:\n${known}\n\n<excerpt>\n${text}\n</excerpt>`,
        }],
      });

      if (response.stop_reason === "refusal") {
        return json({ error: "Claude a refusé cet extrait.", items: [], usage: response.usage, model: MODEL }, 200);
      }
      if (response.stop_reason === "max_tokens") {
        return json({ error: "Extrait trop dense : réduis la taille des parties.", items: [], usage: response.usage, model: MODEL }, 200);
      }
      const textBlock = response.content.find((b) => b.type === "text");
      const parsed = textBlock && textBlock.type === "text" ? JSON.parse(textBlock.text) : { items: [] };
      return json({ items: parsed.items ?? [], usage: response.usage, model: MODEL });
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) return json({ error: "Clé API Anthropic invalide." }, 500);
      if (e instanceof Anthropic.RateLimitError) return json({ error: "Limite de débit Anthropic atteinte : réessaie dans une minute.", retry: true }, 429);
      if (e instanceof Anthropic.APIError) return json({ error: `Erreur Anthropic ${e.status} : ${e.message}`, retry: (e.status ?? 0) >= 500 }, 502);
      return json({ error: `Erreur : ${(e as Error).message}` }, 500);
    }
  }

  return json({ error: "Action inconnue." }, 400);
});
