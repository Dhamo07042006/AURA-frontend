import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const METAL_COLORS = {
  GOLD: '#fbbf24',
  SILVER: '#e5e7eb',
  PLATINUM: '#d1d5db',
  PALLADIUM: '#a5b4fc',
};

function RevenueDashboard({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metalFilter, setMetalFilter] = useState('ALL');
  const [goldGrams, setGoldGrams] = useState('');
  const [goldCurrentRate, setGoldCurrentRate] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [silverCurrentRate, setSilverCurrentRate] = useState('');

  // Polling-based realtime updates (every 10s)
  useEffect(() => {
    let cancelled = false;

    const fetchInvoices = async () => {
      try {
        setStatus((prev) => (prev === 'idle' ? 'loading' : prev));
        const url = user && user.id
          ? `https://aura-1jkg.onrender.com/api/invoices/user/${user.id}`
          : 'https://aura-1jkg.onrender.com/api/invoices/all';
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setInvoices(data);
          setStatus('success');
          setError(null);
        }
      } catch (e) {
        console.error('Revenue dashboard error', e);
        if (!cancelled) {
          setStatus('error');
          setError('Unable to load invoices');
        }
      }
    };

    fetchInvoices();
    const interval = setInterval(fetchInvoices, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const parseDate = (value) => {
    if (!value) return null;
    try {
      return new Date(value);
    } catch (e) {
      return null;
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return '-';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(value);
    } catch (e) {
      return String(value);
    }
  };

  // Apply filters
  const filteredInvoices = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return invoices.filter((inv) => {
      const d = parseDate(inv.invoiceDate);

      if (start && (!d || d < start)) return false;
      if (end) {
        // include end date full day
        const endAdj = new Date(end);
        endAdj.setHours(23, 59, 59, 999);
        if (!d || d > endAdj) return false;
      }

      if (metalFilter !== 'ALL') {
        const metal = (inv.metalType || '').toUpperCase();
        if (!metal.startsWith(metalFilter)) return false;
      }

      return true;
    });
  }, [invoices, startDate, endDate, metalFilter]);

  // KPI calculations
  const kpi = useMemo(() => {
    if (!filteredInvoices.length) {
      return {
        totalSpend: 0,
        gstPaid: 0,
        count: 0,
        avgInvoice: 0,
      };
    }

    let totalSpend = 0;
    let gstPaid = 0;

    filteredInvoices.forEach((inv) => {
      if (inv.totalAmount != null) totalSpend += Number(inv.totalAmount);
      if (inv.gstAmount != null) gstPaid += Number(inv.gstAmount);
    });

    const count = filteredInvoices.length;
    const avgInvoice = count > 0 ? totalSpend / count : 0;

    return { totalSpend, gstPaid, count, avgInvoice };
  }, [filteredInvoices]);

  // Monthly spending chart data
  const monthlyData = useMemo(() => {
    const buckets = new Map(); // key: YYYY-MM, value: sum

    filteredInvoices.forEach((inv) => {
      const d = parseDate(inv.invoiceDate);
      if (!d || inv.totalAmount == null) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = buckets.get(key) || 0;
      buckets.set(key, current + Number(inv.totalAmount));
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, value]) => ({
        month: key,
        total: value,
      }));
  }, [filteredInvoices]);

  // Metal type distribution
  const metalData = useMemo(() => {
    const counts = new Map();
    filteredInvoices.forEach((inv) => {
      const keyRaw = inv.metalType || 'UNKNOWN';
      const key = keyRaw.toUpperCase().startsWith('GOLD')
        ? 'GOLD'
        : keyRaw.toUpperCase().startsWith('SILVER')
          ? 'SILVER'
          : keyRaw.toUpperCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredInvoices]);

  // Daily spend trend (last 30 days)
  const dailyData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    const buckets = new Map(); // key: YYYY-MM-DD, value: sum

    filteredInvoices.forEach((inv) => {
      const d = parseDate(inv.invoiceDate);
      if (!d || inv.totalAmount == null) return;
      if (d < cutoff) return;
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) || 0) + Number(inv.totalAmount));
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, total]) => ({ date, total }));
  }, [filteredInvoices]);

  // GST analysis chart (amount without GST vs GST amount)
  const gstData = useMemo(() => {
    return filteredInvoices.map((inv) => ({
      id: inv.id,
      invoiceDate: inv.invoiceDate || '',
      amountWithoutGst: inv.amountWithoutGst != null ? Number(inv.amountWithoutGst) : 0,
      gstAmount: inv.gstAmount != null ? Number(inv.gstAmount) : 0,
    }));
  }, [filteredInvoices]);

  // Totals invested per metal (amount without GST)
  const investedTotals = useMemo(() => {
    let gold = 0;
    let silver = 0;

    filteredInvoices.forEach((inv) => {
      if (!inv.metalType || inv.amountWithoutGst == null) return;
      const metal = String(inv.metalType).toUpperCase();
      const base = Number(inv.amountWithoutGst) || 0;
      if (metal.startsWith('GOLD')) {
        gold += base;
      } else if (metal.startsWith('SILVER')) {
        silver += base;
      }
    });

    return { gold, silver };
  }, [filteredInvoices]);

  // Profit per metal using invested total + user grams + current rate
  const profits = useMemo(() => {
    const result = {
      gold: 0,
      silver: 0,
    };

    const gQty = parseFloat(goldGrams);
    const gCur = parseFloat(goldCurrentRate);
    if (!isNaN(gQty) && gQty > 0 && !isNaN(gCur) && gCur > 0 && investedTotals.gold > 0) {
      const currentValue = gQty * gCur;
      result.gold = currentValue - investedTotals.gold;
    }

    const sQty = parseFloat(silverGrams);
    const sCur = parseFloat(silverCurrentRate);
    if (!isNaN(sQty) && sQty > 0 && !isNaN(sCur) && sCur > 0 && investedTotals.silver > 0) {
      const currentValue = sQty * sCur;
      result.silver = currentValue - investedTotals.silver;
    }

    return result;
  }, [investedTotals, goldGrams, goldCurrentRate, silverGrams, silverCurrentRate]);

  return (
    <div className="aura-page-shell revenue-page">
      <div className="revenue-header">
        <h1>Revenue dashboard</h1>
        <p>Monitor realized revenue, tax, and invoice volume from your Aura Gold workspace.</p>
      </div>

      {/* Filters */}
      <div className="revenue-filters">
        <div className="revenue-filter-group">
          <label>
            Start date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            End date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
        <div className="revenue-filter-group">
          <label>
            Metal type
            <select value={metalFilter} onChange={(e) => setMetalFilter(e.target.value)}>
              <option value="ALL">All metals</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>
          </label>
        </div>
        <div className="revenue-filter-meta">
          {status === 'loading' && <span className="revenue-chip">Loading…</span>}
          {status === 'error' && <span className="revenue-chip">Error: {error}</span>}
          {status === 'success' && <span className="revenue-chip">Live (auto-refreshing)</span>}
        </div>
      </div>

      {/* Grams + current rate -> profit only */}
      <div className="revenue-profit-card">
        <div className="revenue-profit-header">
          <h2>Gold & silver profit</h2>
          <p>Enter how many grams you hold and todays rate to see an approximate profit.</p>
        </div>
        <div className="revenue-profit-body">
          <div className="revenue-profit-inputs">
            <div className="revenue-profit-column">
              <h3>GOLD24</h3>
              <label>
                Quantity you hold (g)
                <input
                  type="number"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(e.target.value)}
                  placeholder="e.g. 50"
                />
              </label>
              <label>
                Current rate (₹ / g)
                <input
                  type="number"
                  value={goldCurrentRate}
                  onChange={(e) => setGoldCurrentRate(e.target.value)}
                  placeholder="e.g. 7200"
                />
              </label>
            </div>
            <div className="revenue-profit-column">
              <h3>SILVER24</h3>
              <label>
                Quantity you hold (g)
                <input
                  type="number"
                  value={silverGrams}
                  onChange={(e) => setSilverGrams(e.target.value)}
                  placeholder="e.g. 500"
                />
              </label>
              <label>
                Current rate (₹ / g)
                <input
                  type="number"
                  value={silverCurrentRate}
                  onChange={(e) => setSilverCurrentRate(e.target.value)}
                  placeholder="e.g. 95"
                />
              </label>
            </div>
          </div>
          <div className="revenue-profit-summary">
            <div className="revenue-profit-item">
              <span className="revenue-label">Gold profit</span>
              <span
                className={
                  'revenue-value ' +
                  (profits.gold > 0 ? 'revenue-value--positive' : profits.gold < 0 ? 'revenue-value--negative' : '')
                }
              >
                {formatCurrency(profits.gold)}
              </span>
            </div>
            <div className="revenue-profit-item">
              <span className="revenue-label">Silver profit</span>
              <span
                className={
                  'revenue-value ' +
                  (profits.silver > 0
                    ? 'revenue-value--positive'
                    : profits.silver < 0
                      ? 'revenue-value--negative'
                      : '')
                }
              >
                {formatCurrency(profits.silver)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="revenue-kpi-grid">
        <div className="revenue-kpi-card">
          <span className="revenue-label">Total spend</span>
          <span className="revenue-value">{formatCurrency(kpi.totalSpend)}</span>
        </div>
        <div className="revenue-kpi-card">
          <span className="revenue-label">GST paid</span>
          <span className="revenue-value">{formatCurrency(kpi.gstPaid)}</span>
        </div>
        <div className="revenue-kpi-card">
          <span className="revenue-label">Number of invoices</span>
          <span className="revenue-value">{kpi.count}</span>
        </div>
        <div className="revenue-kpi-card">
          <span className="revenue-label">Average invoice value</span>
          <span className="revenue-value">{formatCurrency(kpi.avgInvoice)}</span>
        </div>
      </div>

      {/* Charts layout */}
      <div className="revenue-charts-grid">
        {/* Monthly spending chart */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <span>Monthly spending</span>
          </div>
          <div className="revenue-chart-body">
            {monthlyData.length === 0 ? (
              <p className="manual-status">No data for selected filters.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Metal type distribution */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <span>Metal type distribution</span>
          </div>
          <div className="revenue-chart-body">
            {metalData.length === 0 ? (
              <p className="manual-status">No data for selected filters.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={metalData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {metalData.map((entry, index) => {
                      const key = entry.name.toUpperCase();
                      const color = METAL_COLORS[key] || ['#a855f7', '#22c55e', '#0ea5e9'][index % 3];
                      return <Cell key={entry.name} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily spend trend (last 30 days) */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <span>Daily spend (last 30 days)</span>
          </div>
          <div className="revenue-chart-body">
            {dailyData.length === 0 ? (
              <p className="manual-status">No data for selected filters.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GST analysis chart */}
        <div className="revenue-chart-card">
          <div className="revenue-chart-header">
            <span>GST analysis</span>
          </div>
          <div className="revenue-chart-body">
            {gstData.length === 0 ? (
              <p className="manual-status">No data for selected filters.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={gstData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="invoiceDate" stroke="#9ca3af" hide />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amountWithoutGst" stackId="a" fill="#4ade80" />
                  <Bar dataKey="gstAmount" stackId="a" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueDashboard;

