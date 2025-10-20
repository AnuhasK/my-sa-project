import React, { useState, useEffect } from 'react';
import './AuctionFilters.css';

const AuctionFilters = ({ onFilterChange, onClearFilters }) => {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5021/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    // Build filter object, excluding empty values
    const activeFilters = {};
    
    if (filters.search.trim()) activeFilters.search = filters.search.trim();
    if (filters.categoryId) activeFilters.categoryId = parseInt(filters.categoryId);
    if (filters.status && filters.status !== 'all') activeFilters.status = filters.status;
    if (filters.minPrice) activeFilters.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) activeFilters.maxPrice = parseFloat(filters.maxPrice);
    if (filters.sortBy) activeFilters.sortBy = filters.sortBy;

    onFilterChange(activeFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      categoryId: '',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  // Debounced search - apply filters automatically after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== '') {
        handleApplyFilters();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters.search]);

  return (
    <div className="auction-filters">
      <div className="filters-header">
        <h3>Filter & Search</h3>
      </div>

      <div className="filters-container">
        {/* Search Input */}
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={handleInputChange}
            className="filter-input"
          />
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={filters.categoryId}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label>Status</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="all"
                checked={filters.status === 'all'}
                onChange={handleInputChange}
              />
              All
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="Open"
                checked={filters.status === 'Open'}
                onChange={handleInputChange}
              />
              Open
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="Closed"
                checked={filters.status === 'Closed'}
                onChange={handleInputChange}
              />
              Closed
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group price-range">
          <label>Price Range</label>
          <div className="price-inputs">
            <input
              type="number"
              name="minPrice"
              placeholder="Min $"
              value={filters.minPrice}
              onChange={handleInputChange}
              className="filter-input price-input"
              min="0"
            />
            <span className="price-separator">—</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max $"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className="filter-input price-input"
              min="0"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button 
            onClick={handleApplyFilters} 
            className="btn btn-primary apply-btn"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleClearFilters} 
            className="btn btn-secondary clear-btn"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionFilters;
