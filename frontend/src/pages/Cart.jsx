// Import hooks and API calls.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, BASE_URL } from '../services/api';
import '../styles/pages.css';
import '../styles/cart.css';

// Cart page with payment integration.
function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [wallet, setWallet] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load cart items and wallet from storage/API.
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if (loggedInUser) {
      loadWallet(loggedInUser.id);
    }
  }, []);

  const loadWallet = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/wallet/${userId}`);
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  // Remove one item from cart and update storage.
  const removeFromCart = (indexToRemove) => {
    const updatedItems = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  // Calculate total amount from all cart items.
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  // Show payment modal before placing order.
  const initiateCheckout = () => {
    setMessage('');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (!loggedInUser) {
      setMessage('Please login before placing an order');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (cartItems.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    if (!wallet || wallet.balance < totalPrice) {
      setMessage(`Insufficient balance. Please add ₹${(totalPrice - (wallet?.balance || 0)).toFixed(2)} to your wallet`);
      setTimeout(() => navigate('/wallet'), 2000);
      return;
    }

    setShowPaymentModal(true);
  };

  // Process payment and place orders.
  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage('');
    setProcessingPayment(true);

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (!deliveryAddress.trim()) {
      setMessage('Please enter delivery address');
      setProcessingPayment(false);
      return;
    }

    try {
      // Create orders for each cart item
      const orderPromises = cartItems.map(item => 
        createOrder({
          userId: loggedInUser.id,
          foodId: item.id,
          quantity: item.quantity || 1,
          status: 'Pending',
          totalAmount: Number(item.price || 0) * Number(item.quantity || 1),
          paymentStatus: 'Pending',
          deliveryAddress,
          deliveryStatus: 'Preparing'
        })
      );

      const orders = await Promise.all(orderPromises);

      // Process payment for the total amount using first order ID as reference
      const paymentResponse = await fetch(`${BASE_URL}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orders[0].id,
          orderIds: orders.map(o => o.id),
          userId: loggedInUser.id,
          amount: totalPrice,
          password
        })
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentData.message);

      setMessage('✅ Payment successful! Order placed.');
      setCartItems([]);
      localStorage.removeItem('cart');
      setShowPaymentModal(false);
      setPassword('');
      setDeliveryAddress('');
      
      // Reload wallet balance
      await loadWallet(loggedInUser.id);
      
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <main className="page-container">
      <h2>Your Cart</h2>
      
      {/* Wallet Balance Display */}
      <div className="wallet-info">
        <span className="wallet-balance">
          💰 Wallet Balance: ₹{wallet?.balance?.toFixed(2) || '0.00'}
        </span>
        <button className="btn-view-wallet" onClick={() => navigate('/wallet')}>
          View Wallet
        </button>
      </div>

      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item, index) => (
            <div className="cart-item" key={`${item.id}-${index}`}>
              <span>
                {item.name} x {item.quantity || 1}
              </span>
              <span>₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
              <button onClick={() => removeFromCart(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
      <button onClick={initiateCheckout} disabled={cartItems.length === 0}>
        Proceed to Checkout
      </button>
      {message && <p className="message">{message}</p>}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Your Payment</h3>
            
            <div className="payment-summary">
              <div className="summary-row">
                <span>Order Total:</span>
                <span className="amount">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Wallet Balance:</span>
                <span className="amount">₹{wallet?.balance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row balance-after">
                <span>Balance After Payment:</span>
                <span className="amount">₹{((wallet?.balance || 0) - totalPrice).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Enter Password to Confirm *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your login password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPassword('');
                    setDeliveryAddress('');
                  }}
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pay"
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;
