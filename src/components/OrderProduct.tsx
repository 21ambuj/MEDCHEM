"use client";

import { useState } from "react";

const productFromDatabase = {
  name: "Sodium Chloride",
  base_unit: "g",
  price_per_gram: 0.5,
};

export default function OrderProduct() {
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("kg");

  let calculatedPrice = 0;
  
  if (selectedUnit === "kg") {
    const quantityInGrams = quantity * 1000;
    calculatedPrice = quantityInGrams * productFromDatabase.price_per_gram;
  } else if (selectedUnit === "g") {
    calculatedPrice = quantity * productFromDatabase.price_per_gram;
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Order: {productFromDatabase.name}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input 
            type="number" 
            min="1"
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))} 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total Price:</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{calculatedPrice.toFixed(2)}
            </span>
          </div>

          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-md transition-colors"
            onClick={() => alert(`Order placed for ${quantity} ${selectedUnit} at ₹${calculatedPrice}`)}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
