using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuctionHouse.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(AuthRegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                throw new ApplicationException("Email already registered");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role ?? "Buyer"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return new AuthResponseDto { UserId = user.Id, Username = user.Username, Token = token };
        }

        public async Task<AuthResponseDto> LoginAsync(AuthLoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new ApplicationException("Invalid credentials");

            var token = GenerateJwtToken(user);
            return new AuthResponseDto { UserId = user.Id, Username = user.Username, Token = token };
        }

        private string GenerateJwtToken(User user)
        {
            var jwt = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwt["Key"]!);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiresMinutes"] ?? "60"));

            var token = new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims, expires: expires, signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
