"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DollarSign, Plus, ArrowRight, ShieldCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { validateExpenseAmount } from "@/lib/validation";

export const ProfitLedger: React.FC = () => {
  const [expenses, setExpenses] = useState([
    { id: "e-1", category: "High-Yield Seeds", amount: 4500, date: "July 12, 2026" },
    { id: "e-2", category: "Drip Irrigation Diodes", amount: 8200, date: "July 15, 2026" },
    { id: "e-3", category: "NPK bio-fertilizer", amount: 3500, date: "July 20, 2026" },
  ]);

  const [newCat, setNewCat] = useState("Seeds");
  const [newAmount, setNewAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Financial chart data
  const chartData = [
    { month: "Jan", revenue: 84000, expenses: 31000 },
    { month: "Feb", revenue: 92000, expenses: 28000 },
    { month: "Mar", revenue: 104000, expenses: 35000 },
    { month: "Apr", revenue: 110000, expenses: 40000 },
    { month: "May", revenue: 125000, expenses: 42000 },
    { month: "Jun", revenue: 138000, expenses: 38000 },
    { month: "Jul", revenue: 145000, expenses: 48000 },
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccess(false);

    const validation = validateExpenseAmount(newAmount);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid expense amount.");
      return;
    }
    
    setExpenses((prev) => [
      ...prev,
      {
        id: `e-${Date.now()}`,
        category: newCat,
        amount: Number(newAmount),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    ]);
    setNewAmount("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span>Interactive Crop Profit & Expense Ledger</span>
          </h2>
          <p className="text-xs text-gray-400">Track seed, water, and fertilizer overheads against mandi revenues</p>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-700/10 text-gray-600 border border-gray-700/20">
          Escrow Audit Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Ledger & Inputs */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Add New Expense Item</h3>
          
          {validationError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="text-gray-400 block mb-1">Expense Type</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none"
              >
                <option value="Seeds">High-Yield Certified Seeds</option>
                <option value="Water / Irrigation">Water / Drip Irrigation Equipment</option>
                <option value="Fertilizer">Organic / Chemical Fertilizer</option>
                <option value="Diesel / Fuel">Diesel / Harvester Fuel</option>
                <option value="Labor Wages">Farming Wages / Labor</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Amount (INR)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Record Expense Entry</span>
            </Button>
          </form>

          {success && (
            <div className="p-2.5 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Expense added to ledger successfully!</span>
            </div>
          )}

          {/* Current entries list */}
          <div className="pt-2">
            <div className="flex justify-between font-bold text-white mb-2 uppercase tracking-wider text-[10px]">
              <span>Recent Expense Entries</span>
              <span className="text-rose-400 font-mono">Total: ₹{totalExpense}</span>
            </div>
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e.id} className="p-2.5 rounded-xl bg-gray-800/40 border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-200">{e.category}</div>
                    <div className="text-[9px] text-gray-500">{e.date}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-400">₹{e.amount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Data Visualization area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-dark-bg/90 rounded-2xl border border-gray-800">
            <h3 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Mandi Revenues vs Overheads (2026)</h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", borderRadius: "12px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Income (₹)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-center text-xs">
              <div>
                <div className="text-gray-400">July Revenue</div>
                <div className="text-lg font-black text-gray-600 font-mono">₹1,45,000</div>
              </div>
              <div>
                <div className="text-gray-400">Net Profit Margin</div>
                <div className="text-lg font-black text-amber-400 font-mono">66.8%</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </Card>
  );
};
