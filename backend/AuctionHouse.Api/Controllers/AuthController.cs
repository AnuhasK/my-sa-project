using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouse.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) { _auth = auth; }

        [HttpPost("register")]
        public async Task<IActionResult> Register(AuthRegisterDto dto)
        {
            try
            {
                var res = await _auth.RegisterAsync(dto);
                return Ok(res);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthLoginDto dto)
        {
            try
            {
                var res = await _auth.LoginAsync(dto);
                return Ok(res);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid user token" });

                var profile = await _auth.GetCurrentUserAsync(userId);
                if (profile == null)
                    return NotFound(new { message = "User not found" });

                return Ok(profile);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "Invalid user token" });

                // Extract token from Authorization header
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                    return Unauthorized(new { message = "No token provided" });

                await _auth.LogoutAsync(token, userId);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
