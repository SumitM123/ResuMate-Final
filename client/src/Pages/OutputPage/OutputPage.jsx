import React from 'react';
import { useLocation } from 'react-router-dom';

function OutputPage() {
  const location = useLocation();
  const pdfUrl = location.state?.pdfUrl;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `resume-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Your Resume PDF is Reaady!</h2>
      <button 
        onClick={handleDownload} 
        style={{
          padding: '12px 32px',
          fontSize: '1.2rem',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Download PDF
      </button>
      <div style={{ marginTop: '32px' }}>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Resume PDF Preview"
            width="80%"
            height="600px"
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
        )}
      </div>
    </div>
  );
}

export default OutputPage;