import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = 'https://k9cvcqnuzg.execute-api.us-west-2.amazonaws.com/dev';

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
        setTerms([response.data]);
      } else if (response.status === 404) {
        setError(response.data.message);
        setTerms([]);
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
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
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </header>
      <div className="dictionary-container">
        {error && <div className="error-message">{error}</div>}
        {terms.map((term) => (
          <div key={term.term} className="card">
            <h3>{term.term}</h3>
            <p>{term.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;