import React, { useState } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = 'https://j2bpwrmn74.execute-api.us-west-2.amazonaws.com/dev'; // Your API Gateway URL

  const handleSearch = () => {
    setLoading(true);
    setError('');
    setFilteredTerms([]);

    // Fetch all terms from your backend
    axios.get(`${apiUrl}/get-all-terms`)
      .then(response => {
        const terms = response.data;

        // Set up Fuse.js for fuzzy search
        const fuse = new Fuse(terms, {
          keys: ['term'],
          threshold: 0.3,
          includeScore: true,
        });

        // Perform fuzzy search on the full dataset
        const results = fuse.search(searchTerm);

        if (results.length > 0) {
          const matchedTerms = results.map(result => result.item);
          setFilteredTerms(matchedTerms);
        } else {
          setError('No matching terms found.');
        }
      })
      .catch(() => {
        setError('An error occurred while fetching data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredTerms([]);
    setError('');
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
