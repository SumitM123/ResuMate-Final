import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobDescription.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FormData } from 'formdata-node';

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
  const serverResponseJobDescription = async () => {
    const jobDescription = userInfo.JobDescription;
    try {
      const response = await axios.post('/loadingPage/JobDescriptionKeyWord', jobDescription, {
        header: { 'Content-Type': 'text/plain' }
      });
      return response;
    } catch (err) {
      console.log("Error in getting the keyword extraction: " + err);
      return "Error";
    }
  }
  const responseFromServerJSON = async () => {
    const sendToServer = new FormData();
    sendToServer.append('resume', userInfo.file);
    //sendToServer.append('jobDescription', userInfo.jobDescription);
    try {
    const serverResponse = await axios.post(
      '/loadingPage/extractJSONAndKeywords',
      sendToServer,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    console.log("JSON has been extracted");
    return serverResponse;
    } catch (err) {
      console.error("Upload failed:", err);
      return "Error has occured with the server response";
    }
  }
  const handleClick = (e) => {
    e.preventDefault();
    setSubmitted(true);

    
    const fileError = checkFile();
    const jobError = checkJobDescription();
    console.log("File error: " + fileError);
    if (fileError || jobError) {
      setErrorMessage(fileError || jobError);
      return;
    }

    console.log("Checking if surpassed fileError or jobError");
    setErrorMessage('');
    //AI Message.content is what's being stored. 
    //const serverResponseJSON = responseFromServerJSON(); <- This works, but too much token use. So don't want to reiterate. 
    //userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume)
    const serverResponseJobDescription = serverResponseJobDescription();
    userInfo.setJobKeywords(serverResponseJobDescription.data.keyWordExtraction);
    //maybe create a context that's going to store the jobdescription and the JSON extraction of the resume
    //console.log("Server Response object: " + JSON.stringify(serverResponse));
    navigate('/loadingPage');
  };
  return (
      <form enctype="multipart/form-data" method='post'>
        <div className="job-wrapper">
          {/* LEFT COLUMN: Resume Upload */}
          <div className="left-panel">
            <h2>Upload Resume</h2>
            <div className="upload-box">Your upload component here</div>

              <input
                ref={fileUploadRef}
                type="file"
                accept="application/pdf"
                onChange={checkFile}
              />
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
          {/* Bottom-aligned Submit Button and Error Message */}
          <div className="submit-section" style={{ position: 'fixed', bottom: '20px', width: '100%', textAlign: 'center' }}>
            <button onClick={handleClick} type='submit'>Submit</button>
            {submitted && errorMessage && (
              <p style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</p>
            )}
          </div>
        </div>
      </form>
  );
}

export default JobDescription;
