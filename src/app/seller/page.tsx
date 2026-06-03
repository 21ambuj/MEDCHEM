"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  // Order history state
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!document.cookie.includes("role=SELLER") && !document.cookie.includes("role=ADMIN") && !document.cookie.includes("role=USER")) {
      router.push("/login");
      return;
    }
    fetchProductsAndOrders();
  }, [router]);

  const fetchProductsAndOrders = async () => {
    try {
      const [resProducts, resOrders] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders")
      ]);
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resOrders.ok) setPastOrders(await resOrders.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getConversionFactor = (selectedUnit: string, baseUnit: string) => {
    if (selectedUnit === baseUnit) return 1;
    if (selectedUnit === "kg" && baseUnit === "g") return 1000;
    if (selectedUnit === "L" && baseUnit === "ml") return 1000;
    return 1;
  };

  const handleAddToCart = (product: any, quantity: number, selectedUnit: string) => {
    if (quantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }
    const factor = getConversionFactor(selectedUnit, product.base_unit);
    const baseQuantity = quantity * factor;
    const price = baseQuantity * parseFloat(product.base_price_inr);
    
    setCart([...cart, {
      product,
      ordered_quantity: quantity,
      ordered_unit: selectedUnit,
      base_quantity: baseQuantity,
      price_inr: price
    }]);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    const total_price_inr = cart.reduce((sum, item) => sum + item.price_inr, 0);
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(c => ({
            productId: c.product.id,
            ordered_quantity: c.ordered_quantity,
            ordered_unit: c.ordered_unit,
            base_quantity: c.base_quantity,
            price_inr: c.price_inr
          })),
          total_price_inr
        })
      });

      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]);
        fetchProductsAndOrders(); // Refresh to see updated inventory and new order
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-black">Loading dashboard...</div>;

  const cartTotal = cart.reduce((sum, item) => sum + item.price_inr, 0);
  
  // Search filtering logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Seller / User Portal</h1>
          <button 
            onClick={() => { document.cookie = "role=; Max-Age=0; path=/"; router.push("/login"); }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Product Catalog */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black">Available Products</h2>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-64 text-black bg-white"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-gray-500">No products found matching your search.</p>
              )}
            </div>
          </div>

          {/* Shopping Cart / Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-8 text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Current Order</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.ordered_quantity} {item.ordered_unit}</p>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.price_inr.toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Total:</span>
                  <span className="font-bold text-2xl text-green-600">₹{cartTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium p-3 rounded-md transition-colors"
                >
                  Confirm Order
                </button>
                <button 
                  onClick={() => setCart([])}
                  className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium p-2 rounded-md transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Order History Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8 text-black">
          <h2 className="text-xl font-semibold mb-4 text-black">Your Past Orders</h2>
          
          {pastOrders.length === 0 ? (
            <p className="text-gray-500">You have no past orders.</p>
          ) : (
            <div className="space-y-4">
              {pastOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Order ID: {order.id.substring(0, 8)}...</span>
                    <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <ul className="list-disc pl-5 mb-3 text-sm text-gray-700">
                    {order.items.map((item: any) => (
                      <li key={item.id}>
                        <span className="font-medium">{item.product?.name}</span>: {item.ordered_quantity} {item.ordered_unit} 
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-end items-center pt-2">
                    <span className="font-bold text-green-600 text-lg">Total Paid: ₹{order.total_price_inr}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

// A sub-component for the product card to manage its own quantity/unit state
function ProductCard({ product, onAdd }: { product: any, onAdd: Function }) {
  const [qty, setQty] = useState(1);
  
  // Default unit based on base unit
  const [unit, setUnit] = useState(
    product.base_unit === 'g' ? 'kg' : 
    product.base_unit === 'ml' ? 'L' : 'item'
  );

  const factor = unit === product.base_unit ? 1 : 
                 (unit === 'kg' && product.base_unit === 'g') ? 1000 : 
                 (unit === 'L' && product.base_unit === 'ml') ? 1000 : 1;
                 
  const calcPrice = qty * factor * parseFloat(product.base_price_inr);

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-black">
      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-4">Base Rate: ₹{product.base_price_inr} / {product.base_unit}</p>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="number" min="0.001" step="any" value={qty} 
          onChange={e => setQty(Number(e.target.value))} 
          className="w-full border p-2 rounded-md bg-white text-black" 
        />
        <select 
          value={unit} 
          onChange={e => setUnit(e.target.value)} 
          className="w-full border p-2 rounded-md bg-white text-black"
        >
          {product.base_unit === 'g' && <><option value="kg">kg</option><option value="g">g</option></>}
          {product.base_unit === 'ml' && <><option value="L">L</option><option value="ml">ml</option></>}
          {product.base_unit === 'item' && <option value="item">item</option>}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">₹{calcPrice.toFixed(2)}</span>
        <button 
          onClick={() => onAdd(product, qty, unit)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Add to Order
        </button>
      </div>
    </div>
  );
}
