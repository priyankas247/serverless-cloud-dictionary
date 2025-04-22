import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = 'https://j2bpwrmn74.execute-api.us-west-2.amazonaws.com/dev';

  const handleSearch = () => {
    console.log('Fetching data from API...');
    setLoading(true);

    const url = searchTerm
      ? `${apiUrl}/get-definition?term=${encodeURIComponent(searchTerm)}`
      : `${apiUrl}/get-definition`;

    axios
      .get(url)
      .then(response => {
        console.log('API Response:', response.data);
        const result = response.data ? [response.data] : [];
        setTerms(result);
        setFilteredTerms(result);
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          console.warn('Term not found.');
          setFilteredTerms([{
            term: searchTerm,
            definition: 'Definition not found in the dictionary.'
          }]);
        } else {
          console.error('Error fetching data:', error);
          setFilteredTerms([{
            term: searchTerm,
            definition: 'An error occurred while fetching data.'
          }]);
        }
      })
      .finally(() => {
        setSearchTerm('');
        setLoading(false);
      });
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredTerms([]);
    setTerms([]);
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
