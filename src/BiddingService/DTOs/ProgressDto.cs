namespace BiddingService.DTOs
{
    public class ProgressDto
    {
        public string Username { get; set; }
        public string AvatarUrl { get; set; }
        public int Level { get; set; }
        public int Experience { get; set; }
        public int NextLevelAt { get; set; }
        public int FlogBalance { get; set; }
        public int GoldBalance => FlogBalance;
        public int TotalHeroPower { get; set; }
        public int AuctionsCreated { get; set; }
        public int AuctionsSold { get; set; }
    public int AuctionsWon { get; set; }
    public int BidsPlaced { get; set; }
    public DateTime? LastDailyReward { get; set; }
    public List<string> RecentPurchases { get; set; }
    public List<string> RecentSales { get; set; }
    public List<HeldBidDto> HeldBids { get; set; }
    public DateTime? LastMysteryRewardAt { get; set; }
    public int? LastMysteryRewardXp { get; set; }
    public int? LastMysteryRewardCoins { get; set; }
    public List<OwnedHeroDto> OwnedHeroes { get; set; } = new();
}

    public class HeldBidDto
    {
        public string AuctionId { get; set; }
        public int Amount { get; set; }
    }
}
