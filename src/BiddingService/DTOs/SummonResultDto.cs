namespace BiddingService.DTOs
{
    public class SummonResultDto
    {
        public ProgressDto Profile { get; set; }
        public OwnedHeroDto Hero { get; set; }
        public int GoldAwarded { get; set; }
        public string Rarity { get; set; }
    }
}
