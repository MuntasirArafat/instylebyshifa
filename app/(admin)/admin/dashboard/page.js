"use client";
import React, { useEffect, useState } from 'react'
import { Filter, TrendingUp, Users, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalEarning: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = async (f = fromDate, t = toDate) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f) params.set("from", f);
      if (t) params.set("to", t);
      
      const res = await fetch(`/api/admin/dashboard?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setStats(data?.stats || { totalOrders: 0, totalEarning: 0, products: 0, customers: 0 });
      setRecentOrders(Array.isArray(data?.recentOrders) ? data.recentOrders : []);
      setChartData(data?.chartData || []);
    } catch (_e) {
      setStats({ totalOrders: 0, totalEarning: 0, products: 0, customers: 0 });
      setRecentOrders([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Date Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-auto space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">From Date</label>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
        <div className="w-full md:w-auto space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">To Date</label>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
        <button 
          onClick={() => fetchStats()}
          disabled={loading}
          className="w-full md:w-auto md:ml-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
        >
          <Filter className="w-4 h-4" />
          {loading ? "Filtering..." : "Filter Data"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Orders</h2>
          <p className="text-3xl font-black text-gray-900 mt-2">{loading ? "—" : stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Earning</h2>
          <p className="text-3xl font-black text-gray-900 mt-2">{loading ? "—" : `${Number(stats.totalEarning || 0).toLocaleString()} BDT`}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Products</h2>
          <p className="text-3xl font-black text-gray-900 mt-2">{loading ? "—" : stats.products}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Customers</h2>
          <p className="text-3xl font-black text-gray-900 mt-2">{loading ? "—" : stats.customers}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Visitor Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Visitor Traffic
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Last 7 Days</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Order Volume
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Recent Activity</p>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-gray-200" />)}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#c026d3' : '#e879f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Recent 5 Orders
            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">Newest</span>
          </h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5">Order ID</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Total</th>
                  <th className="px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>Loading recent orders...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const name = `${order?.customer?.firstName || ""} ${order?.customer?.lastName || ""}`.trim() || "Customer";
                    const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                    const total = Number(order?.amounts?.total || 0).toLocaleString();
                    const status = order?.status || "Pending";
                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/admin/orders/edit/${order._id}`)}
                      >
                        <td className="px-6 py-4 font-bold text-indigo-600 group-hover:text-indigo-800">{order.orderNumber || `#${order._id}`}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">{date}</td>
                        <td className="px-6 py-4 font-black text-gray-900">৳ {total}</td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
