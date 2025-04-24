import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTerm, setActiveTerm] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const apiUrl = 'https://k9cvcqnuzg.execute-api.us-west-2.amazonaws.com/dev';

  // Fetch term suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim() || searchTerm.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/suggest-terms?term=${encodeURIComponent(searchTerm)}`
        );
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error("Couldn't fetch suggestions", error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = async (termOverride) => {
    const termToSearch = String(termOverride || searchTerm || '').trim();
    if (!termToSearch) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setAiExplanation(null);

    try {
      const response = await axios.get(`${apiUrl}/get-definition?term=${encodeURIComponent(termToSearch)}`);
      
      if (response.status === 200) {
        const termData = {
          ...response.data,
          category: response.data.category || 'General',
          example: response.data.example || '',
          source: response.data.source || 'database'
        };
        setTerms([termData]);
        
        if (response.data.source === 'ai') {
          try {
            await axios.post(`${apiUrl}/save-term`, {
              term: termData.term,
              definition: termData.definition,
              category: termData.category
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
          } catch (saveError) {
            console.error('Save failed:', saveError.response?.data || saveError.message);
          }
        }
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

  const handleClear = () => {
    setSearchTerm('');
    setTerms([]);
    setError(null);
    setAiExplanation(null);
    setSuggestions([]);
  };

  const handleGenerateExplanation = async (term) => {
    setIsGenerating(true);
    setActiveTerm(term.term);
    setAiExplanation(null);
    
    try {
      const response = await axios.post(`${apiUrl}/generate-explanation`, {
        term: term.term,
        definition: term.definition
      });
      
      setAiExplanation({
        term: term.term,
        content: response.data.explanation
      });
    } catch (error) {
      console.error('Error generating explanation:', error);
      setError('Failed to generate AI explanation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  const TermCard = ({ term }) => (
    <div className="term-card">
      <div className="term-header">
        <h3 className="term-title">{term.term}</h3>
        <span className={`category-tag ${term.category.toLowerCase()} ${term.source}`}>
          {term.category} {term.source === 'ai' && '(AI-Generated)'}
        </span>
      </div>
      <div className="term-body">
        <div className="term-definition">
          <ReactMarkdown>{term.definition}</ReactMarkdown>
        </div>
        {term.example && (
          <div className="term-example">
            <strong>Example: </strong>
            <ReactMarkdown>{term.example}</ReactMarkdown>
          </div>
        )}
        
        <button 
          className="ai-explain-button"
          onClick={() => handleGenerateExplanation(term)}
          disabled={isGenerating && activeTerm === term.term}
        >
          {isGenerating && activeTerm === term.term ? (
            <span className="button-loading">
              <span className="spinner"></span> Generating...
            </span>
          ) : (
            'Explain with AI'
          )}
        </button>
        
        {aiExplanation && aiExplanation.term === term.term && (
          <div className="ai-explanation">
            <h4>AI-Powered Explanation</h4>
            <div className="explanation-content">
              <ReactMarkdown>{aiExplanation.content}</ReactMarkdown>
            </div>
            <div className="model-info">
              Generated by Claude 3 Sonnet
            </div>
          </div>
        )}
      </div>
      <div className="term-footer">
        <span className="term-source">
          Source: {term.source === 'ai' ? 'AI-Generated' : 'Cloud Dictionary'}
        </span>
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

  const TermSuggestions = () => {
    if (!suggestions.length || loading || isGenerating) return null;
    
    return (
      <div className="term-suggestions">
        <h4>Related Terms</h4>
        <div className="suggestions-grid">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="app-title">Cloud Dictionary</h1>
        <p className="app-subtitle">Your guide to cloud computing terminology</p>
        
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a cloud term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="button-group">
            <button 
              className="search-button"
              onClick={() => handleSearch()} 
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
            <button
              className="clear-button"
              onClick={handleClear}
              disabled={!searchTerm && terms.length === 0}
            >
              Clear
            </button>
          </div>
        </div>
        
        <TermSuggestions />
      </header>
      
      <main className="dictionary-container">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span> {error}
            {error.includes('not found') && (
              <button 
                className="try-ai-button"
                onClick={() => handleSearch()}
              >
                Try AI Generation
              </button>
            )}
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
            {terms.length > 0 ? (
              <div className="terms-list">
                {terms.map((term) => (
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
      
      <footer className="app-footer">
        <p>Powered by AWS Bedrock (Claude 3) and DynamoDB</p>
      </footer>
    </div>
  );
};

export default App;