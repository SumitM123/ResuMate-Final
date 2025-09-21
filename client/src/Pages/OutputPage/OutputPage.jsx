import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../Components/context/UserContext.js';
import './OutputPage.css';
function OutputPage() {
  const location = useLocation();
  const pdfUrl = location.state?.pdfUrl;
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
    async function uploadFiles() {
      //I would want to create a request in which it takes the pdf and the job description sent by the user and store it inside the database
      const filesToServer = new FormData();
      filesToServer.append("originalResume", userInfo.file, "originalResume.pdf");
      filesToServer.append("jobDescription", userInfo.jobDescription);
      filesToServer.append("googleId", userInfo.user.googleId);
      const response = await axios.get(pdfUrl, { responseType: 'blob' });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfFile = new File([pdfBlob], 'parsedResume.pdf', { type: 'application/pdf' });
      //filesToServer.append("parsedResumeURL", pdfUrl); // This is a link to the pdf file
      filesToServer.append("parsedOutputResume", pdfFile, "parsedOutputResume.pdf");

      //filesToServer.append("googleId", userInfo.user.googleId);
      /*
        This will download the file from the link, get the the original file and download it locally. Then both files will be sent to the s3 bucket
        and we'll get the URL of the files and store it inside the mongoDB 

        After that, delete the local files
      */

      try {
        await axios.post('http://localhost:5000/users/uploadFiles', filesToServer, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }  catch (error) {
        console.error("Error uploading files to server:", error);
      }
    }
    uploadFiles();
  }, [pdfUrl]);
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