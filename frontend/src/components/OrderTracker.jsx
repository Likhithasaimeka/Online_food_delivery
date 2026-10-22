// OrderTracker component — shows delivery progress with visual steps.
import '../styles/order-tracker.css';

function OrderTracker({ deliveryStatus }) {
  const steps = [
    { id: 'Preparing', label: 'Preparing', icon: '👨‍🍳' },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: '🚴' },
    { id: 'Delivered', label: 'Delivered', icon: '✅' }
  ];

  // Find index of current status
  const currentIndex = steps.findIndex(step => step.id === deliveryStatus);

  return (
    <div className="order-tracker">
      {steps.map((step, index) => (
        <div key={step.id} className="tracker-step">
          <div className={`tracker-icon ${index <= currentIndex ? 'active' : ''}`}>
            {step.icon}
          </div>
          <div className="tracker-label">{step.label}</div>
          {index < steps.length - 1 && (
            <div className={`tracker-line ${index < currentIndex ? 'active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default OrderTracker;
