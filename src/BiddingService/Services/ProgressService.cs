using BiddingService.DTOs;
using BiddingService.Models;
using MongoDB.Entities;

namespace BiddingService.Services;

public class ProgressService
{
    private const int StatsPerLevel = 120;
    private readonly Random rng = new();
    private readonly (string rarity, int weight)[] rarityWeights = new[]
    {
        ("Common", 65),
        ("Rare", 22),
        ("Epic", 10),
        ("Legendary", 3)
    };

    private readonly Dictionary<string, int> goldByRarity = new()
    {
        ["Common"] = 120,
        ["Rare"] = 280,
        ["Epic"] = 520,
        ["Legendary"] = 900
    };

    public async Task<UserProgress> GetOrCreateProfile(string username)
    {
        var profile = await DB.Find<UserProgress>().OneAsync(username);

        if (profile != null)
        {
            profile.OwnedHeroes ??= new List<OwnedHero>();
            profile.RecentPurchases ??= new List<string>();
            profile.RecentSales ??= new List<string>();
            profile.HeldBids ??= new List<HeldBid>();
            await EnsureStarterPack(profile);
            return profile;
        }

        // also try lookup by Username field for friendly-name identifiers
        profile = await DB.Find<UserProgress>().Match(u => u.Username == username).ExecuteFirstAsync();

        if (profile != null)
        {
            profile.OwnedHeroes ??= new List<OwnedHero>();
            profile.RecentPurchases ??= new List<string>();
            profile.RecentSales ??= new List<string>();
            profile.HeldBids ??= new List<HeldBid>();
            await EnsureStarterPack(profile);
            return profile;
        }

        profile = new UserProgress
        {
            ID = username,
            Username = username,
            AvatarUrl =
                $"https://api.dicebear.com/7.x/thumbs/png?seed={username}&backgroundType=gradientLinear&radius=40",
            FlogBalance = 500,
            Experience = 0,
            Level = 1,
            RecentPurchases = new List<string>(),
            RecentSales = new List<string>(),
            HeldBids = new List<HeldBid>(),
            OwnedHeroes = new List<OwnedHero>()
        };

        await EnsureStarterPack(profile);
        await profile.SaveAsync();
        return profile;
    }

    private static void RefreshLevel(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var totalPower = CalculateHeroPower(profile);
        profile.Experience = totalPower;
        profile.Level = Math.Max(1, (totalPower / StatsPerLevel) + 1);
    }

    private static int CalculateCoinBonus(int? amount, double multiplier, int minimum)
    {
        var raw = (amount ?? 0) * multiplier;
        return Math.Max(minimum, (int)Math.Round(raw));
    }

    private static ProgressDto ToDto(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var experience = CalculateHeroPower(profile);
        return new ProgressDto
        {
            Username = profile.Username,
            AvatarUrl = profile.AvatarUrl,
            Level = profile.Level,
            Experience = experience,
            NextLevelAt = (profile.Level + 1) * StatsPerLevel,
            FlogBalance = profile.FlogBalance,
            TotalHeroPower = experience,
            AuctionsCreated = profile.AuctionsCreated,
            AuctionsSold = profile.AuctionsSold,
            AuctionsWon = profile.AuctionsWon,
            BidsPlaced = profile.BidsPlaced,
            LastDailyReward = profile.LastDailyReward,
            RecentPurchases = profile.RecentPurchases,
            RecentSales = profile.RecentSales,
            HeldBids = profile.HeldBids.Select(h => new HeldBidDto { AuctionId = h.AuctionId, Amount = h.Amount }).ToList(),
            LastMysteryRewardAt = profile.LastMysteryRewardAt,
            LastMysteryRewardXp = profile.LastMysteryRewardXp,
            LastMysteryRewardCoins = profile.LastMysteryRewardCoins,
            OwnedHeroes = profile.OwnedHeroes.Select(MapOwnedHero).ToList()
        };
    }

