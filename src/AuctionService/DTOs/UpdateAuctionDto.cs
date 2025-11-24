using System.ComponentModel.DataAnnotations;

namespace AuctionService.DTOs;

public class UpdateAuctionDto
{
    public string Title { get; set; }
    public string Brand { get; set; }
    public string Category { get; set; }
    public string Condition { get; set; }
    public string Variant { get; set; }
    public string Colorway { get; set; }
    public int? ReleaseYear { get; set; }
    public string Specs { get; set; }
}
