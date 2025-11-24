using AutoMapper;
using Contracts;
using MassTransit;
using MongoDB.Entities;
using SearchService.Models;

namespace SearchService.Consumers;

public class AuctionUpdatedConsumer : IConsumer<AuctionUpdated>
{
    private readonly IMapper _mapper;
    
    public AuctionUpdatedConsumer(IMapper mapper)
    {
        _mapper = mapper;
    }
    
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        Console.WriteLine("--> Consuming auction updated: " + context.Message.Id);

        var item = _mapper.Map<Item>(context.Message);

        var result = DB.Update<Item>()
            .Match(a => a.ID == context.Message.Id)
            .ModifyOnly(i => new {
                i.Title,
                i.Brand,
                i.Category,
                i.Variant,
                i.Condition,
                i.Colorway,
                i.ReleaseYear,
                i.Specs,
                i.ImageUrl
            }, item)
            .ExecuteAsync();

        if (result.IsFaulted)
        {
            throw new MessageException(typeof(AuctionUpdated), "Problem updating mongodb");
        }
    }
}
