using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        /// <summary>
        /// Creates a new transaction (typically called after auction closes)
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.CreateTransactionAsync(dto.AuctionId, dto.BuyerId, dto.Amount);
                
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets all transactions (admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            try
            {
                var result = await _transactionService.GetAllTransactionsAsync();
                
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a specific transaction by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransaction(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.GetTransactionByIdAsync(id, userId);
                
                if (!result.IsSuccess)
                {
                    return result.Error == "Transaction not found" 
                        ? NotFound(new { message = result.Error })
                        : BadRequest(new { message = result.Error });
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets all transactions where the current user is the buyer (won auctions)
        /// Aliases: /api/transactions/buyer, /api/transactions/my-purchases, /api/transactions/won-auctions
        /// </summary>
        [Authorize]
        [HttpGet("buyer")]
        public async Task<IActionResult> GetBuyerTransactions()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.GetBuyerTransactionsAsync(userId);
                
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Alias for GetBuyerTransactions - Gets won auctions/my purchases
        /// </summary>
        [Authorize]
        [HttpGet("my-purchases")]
        public async Task<IActionResult> GetMyPurchases()
        {
            return await GetBuyerTransactions();
        }

        /// <summary>
        /// Alias for GetBuyerTransactions - Gets won auctions
        /// </summary>
        [Authorize]
        [HttpGet("won-auctions")]
        public async Task<IActionResult> GetWonAuctions()
        {
            return await GetBuyerTransactions();
        }

        /// <summary>
        /// Gets all transactions where the current user is the seller
        /// </summary>
        [Authorize]
        [HttpGet("seller")]
        public async Task<IActionResult> GetSellerTransactions()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.GetSellerTransactionsAsync(userId);
                
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Updates the payment status of a transaction
        /// </summary>
        [Authorize]
        [HttpPatch("{id}/payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.UpdatePaymentStatusAsync(id, dto.PaymentStatus, userId);
                
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(new { message = "Payment status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Updates shipping information for a transaction (Admin only)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/shipping")]
        public async Task<IActionResult> UpdateShippingInfo(int id, [FromBody] UpdateShippingInfoDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _transactionService.UpdateShippingInfoAsync(
                    id,
                    dto.ShippingAddress,
                    dto.TrackingNumber,
                    dto.ShippingMethod,
                    dto.AdminNotes,
                    userId
                );

                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(new { message = "Shipping information updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // DTO for creating transactions
    public class CreateTransactionDto
    {
        public int AuctionId { get; set; }
        public int BuyerId { get; set; }
        public decimal Amount { get; set; }
    }
}
