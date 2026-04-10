import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-stone-400",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400",
  Grass: "bg-green-500",
  Ice: "bg-cyan-400",
  Fighting: "bg-red-700",
  Poison: "bg-purple-600",
  Ground: "bg-yellow-700",
  Flying: "bg-indigo-400",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-500",
  Rock: "bg-yellow-600",
  Ghost: "bg-purple-800",
  Dragon: "bg-indigo-700",
  Dark: "bg-stone-700",
  Steel: "bg-slate-400",
  Fairy: "bg-pink-400",
};

export const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
] as const;

export const ARCHETYPES = [
  "Hyper Offense", "Balance", "Stall", "Rain", "Sun",
  "Sand", "Snow", "Trick Room", "Weather", "Entry Hazards",
  "Bulky Offense", "VoltTurn",
] as const;

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getVoteCount(votes: { value: number }[]) {
  return votes.reduce((sum, v) => sum + v.value, 0);
}
