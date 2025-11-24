using System.ComponentModel.DataAnnotations;

namespace AuctionService.DTOs;

public class CreateAuctionDto
{
    [Required]
    public string Title { get; set; }
    [Required]
    public string Brand { get; set; }
    [Required]
    public string Category { get; set; }
    [Required]
    public string Condition { get; set; }
    public string Variant { get; set; }
    public string Colorway { get; set; }
    public int? ReleaseYear { get; set; }
    public string Specs { get; set; }
    [Required]
    public string ImageUrl { get; set; }
    [Required]
    public int ReservePrice { get; set; }
    [Required]
    public DateTime AuctionEnd { get; set; }
}
