using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Services;
using Microsoft.AspNetCore.Mvc;

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
    }
}
