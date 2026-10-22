// Import card styles.
import '../styles/foodcard.css';

// Render one food item card with add-to-cart action.
function FoodCard({ food, onAddToCart }) {
  return (
    <div className="food-card">
      <img
        src={food.imageUrl || 'https://via.placeholder.com/300x180?text=Food'}
        alt={food.name}
        className="food-image"
      />
      <h3>{food.name}</h3>
      <p>{food.description || 'Tasty food item available now.'}</p>
      <div className="food-footer">
        <span className="food-price">₹{Number(food.price || 0).toFixed(2)}</span>
        <button onClick={() => onAddToCart(food)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default FoodCard;
