using AuctionHouse.Api.Data;
using AuctionHouse.Api.DTOs;
using AuctionHouse.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionHouse.Api.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
    }

    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _db;
        
        public CategoryService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            return await _db.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            return await _db.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();
        }
    }
}