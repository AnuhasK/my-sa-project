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
        public string? ProfileImageUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? Bio { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
