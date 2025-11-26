export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Discipline = 'Warrior' | 'Ranger' | 'Necromancer' | 'Oracle' | 'Guardian' | 'Berserker' | 'Reaper' | 'Valkyrie';

export type CharacterDefinition = {
  id: string;
  name: string;
  discipline: Discipline;
  rarity: Rarity;
  lore?: string;
  stats: {
    strength: number;
    intellect: number;
    vitality: number;
    agility: number;
  };
  gold: number;
  cardImage: string;
};

type HeroArchetype = {
  id: string;
  name: string;
  discipline: Discipline;
  baseStats: { strength: number; intellect: number; vitality: number; agility: number };
  baseGold: number;
  cardImage: string;
  lore: string;
};

const rarityScale: Record<Rarity, number> = {
  Common: 0.7,
  Rare: 1,
  Epic: 1.25,
  Legendary: 1.5,
};

const rarityOrder: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

const heroArchetypes: HeroArchetype[] = [
  {
    id: 'veyla',
    name: 'Veyla the Shadow Lich',
    discipline: 'Necromancer',
    baseStats: { strength: 42, intellect: 95, vitality: 68, agility: 54 },
    baseGold: 5200,
    cardImage: '/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png',
    lore: 'Master of shadowflame and soul drain from the Umbral crypts.',
  },
  {
    id: 'elyra',
    name: 'Elyra Nocturne',
    discipline: 'Oracle',
    baseStats: { strength: 34, intellect: 88, vitality: 60, agility: 58 },
    baseGold: 4200,
    cardImage: '/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png',
    lore: 'Seer of eclipses, her whispers bend fate.',
  },
  {
    id: 'morr',
    name: 'Morr Wispblade',
    discipline: 'Reaper',
    baseStats: { strength: 68, intellect: 64, vitality: 58, agility: 72 },
    baseGold: 3800,
    cardImage: '/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png',
    lore: 'Edge of dusk; the silent executioner of wraith clans.',
  },
  {
    id: 'sigrun',
    name: 'Sigrun Dawnbreak',
    discipline: 'Valkyrie',
    baseStats: { strength: 90, intellect: 48, vitality: 82, agility: 70 },
    baseGold: 5600,
    cardImage: '/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png',
    lore: 'Sunsteel skyrider guarding fallen champions.',
  },
  {
    id: 'caelys',
    name: 'Caelys Ember-Crusader',
    discipline: 'Warrior',
    baseStats: { strength: 82, intellect: 32, vitality: 78, agility: 52 },
    baseGold: 4000,
    cardImage: '/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png',
    lore: 'Frontline bastion wielding ember-forged faith.',
  },
  {
    id: 'torhild',
    name: 'Torhild Embercore',
    discipline: 'Guardian',
    baseStats: { strength: 88, intellect: 28, vitality: 92, agility: 28 },
    baseGold: 4500,
    cardImage: '/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png',
    lore: 'Living bulwark of stone and flame.',
  },
  {
    id: 'frostech',
    name: 'Frostech Ward',
    discipline: 'Guardian',
    baseStats: { strength: 74, intellect: 35, vitality: 86, agility: 32 },
    baseGold: 3600,
    cardImage: '/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png',
    lore: 'Icebound sentinel anchoring the line.',
  },
  {
    id: 'grum',
    name: 'Grum Ironhorn',
    discipline: 'Berserker',
    baseStats: { strength: 96, intellect: 18, vitality: 88, agility: 44 },
    baseGold: 4700,
    cardImage: '/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png',
    lore: 'Stampeding minotaur whose charge breaks warlines.',
  },
  {
    id: 'astrael',
    name: 'Astrael Fallen',
    discipline: 'Reaper',
    baseStats: { strength: 76, intellect: 74, vitality: 72, agility: 66 },
    baseGold: 5400,
    cardImage: '/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angels_1/card/frame_0.png',
    lore: 'Winged revenant wielding twilight scythes.',
  },
  {
    id: 'dresh',
    name: 'Dresh Wildarrow',
    discipline: 'Ranger',
    baseStats: { strength: 58, intellect: 24, vitality: 52, agility: 68 },
    baseGold: 3000,
    cardImage: '/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png',
    lore: 'Quickdraw hunter of the wild clans.',
  },
];

const scaleStats = (base: HeroArchetype['baseStats'], multiplier: number) => ({
  strength: Math.round(base.strength * multiplier),
  intellect: Math.round(base.intellect * multiplier),
  vitality: Math.round(base.vitality * multiplier),
  agility: Math.round(base.agility * multiplier),
});

export const characterCatalog: CharacterDefinition[] = heroArchetypes.flatMap((hero) =>
  rarityOrder.map((rarity) => {
    const m = rarityScale[rarity];
    return {
      id: `${hero.id}-${rarity.toLowerCase()}`,
      name: hero.name,
      discipline: hero.discipline,
      rarity,
      lore: hero.lore,
      stats: scaleStats(hero.baseStats, m),
      gold: Math.round(hero.baseGold * m),
      cardImage: hero.cardImage,
    };
  })
);
