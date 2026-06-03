"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form State for new product
  const [name, setName] = useState("");
  const [baseUnit, setBaseUnit] = useState("g");
  const [basePrice, setBasePrice] = useState("");

  useEffect(() => {
    // Basic auth check (in a real app, use proper middleware)
    if (!document.cookie.includes("role=ADMIN")) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [resProducts, resOrders] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders")
      ]);
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resOrders.ok) setOrders(await resOrders.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          base_unit: baseUnit,
          base_price_inr: parseFloat(basePrice),
          description: ""
        })
      });
      if (res.ok) {
        setName("");
        setBasePrice("");
        fetchData();
        alert("Product created successfully!");
      } else {
        alert("Failed to create product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button 
            onClick={() => { document.cookie = "role=; Max-Age=0; path=/"; router.push("/login"); }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Product Creation Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleCreateProduct} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Unit</label>
              <select value={baseUnit} onChange={e => setBaseUnit(e.target.value)} className="mt-1 w-full border p-2 rounded-md">
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="item">Items (unit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price (INR per unit)</label>
              <input type="number" step="0.0001" required value={basePrice} onChange={e => setBasePrice(e.target.value)} className="mt-1 w-full border p-2 rounded-md" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 h-[42px]">
              Add Product
            </button>
          </form>
        </div>

        {/* Inventory Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2">Name</th>
                <th className="py-2">Base Unit</th>
                <th className="py-2">Price per Base Unit</th>
                <th className="py-2">Inventory Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">{p.base_unit}</td>
                  <td className="py-3">₹{p.base_price_inr}</td>
                  <td className="py-3 font-semibold text-blue-600">{p.inventory_quantity} {p.base_unit}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No products found. Add one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Orders Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2">Order ID</th>
                <th className="py-2">Total Price</th>
                <th className="py-2">Items</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-500">{o.id.substring(0, 8)}...</td>
                  <td className="py-3 font-bold text-green-600">₹{o.total_price_inr}</td>
                  <td className="py-3">
                    <ul className="list-disc pl-4 text-sm">
                      {o.items.map((i: any) => (
                        <li key={i.id}>
                          {i.product?.name}: {i.ordered_quantity} {i.ordered_unit} (Stored as -{i.base_quantity} base units)
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 text-sm">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No orders placed yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
