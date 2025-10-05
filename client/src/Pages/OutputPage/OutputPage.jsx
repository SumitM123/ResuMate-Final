import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../../Components/context/UserContext.js';
import './OutputPage.css';
function OutputPage() {
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState(location.state?.pdfUrl || JSON.parse(sessionStorage.getItem('userContext'))?.pdfContent || null);
  const userInfo = useUser();
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `resume-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('outputGenerated');
    };
  }, []);
  console.log("PDF URL:", pdfUrl);
  useEffect(() => {
    async function getPDFAndMaybeUpload() {
      if (!pdfUrl) return;
      try {
        const response = await axios.get(pdfUrl, { responseType: 'blob' });
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfBlobURL = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfBlobURL);

        // Only upload if not already done
        const prefix = Date.now();
        if (sessionStorage.getItem('outputGenerated') !== 'true') {
          const filesToServer = new FormData();
          const prefix = Date.now();
          if (userInfo.file instanceof Blob) {
            filesToServer.append("originalResume", userInfo.file, prefix + "originalResume.pdf");
          }
          filesToServer.append("jobDescription", userInfo.jobDescription || "");
          filesToServer.append("googleId", userInfo.user?.googleId || "");
          filesToServer.append("parsedOutputResume", pdfBlob, prefix + "parsedOutputResume.pdf");
          filesToServer.append("prefix", prefix.toString());
          await axios.post('https://resumate-backend-xv4m.onrender.com/users/uploadFiles', filesToServer, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          sessionStorage.setItem('outputGenerated', 'true');
        }
      } catch (error) {
        console.error("Error fetching or uploading PDF:", error);
      }
    }
    getPDFAndMaybeUpload();
  }, [pdfUrl, userInfo.file, userInfo.jobDescription, userInfo.user]);
  return (
    <div className="output-page-container">
      <div className="output-header">
        <h2 className="output-title">Your Resume PDF is Ready!</h2>
        <div className="success-message">
          Your enhanced resume has been successfully generated and is ready for download!
        </div>
      </div>
      
      <div className="download-section">
        <button className="download-button" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
      
      <div className="pdf-preview-section">
        <h3 className="preview-title">Resume Preview</h3>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Resume PDF Preview"
            className="pdf-iframe"
          />
        ) : (
          <div className="loading-preview">
            <div className="preview-spinner"></div>
            Loading preview...
          </div>
        )}
        
        <div className="actions-section">
          <button className="action-button primary" onClick={handleDownload}>
            ⬇️ Download Again
          </button>
          <button className="action-button secondary" onClick={() => window.print()}>
            🖨️ Print Resume
          </button>
        </div>
        
        <div className="tips-section">
          <h4 className="tips-title">Next Steps</h4>
          <ul className="tips-list">
            <li>Review your enhanced resume carefully before applying</li>
            <li>Customize it further for specific job applications</li>
            <li>Keep the original version as a backup</li>
            <li>Update your LinkedIn profile to match</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default OutputPage;
