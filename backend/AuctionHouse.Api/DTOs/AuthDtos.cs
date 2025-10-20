namespace AuctionHouse.Api.DTOs
{
    public class AuthRegisterDto 
    { 
        public string Username { get; set; } = null!; 
        public string Email { get; set; } = null!; 
        public string Password { get; set; } = null!; 
        public string? Role { get; set; } 
    }
    
    public class AuthLoginDto 
    { 
        public string Email { get; set; } = null!; 
        public string Password { get; set; } = null!; 
    }
    
    public class AuthResponseDto 
    { 
        public int UserId { get; set; } 
        public string Username { get; set; } = null!; 
        public string Token { get; set; } = null!; 
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
