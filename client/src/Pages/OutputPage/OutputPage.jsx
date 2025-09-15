import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FormData } from 'form-data';
import axios from 'axios';
import { useUser } from '../../Components/context/UserContext.js';
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
    //I would want to create a request in which it takes the pdf and the job description sent by the user and store it inside the database
    const filesToServer = new FormData();
    filesToServer.append("originalResume", userInfo.file);
    filesToServer.append("jobDescription", userInfo.jobDescription);
    filesToServer.append("parsedResumeURL", pdfUrl); // This is a link to the pdf file
    /*
      This will download the file from the link, get the the original file and download it locally. Then both files will be sent to the s3 bucket
      and we'll get the URL of the files and store it inside the mongoDB 

      After that, delete the local files
    */

      
    axios.post('users/uploadFiles', filesToServer, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }, []);
  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Your Resume PDF is Ready!</h2>
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