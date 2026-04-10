"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NATURES, ARCHETYPES, TYPE_COLORS } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

type PokemonOption = {
  id: string;
  dexNumber: number;
  name: string;
  displayName: string;
  types: string;
  spriteUrl: string | null;
  abilities: { ability: { name: string }; isHidden: boolean }[];
};

type SlotData = {
  pokemonId: string;
  slotIndex: number;
  nickname: string;
  ability: string;
  itemName: string;
  nature: string;
  moves: [string, string, string, string];
  evHp: number;
  evAtk: number;
  evDef: number;
  evSpAtk: number;
  evSpDef: number;
  evSpeed: number;
  notes: string;
};

const EMPTY_SLOT = (slotIndex: number): SlotData => ({
  pokemonId: "",
  slotIndex,
  nickname: "",
  ability: "",
  itemName: "",
  nature: "",
  moves: ["", "", "", ""],
  evHp: 0,
  evAtk: 0,
  evDef: 0,
  evSpAtk: 0,
  evSpDef: 0,
  evSpeed: 0,
  notes: "",
});

const EV_STATS = [
  { key: "evHp" as const, label: "HP" },
  { key: "evAtk" as const, label: "Atk" },
  { key: "evDef" as const, label: "Def" },
  { key: "evSpAtk" as const, label: "SpA" },
  { key: "evSpDef" as const, label: "SpD" },
  { key: "evSpeed" as const, label: "Spe" },
];

