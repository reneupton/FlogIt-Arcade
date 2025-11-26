namespace BiddingService.DTOs
{
    public class OwnedHeroDto
    {
        public string HeroId { get; set; }
        public string VariantId { get; set; }
        public string Name { get; set; }
        public string Discipline { get; set; }
        public string Rarity { get; set; }
        public int Strength { get; set; }
        public int Intellect { get; set; }
        public int Vitality { get; set; }
        public int Agility { get; set; }
        public string CardImage { get; set; }
        public DateTime AcquiredAt { get; set; }
    }
}
