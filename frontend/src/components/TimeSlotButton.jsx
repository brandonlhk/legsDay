export default function TimeSlotButton ({ timeslot, popularity, isSelected, onClick }) {
    // Determine the circle color based on popularity
    let circleColor;
    if (popularity >= 11) {
      circleColor = 'bg-orange-500'; // very popular
    } else if (popularity >= 1) {
      circleColor = 'bg-yellow-500'; // moderately popular
    } else {
      circleColor = 'bg-green-500'; // no or low popularity
    }
  
    return (
      <button
        onClick={onClick}
        className={`relative p-3 rounded-md border font-bold text-[0.8rem] ${
          isSelected ? "border-green-500 border-2" : "border-gray-200 text-gray-700 border-2"
        }`}
      >
        {timeslot}
        {/* Circle indicator positioned at the top right */}
        <span
          className={circleColor}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            position: 'absolute',
            top: '8px',
            right: '8px'
          }}
        ></span>
      </button>
    );
  };
  