namespace Contracts;

public class AuctionUpdated
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Brand { get; set; }
    public string Category { get; set; }
    public string Variant { get; set; }
    public string Condition { get; set; }
    public string Colorway { get; set; }
    public int? ReleaseYear { get; set; }
    public string Specs { get; set; }
    public string ImageUrl { get; set; }
}
