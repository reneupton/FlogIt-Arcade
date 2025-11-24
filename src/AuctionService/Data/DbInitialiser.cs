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
                Title = "Nebula Pro Mechanical Keyboard",
                Brand = "Lumos",
                Category = "Keyboard",
                Variant = "75% RGB Tri-mode",
                Condition = "New",
                Colorway = "White Ice",
                ReleaseYear = 2024,
                Specs = "Gateron Oil King | PBT caps | Hot-swap",
                ImageUrl = "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Aurora 27\" QHD Gaming Monitor",
                Brand = "Pulseview",
                Category = "Monitor",
                Variant = "170Hz Fast-IPS",
                Condition = "Open-Box",
                Colorway = "Midnight",
                ReleaseYear = 2023,
                Specs = "2560x1440 | 170Hz | 1ms | HDR400",
                ImageUrl = "https://images.unsplash.com/photo-1587202372775-98973d03e1c0?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Atlas X Wireless Gaming Mouse",
                Brand = "Glacier",
                Category = "Mouse",
                Variant = "58g / 4K Hz",
                Condition = "New",
                Colorway = "Lunar Grey",
                ReleaseYear = 2024,
                Specs = "PixArt 3395 | 4K dongle | 58g",
                ImageUrl = "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Nova Pro Wireless Headset",
                Brand = "Velar",
                Category = "Headset",
                Variant = "ANC + Low-latency",
                Condition = "Used",
                Colorway = "Onyx",
                ReleaseYear = 2022,
                Specs = "Dual wireless | ANC | Swap batteries",
                ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Helix RTX 4080 Super GPU",
                Brand = "Nvidia",
                Category = "GPU",
                Variant = "16GB GDDR6X",
                Condition = "New",
                Colorway = "Founders Black",
                ReleaseYear = 2024,
                Specs = "Overclocked | DLSS 3.5 | 850W rec PSU",
                ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Sentinel XL Gaming Chair",
                Brand = "Aether",
                Category = "Chair",
                Variant = "Fabric / 4D Armrests",
                Condition = "New",
                Colorway = "Mist Grey",
                ReleaseYear = 2023,
                Specs = "Aluminum base | 4D arms | Memory foam",
                ImageUrl = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Pulse 34\" Ultrawide Monitor",
                Brand = "Pulseview",
                Category = "Monitor",
                Variant = "144Hz UWQHD",
                Condition = "Open-Box",
                Colorway = "Shadow Black",
                ReleaseYear = 2023,
                Specs = "3440x1440 | 144Hz | 1ms | HDR10",
                ImageUrl = "https://images.unsplash.com/photo-1527443224154-d7fb2c9cc0c6?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Forge Mini ITX Gaming PC",
                Brand = "Custom",
                Category = "PC",
                Variant = "Ryzen 7 / RTX 4070",
                Condition = "New",
                Colorway = "Frost White",
                ReleaseYear = 2024,
                Specs = "Ryzen 7 7800X3D | RTX 4070 | 32GB DDR5",
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Stride XL Gaming Desk Mat",
                Brand = "Glacier",
                Category = "Accessories",
                Variant = "Stealth RGB",
                Condition = "New",
                Colorway = "Onyx",
                ReleaseYear = 2024,
                Specs = "XXL size | RGB edge | Spill resistant",
                ImageUrl = "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1200&q=80"
            },
            new Item
            {
                Title = "Lumen Studio Streaming Kit",
                Brand = "Lumos",
                Category = "Streaming",
                Variant = "Dual Light + Mic",
                Condition = "New",
                Colorway = "Black",
                ReleaseYear = 2024,
                Specs = "Key lights | arm mic | desk boom",
                ImageUrl = "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
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
