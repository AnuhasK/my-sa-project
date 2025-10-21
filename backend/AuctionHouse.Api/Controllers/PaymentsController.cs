using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// Create a Stripe checkout session for a transaction
        /// </summary>
        [Authorize]
        [HttpPost("create-checkout-session/{transactionId}")]
        public async Task<IActionResult> CreateCheckoutSession(int transactionId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _paymentService.CreateCheckoutSessionAsync(transactionId, userId);

                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.Error });
                }

                return Ok(new { checkoutUrl = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating checkout session: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Stripe webhook endpoint for payment events
        /// </summary>
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            try
            {
                var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
                var signature = Request.Headers["Stripe-Signature"].ToString();

                if (string.IsNullOrEmpty(signature))
                {
                    return BadRequest(new { message = "Missing Stripe signature" });
                }

                var result = await _paymentService.HandleWebhookAsync(json, signature);

                if (!result.IsSuccess)
                {
                    _logger.LogWarning($"Webhook processing failed: {result.Error}");
                    return BadRequest(new { message = result.Error });
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Webhook error: {ex.Message}");
                return StatusCode(500, new { message = "Webhook processing failed" });
            }
        }
    }
}
