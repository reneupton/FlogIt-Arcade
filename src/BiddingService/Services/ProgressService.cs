using BiddingService.DTOs;
using BiddingService.Models;
using MongoDB.Entities;

namespace BiddingService.Services;

public class ProgressService
{
    private const int XpPerLevel = 500;

    public async Task<UserProgress> GetOrCreateProfile(string username)
    {
        var profile = await DB.Find<UserProgress>().OneAsync(username);

        if (profile != null) return profile;

        profile = new UserProgress
        {
            ID = username,
            Username = username,
            AvatarUrl =
                $"https://api.dicebear.com/7.x/thumbs/svg?seed={username}&backgroundType=gradientLinear&radius=40",
            FlogBalance = 500,
            Experience = 0,
            Level = 1,
            RecentPurchases = new List<string>(),
            RecentSales = new List<string>(),
            HeldBids = new List<HeldBid>()
        };

        await profile.SaveAsync();
        return profile;
    }

    private static void RefreshLevel(UserProgress profile)
    {
        profile.Level = Math.Max(1, (profile.Experience / XpPerLevel) + 1);
    }

    private static int CalculateCoinBonus(int? amount, double multiplier, int minimum)
    {
        var raw = (amount ?? 0) * multiplier;
        return Math.Max(minimum, (int)Math.Round(raw));
    }

    private static ProgressDto ToDto(UserProgress profile)
    {
        return new ProgressDto
        {
            Username = profile.Username,
            AvatarUrl = profile.AvatarUrl,
            Level = profile.Level,
            Experience = profile.Experience,
            NextLevelAt = profile.Level * XpPerLevel,
            FlogBalance = profile.FlogBalance,
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
            LastMysteryRewardCoins = profile.LastMysteryRewardCoins
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
        profile.Experience += 50;
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
        profile.Experience += 20;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardListingAsync(string username)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsCreated += 1;
        profile.Experience += 120;
        profile.FlogBalance += 40;

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardSaleAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsSold += 1;
        profile.Experience += 220;
        profile.FlogBalance += CalculateCoinBonus(amount, 0.08, 60);

        RefreshLevel(profile);
        await profile.SaveAsync();

        return ToDto(profile);
    }

    public async Task<ProgressDto> AwardPurchaseAsync(string username, int? amount)
    {
        var profile = await GetOrCreateProfile(username);

        profile.AuctionsWon += 1;
        profile.Experience += 180;
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
        return ToDto(profile);
    }

    public async Task<List<ProgressDto>> GetLeaderboard()
    {
        var leaders = await DB.Find<UserProgress>()
            .Sort(p => p.Descending(x => x.Experience))
            .Limit(10)
            .ExecuteAsync();

        return leaders.Select(ToDto).ToList();
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

    public async Task<ProgressDto> OpenMystery(string username)
    {
        var profile = await GetOrCreateProfile(username);
        var now = DateTime.UtcNow;
        if (profile.LastMysteryRewardAt.HasValue && profile.LastMysteryRewardAt.Value.AddHours(24) > now)
        {
            return ToDto(profile);
        }

        var rewards = new[]
        {
            (xp: 50, coins: 25),
            (xp: 120, coins: 75),
            (xp: 200, coins: 150),
            (xp: 80, coins: 40),
            (xp: 300, coins: 200)
        };

        var pick = rewards[new Random().Next(rewards.Length)];
        profile.Experience += pick.xp;
        profile.FlogBalance += pick.coins;
        profile.LastMysteryRewardAt = now;
        profile.LastMysteryRewardXp = pick.xp;
        profile.LastMysteryRewardCoins = pick.coins;

        RefreshLevel(profile);
        await profile.SaveAsync();
        return ToDto(profile);
    }
}
