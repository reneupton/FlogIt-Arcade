using BiddingService.Models;
using MongoDB.Entities;

namespace BiddingService.Services;

public static class SeedProgressData
{
    public static async Task SeedAsync()
    {
        var existing = await DB.CountAsync<UserProgress>();
        if (existing > 0) return;

        var random = new Random(1234);
        var usernames = new[]
        {
            "nova",
            "echo",
            "pixel",
            "blade",
            "ember",
            "orbit",
            "zenith",
            "drift",
            "glyph",
            "frost",
            "helix",
            "lumen",
            "atlas",
            "pulse",
            "quark"
        };

        var sampleItems = new[]
        {
            "Lumos Nebula Pro Keyboard",
            "Pulseview Aurora 27 QHD",
            "Glacier Atlas X Mouse",
            "Helix RTX GPU",
            "Forge Mini ITX PC",
            "Velar Nova Pro Headset",
            "Aether Sentinel Chair",
            "Lumen Studio Streaming Kit",
            "Stride XL Desk Mat",
            "Pulse 34 Ultrawide"
        };

        foreach (var user in usernames)
        {
            var xp = random.Next(400, 12000);
            var profile = new UserProgress
            {
                ID = user,
                Username = user,
                AvatarUrl =
                    $"https://api.dicebear.com/7.x/thumbs/svg?seed={user}&backgroundType=gradientLinear&radius=40",
                Experience = xp,
                Level = Math.Max(1, (xp / 500) + 1),
                FlogBalance = random.Next(250, 9000),
                AuctionsCreated = random.Next(2, 40),
                AuctionsSold = random.Next(1, 30),
                AuctionsWon = random.Next(0, 20),
                BidsPlaced = random.Next(10, 120),
                LastDailyReward = DateTime.UtcNow.AddDays(-random.Next(0, 5)),
                RecentPurchases = sampleItems.OrderBy(_ => random.Next()).Take(3).ToList(),
                RecentSales = sampleItems.OrderBy(_ => random.Next()).Take(3).ToList(),
                HeldBids = new List<HeldBid>()
            };

            await profile.SaveAsync();
        }
    }
}
