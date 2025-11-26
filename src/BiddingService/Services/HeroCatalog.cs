using BiddingService.Models;

namespace BiddingService.Services
{
    public record HeroArchetype(
        string Id,
        string Name,
        string Discipline,
        int Strength,
        int Intellect,
        int Vitality,
        int Agility,
        string CardImage);

    public record HeroVariant(
        string HeroId,
        string VariantId,
        string Name,
        string Discipline,
        string Rarity,
        int Strength,
        int Intellect,
        int Vitality,
        int Agility,
        string CardImage);

    public static class HeroCatalog
    {
        private static readonly Dictionary<string, double> RarityScale = new()
        {
            ["Common"] = 0.7,
            ["Rare"] = 1.0,
            ["Epic"] = 1.25,
            ["Legendary"] = 1.5
        };

        public static readonly string[] Rarities = { "Common", "Rare", "Epic", "Legendary" };

        private static readonly List<HeroArchetype> Archetypes = new()
        {
            new HeroArchetype(
                "veyla",
                "Veyla the Shadow Lich",
                "Necromancer",
                42, 95, 68, 54,
                "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png"),
            new HeroArchetype(
                "elyra",
                "Elyra Nocturne",
                "Oracle",
                34, 88, 60, 58,
                "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png"),
            new HeroArchetype(
                "morr",
                "Morr Wispblade",
                "Reaper",
                68, 64, 58, 72,
                "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png"),
            new HeroArchetype(
                "sigrun",
                "Sigrun Dawnbreak",
                "Valkyrie",
                90, 48, 82, 70,
                "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png"),
            new HeroArchetype(
                "caelys",
                "Caelys Ember-Crusader",
                "Warrior",
                82, 32, 78, 52,
                "/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png"),
            new HeroArchetype(
                "torhild",
                "Torhild Embercore",
                "Guardian",
                88, 28, 92, 28,
                "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png"),
            new HeroArchetype(
                "frostech",
                "Frostech Ward",
                "Guardian",
                74, 35, 86, 32,
                "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png"),
            new HeroArchetype(
                "grum",
                "Grum Ironhorn",
                "Berserker",
                96, 18, 88, 44,
                "/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png"),
            new HeroArchetype(
                "astrael",
                "Astrael Fallen",
                "Reaper",
                76, 74, 72, 66,
                "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angel_1/card/frame_0.png"),
            new HeroArchetype(
                "dresh",
                "Dresh Wildarrow",
                "Ranger",
                58, 24, 52, 68,
                "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png")
        };

        public static IReadOnlyList<HeroVariant> AllVariants =>
            Archetypes.SelectMany(CreateVariantsForHero).ToList();

        public static HeroVariant CreateVariant(HeroArchetype hero, string rarity)
        {
            var multiplier = RarityScale.TryGetValue(rarity, out var m) ? m : 1.0;

            return new HeroVariant(
                hero.Id,
                $"{hero.Id}-{rarity.ToLower()}",
                hero.Name,
                hero.Discipline,
                rarity,
                Scale(hero.Strength, multiplier),
                Scale(hero.Intellect, multiplier),
                Scale(hero.Vitality, multiplier),
                Scale(hero.Agility, multiplier),
                hero.CardImage);
        }

        public static HeroVariant? GetVariant(string heroId, string rarity)
        {
            var hero = Archetypes.FirstOrDefault(h => h.Id.Equals(heroId, StringComparison.OrdinalIgnoreCase));
            if (hero == null) return null;
            if (!Rarities.Any(r => r.Equals(rarity, StringComparison.OrdinalIgnoreCase))) return null;
            var normalized = Rarities.First(r => r.Equals(rarity, StringComparison.OrdinalIgnoreCase));
            return CreateVariant(hero, normalized);
        }

        public static HeroVariant GetRandomVariant(Random rng, string rarity)
        {
            var candidates = Archetypes.Select(a => CreateVariant(a, rarity)).ToList();
            if (candidates.Count == 0) throw new InvalidOperationException("Hero catalog is empty");
            var idx = rng.Next(candidates.Count);
            return candidates[idx];
        }

        private static IEnumerable<HeroVariant> CreateVariantsForHero(HeroArchetype hero) =>
            Rarities.Select(r => CreateVariant(hero, r));

        private static int Scale(int value, double multiplier) =>
            (int)Math.Round(value * multiplier, MidpointRounding.AwayFromZero);
    }
}
