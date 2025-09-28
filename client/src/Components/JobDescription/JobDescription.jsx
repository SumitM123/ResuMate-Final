import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobDescription.css';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function JobDescription() {
  const userInfo = useUser();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  console.log("User Context from session storage:", sessionStorage.getItem('userContext'));
  const [fileUpload, setFileUpload] = useState(JSON.parse(sessionStorage.getItem('userContext')).file);
  const [jobDescriptionVal, setJobDescriptionVal] = useState(JSON.parse(sessionStorage.getItem('userContext')).jobDescription);

  useEffect(() => {
    if(fileUpload) {
      sessionStorage.setItem('userContext', JSON.stringify({
        ...JSON.parse(sessionStorage.getItem('userContext')),
        file: fileUpload
      }));
    }
    if(jobDescriptionVal) {
      sessionStorage.setItem('userContext', JSON.stringify({
        ...JSON.parse(sessionStorage.getItem('userContext')),
        jobDescription: jobDescriptionVal
      }));
    } 
    if(fileUpload && jobDescriptionVal) { 
      setErrorMessage('');
    } else {
      setErrorMessage('Please upload a file and enter a job description.');
    }
  }, [fileUpload, jobDescriptionVal]); 
  const navigate = useNavigate();

  const checkFile = (e) => {
    const selectedFile = e.target.files[0];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if(selectedFile && fileExtension === 'pdf') {
      setFileUpload(prevVal => {
        return selectedFile;
      });
    } else {
      setFileUpload(null);
    }
  };

  const checkJobDescription = (e) => {
    const jobDescriptionSent = e.target.value;
    if (!jobDescriptionSent.trim()) {
      jobDescriptionSent = "";
    } 
    setJobDescriptionVal(jobDescriptionSent);
  };
  const serverResponseJobDescription = async () => {
    const jobDescription = jobDescriptionVal;
    console.log("Sending job description to backend:", jobDescription);
    try {
      const response = await axios.post('http://localhost:5000/loadingPage/JobDescriptionKeyWord', {jobDescription}, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    } catch (err) {
      console.error("Error in getting the keyword extraction: " + err);
      return { data: { keyWordExtraction: null, error: err } }; // Return a fallback object
    }
  }
  const responseFromServerJSON = async () => {
    const sendToServer = new FormData();
    sendToServer.append('resume', fileUpload);
    try {
      const serverResponse = await axios.post('http://localhost:5000/loadingPage/extractJSON', sendToServer,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return serverResponse;
    } catch (err) {
      return console.error("Upload failed:", err);
    }
  }
  const handleClick = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (errorMessage !== "") {
      console.log("There has been an eror with either file or job description");
      setSubmitted(false); 
      return;
    }
    console.log("Checking if surpassed fileError or jobError"); //GOOD
    setErrorMessage('');
    userInfo.setFile(fileUpload);
    userInfo.setJobDescription(jobDescriptionVal);
    navigate('/loadingPage');
    // UNCOMMENT BELOW WHEN EVERYTHING IS READY. BUT THIS IS WORKING FINE. DON'T WANT TO WASTE TOKENS
    try {
      const serverResponseJSON = await responseFromServerJSON();
      //console.log("Server Response Resume JSON: " + serverResponseJSON.data.parsedResume); //GOOD
      // if (serverResponseJSON && serverResponseJSON.data && serverResponseJSON.data.parsedResume) {
      //   userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume);
      // }
      userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume);
      //console.log("Parsed Resume Data from context: " + userInfo.parsedResumeData);
    } catch (err) {
      console.error("Error in getting the JSON extraction:", err);
      return;
    }
    try {
      const serverResponseKeywords = await serverResponseJobDescription(); // <- This works, but too much token use. So don't want to reiterate. 
      console.log("Getting the keyword extraction from job description: " + serverResponseKeywords.data.keyWordExtraction);
      // if (serverResponseKeywords && serverResponseKeywords.data && serverResponseKeywords.data.keyWordExtraction) {
      //   userInfo.setJobKeywords(serverResponseKeywords.data.keyWordExtraction);
      // }
      userInfo.setJobKeywords(serverResponseKeywords.data.keyWordExtraction);
      console.log("Job Keywords from context: " + userInfo.jobkeywords);
    } catch (err) {
      console.error("Error in getting the keyword extraction:", err);
      return;
    }



    // navigate('/loadingPage');
/*
 As a Software Developer, you’ll gain hands-on experience working on real-world projects that impact users globally. You’ll collaborate with designers and developers to build responsive, elegant, and user-friendly applications using modern web technologies.

Your Role And Responsibilities

You will: 

Participate in Agile development cycles: design, code, test, and support. 
Translate wireframes into functional user interfaces. 
Learn and apply best practices in software development and testing. 
Work with APIs, databases, and cloud-based services.

Who You Are

Curious, motivated, and eager to learn new technologies. 
A team player with strong communication and collaboration skills. 
Comfortable with debugging, problem-solving, and adapting to new challenges.

Preferred Education

Bachelor's Degree

Required Technical And Professional Expertise

Familiarity with HTML, CSS, JavaScript, and UI frameworks (React, Angular, Vue). 
Basic knowledge of backend technologies: Node.js, Java, Python, SQL. 
Understanding of software development tools (Git, IDEs) and version control. 
Exposure to automation testing frameworks and APIs. 
Awareness of operating systems, container technologies, and cloud platforms.

Preferred Technical And Professional Experience

Experience with cloud platforms (IBM Cloud, AWS, Azure).
Contributions to open-source projects.
Familiarity with Agile tools and methodologies.
Linux or Unix based OS
Any one modern programming language like GO, NodeJS, JavaScript, Python
Integrated development environments (e.g.: Eclipse, Visual Studio Code)
Familiarity with Source control management (e.g. Git): to enable teams to work together to manage changes to source code
Knowledge of containers, containers orchestration software, cloud platforms.
Knowledge of SQL and relational database technology (e.g. Postgres, MySQL, Db2, Oracle, SQL Server)
Knowledge of automating infrastructure, testing, and deployments using tools like Jenkins, Puppeteer, Selenium, Playwright, Cypress or any other automation framework
Knowledge of Deployment tools like Jenkins, Travis: for ensuring the latest software release is packaged correctly, tested, and deployed to an application server.
Development experience with REST API development
 */
  };
  return (
      <form encType="multipart/form-data" method='post'>
        <div className="job-wrapper">
          {/* LEFT COLUMN: Resume Upload */}
          <div className="left-panel">
            <h2>Upload Resume</h2>
            <div className="upload-box">Your upload component here</div>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => checkFile(e)}
              />
          </div>

          {/* RIGHT COLUMN: Job Description */}
          <div className="right-panel">
            <h2>Paste Job Description</h2>
            <textarea
              value={jobDescriptionVal}
              onChange={(e) => checkJobDescription(e)}
              placeholder="Paste the job description here..."
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
