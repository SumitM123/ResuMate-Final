import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobDescription.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function JobDescription() {
  const userInfo = useUser();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fileUploadRef = useRef(null);
  const jobDescriptionRef = useRef(null);

  const navigate = useNavigate();

  const updateJobText = (e) => {
    userInfo.setJobDescription(e.target.value);
  };

  const checkFile = () => {
    const files = fileUploadRef.current.files;
    if (files.length === 0) {
      return "No files were uploaded. Please upload a file.";
    }
    const file = files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'pdf') {
      fileUploadRef.current.value = '';
      userInfo.setFile(null);
      return "Wrong uploaded file. Only PDFs are allowed.";
    }
    userInfo.setFile(file);

    return "";
  };

  const checkJobDescription = () => {
    if (!jobDescriptionRef.current.value.trim()) {
      return "No job description. Please type a job description.";
    }
    return "";
  };

  const handleClick = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const fileError = checkFile();
    const jobError = checkJobDescription();

    if (fileError || jobError) {
      setErrorMessage(fileError || jobError);
      return;
    }


    setErrorMessage('');
    navigate('/loadingPage');
  };

  return (
    <>
      <div className="job-wrapper">
        {/* LEFT COLUMN: Resume Upload */}
        <div className="left-panel">
          <h2>Upload Resume</h2>
          <div className="upload-box">Your upload component here</div>
          <form>
            <input
              ref={fileUploadRef}
              type="file"
              accept="application/pdf"
              onChange={checkFile}
            />
          </form>
        </div>

        {/* RIGHT COLUMN: Job Description */}
        <div className="right-panel">
          <h2>Paste Job Description</h2>
          <textarea
            value={userInfo.jobDescription}
            onChange={updateJobText}
            placeholder="Paste the job description here..."
            ref={jobDescriptionRef}
          />
        </div>
      </div>

      {/* Bottom-aligned Submit Button and Error Message */}
      <div className="submit-section" style={{ position: 'fixed', bottom: '20px', width: '100%', textAlign: 'center' }}>
        <button onClick={handleClick}>Submit</button>
        {submitted && errorMessage && (
          <p style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</p>
        )}
      </div>
    </>
  );
}

export default JobDescription;
