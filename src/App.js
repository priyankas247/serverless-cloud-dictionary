import React, { useState } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = 'https://j2bpwrmn74.execute-api.us-west-2.amazonaws.com/dev'; // Replace with your API Gateway URL

  const handleSearch = () => {
    setLoading(true);
    setError('');
    setFilteredTerms([]);
    
    // Call the API to fetch terms
    axios.get(`${apiUrl}/get-definition?term=${searchTerm}`)
      .then(response => {
        const terms = response.data; // Assuming the response is an array of terms with their definitions

        // Configure Fuse.js to search the term field
        const fuse = new Fuse(terms, {
          keys: ['term'],       // Search against the "term" key
          threshold: 0.3,       // A lower value means more strict matching
          includeScore: true,   // Include the search score for sorting results
        });

        // Perform fuzzy search
        const results = fuse.search(searchTerm);

        // If results are found, update filteredTerms with the best match
        if (results.length > 0) {
          const matchedTerms = results.map(result => result.item);  // Get the item (term object) from the result
          setFilteredTerms(matchedTerms);
        } else {
          setError('No matching terms found.');
        }
      })
      .catch(error => {
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
            <p>Fetching definition...</p>
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
