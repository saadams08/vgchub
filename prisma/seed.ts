/**
 * Seed script: fetches only Pokémon available in Pokémon Champions
 * sourced from https://www.serebii.net/pokemonchampions/pokemon.shtml
 * Run with: npm run seed
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const POKEAPI = "https://pokeapi.co/api/v2";

// All 201 Pokémon available in Pokémon Champions (as PokéAPI slugs)
const CHAMPIONS_POKEMON = [
  "venusaur", "charizard", "blastoise", "beedrill", "pidgeot",
  "arbok", "pikachu", "raichu", "clefable", "ninetales",
  "arcanine", "alakazam", "machamp", "victreebel", "slowbro",
  "gengar", "kangaskhan", "starmie", "pinsir", "tauros",
  "gyarados", "ditto", "vaporeon", "jolteon", "flareon",
  "aerodactyl", "snorlax", "dragonite", "meganium", "typhlosion",
  "feraligatr", "ariados", "ampharos", "azumarill", "politoed",
  "espeon", "umbreon", "slowking", "forretress", "steelix",
  "scizor", "heracross", "skarmory", "houndoom", "tyranitar",
  "pelipper", "gardevoir", "sableye", "aggron", "medicham",
  "manectric", "sharpedo", "camerupt", "torkoal", "altaria",
  "milotic", "castform", "banette", "chimecho", "absol",
  "glalie", "torterra", "infernape", "empoleon", "luxray",
  "roserade", "rampardos", "bastiodon", "lopunny", "spiritomb",
  "garchomp", "lucario", "hippowdon", "toxicroak", "abomasnow",
  "weavile", "rhyperior", "leafeon", "glaceon", "gliscor",
  "mamoswine", "gallade", "froslass", "rotom", "serperior",
  "emboar", "samurott", "watchog", "liepard", "simisage",
  "simisear", "simipour", "excadrill", "audino", "conkeldurr",
  "whimsicott", "krookodile", "cofagrigus", "garbodor", "zoroark",
  "reuniclus", "vanilluxe", "emolga", "chandelure", "beartic",
  "stunfisk", "golurk", "hydreigon", "volcarona", "chesnaught",
  "delphox", "greninja", "diggersby", "talonflame", "vivillon",
  "floette", "florges", "pangoro", "furfrou", "meowstic-male",
  "aegislash-shield", "aromatisse", "slurpuff", "clawitzer", "heliolisk",
  "tyrantrum", "aurorus", "sylveon", "hawlucha", "dedenne",
  "goodra", "klefki", "trevenant", "gourgeist-average", "avalugg",
  "noivern", "decidueye", "incineroar", "primarina", "toucannon",
  "crabominable", "lycanroc-midday", "toxapex", "mudsdale", "araquanid",
  "salazzle", "tsareena", "oranguru", "passimian", "mimikyu-disguised",
  "drampa", "kommo-o", "corviknight", "flapple", "appletun",
  "sandaconda", "polteageist", "hatterene", "mr-rime", "runerigus",
  "alcremie", "morpeko-full-belly", "dragapult", "wyrdeer", "kleavor",
  "basculegion-male", "sneasler", "meowscarada", "skeledirge", "quaquaval",
  "maushold-family-of-four", "garganacl", "armarouge", "ceruledge", "bellibolt",
  "scovillain", "espathra", "tinkaton", "palafin-zero", "orthworm",
  "glimmora", "farigiraf", "kingambit", "sinistcha", "archaludon",
  "hydrapple",
];

type PokeAPISprite = { front_default: string | null };
type PokeAPIType = { type: { name: string } };
type PokeAPIStat = { base_stat: number; stat: { name: string } };
type PokeAPIAbility = { ability: { name: string; url: string }; is_hidden: boolean };

type PokeAPIPokemon = {
  id: number;
  name: string;
  sprites: PokeAPISprite & { other?: { "official-artwork"?: { front_default?: string } } };
  types: PokeAPIType[];
  stats: PokeAPIStat[];
  abilities: PokeAPIAbility[];
};

type PokeAPISpecies = {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  names: { name: string; language: { name: string } }[];
};

type PokeAPIAbilityDetail = { effect_entries: { effect: string; language: { name: string } }[] };

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function seedPokemon() {
  console.log(`Seeding ${CHAMPIONS_POKEMON.length} Pokémon Champions Pokémon...`);

  // Clear existing data first so we start fresh
  await db.pokemonAbility.deleteMany();
  await db.pokemon.deleteMany();
  await db.ability.deleteMany();
  console.log("Cleared existing Pokémon data.\n");

  let success = 0;
  let failed = 0;

  for (const slug of CHAMPIONS_POKEMON) {
    try {
      const poke = await fetchJSON<PokeAPIPokemon>(`${POKEAPI}/pokemon/${slug}`);

      // Species endpoint uses the base species ID for alternate forms
      const speciesId = poke.id > 10000
        ? poke.name.split("-")[0] // fallback for forms
        : poke.id;

      const species = await fetchJSON<PokeAPISpecies>(
        `${POKEAPI}/pokemon-species/${speciesId}`
      ).catch(() => fetchJSON<PokeAPISpecies>(`${POKEAPI}/pokemon-species/${slug}`));

      const displayName =
        species.names.find((n) => n.language.name === "en")?.name ?? capitalize(poke.name);

      const description =
        species.flavor_text_entries
          .filter((e) => e.language.name === "en")
          .pop()
          ?.flavor_text.replace(/\f|\n/g, " ") ?? null;

      const types = JSON.stringify(poke.types.map((t) => capitalize(t.type.name)));

      const statMap: Record<string, number> = {};
      for (const s of poke.stats) {
        statMap[s.stat.name] = s.base_stat;
      }

      const spriteUrl =
        poke.sprites.other?.["official-artwork"]?.front_default ??
        poke.sprites.front_default ??
        null;

      const pokemon = await db.pokemon.upsert({
        where: { dexNumber: poke.id },
        update: {
          displayName,
          types,
          hp: statMap["hp"] ?? 0,
          attack: statMap["attack"] ?? 0,
          defense: statMap["defense"] ?? 0,
          spAtk: statMap["special-attack"] ?? 0,
          spDef: statMap["special-defense"] ?? 0,
          speed: statMap["speed"] ?? 0,
          spriteUrl,
          imageUrl: spriteUrl,
          description,
        },
        create: {
          dexNumber: poke.id,
          name: poke.name,
          displayName,
          types,
          hp: statMap["hp"] ?? 0,
          attack: statMap["attack"] ?? 0,
          defense: statMap["defense"] ?? 0,
          spAtk: statMap["special-attack"] ?? 0,
          spDef: statMap["special-defense"] ?? 0,
          speed: statMap["speed"] ?? 0,
          spriteUrl,
          imageUrl: spriteUrl,
          description,
        },
      });

      // Abilities
      for (const ab of poke.abilities) {
        let ability = await db.ability.findUnique({ where: { name: ab.ability.name } });
        if (!ability) {
          let desc: string | null = null;
          try {
            const abDetail = await fetchJSON<PokeAPIAbilityDetail>(ab.ability.url);
            desc = abDetail.effect_entries.find((e) => e.language.name === "en")?.effect ?? null;
          } catch {
            // ignore
          }
          ability = await db.ability.create({
            data: { name: ab.ability.name, description: desc },
          });
        }
        await db.pokemonAbility
          .create({
            data: {
              pokemonId: pokemon.id,
              abilityId: ability.id,
              isHidden: ab.is_hidden,
            },
          })
          .catch(() => {/* skip duplicate */});
      }

      console.log(`  ✓ ${displayName} (#${poke.id})`);
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${slug} —`, (err as Error).message);
      failed++;
    }
  }

  console.log(`\nDone! ${success} seeded, ${failed} failed.`);
}

seedPokemon()
  .catch(console.error)
  .finally(() => db.$disconnect());