export function TeamBuilderForm({ pokemon }: { pokemon: PokemonOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"Singles" | "Doubles">("Singles");
  const [archetype, setArchetype] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [rentalCode, setRentalCode] = useState("");
  const [slots, setSlots] = useState<SlotData[]>([EMPTY_SLOT(0)]);
  const [expandedSlot, setExpandedSlot] = useState<number>(0);
  const [pokemonSearch, setPokemonSearch] = useState<Record<number, string>>({});

  const pokemonMap = Object.fromEntries(pokemon.map((p) => [p.id, p]));

  function updateSlot(index: number, update: Partial<SlotData>) {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...update } : s))
    );
  }

  function updateMove(slotIndex: number, moveIndex: number, value: string) {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (i !== slotIndex) return s;
        const moves = [...s.moves] as [string, string, string, string];
        moves[moveIndex] = value;
        return { ...s, moves };
      })
    );
  }

  function addSlot() {
    if (slots.length >= 6) return;
    setSlots((prev) => [...prev, EMPTY_SLOT(prev.length)]);
    setExpandedSlot(slots.length);
  }

  function removeSlot(index: number) {
    setSlots((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, slotIndex: i }))
    );
    setExpandedSlot(Math.max(0, index - 1));
  }

  function totalEvs(slot: SlotData) {
    return slot.evHp + slot.evAtk + slot.evDef + slot.evSpAtk + slot.evSpDef + slot.evSpeed;
  }

  function handleSubmit() {
    if (!title.trim()) return setError("Please enter a team title.");
    const filledSlots = slots.filter((s) => s.pokemonId);
    if (filledSlots.length === 0) return setError("Add at least 1 Pokémon.");

    for (const slot of filledSlots) {
      if (totalEvs(slot) > 510) {
        return setError(`Slot ${slot.slotIndex + 1} has more than 510 EVs.`);
      }
    }

    startTransition(async () => {
      const result = await createTeam({
        title,
        description,
        format,
        archetype: archetype || undefined,
        isPublic,
        rentalCode: rentalCode || undefined,
        slots: filledSlots.map((s) => ({
          ...s,
          moves: s.moves.filter(Boolean),
        })),
      });

      if (result.teamId) {
        router.push(`/teams/${result.teamId}`);
      } else {
        setError(result.message ?? "Something went wrong.");
      }
    });
  }

  const filteredPokemon = (search: string) =>
    search.length < 1
      ? pokemon.slice(0, 30)
      : pokemon.filter(
          (p) =>
            p.displayName.toLowerCase().includes(search.toLowerCase()) ||
            p.name.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Team meta */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <h2 className="font-semibold text-zinc-200">Team Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Title *</label>
            <Input
              placeholder="e.g. Iron Bundle Hyper Offense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Format *</label>
            <Select value={format} onValueChange={(v) => setFormat(v as "Singles" | "Doubles")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Singles">Singles</SelectItem>
                <SelectItem value="Doubles">Doubles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Archetype</label>
            <Select value={archetype} onValueChange={setArchetype}>
              <SelectTrigger>
                <SelectValue placeholder="Select archetype..." />
              </SelectTrigger>
              <SelectContent>
                {ARCHETYPES.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Visibility</label>
            <Select
              value={isPublic ? "public" : "private"}
              onValueChange={(v) => setIsPublic(v === "public")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              Team Code <span className="text-zinc-600">(optional)</span>
            </label>
            <Input
              placeholder="e.g. 0000 0000 00"
              value={rentalCode}
              onChange={(e) => setRentalCode(e.target.value)}
              maxLength={10}
            />
            <p className="text-xs text-zinc-600 mt-1">
              In-game rental code so others can import your team directly.
            </p>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Description</label>
          <Textarea
            placeholder="Describe your team strategy, win conditions, threats..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200">Pokémon ({slots.length}/6)</h2>
          {slots.length < 6 && (
            <Button variant="outline" size="sm" onClick={addSlot}>
              <Plus className="h-4 w-4 mr-1" /> Add Pokémon
            </Button>
          )}
        </div>

        {slots.map((slot, idx) => {
          const selectedPokemon = slot.pokemonId ? pokemonMap[slot.pokemonId] : null;
          const search = pokemonSearch[idx] ?? "";
          const isExpanded = expandedSlot === idx;

          return (
            <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              {/* Slot header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setExpandedSlot(isExpanded ? -1 : idx)}
              >
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedPokemon?.spriteUrl ? (
                    <Image
                      src={selectedPokemon.spriteUrl}
                      alt={selectedPokemon.displayName}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-zinc-600 text-xs">#{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-zinc-200">
                    {selectedPokemon
                      ? slot.nickname || selectedPokemon.displayName
                      : `Slot ${idx + 1} — select a Pokémon`}
                  </span>
                  {selectedPokemon && (
                    <div className="flex gap-1 mt-0.5">
                      {(JSON.parse(selectedPokemon.types) as string[]).map((t) => (
                        <span
                          key={t}
                          className={`${TYPE_COLORS[t] ?? "bg-zinc-600"} rounded px-1.5 py-0.5 text-xs text-white`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {slots.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSlot(idx); }}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Slot form */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-zinc-800 space-y-4">
                  {/* Pokemon picker */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Pokémon *</label>
                    <Input
                      placeholder="Search Pokémon..."
                      value={search}
                      onChange={(e) => setPokemonSearch((p) => ({ ...p, [idx]: e.target.value }))}
                      className="mb-2"
                    />
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto rounded-md border border-zinc-700 p-2 bg-zinc-950">
                      {filteredPokemon(search).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            updateSlot(idx, { pokemonId: p.id });
                            setPokemonSearch((prev) => ({ ...prev, [idx]: "" }));
                          }}
                          className={`flex flex-col items-center p-1.5 rounded-lg text-xs transition-colors hover:bg-zinc-800 ${
                            slot.pokemonId === p.id ? "bg-violet-500/20 border border-violet-500" : "border border-transparent"
                          }`}
                        >
                          {p.spriteUrl ? (
                            <Image src={p.spriteUrl} alt={p.displayName} width={32} height={32} className="object-contain" />
                          ) : (
                            <div className="h-8 w-8 bg-zinc-800 rounded-full" />
                          )}
                          <span className="text-zinc-300 truncate w-full text-center">{p.displayName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Nickname</label>
                      <Input
                        placeholder="Optional"
                        value={slot.nickname}
                        onChange={(e) => updateSlot(idx, { nickname: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Item</label>
                      <Input
                        placeholder="e.g. Choice Specs"
                        value={slot.itemName}
                        onChange={(e) => updateSlot(idx, { itemName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Ability</label>
                      <Input
                        placeholder="e.g. Protosynthesis"
                        value={slot.ability}
                        onChange={(e) => updateSlot(idx, { ability: e.target.value })}
                        list={`abilities-${idx}`}
                      />
                      {selectedPokemon && (
                        <datalist id={`abilities-${idx}`}>
                          {selectedPokemon.abilities.map(({ ability }) => (
                            <option key={ability.name} value={ability.name} />
                          ))}
                        </datalist>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Nature</label>
                      <Select value={slot.nature} onValueChange={(v) => updateSlot(idx, { nature: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nature..." />
                        </SelectTrigger>
                        <SelectContent>
                          {NATURES.map((n) => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Moves */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Moves (up to 4)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {slot.moves.map((m, mi) => (
                        <Input
                          key={mi}
                          placeholder={`Move ${mi + 1}`}
                          value={m}
                          onChange={(e) => updateMove(idx, mi, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* EVs */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-zinc-500">EVs</label>
                      <span className={`text-xs ${totalEvs(slot) > 510 ? "text-red-400" : "text-zinc-500"}`}>
                        {totalEvs(slot)}/510
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {EV_STATS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-xs text-zinc-600 mb-0.5 block text-center">{label}</label>
                          <Input
                            type="number"
                            min={0}
                            max={252}
                            value={slot[key]}
                            onChange={(e) =>
                              updateSlot(idx, { [key]: Math.min(252, Math.max(0, parseInt(e.target.value) || 0)) })
                            }
                            className="text-center px-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Notes for this Pokémon</label>
                    <Textarea
                      placeholder="Usage notes, spread explanation..."
                      value={slot.notes}
                      onChange={(e) => updateSlot(idx, { notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pb-8">
        <Button onClick={handleSubmit} disabled={isPending} size="lg">
          {isPending ? "Publishing..." : "Publish Team"}
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
