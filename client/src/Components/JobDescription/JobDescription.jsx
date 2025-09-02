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
    userInfo.setJobDescription(jobDescriptionRef.current.value);
    return "";
  };
  const serverResponseJobDescription = async () => {
    const jobDescription = userInfo.jobDescription;
    try {
      const response = await axios.post('/loadingPage/JobDescriptionKeyWord', {jobDescription}, {
        headers: { 'Content-Type': 'application/json' }
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
    try {
    const serverResponse = await axios.post(
      '/loadingPage/extractJSON',
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
  const handleClick = async (e) => {
    e.preventDefault();
    
    const fileError = checkFile();
    const jobError = checkJobDescription();
    console.log("File error: " + fileError);
    if (fileError || jobError) {
      setErrorMessage(fileError || jobError);
      return;
    }
    setSubmitted(true);

    console.log("Checking if surpassed fileError or jobError");
    setErrorMessage('');
    //AI Message.content is what's being stored. 
    //const serverResponseJSON = responseFromServerJSON(); // <- This works, but too much token use. So don't want to reiterate. 
    //userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume);
    //userInfo.setParsedResumeData("```json\n{\n  \"personalInfo\": {\n    \"name\": \"Sumit Mantri\",\n    \"email\": \"smantri@ucdavis.edu\",\n    \"phone\": \"669-268-7993\",\n    \"location\": \"Mountain House, CA\",\n    \"links\": [\n      {\n        \"label\": \"GitHub\",\n        \"url\": \"\"\n      }\n    ]\n  },\n  \"experience\": [\n    {\n      \"company\": \"UC Davis Research - Dr. Tagkopoulos Lab\",\n      \"title\": null,\n      \"startDate\": \"May 2025\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Understood the D3PM model implementation and fine tuning of the model in creating synthetic sequences that can be tested in real world\"\n      ]\n    },\n    {\n      \"company\": \"Artificial Intelligence Student Collective\",\n      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Davis\",\n      \"degree\": \"Computer Science and Statistics (Machine Learning Track)\",\n      \"startDate\": null,\n      \"endDate\": null,\n      \"gpa\": null\n    }\n  ],\n  \"skills\": [\n    \"Python 3\",\n    \"C++\",\n    \"Java\",\n    \"R\",\n    \"MATLAB\",\n    \"HTML\",\n    \"CSS\",\n    \"Node.JS\",\n    \"Javascript\",\n    \"MongoDB\"\n  ],\n  \"projects\": [\n    {\n      \"name\": \"Image Segmentation\      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Davis\",\n      \"degree\": \"Computer Science and Statistics (Machine Learning Track)\",\n      \"startDate\": null,\n      \"endDate\": null,\n      \"gpa\": null\n    }\n  ],\n  \"skills\": [\n    \"Python 3\",\n    \"C++\",\n    \"Java\",\n    \"R\",\n    \"MATLAB\",\n    \"HTML\",\n    \"CSS\",\n    \"Node.JS\",\n       \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Davis\",\n      \"degree\": \"Computer Science and Statistics (Machine Learning Track)\",\n      \"startDate\": null,\n      \"endDate\": null,\n      \"gpa\": null\n    }\n  ],\n  \"skills\": [\n    \"Python 3\",\n      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Davis\",\n      \"degree\": \"Computer Science and Statistics (Machine Learning Track)\",\n      \"startDate\      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Dav      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Dav      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\"      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\"      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used      \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"title\": \"SWE in Objected Detection\",\n      \"startDate\": \"October 2024\",\n      \"endDate\": \"Present\",\n      \"location\": null,\n      \"description\": null,\n      \"responsibilities\": [\n        \"Web-Scraping to gather data for our test set via Selenium and chrome Web Driver\",\n        \"Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user\"\n      ]\n    }\n  ],\n  \"education\": [\n    {\n      \"institution\": \"University of California, Davis\",\n      \"degree\": \"Computer Science and Statistics (Machine Learning Track)\",\n      \"startDate\": null,\n      \"endDate\": null,\n      \"gpa\": null\n    }\n  ],\n  \"skills\": [\n    \"Python 3\",\n    \"C++\",\n    \"Java\",\n    \"R\",\n    \"MATLAB\",\n    \"HTML\",\n    \"CSS\",\n    \"Node.JS\",\n    \"Javascript\",\n    \"MongoDB\"\n  ],\n  \"projects\": [\n    {\n      \"name\": \"Image Segmentation\",\n      \"startDate\": \"June 2024\",\n      \"endDate\": \"July 2024\",\n      \"description\": [\n        \"Built a U-Net convolutional neural network in TensorFlow/Keras for semantic image segmentation on a self-driving car dataset.\",\n        \"Achieved 90% accuracy by designing and testing modular U-Net blocks (convolution, pooling, upsampling) to ensure correct architecture using model summaries\"\n      ],\n      \"link\": null\n    }\n  ],\n  \"certifications\": []\n}\n```");
    userInfo.setParsedResumeData({
      personalInfo: {
        name: "Sumit Mantri",
        email: "smantri@ucdavis.edu",
        phone: "669-268-7993",
        location: "Mountain House, CA",
        links: [
          { label: "GitHub", url: "" }
        ]
      },
      experience: [
        {
          company: "UC Davis Research - Dr. Tagkopoulos Lab",
          title: null,
          startDate: "May 2025",
          endDate: "Present",
          location: null,
          description: null,
          responsibilities: [
            "Understood the D3PM model implementation and fine tuning of the model in creating synthetic sequences that can be tested in real world"
          ]
        },
        {
          company: "Artificial Intelligence Student Collective",
          title: "SWE in Objected Detection",
          startDate: "October 2024",
          endDate: "Present",
          location: null,
          description: null,
          responsibilities: [
            "Web-Scraping to gather data for our test set via Selenium and chrome Web Driver",
            "Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user"
          ]
        }
      ],
      education: [
        {
          institution: "University of California, Davis",
          degree: "Computer Science and Statistics (Machine Learning Track)",
          startDate: null,
          endDate: null,
          gpa: null
        }
      ],
      skills: [
        "Python 3",
        "C++",
        "Java",
        "R",
        "MATLAB",
        "HTML",
        "CSS",
        "Node.JS",
        "Javascript",
        "MongoDB"
      ],
      projects: [
        {
          name: "Image Segmentation",
          startDate: "June 2024",
          endDate: "July 2024",
          description: [
            "Built a U-Net convolutional neural network in TensorFlow/Keras for semantic image segmentation on a self-driving car dataset.",
            "Achieved 90% accuracy by designing and testing modular U-Net blocks (convolution, pooling, upsampling) to ensure correct architecture using model summaries"
          ],
          link: null
        }
      ],
      certifications: []
    });
    try {
      const serverResponse = await serverResponseJobDescription();

      if (serverResponse && serverResponse.data && serverResponse.data.keyWordExtraction) {
        userInfo.setJobKeywords(serverResponse.data.keyWordExtraction);
      } else {
        console.error("Backend response missing keyWordExtraction:", serverResponse?.data);
        setErrorMessage("Server did not return keywords");
      }

      navigate("/loadingPage");
    } catch (err) {
      console.error("Error in getting the keyword extraction:", err);
      setErrorMessage("Failed to fetch job keywords. Please try again.");
    }
    //const serverResponse = await serverResponseJobDescription();
    //userInfo.setJobKeywords(serverResponse.data.keyWordExtraction);
    //maybe create a context that's going to store the jobdescription and the JSON extraction of the resume
    //console.log("Server Response object: " + JSON.stringify(serverResponse));
    //navigate('/loadingPage');
  };
  return (
      <form encType="multipart/form-data" method='post'>
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
