import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'relevance'
  });
  const [categories, setCategories] = useState([]);

  const apiUrl = 'https://k9cvcqnuzg.execute-api.us-west-2.amazonaws.com/dev';

  // Fetch available categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/categories`);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Couldn't fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${apiUrl}/get-definition?term=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(url);
      
      if (response.status === 200) {
        const termData = {
          ...response.data,
          category: response.data.category || 'General',
          example: response.data.example || '',
          source: response.data.source || 'Cloud Dictionary'
        };
        setTerms([termData]);
      } else if (response.status === 404) {
        setError(response.data.message);
        setTerms([]);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError(error.response.data.message);
        } else {
          setError('An error occurred while fetching data');
        }
      } else {
        setError('Network error - could not connect to server');
      }
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = (terms) => {
    let filtered = [...terms];
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(term => 
        term.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (filters.sort) {
      case 'a-z':
        filtered.sort((a, b) => a.term.localeCompare(b.term));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.term.localeCompare(a.term));
        break;
      case 'relevance':
      default:
        // Default sorting (relevance) - keep original order
        break;
    }
    
    return filtered;
  };

  const TermCard = ({ term }) => (
    <div className="term-card">
      <div className="term-header">
        <h3 className="term-title">{term.term}</h3>
        <span className={`category-tag ${term.category.toLowerCase()}`}>
          {term.category}
        </span>
      </div>
      <div className="term-body">
        <p className="term-definition">{term.definition}</p>
        {term.example && (
          <div className="term-example">
            <strong>Example: </strong>
            <em>{term.example}</em>
          </div>
        )}
      </div>
      <div className="term-footer">
        <span className="term-source">{term.source}</span>
      </div>
    </div>
  );

  const TermCardSkeleton = () => (
    <div className="term-card skeleton">
      <div className="term-header skeleton">
        <div className="term-title-skeleton skeleton-shimmer"></div>
        <div className="category-tag-skeleton skeleton-shimmer"></div>
      </div>
      <div className="term-body skeleton">
        <div className="definition-line skeleton-shimmer"></div>
        <div className="definition-line skeleton-shimmer"></div>
        <div className="definition-line skeleton-shimmer short"></div>
      </div>
      <div className="term-footer skeleton">
        <div className="source-skeleton skeleton-shimmer"></div>
      </div>
    </div>
  );

  const filteredTerms = applyFilters(terms);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">Cloud Dictionary</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a cloud term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="search-button"
            onClick={handleSearch} 
            disabled={loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner"></span> Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
        
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              disabled={loading}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort-filter">Sort by:</label>
            <select
              id="sort-filter"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              disabled={loading}
            >
              <option value="relevance">Relevance</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>
      </header>
      
      <main className="dictionary-container">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span> {error}
          </div>
        )}
        
        {loading ? (
          <div className="terms-list">
            {[...Array(3)].map((_, i) => (
              <TermCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {filteredTerms.length > 0 ? (
              <div className="terms-list">
                {filteredTerms.map((term) => (
                  <TermCard key={term.term} term={term} />
                ))}
              </div>
            ) : (
              !error && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No terms found</h3>
                  <p>Try searching for a cloud computing term</p>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;