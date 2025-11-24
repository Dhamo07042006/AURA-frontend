import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const INVEST_COLORS = {
  GOLD: '#fbbf24',
  SILVER: '#e5e7eb',
};

function Home({ user }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchInvoices = async () => {
      try {
        const res = await fetch(`https://aura-1jkg.onrender.com/api/invoices/user/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
        }
      } catch (e) {
        // swallow for now; home is informational only
      }
    };

    fetchInvoices();
  }, [user]);

  const invested = useMemo(() => {
    let gold = 0;
    let silver = 0;

    invoices.forEach((inv) => {
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
  }, [invoices]);

  const donutData = useMemo(() => {
    const items = [];
    if (invested.gold > 0) {
      items.push({ name: 'Gold', value: invested.gold, key: 'GOLD' });
    }
    if (invested.silver > 0) {
      items.push({ name: 'Silver', value: invested.silver, key: 'SILVER' });
    }
    return items;
  }, [invested]);

  const formatCurrency = (value) => {
    if (value == null) return '₹0';
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
  return (
    <div className="aura-home">
      <section className="aura-hero">
        <div className="aura-hero-content">
          <p className="aura-pill">Aura Gold for finance teams</p>
          <h1>One golden surface for every invoice and rupee of revenue.</h1>
          <p className="aura-subtext">
            Streamline capture, approvals and reconciliation across cards, bank transfers and wallets
            with live anomaly detection baked in.
          </p>
          <p className="aura-subtext">
            Upload invoices, enter bespoke documents manually, and monitor gold and silver exposure and profit
            from a single Aura workspace.
          </p>
        </div>
      </section>
      <section className="aura-home-grid aura-grid">
        <div className="aura-landing-card aura-landing-card--gold">
          <h2>Gold performance snapshot</h2>
          <p>
            Over the last five years, gold has delivered around
            <span className="aura-stat"> 125%+</span> returns in USD, and about
            <span className="aura-stat"> 33.15%</span> in the five years leading up to October 2025.
          </p>
          <p className="aura-note">
            Driven by its role as a hedge against currency debasement and a safe haven during economic and
            geopolitical tension.
          </p>
        </div>
        <div className="aura-landing-card aura-landing-card--silver">
          <h2>Silver performance snapshot</h2>
          <p>
            Silver has shown strong upside with approximately
            <span className="aura-stat"> 114.40%</span> returns over five years in USD.
          </p>
          <p className="aura-note">
            Powered by both investor demand and industrial use in solar panels, 5G networks and AI hardware.
          </p>
        </div>
        <div className="aura-landing-card">
          <h2>Gold & silver on a single pane</h2>
          <p>
            Aura brings these market stories down to your ledger level  every invoice, tax line and gram
            reconciled in one golden surface.
          </p>
        </div>
        <div className="aura-landing-card aura-landing-card--invest">
          <h2>Your invested picture</h2>
          <div className="home-invest-grid">
            <div className="home-invest-chart">
              {donutData.length === 0 ? (
                <p className="manual-status">No gold/silver invoices yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.key} fill={INVEST_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="home-invest-summary">
              <div>
                <span className="home-invest-label">Total in GOLD24</span>
                <span className="home-invest-value">{formatCurrency(invested.gold)}</span>
              </div>
              <div>
                <span className="home-invest-label">Total in SILVER24</span>
                <span className="home-invest-value">{formatCurrency(invested.silver)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="aura-landing-card aura-landing-card--images">
          <h2>Metals in focus</h2>
          <div className="home-metal-images">
            <div className="home-metal-image">
              <img
                src="https://goldbulliondealers.co.uk/wp-content/uploads/2024/07/9d28fe21thumbnail.jpeg"
                alt="Gold bars"
              />
              <span>Gold bars</span>
            </div>
            <div className="home-metal-image">
              <img
                src="https://img500.exportersindia.com/product_images/bc-500/dir_178/5319584/silver-bars-1510637837-3449616.jpg"
                alt="Silver coins"
              />
              <span>Silver coins</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
