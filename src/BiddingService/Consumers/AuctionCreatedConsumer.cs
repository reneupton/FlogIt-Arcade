using Contracts;
using MassTransit;
using BiddingService.Services;
using MongoDB.Entities;

namespace BiddingService.Consumers
{
    public class AuctionCreatedConsumer : IConsumer<AuctionCreated>
    {
        private readonly ProgressService progressService;

        public AuctionCreatedConsumer(ProgressService progressService)
        {
            this.progressService = progressService;
        }

        public async Task Consume(ConsumeContext<AuctionCreated> context){
            var auction = new Auction{
                ID = context.Message.Id.ToString(),
                Seller = context.Message.Seller,
                AuctionEnd = context.Message.AuctionEnd,
                ReservePrice = context.Message.ReservePrice
            };

            await auction.SaveAsync();
            if(!string.IsNullOrWhiteSpace(context.Message.Seller))
            {
                await progressService.AwardListingAsync(context.Message.Seller);
            }
        }
    }
}
