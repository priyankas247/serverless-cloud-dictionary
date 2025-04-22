import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import debounce from 'lodash.debounce'; // You can use lodash.debounce

import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const apiUrl = 'https://k9cvcqnuzg.execute-api.us-west-2.amazonaws.com/dev';

  // Debounced search
  const handleSearch = () => {
    setLoading(true);
    setError('');
    setFilteredTerms([]);
    setTotalResults(0);

    axios.get(`${apiUrl}/get-all-terms`)
      .then(response => {
        const terms = response.data;

        const fuse = new Fuse(terms, {
          keys: ['term'],
          threshold: 0.3,
          includeScore: true,
        });

        const results = fuse.search(searchTerm);

        if (results.length > 0) {
          const matchedTerms = results.map(result => result.item);
          setFilteredTerms(matchedTerms);
          setTotalResults(matchedTerms.length);
        } else {
          setError('No matching terms found.');
        }
      })
      .catch(error => {
        setError(error.response ? error.response.data.message : 'An error occurred while fetching data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Debounce search term
  useEffect(() => {
    const debouncedSearch = debounce(() => handleSearch(), 500);
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm('');
    setFilteredTerms([]);
    setError('');
    setTotalResults(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud Dictionary</h1>
        <input
          type="text"
          placeholder="Search for a term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleSearch} disabled={loading}>Search</button>
          <button onClick={handleClear} style={{ marginLeft: '10px' }}>Clear</button>
        </div>
        {totalResults > 0 && <p>{totalResults} terms found.</p>}
      </header>

      <div className="dictionary-container">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Fetching definitions...</p>
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredTerms.map((term) => (
            <div key={term.term} className="card">
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
