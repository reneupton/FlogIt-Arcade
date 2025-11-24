using MongoDB.Entities;

namespace BiddingService.Models;

public class UserProgress : Entity
{
    public string Username { get; set; }
    public string AvatarUrl { get; set; }
    public int Experience { get; set; }
    public int Level { get; set; } = 1;
    public int FlogBalance { get; set; } = 0;
    public int AuctionsCreated { get; set; }
    public int AuctionsSold { get; set; }
    public int AuctionsWon { get; set; }
    public int BidsPlaced { get; set; }
    public DateTime? LastDailyReward { get; set; }
    public List<string> RecentPurchases { get; set; } = new();
    public List<string> RecentSales { get; set; } = new();
    public List<HeldBid> HeldBids { get; set; } = new();
    public DateTime? LastMysteryRewardAt { get; set; }
    public int? LastMysteryRewardXp { get; set; }
    public int? LastMysteryRewardCoins { get; set; }
}
