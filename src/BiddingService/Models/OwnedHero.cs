namespace BiddingService.Models
{
    public class OwnedHero
    {
        public string HeroId { get; set; } = string.Empty;           // archetype id
        public string VariantId { get; set; } = string.Empty;        // heroId-rarity
        public string Name { get; set; } = string.Empty;
        public string Discipline { get; set; } = string.Empty;
        public string Rarity { get; set; } = string.Empty;
        public int Strength { get; set; }
        public int Intellect { get; set; }
        public int Vitality { get; set; }
        public int Agility { get; set; }
        public string CardImage { get; set; } = string.Empty;
        public DateTime AcquiredAt { get; set; } = DateTime.UtcNow;
    }
}