    public async Task<ProgressDto> TrackDailyLogin(string username)
    {
        var profile = await GetOrCreateProfile(username);

        if (profile.LastDailyReward?.Date == DateTime.UtcNow.Date)
        {
            return ToDto(profile);
        }

        profile.LastDailyReward = DateTime.UtcNow;
        profile.FlogBalance += 25;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardBidAsync(string username, int amount, string auctionId)
    {
        var profile = await GetOrCreateProfile(username);

        var existingHold = profile.HeldBids.FirstOrDefault(h => h.AuctionId == auctionId);
        var priorAmount = existingHold?.Amount ?? 0;
        var delta = Math.Max(0, amount - priorAmount);
        profile.FlogBalance = Math.Max(0, profile.FlogBalance - delta);

        if (existingHold != null)
        {
            existingHold.Amount = amount;
        }
        else
        {
            profile.HeldBids.Add(new HeldBid { AuctionId = auctionId, Amount = amount });
        }

        profile.BidsPlaced += 1;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardListingAsync(string username)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsCreated += 1;
        profile.FlogBalance += 40;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardSaleAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsSold += 1;
        profile.FlogBalance += CalculateCoinBonus(amount, 0.08, 60);

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardPurchaseAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsWon += 1;
        profile.FlogBalance += CalculateCoinBonus(amount, 0.05, 40);

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public Task<ProgressDto> AwardAsync(string username, string action, int? amount = null)
    {
        return action?.ToLower() switch
        {
            "bid" => AwardBidAsync(username, amount ?? 0, string.Empty),
            "list" => AwardListingAsync(username),
            "sale" => AwardSaleAsync(username, amount),
            "purchase" => AwardPurchaseAsync(username, amount),
            "daily-login" => TrackDailyLogin(username),
            _ => TrackDailyLogin(username)
        };
    }

    public async Task<ProgressDto> GetProfile(string username)
    {
        var profile = await GetOrCreateProfile(username);
        RefreshLevel(profile);
        await profile.SaveAsync();
        return ToDto(profile);
    }

    public async Task<List<ProgressDto>> GetLeaderboard()
    {
        var leaders = await DB.Find<UserProgress>().ExecuteAsync();
        var ordered = leaders
            .Select(p =>
            {
                RefreshLevel(p);
                return p;
            })
            .OrderByDescending(p => CalculateHeroPower(p))
            .ThenByDescending(p => p.Level)
            .Take(10)
            .ToList();

        return ordered.Select(ToDto).ToList();
    }

    public async Task SettleAuction(string auctionId, string winner)
    {
        var profiles = await DB.Find<UserProgress>()
            .Match(p => p.HeldBids.Any(h => h.AuctionId == auctionId))
            .ExecuteAsync();

        foreach (var profile in profiles)
        {
            var hold = profile.HeldBids.FirstOrDefault(h => h.AuctionId == auctionId);
            if (hold == null) continue;

            profile.HeldBids = profile.HeldBids.Where(h => h.AuctionId != auctionId).ToList();

            if (!string.Equals(profile.Username, winner, StringComparison.OrdinalIgnoreCase))
            {
                profile.FlogBalance += hold.Amount;
            }

            await profile.SaveAsync();
        }
    }

    public async Task<SummonResultDto> OpenMystery(string username)
    {
        var profile = await GetOrCreateProfile(username);
        profile.OwnedHeroes ??= new List<OwnedHero>();
        var now = DateTime.UtcNow;
        if (profile.LastMysteryRewardAt.HasValue && profile.LastMysteryRewardAt.Value.AddHours(24) > now)
        {
            return new SummonResultDto
            {
                Profile = ToDto(profile),
                Hero = null,
                GoldAwarded = 0,
                Rarity = string.Empty
            };
        }

        var rarity = RollRarity();
        var heroVariant = HeroCatalog.GetRandomVariant(rng, rarity);
        var gold = goldByRarity[rarity];

        profile.FlogBalance += gold;
        var ownedHero = new OwnedHero
        {
            HeroId = heroVariant.HeroId,
            VariantId = heroVariant.VariantId,
            Name = heroVariant.Name,
            Discipline = heroVariant.Discipline,
            Rarity = heroVariant.Rarity,
            Strength = heroVariant.Strength,
            Intellect = heroVariant.Intellect,
            Vitality = heroVariant.Vitality,
            Agility = heroVariant.Agility,
            CardImage = heroVariant.CardImage,
            AcquiredAt = now
        };
        profile.OwnedHeroes.Add(ownedHero);

        profile.RecentPurchases ??= new List<string>();
        profile.RecentPurchases.Insert(0, heroVariant.VariantId);
        profile.RecentPurchases = profile.RecentPurchases.Take(50).ToList();

        var powerGained = heroVariant.Strength + heroVariant.Intellect + heroVariant.Vitality + heroVariant.Agility;
        profile.LastMysteryRewardAt = now;
        profile.LastMysteryRewardXp = powerGained;
        profile.LastMysteryRewardCoins = gold;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return new SummonResultDto
        {
            Profile = ToDto(profile),
            Hero = MapOwnedHero(ownedHero),
            GoldAwarded = gold,
            Rarity = rarity
        };
    }

    private string RollRarity()
    {
        var totalWeight = rarityWeights.Sum(r => r.weight);
        var roll = rng.Next(0, totalWeight);
        var cumulative = 0;
        foreach (var (rarity, weight) in rarityWeights)
        {
            cumulative += weight;
            if (roll < cumulative)
            {
                return rarity;
            }
        }

        return "Common";
    }

    private static int CalculateHeroPower(UserProgress profile)
    {
        profile.OwnedHeroes ??= new List<OwnedHero>();
        return profile.OwnedHeroes.Sum(h => h.Strength + h.Intellect + h.Vitality + h.Agility);
    }

    private static OwnedHeroDto MapOwnedHero(OwnedHero hero)
    {
        return new OwnedHeroDto
        {
            HeroId = hero.HeroId,
            VariantId = hero.VariantId,
            Name = hero.Name,
            Discipline = hero.Discipline,
            Rarity = hero.Rarity,
            Strength = hero.Strength,
            Intellect = hero.Intellect,
            Vitality = hero.Vitality,
            Agility = hero.Agility,
            CardImage = hero.CardImage ?? string.Empty,
            AcquiredAt = hero.AcquiredAt
        };
    }

    private static async Task EnsureStarterPack(UserProgress profile)
    {
        var starterUsers = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "test",
            "Dion Upton"
        };

        if (!starterUsers.Contains(profile.Username)) return;

        profile.OwnedHeroes ??= new List<OwnedHero>();
        if (profile.OwnedHeroes.Any())
        {
            return;
        }

        var starterChoices = new (string heroId, string rarity)[]
        {
            ("elyra", "Epic"),
            ("grum", "Legendary"),
            ("dresh", "Common"),
            ("sigrun", "Rare")
        };

        foreach (var (heroId, rarity) in starterChoices)
        {
            var variant = HeroCatalog.GetVariant(heroId, rarity);
            if (variant == null) continue;

            profile.OwnedHeroes.Add(new OwnedHero
            {
                HeroId = variant.HeroId,
                VariantId = variant.VariantId,
                Name = variant.Name,
                Discipline = variant.Discipline,
                Rarity = variant.Rarity,
                Strength = variant.Strength,
                Intellect = variant.Intellect,
                Vitality = variant.Vitality,
                Agility = variant.Agility,
                CardImage = variant.CardImage,
                AcquiredAt = DateTime.UtcNow
            });
            profile.RecentPurchases ??= new List<string>();
            profile.RecentPurchases.Insert(0, variant.VariantId);
        }

        RefreshLevel(profile);
        await profile.SaveAsync();
    }
}
