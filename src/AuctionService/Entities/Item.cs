using System.ComponentModel.DataAnnotations.Schema;

namespace AuctionService.Entities;

[Table("Items")]
public class Item
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Brand { get; set; }
    public string Category { get; set; }
    public string Variant { get; set; }
    public string Condition { get; set; }
    public string Colorway { get; set; }
    public int? ReleaseYear { get; set; }
    public string Specs { get; set; }
    public string ImageUrl { get; set; }
    
    // nav properties
    public Auction Auction { get; set; }
    public Guid AuctionId { get; set; }
}
