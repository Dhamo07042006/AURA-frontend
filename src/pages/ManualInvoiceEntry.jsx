import React, { useState, useEffect } from 'react';

function ManualInvoiceEntry({ user }) {
  const [form, setForm] = useState({
    userId: user?.id || 1,
    invoiceDate: '',
    metalType: '',
    amountWithoutGst: '',
    gstAmount: '',
    totalAmount: '',
  });

  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      setForm((prev) => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAmountChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      const base = parseFloat(updated.amountWithoutGst);
      const gst = parseFloat(updated.gstAmount);

      if (!isNaN(base) && !isNaN(gst)) {
        updated.totalAmount = (base + gst).toFixed(2);
      } else {
        updated.totalAmount = '';
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('pending');

    try {
      const payload = {
        userId: form.userId,
        invoiceDate: form.invoiceDate || null,
        metalType: form.metalType || null,
        amountWithoutGst: form.amountWithoutGst ? Number(form.amountWithoutGst) : null,
        gstAmount: form.gstAmount ? Number(form.gstAmount) : null,
        totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
      };

      const response = await fetch('https://aura-1jkg.onrender.com/api/invoices/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Manual invoice save failed', response.status, response.statusText, errorText);
        throw new Error('Failed to save invoice');
      }

      setStatus('success');
      setForm({
        userId: form.userId,
        invoiceDate: '',
        metalType: '',
        amountWithoutGst: '',
        gstAmount: '',
        totalAmount: '',
      });
    } catch (error) {
      console.error('Manual invoice error', error);
      setStatus('error');
    }
  };

  return (
    <div className="aura-page-shell">
      <div className="manual-card">
        <div className="manual-header">
          <h1>Manual invoice entry</h1>
          <p>
            Capture bespoke documents, adjustments and off‑cycle invoices in a guided Aura Gold form.
          </p>
        </div>
        <form className="manual-form" onSubmit={handleSubmit}>
          <div className="manual-grid">
            <label>
              Metal type
              <select value={form.metalType} onChange={handleChange('metalType')}>
                <option value="">Select metal type</option>
                <option value="SILVER24">SILVER24</option>
                <option value="GOLD24">GOLD24</option>
              </select>
            </label>
            <label>
              Invoice date
              <input
                type="date"
                value={form.invoiceDate}
                onChange={handleChange('invoiceDate')}
              />
            </label>
          </div>
          <div className="manual-grid">
            <label>
              Amount without GST (₹)
              <input
                type="number"
                placeholder="125000"
                value={form.amountWithoutGst}
                onChange={handleAmountChange('amountWithoutGst')}
              />
            </label>
            <label>
              GST amount (₹)
              <input
                type="number"
                placeholder="22500"
                value={form.gstAmount}
                onChange={handleAmountChange('gstAmount')}
              />
            </label>
          </div>
          <label>
            Total amount (₹)
            <input
              type="number"
              placeholder="147500"
              value={form.totalAmount}
              readOnly
            />
          </label>
          <button type="submit" className="aura-gold-button">
            Save invoice
          </button>
          {status === 'success' && (
            <p className="manual-status manual-status--success">Invoice saved successfully.</p>
          )}
          {status === 'error' && (
            <p className="manual-status manual-status--error">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ManualInvoiceEntry;

