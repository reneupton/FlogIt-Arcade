using BiddingService.Services;
using Contracts;
using MassTransit;

namespace BiddingService.Consumers;

public class AuctionFinishedConsumer : IConsumer<AuctionFinished>
{
    private readonly ProgressService progressService;

    public AuctionFinishedConsumer(ProgressService progressService)
    {
        this.progressService = progressService;
    }

    public async Task Consume(ConsumeContext<AuctionFinished> context)
    {
        var message = context.Message;

        await progressService.SettleAuction(message.AuctionId, message.Winner);

        if (message.ItemSold && !string.IsNullOrWhiteSpace(message.Winner))
        {
            await progressService.AwardPurchaseAsync(message.Winner, message.Amount);
        }

        if (message.ItemSold && !string.IsNullOrWhiteSpace(message.Seller))
        {
            await progressService.AwardSaleAsync(message.Seller, message.Amount);
        }
    }
}
