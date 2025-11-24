namespace AuctionService.DTOs;

public class AuctionDto
{
    public Guid Id { get; set; }
    public int Reserve { get; set; }
    public string Seller { get; set; }
    public string Winner { get; set; }
    public int SoldAmount { get; set; }
    public int ReservePrice { get; set; }
    public int CurrentHighBid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime AuctionEnd { get; set; }
    public string Status { get; set; }
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
