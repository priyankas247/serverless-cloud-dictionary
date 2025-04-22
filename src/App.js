import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);

  const apiUrl = 'https://j2bpwrmn74.execute-api.us-west-2.amazonaws.com/dev'; // Replace with your API Gateway URL

  const handleSearch = () => {
    console.log('Fetching data from API...');

    const url = searchTerm
      ? `${apiUrl}/get-definition?term=${encodeURIComponent(searchTerm)}`
      : `${apiUrl}/get-definition`;

    axios
      .get(url)
      .then(response => {
        console.log('API Response:', response.data);
        setTerms(response.data ? [response.data] : []);
        setFilteredTerms(response.data ? [response.data] : []);
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
      });
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
        <button onClick={handleSearch}>Search</button>
      </header>
      <div className="dictionary-container">
        {filteredTerms.map((term) => (
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
