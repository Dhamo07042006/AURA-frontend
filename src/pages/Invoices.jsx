import React, { useEffect, useState } from 'react';

function Invoices({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !user.id) return;
      setStatus('loading');
      try {
        const response = await fetch(`https://aura-1jkg.onrender.com/api/invoices/user/${user.id}`);
        if (!response.ok) {
          console.error('Failed to fetch invoices', response.status, response.statusText);
          setStatus('error');
          return;
        }
        const data = await response.json();
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const da = a.invoiceDate ? new Date(a.invoiceDate) : null;
              const db = b.invoiceDate ? new Date(b.invoiceDate) : null;
              if (!da && !db) return 0;
              if (!da) return 1; // nulls last
              if (!db) return -1;
              return da - db;
            })
          : [];
        setInvoices(sorted);
        setStatus('success');
      } catch (e) {
        console.error('Invoices page error', e);
        setStatus('error');
      }
    };

    fetchInvoices();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      const response = await fetch(`https://aura-1jkg.onrender.com/api/invoices/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('Failed to delete invoice', response.status, response.statusText);
        return;
      }
      setInvoices((current) => current.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error('Delete invoice error', e);
    }
  };

  return (
    <div className="aura-page-shell">
      <div className="manual-card">
        <div className="manual-header">
          <h1>Invoices</h1>
          <p>Review and manage all invoices captured in your Aura Gold workspace.</p>
        </div>
        {status === 'loading' && <p className="manual-status">Loading invoices…</p>}
        {status === 'error' && (
          <p className="manual-status manual-status--error">Unable to load invoices. Please try again.</p>
        )}
        {status === 'success' && invoices.length === 0 && (
          <p className="manual-status">No invoices found yet.</p>
        )}
        {invoices.length > 0 && (
          <div className="invoices-table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Metal type</th>
                  <th>Amount without GST</th>
                  <th>GST amount</th>
                  <th>Total amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceDate || '—'}</td>
                    <td>{inv.metalType || '—'}</td>
                    <td>{inv.amountWithoutGst ?? '—'}</td>
                    <td>{inv.gstAmount ?? '—'}</td>
                    <td>{inv.totalAmount ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="aura-gold-button aura-gold-button--ghost"
                        onClick={() => handleDelete(inv.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Invoices;
