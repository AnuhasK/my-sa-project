using AuctionHouse.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Middleware
{
    public class TokenRevocationMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenRevocationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
        {
            // Check if the request has an Authorization header
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = authHeader.Substring("Bearer ".Length).Trim();

                    // Check if token is revoked
                    var isRevoked = await db.RevokedTokens
                        .AnyAsync(rt => rt.Token == token && rt.ExpiresAt > DateTime.UtcNow);

                    if (isRevoked)
                    {
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync("{\"message\":\"Token has been revoked\"}");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }

    // Extension method to add middleware to pipeline
    public static class TokenRevocationMiddlewareExtensions
    {
        public static IApplicationBuilder UseTokenRevocation(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TokenRevocationMiddleware>();
        }
    }
}
