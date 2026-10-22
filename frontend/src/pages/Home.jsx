// Import hooks and reusable parts.
import { useEffect, useState } from 'react';
import FoodCard from '../components/FoodCard';
import { getFoods, BASE_URL } from '../services/api';
import '../styles/pages.css';

// Home page shows list of food items.
function Home() {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial data when page loads.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsData, restaurantsData, locationsData] = await Promise.all([
          getFoods(),
          fetch(`${BASE_URL}/restaurants`).then(r => r.json()),
          fetch(`${BASE_URL}/restaurants/locations/all`).then(r => r.json())
        ]);
        setFoods(foodsData);
        setRestaurants(restaurantsData);
        setLocations(locationsData);
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch filtered restaurants when location changes.
  useEffect(() => {
    if (selectedLocation) {
      fetch(`${BASE_URL}/restaurants?location=${selectedLocation}`)
        .then(r => r.json())
        .then(data => setRestaurants(data))
        .catch(err => setError(err.message));
    } else {
      fetch(`${BASE_URL}/restaurants`)
        .then(r => r.json())
        .then(data => setRestaurants(data))
        .catch(err => setError(err.message));
    }
  }, [selectedLocation]);

  // Handle search.
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const url = selectedLocation
        ? `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(selectedLocation)}`
        : `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  // Save selected item into browser storage as cart data.
  const handleAddToCart = (food) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push({ ...food, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert(`${food.name} added to cart`);
  };

  return (
    <main className="page-container">
      {/* Search and Location Bar */}
      <div className="search-location-bar">
        <select 
          className="location-selector" 
          value={selectedLocation} 
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for food or restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">🔍 Search</button>
          {isSearching && (
            <button onClick={clearSearch} className="clear-btn">✕ Clear</button>
          )}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Search Results */}
      {isSearching && (
        <div className="results-section">
          <h2>Search Results ({searchResults.length})</h2>
          {searchResults.length === 0 ? (
            <p>No results found for "{searchQuery}"</p>
          ) : (
            <section className="grid">
              {searchResults.map((item) => (
                <div key={`${item.type}-${item.id}`} className="food-card">
                  {item.type === 'restaurant' ? (
                    <>
                      <h3>🏪 {item.name}</h3>
                      <p>📍 {item.location}</p>
                      <p>{item.description}</p>
                      <p>⭐ {item.rating} • 🕒 {item.deliveryTime}</p>
                    </>
                  ) : (
                    <>
                      <h3>🍽️ {item.name}</h3>
                      <p>{item.description}</p>
                      <p>📍 {item.location}</p>
                    </>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {/* Restaurants Section */}
      {!isSearching && restaurants.length > 0 && (
        <div className="results-section">
          <h2>
            {selectedLocation ? `Restaurants in ${selectedLocation}` : 'All Restaurants'} 
            ({restaurants.length})
          </h2>
          <section className="grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <h3>🏪 {restaurant.name}</h3>
                <p className="restaurant-location">📍 {restaurant.location}</p>
                <p className="restaurant-description">{restaurant.description}</p>
                <div className="restaurant-meta">
                  <span>⭐ {restaurant.rating}</span>
                  <span>🕒 {restaurant.deliveryTime}</span>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* Foods Section */}
      {!isSearching && (
        <div className="results-section">
          <h2>Popular Foods</h2>
          <section className="grid">
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} onAddToCart={handleAddToCart} />
            ))}
          </section>
        </div>
      )}
    </main>
  );
}

export default Home;
