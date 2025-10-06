import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          id="search-overlay"
          name="search"
          className="block w-full bg-gray-700 border border-transparent rounded-md py-3 pl-4 pr-12 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white focus:text-gray-900"
          placeholder="Search for topics, articles, and more..."
          type="search"
          value={query}
          onChange={handleInputChange}
          autoFocus
        />
        <button type="submit" className="absolute inset-y-0 right-0 pr-4 flex items-center" aria-label="Submit search">
          <svg className="h-6 w-6 text-gray-400 group-focus-within:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
