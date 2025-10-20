using AuctionHouse.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    /// <summary>
    /// Background service that runs periodically to close expired auctions and create transactions
    /// </summary>
    public class AuctionClosingService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuctionClosingService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Check every minute

        public AuctionClosingService(
            IServiceScopeFactory scopeFactory,
            ILogger<AuctionClosingService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Auction Closing Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CloseExpiredAuctions();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while closing expired auctions");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Auction Closing Service stopped");
        }

        private async Task CloseExpiredAuctions()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var auctionService = scope.ServiceProvider.GetRequiredService<IAuctionService>();

            // Find all auctions that should be closed
            var expiredAuctions = await db.Auctions
                .Where(a => a.Status == "Open" && a.EndTime <= DateTime.UtcNow)
                .ToListAsync();

            if (expiredAuctions.Any())
            {
                _logger.LogInformation($"Found {expiredAuctions.Count} expired auctions to close");

                foreach (var auction in expiredAuctions)
                {
                    try
                    {
                        _logger.LogInformation($"Closing auction {auction.Id}: {auction.Title}");
                        await auctionService.CloseAuctionAsync(auction.Id);
                        _logger.LogInformation($"Auction {auction.Id} closed successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to close auction {auction.Id}");
                    }
                }
            }
        }
    }
}
