/**
 * Seeds 10 sample team builds (5 Singles, 5 Doubles) for VGCHub.
 * Run with: npm run seed:teams
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Helper: look up a Pokemon by its PokéAPI name slug
async function getPoke(name: string) {
  const p = await db.pokemon.findUnique({ where: { name } });
  if (!p) throw new Error(`Pokemon not found in DB: ${name}`);
  return p;
}

async function main() {
  // Create a bot account to author the sample builds
  const botEmail = "vgchub-bot@vgchub.com";
  let bot = await db.user.findUnique({ where: { email: botEmail } });
  if (!bot) {
    bot = await db.user.create({
      data: {
        email: botEmail,
        name: "VGCHub Staff",
        username: "vgchub",
        password: await bcrypt.hash("not-a-real-password", 12),
      },
    });
  }

  // Clear existing sample teams from this bot
  await db.teamBuild.deleteMany({ where: { authorId: bot.id } });
  console.log("Cleared old sample teams.\n");

  // ── SINGLES TEAMS ──────────────────────────────────────────────

  // 1. Hyper Offense
  {
    const slots = [
      { name: "meowscarada",    nickname: null, item: "Choice Specs",      ability: "Protean",           nature: "Timid",   moves: ["Flower Trick","Dark Pulse","U-turn","Grass Knot"],          evs: [0,0,0,252,4,252] },
      { name: "dragapult",      nickname: null, item: "Choice Band",       ability: "Clear Body",         nature: "Jolly",   moves: ["Dragon Darts","U-turn","Shadow Ball","Fire Blast"],          evs: [0,252,0,0,4,252] },
      { name: "garchomp",       nickname: null, item: "Rocky Helmet",      ability: "Rough Skin",         nature: "Jolly",   moves: ["Earthquake","Dragon Claw","Stealth Rock","Fire Fang"],       evs: [0,252,0,0,4,252] },
      { name: "weavile",        nickname: null, item: "Life Orb",          ability: "Pressure",           nature: "Jolly",   moves: ["Triple Axel","Knock Off","Ice Shard","Low Kick"],            evs: [0,252,0,0,4,252] },
      { name: "talonflame",     nickname: null, item: "Heavy-Duty Boots",  ability: "Gale Wings",         nature: "Jolly",   moves: ["Brave Bird","Flare Blitz","Tailwind","Roost"],               evs: [0,252,0,0,4,252] },
      { name: "lucario",        nickname: null, item: "Life Orb",          ability: "Inner Focus",        nature: "Timid",   moves: ["Aura Sphere","Flash Cannon","Nasty Plot","Vacuum Wave"],     evs: [0,0,0,252,4,252] },
    ];
    await createTeam(bot.id, "Meowscarada Hyper Offense", "Classic fast-paced team built around Meowscarada and Dragapult applying immediate pressure. Garchomp sets Stealth Rock while Talonflame provides Tailwind support.", "Singles", "Hyper Offense", slots);
  }

  // 2. Bulky Offense
  {
    const slots = [
      { name: "corviknight",    nickname: null, item: "Rocky Helmet",      ability: "Pressure",           nature: "Impish",  moves: ["Body Press","Brave Bird","Roost","Defog"],                  evs: [252,0,252,0,4,0] },
      { name: "toxapex",        nickname: null, item: "Black Sludge",      ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Toxic","Recover","Haze"],                           evs: [252,0,252,0,4,0] },
      { name: "garchomp",       nickname: null, item: "Loaded Dice",       ability: "Rough Skin",         nature: "Jolly",   moves: ["Earthquake","Scale Shot","Stealth Rock","Swords Dance"],    evs: [0,252,0,0,4,252] },
      { name: "kingambit",      nickname: null, item: "Sitrus Berry",      ability: "Supreme Overlord",   nature: "Adamant", moves: ["Kowtow Cleave","Iron Head","Sucker Punch","Swords Dance"],  evs: [0,252,0,0,4,252] },
      { name: "hatterene",      nickname: null, item: "Leftovers",         ability: "Magic Bounce",       nature: "Modest",  moves: ["Psychic","Dazzling Gleam","Trick Room","Calm Mind"],        evs: [252,0,0,252,4,0] },
      { name: "garganacl",      nickname: null, item: "Leftovers",         ability: "Purifying Salt",     nature: "Careful", moves: ["Salt Cure","Body Press","Protect","Recover"],               evs: [252,0,4,0,252,0] },
    ];
    await createTeam(bot.id, "Corviknight Bulky Offense", "Defensively solid team with offensive pressure from Garchomp and Kingambit. Hatterene provides Magic Bounce utility and Trick Room threat.", "Singles", "Bulky Offense", slots);
  }

  // 3. Rain Team
  {
    const slots = [
      { name: "politoed",       nickname: null, item: "Damp Rock",         ability: "Drizzle",            nature: "Bold",    moves: ["Scald","Ice Beam","Encore","Toxic"],                        evs: [252,0,252,0,4,0] },
      { name: "toxapex",        nickname: null, item: "Black Sludge",      ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Toxic","Recover","Haze"],                           evs: [252,0,252,0,4,0] },
      { name: "gyarados",       nickname: null, item: "Lum Berry",         ability: "Moxie",              nature: "Jolly",   moves: ["Waterfall","Dragon Dance","Ice Fang","Earthquake"],         evs: [0,252,0,0,4,252] },
      { name: "greninja",       nickname: null, item: "Life Orb",          ability: "Protean",            nature: "Timid",   moves: ["Hydro Pump","Dark Pulse","Ice Beam","U-turn"],              evs: [0,0,0,252,4,252] },
      { name: "pelipper",       nickname: null, item: "Heavy-Duty Boots",  ability: "Drizzle",            nature: "Modest",  moves: ["Hurricane","Hydro Pump","U-turn","Roost"],                  evs: [0,0,0,252,4,252] },
      { name: "araquanid",      nickname: null, item: "Choice Band",       ability: "Water Bubble",       nature: "Adamant", moves: ["Liquidation","Leech Life","Poison Jab","Crunch"],           evs: [0,252,0,0,4,252] },
    ];
    await createTeam(bot.id, "Politoed Rain Team", "Full rain team with two drizzle setters for redundancy. Gyarados and Araquanid are the primary win conditions under rain.", "Singles", "Rain", slots);
  }

  // 4. Trick Room
  {
    const slots = [
      { name: "hatterene",      nickname: null, item: "Leftovers",         ability: "Magic Bounce",       nature: "Quiet",   moves: ["Trick Room","Psychic","Dazzling Gleam","Healing Wish"],    evs: [252,0,4,252,0,0] },
      { name: "reuniclus",      nickname: null, item: "Life Orb",          ability: "Magic Guard",        nature: "Quiet",   moves: ["Psychic","Shadow Ball","Trick Room","Calm Mind"],           evs: [252,0,4,252,0,0] },
      { name: "conkeldurr",     nickname: null, item: "Flame Orb",         ability: "Guts",               nature: "Brave",   moves: ["Drain Punch","Mach Punch","Ice Punch","Thunder Punch"],     evs: [252,252,4,0,0,0] },
      { name: "mamoswine",      nickname: null, item: "Choice Band",       ability: "Thick Fat",          nature: "Brave",   moves: ["Earthquake","Icicle Crash","Ice Shard","Knock Off"],        evs: [252,252,4,0,0,0] },
      { name: "cofagrigus",     nickname: null, item: "Mental Herb",       ability: "Mummy",              nature: "Quiet",   moves: ["Trick Room","Shadow Ball","Will-O-Wisp","Nasty Plot"],      evs: [252,0,4,252,0,0] },
      { name: "garganacl",      nickname: null, item: "Leftovers",         ability: "Purifying Salt",     nature: "Sassy",   moves: ["Salt Cure","Body Press","Recover","Protect"],               evs: [252,0,4,0,252,0] },
    ];
    await createTeam(bot.id, "Hatterene Trick Room", "Trick Room team with three setters and powerful slow attackers. Magic Guard Reuniclus and Guts Conkeldurr are devastating once Trick Room is up.", "Singles", "Trick Room", slots);
  }

  // 5. Stall
  {
    const slots = [
      { name: "toxapex",        nickname: null, item: "Black Sludge",      ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Toxic","Recover","Haze"],                           evs: [252,0,252,0,4,0] },
      { name: "garganacl",      nickname: null, item: "Leftovers",         ability: "Purifying Salt",     nature: "Careful", moves: ["Salt Cure","Body Press","Recover","Stealth Rock"],           evs: [252,0,4,0,252,0] },
      { name: "corviknight",    nickname: null, item: "Leftovers",         ability: "Pressure",           nature: "Impish",  moves: ["Body Press","Roost","Defog","Thunder Wave"],                evs: [252,0,252,0,4,0] },
      { name: "hippowdon",      nickname: null, item: "Leftovers",         ability: "Sand Stream",        nature: "Impish",  moves: ["Earthquake","Slack Off","Stealth Rock","Whirlwind"],        evs: [252,0,252,0,4,0] },
      { name: "slowbro",        nickname: null, item: "Leftovers",         ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Ice Beam","Slack Off","Teleport"],                  evs: [252,0,252,0,4,0] },
      { name: "aegislash-shield", nickname: "Aegislash", item: "Leftovers", ability: "Stance Change",    nature: "Sassy",   moves: ["King's Shield","Shadow Ball","Flash Cannon","Toxic"],       evs: [252,0,4,0,252,0] },
    ];
    await createTeam(bot.id, "Toxic Stall Core", "Regenerator core of Toxapex and Slowbro forms the backbone. Hippowdon sets Sand while Garganacl and Corviknight provide reliable recovery.", "Singles", "Stall", slots);
  }

  // ── DOUBLES TEAMS ──────────────────────────────────────────────

  // 6. Sun Doubles
  {
    const slots = [
      { name: "charizard",      nickname: null, item: "Choice Specs",      ability: "Solar Power",        nature: "Timid",   moves: ["Heat Wave","Air Slash","Dragon Pulse","Solar Beam"],        evs: [0,0,0,252,4,252] },
      { name: "arcanine",       nickname: null, item: "Sitrus Berry",      ability: "Intimidate",         nature: "Adamant", moves: ["Flare Blitz","Extreme Speed","Will-O-Wisp","Protect"],      evs: [0,252,0,0,4,252] },
      { name: "incineroar",     nickname: null, item: "Safety Goggles",    ability: "Intimidate",         nature: "Careful", moves: ["Flare Blitz","Knock Off","Parting Shot","Protect"],         evs: [252,0,4,0,252,0] },
      { name: "gardevoir",      nickname: null, item: "Psychic Seed",      ability: "Trace",              nature: "Timid",   moves: ["Psychic","Dazzling Gleam","Ally Switch","Protect"],         evs: [0,0,4,252,0,252] },
      { name: "volcarona",      nickname: null, item: "Lum Berry",         ability: "Flame Body",         nature: "Timid",   moves: ["Heat Wave","Bug Buzz","Quiver Dance","Protect"],            evs: [0,0,0,252,4,252] },
      { name: "garchomp",       nickname: null, item: "Yache Berry",       ability: "Rough Skin",         nature: "Jolly",   moves: ["Earthquake","Rock Slide","Protect","Swords Dance"],         evs: [0,252,0,0,4,252] },
    ];
    await createTeam(bot.id, "Solar Power Sun Team", "Brutal sun offense led by Solar Power Charizard. Double Intimidate from Arcanine and Incineroar provides defensive utility between turns.", "Doubles", "Sun", slots);
  }

  // 7. Rain Doubles
  {
    const slots = [
      { name: "pelipper",       nickname: null, item: "Damp Rock",         ability: "Drizzle",            nature: "Modest",  moves: ["Hurricane","Hydro Pump","Wide Guard","Tailwind"],          evs: [0,0,0,252,4,252] },
      { name: "araquanid",      nickname: null, item: "Mystic Water",      ability: "Water Bubble",       nature: "Adamant", moves: ["Liquidation","Leech Life","Crunch","Protect"],              evs: [0,252,0,0,4,252] },
      { name: "toxapex",        nickname: null, item: "Rocky Helmet",      ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Toxic","Recover","Wide Guard"],                     evs: [252,0,252,0,4,0] },
      { name: "gyarados",       nickname: null, item: "Lum Berry",         ability: "Moxie",              nature: "Adamant", moves: ["Waterfall","Ice Fang","Thunder Wave","Protect"],            evs: [0,252,0,0,4,252] },
      { name: "incineroar",     nickname: null, item: "Safety Goggles",    ability: "Intimidate",         nature: "Careful", moves: ["Flare Blitz","Knock Off","Parting Shot","Protect"],         evs: [252,0,4,0,252,0] },
      { name: "greninja",       nickname: null, item: "Life Orb",          ability: "Protean",            nature: "Timid",   moves: ["Hydro Pump","Dark Pulse","Surf","Ice Beam"],                evs: [0,0,0,252,4,252] },
    ];
    await createTeam(bot.id, "Pelipper Rain Offense", "Rain team for Doubles with Araquanid as the primary attacker, boosted by Water Bubble in rain. Pelipper and Incineroar provide excellent support.", "Doubles", "Rain", slots);
  }

  // 8. Trick Room Doubles
  {
    const slots = [
      { name: "hatterene",      nickname: null, item: "Mental Herb",       ability: "Magic Bounce",       nature: "Quiet",   moves: ["Trick Room","Psychic","Dazzling Gleam","Protect"],         evs: [252,0,4,252,0,0] },
      { name: "armarouge",      nickname: null, item: "Life Orb",          ability: "Flash Fire",         nature: "Quiet",   moves: ["Armor Cannon","Psyshock","Expanding Force","Protect"],     evs: [0,0,4,252,0,252] },
      { name: "conkeldurr",     nickname: null, item: "Flame Orb",         ability: "Guts",               nature: "Brave",   moves: ["Drain Punch","Mach Punch","Ice Punch","Protect"],           evs: [252,252,4,0,0,0] },
      { name: "mamoswine",      nickname: null, item: "Choice Band",       ability: "Thick Fat",          nature: "Brave",   moves: ["Earthquake","Icicle Crash","Rock Slide","Ice Shard"],       evs: [252,252,4,0,0,0] },
      { name: "garganacl",      nickname: null, item: "Leftovers",         ability: "Purifying Salt",     nature: "Sassy",   moves: ["Salt Cure","Body Press","Recover","Protect"],               evs: [252,0,4,0,252,0] },
      { name: "reuniclus",      nickname: null, item: "Assault Vest",      ability: "Magic Guard",        nature: "Quiet",   moves: ["Psychic","Shadow Ball","Energy Ball","Focus Blast"],        evs: [252,0,4,252,0,0] },
    ];
    await createTeam(bot.id, "Hatterene Trick Room Doubles", "Doubles Trick Room with Magic Bounce Hatterene and Armarouge as the setup lead. Slow, powerful attackers clean up once the room is set.", "Doubles", "Trick Room", slots);
  }

  // 9. Tailwind Offense Doubles
  {
    const slots = [
      { name: "talonflame",     nickname: null, item: "Heavy-Duty Boots",  ability: "Gale Wings",         nature: "Jolly",   moves: ["Tailwind","Brave Bird","Flare Blitz","Protect"],            evs: [0,252,0,0,4,252] },
      { name: "dragapult",      nickname: null, item: "Choice Specs",      ability: "Clear Body",         nature: "Timid",   moves: ["Draco Meteor","Shadow Ball","Dragon Darts","Fire Blast"],   evs: [0,0,0,252,4,252] },
      { name: "kingambit",      nickname: null, item: "Black Glasses",     ability: "Supreme Overlord",   nature: "Adamant", moves: ["Kowtow Cleave","Iron Head","Sucker Punch","Protect"],       evs: [0,252,0,0,4,252] },
      { name: "garchomp",       nickname: null, item: "Lum Berry",         ability: "Rough Skin",         nature: "Jolly",   moves: ["Earthquake","Rock Slide","Dragon Claw","Protect"],          evs: [0,252,0,0,4,252] },
      { name: "incineroar",     nickname: null, item: "Sitrus Berry",      ability: "Intimidate",         nature: "Careful", moves: ["Flare Blitz","Knock Off","Parting Shot","Protect"],         evs: [252,0,4,0,252,0] },
      { name: "meowscarada",    nickname: null, item: "Focus Sash",        ability: "Protean",            nature: "Timid",   moves: ["Flower Trick","Dark Pulse","U-turn","Protect"],             evs: [0,0,0,252,4,252] },
    ];
    await createTeam(bot.id, "Talonflame Tailwind Doubles", "Aggressive Tailwind team with Talonflame setting speed control for Dragapult and Kingambit. Incineroar handles defensive utility with Intimidate and Parting Shot.", "Doubles", "Hyper Offense", slots);
  }

  // 10. Balance Doubles
  {
    const slots = [
      { name: "incineroar",     nickname: null, item: "Safety Goggles",    ability: "Intimidate",         nature: "Careful", moves: ["Flare Blitz","Knock Off","Parting Shot","Protect"],         evs: [252,0,4,0,252,0] },
      { name: "gardevoir",      nickname: null, item: "Choice Scarf",      ability: "Trace",              nature: "Timid",   moves: ["Psychic","Dazzling Gleam","Moonblast","Ally Switch"],       evs: [0,0,0,252,4,252] },
      { name: "corviknight",    nickname: null, item: "Rocky Helmet",      ability: "Pressure",           nature: "Impish",  moves: ["Body Press","Brave Bird","Tailwind","Roost"],               evs: [252,0,252,0,4,0] },
      { name: "garganacl",      nickname: null, item: "Leftovers",         ability: "Purifying Salt",     nature: "Careful", moves: ["Salt Cure","Body Press","Wide Guard","Protect"],            evs: [252,0,4,0,252,0] },
      { name: "lucario",        nickname: null, item: "Life Orb",          ability: "Inner Focus",        nature: "Timid",   moves: ["Aura Sphere","Flash Cannon","Bullet Punch","Protect"],      evs: [0,0,0,252,4,252] },
      { name: "toxapex",        nickname: null, item: "Black Sludge",      ability: "Regenerator",        nature: "Bold",    moves: ["Scald","Toxic","Recover","Wide Guard"],                     evs: [252,0,252,0,4,0] },
    ];
    await createTeam(bot.id, "Incineroar Balance", "Well-rounded Doubles team with strong defensive utility from Incineroar, Corviknight, and Toxapex. Gardevoir and Lucario provide offensive coverage.", "Doubles", "Balance", slots);
  }

  console.log("\n✓ All 10 sample teams seeded!");
}

async function createTeam(
  authorId: string,
  title: string,
  description: string,
  format: string,
  archetype: string,
  slots: {
    name: string;
    nickname: string | null;
    item: string;
    ability: string;
    nature: string;
    moves: string[];
    evs: number[]; // [HP, Atk, Def, SpA, SpD, Spe]
  }[]
) {
  const pokemonList = await Promise.all(slots.map((s) => getPoke(s.name)));

  await db.teamBuild.create({
    data: {
      title,
      description,
      format,
      archetype,
      isPublic: true,
      authorId,
      slots: {
        create: slots.map((s, i) => ({
          slotIndex: i,
          pokemonId: pokemonList[i].id,
          nickname: s.nickname,
          itemName: s.item,
          ability: s.ability,
          nature: s.nature,
          moves: JSON.stringify(s.moves),
          evHp: s.evs[0],
          evAtk: s.evs[1],
          evDef: s.evs[2],
          evSpAtk: s.evs[3],
          evSpDef: s.evs[4],
          evSpeed: s.evs[5],
        })),
      },
    },
  });

  console.log(`  ✓ "${title}" (${format} - ${archetype})`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
