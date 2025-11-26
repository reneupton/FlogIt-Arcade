using AuctionService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Data;

public class DbInitialiser
{
    public static void InitDb(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        SeedData(scope.ServiceProvider.GetService<AuctionDbContext>());
    }

    private static void SeedData(AuctionDbContext context)
    {
        context.Database.Migrate();

        if (context.Auctions.Any())
        {
            Console.WriteLine("Data already exists");
            return;
        }

        var templates = new List<Item>
        {
            new Item
            {
                Title = "Veyla the Shadow Lich",
                Brand = "Necromancer",
                Category = "Legendary",
                Variant = "INT 95 | STR 42 | VIT 68 | AGI 54",
                Condition = "Hero",
                Colorway = "Arcane",
                ReleaseYear = 2025,
                Specs = "Master of shadow flames and soul drain.",
                ImageUrl = "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png"
            },
            new Item
            {
                Title = "Elyra Nocturne",
                Brand = "Oracle",
                Category = "Epic",
                Variant = "INT 88 | STR 34 | VIT 60 | AGI 58",
                Condition = "Hero",
                Colorway = "Umbral",
                ReleaseYear = 2025,
                Specs = "Seer of eclipses, whispers prophecies.",
                ImageUrl = "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png"
            },
            new Item
            {
                Title = "Morr Wispblade",
                Brand = "Reaper",
                Category = "Rare",
                Variant = "STR 68 | INT 64 | VIT 58 | AGI 72",
                Condition = "Hero",
                Colorway = "Wraith",
                ReleaseYear = 2025,
                Specs = "Edge of dusk; silent executioner.",
                ImageUrl = "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png"
            },
            new Item
            {
                Title = "Sigrun Dawnbreak",
                Brand = "Valkyrie",
                Category = "Legendary",
                Variant = "STR 90 | VIT 82 | AGI 70 | INT 48",
                Condition = "Hero",
                Colorway = "Sunsteel",
                ReleaseYear = 2025,
                Specs = "Skyrider who guards fallen champions.",
                ImageUrl = "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png"
            },
            new Item
            {
                Title = "Caelys Ember-Crusader",
                Brand = "Warrior",
                Category = "Rare",
                Variant = "STR 82 | VIT 78 | AGI 52 | INT 32",
                Condition = "Hero",
                Colorway = "Emberbone",
                ReleaseYear = 2025,
                Specs = "Frontline bastion wielding holy fire.",
                ImageUrl = "/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png"
            },
            new Item
            {
                Title = "Torhild Embercore",
                Brand = "Guardian",
                Category = "Epic",
                Variant = "STR 88 | VIT 92 | AGI 28 | INT 28",
                Condition = "Hero",
                Colorway = "Magma",
                ReleaseYear = 2025,
                Specs = "Living bulwark of stone and flame.",
                ImageUrl = "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png"
            },
            new Item
            {
                Title = "Frostech Ward",
                Brand = "Guardian",
                Category = "Rare",
                Variant = "STR 74 | VIT 86 | AGI 32 | INT 35",
                Condition = "Hero",
                Colorway = "Frost",
                ReleaseYear = 2025,
                Specs = "Icebound sentinel, anchors the line.",
                ImageUrl = "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png"
            },
            new Item
            {
                Title = "Grum Ironhorn",
                Brand = "Berserker",
                Category = "Epic",
                Variant = "STR 96 | VIT 88 | AGI 44 | INT 18",
                Condition = "Hero",
                Colorway = "Bronze",
                ReleaseYear = 2025,
                Specs = "Stampeding minotaur, unstoppable charge.",
                ImageUrl = "/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png"
            },
            new Item
            {
                Title = "Astrael Fallen",
                Brand = "Reaper",
                Category = "Legendary",
                Variant = "STR 76 | INT 74 | VIT 72 | AGI 66",
                Condition = "Hero",
                Colorway = "Celestial",
                ReleaseYear = 2025,
                Specs = "Winged revenant with twilight scythe.",
                ImageUrl = "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angel_1/card/frame_0.png"
            },
            new Item
            {
                Title = "Dresh Wildarrow",
                Brand = "Ranger",
                Category = "Common",
                Variant = "STR 58 | AGI 68 | VIT 52 | INT 24",
                Condition = "Hero",
                Colorway = "Verdant",
                ReleaseYear = 2025,
                Specs = "Quickdraw hunter of the wild clans.",
                ImageUrl = "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png"
            }
        };

        var sellers = new[] { "alice", "bob", "tom", "nova", "echo", "pixel", "blade", "ember" };
        var random = new Random(99);

        var auctions = new List<Auction>();

        for (var i = 0; i < 70; i++)
        {
            var template = templates[i % templates.Count];
            var seller = sellers[random.Next(sellers.Length)];
            var reserve = random.Next(80, 1500);
            var endDate = DateTime.UtcNow.AddDays(random.Next(-5, 45));
            var status = endDate <= DateTime.UtcNow
                ? (random.NextDouble() > 0.4 ? Status.Finished : Status.ReserveNotMet)
                : Status.Live;

            auctions.Add(new Auction
            {
                Id = Guid.NewGuid(),
                Status = status,
                ReservePrice = reserve,
                Seller = seller,
                AuctionEnd = endDate,
                Item = new Item
                {
                    Title = $"{template.Title} #{i + 1:00}",
                    Brand = template.Brand,
                    Category = template.Category,
                    Variant = template.Variant,
                    Condition = template.Condition,
                    Colorway = template.Colorway,
                    ReleaseYear = template.ReleaseYear.HasValue ? template.ReleaseYear.Value - (i % 3 == 0 ? 1 : 0) : null,
                    Specs = template.Specs,
                    ImageUrl = template.ImageUrl
                }
            });
        }
        
        context.AddRange(auctions);
        context.SaveChanges();
    }
}
