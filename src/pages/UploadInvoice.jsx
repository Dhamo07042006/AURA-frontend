import React, { useState } from 'react';

function UploadInvoice({ user }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [parsedInvoice, setParsedInvoice] = useState(null);

  const handleFileChange = (event) => {
    const selected = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setFile(selected);
    setParsedInvoice(null);
  };

  const handleProcess = async () => {
    if (!file) {
      setStatus('no-files');
      return;
    }

    setStatus('pending');
    setParsedInvoice(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const userId = user && user.id ? user.id : undefined;
      const url = userId
        ? `https://aura-1jkg.onrender.com/api/invoices/upload?userId=${encodeURIComponent(userId)}`
        : 'https://aura-1jkg.onrender.com/api/invoices/upload';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Upload failed', response.status, response.statusText);
        setStatus('error');
        return;
      }

      const data = await response.json();
      setParsedInvoice(data);
      setStatus('success');
    } catch (error) {
      console.error('Upload error', error);
      setStatus('error');
    }
  };

  return (
    <div className="aura-page-shell">
      <div className="upload-card">
        <div className="upload-header">
          <h1>Upload invoices</h1>
          <p>
            Drop PDFs, images or CSVs into an Aura‑grade ingestion pipeline with OCR, classification and
            instant policy validation.
          </p>
        </div>
        <div className="upload-dropzone">
          <input type="file" onChange={handleFileChange} />
          <p>Drag &amp; drop files here or click to browse</p>
        </div>
        <ul className="upload-hints">
          <li>Automatic vendor and tax detection</li>
          <li>Live duplicate and anomaly checks</li>
          <li>Exports to your downstream ledger in one click</li>
        </ul>
        <button type="button" className="aura-gold-button" onClick={handleProcess}>
          Process batch
        </button>
        {status === 'no-files' && (
          <p className="manual-status manual-status--error">Select at least one file to process.</p>
        )}
        {status === 'success' && (
          <>
            <p className="manual-status manual-status--success">Invoice processed successfully.</p>
            {parsedInvoice && (
              <div className="upload-result-card">
                <h2>Extracted invoice details</h2>
                <ul>
                  <li><strong>Date:</strong> {parsedInvoice.invoiceDate || '—'}</li>
                  <li><strong>Metal type:</strong> {parsedInvoice.metalType || '—'}</li>
                  <li><strong>Amount without GST:</strong> {parsedInvoice.amountWithoutGst ?? '—'}</li>
                  <li><strong>GST amount:</strong> {parsedInvoice.gstAmount ?? '—'}</li>
                  <li><strong>Total amount:</strong> {parsedInvoice.totalAmount ?? '—'}</li>
                  {parsedInvoice.csvPath && (
                    <li><strong>CSV path:</strong> {parsedInvoice.csvPath}</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
        {status === 'error' && (
          <p className="manual-status manual-status--error">Upload failed. Check server logs and try again.</p>
        )}
      </div>
    </div>
  );
}

export default UploadInvoice;

