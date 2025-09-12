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

    navigate("/loadingPage");
    //UNCOMMENT BELOW WHEN EVERYTHING IS READY. BUT THIS IS WORKING FINE. DON'T WANT TO WASTE TOKENS
    // try {
    //   const serverResponseJSON = await responseFromServerJSON();
    //   if (serverResponseJSON && serverResponseJSON.data && serverResponseJSON.data.parsedResume) {
    //     userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume);
    //   }
    //   console.log("Parsed Resume Data: " + JSON.stringify(userInfo.parsedResumeData));
    // } catch (err) {
    //   console.error("Error in getting the JSON extraction:", err);
    //   return;
    // }
    userInfo.setParsedResumeData(
      {
        "personalInfo": {
          "name": "Sumit Mantri",
          "location": "Mountain House, CA",
          "email": "smantri@ucdavis.edu",
          "phone": "669-268-7993",
          "links": [
            {
              "label": "GitHub",
              "url": ""
            }
          ]
        },
        "experience": [
          {
            "organization": "UC Davis Research - Dr. Tagkopoulos Lab",
            "title": "Researcher",
            "startDate": "May 2025",
            "endDate": "Present",
            "description": [
              "Working under Phd. Student Pranav Gupta in implementing classification models for peptides through transformers, 1D Convolution, and other RNN layers for sequences of data",
              "Understood the D3PM model implementation and fine tuning of the model in creating synthetic sequences that can be tested in real world"
            ]
          },
          {
            "organization": "Artificial Intelligence Student Collective",
            "title": "SWE in Object Detection",
            "startDate": "October 2024",
            "endDate": "Present",
            "description": [
              "Web-Scraping to gather data for our test set via Selenium and chrome Web Driver",
              "Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user",
              "Implementing customizable volume output based on proximity of the object that are in focus"
            ]
          },
          {
            "organization": "Deep Learning.AI",
            "title": "Student",
            "startDate": "June 2024",
            "endDate": "October 2024",
            "description": [
              "Acquired in-depth knowledge of supervised learning techniques",
              "Developed and optimized neural network architectures, including Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), LSTMs, and Transformers Network.",
              "Enhanced model performance using techniques such as Dropout, Batch Normalization, and Xavier/He initialization.",
              "Gained expertise in theoretical concepts and applied them to real-world problems in Python and TensorFlow, with practical experience in speech recognition, music synthesis, chatbots, machine translation, and Natural Language Processing (NLP)."
            ]
          },
          {
            "organization": "Cisco",
            "title": "Programmer/Marketer (Job Shadow)",
            "startDate": "June 2022",
            "endDate": "July 2022",
            "description": [
              "Expanded industry knowledge and professional network through engagement with Cisco employees, and gained valuable insights into the company's organizational structure",
              "Developed a marketing strategy during a hackathon, conducting surveys with Cisco employees on mental health to inform solution implementation",
              "Served as programming lead for the hackathon team alongside my colleague, developing a personalized mental health Webex chatbot named Carely to address user needs using Javascript and Express"
            ]
          }
        ],
        "education": [
          {
            "institution": "University of California, Davis",
            "degree": "Computer Science and Statistics",
            "areaOfStudy": "Machine Learning Track",
            "gradDate": "May 2025"
          }
        ],
        "skills": [
          "Python 3",
          "C++",
          "Java",
          "R",
          "MATLAB",
          "HTML",
          "CSS",
          "Node.JS",
          "Javascript",
          "MongoDB",
          "TensorFlow",
          "Keras",
          "NumPy",
          "Pandas",
          "scikit-learn",
          "React",
          "Express",
          "Selenium",
          "Transformers",
          "Convolutional Neural Networks (CNNs)",
          "Recurrent Neural Networks (RNNs)",
          "LSTMs",
          "YOLO",
          "U-Net",
          "XGBoost",
          "Random Forest",
          "Logistic Regression",
          "Natural Language Processing (NLP)",
          "GridSearchCV",
          "RandomizedSearchCV",
          "StratifiedKFold",
          "Dropout",
          "Batch Normalization",
          "Visual Studio Code",
          "R Studio",
          "Jupyter",
          "Git",
          "GitHub",
          "Compass"
        ],
        "projects": [
          {
            "name": "Image Segmentation",
            "startDate": "June 2024",
            "endDate": "July 2024",
            "description": [
              "Built a U-Net convolutional neural network in TensorFlow/Keras for semantic image segmentation on a self-driving car dataset.",
              "Preprocessed image and mask data using tf.data pipelines and custom augmentation functions to prepare inputs for training.",
              "Achieved 90% accuracy by designing and testing modular U-Net blocks (convolution, pooling, upsampling) to ensure correct architecture using model summaries"
            ]
          },
          {
            "name": "Chronic Kidney Disease Detection",
            "startDate": "March 2025",
            "endDate": "April 2025",
            "description": [
              "Built machine learning models to classify Chronic Kidney Disease stages using patient lab data.",
              "Preprocessed features with imputation, scaling, and one-hot encoding through scikit-learn pipelines.",
              "Performed detailed error analysis by comparing training and validation performance to identify underfitting and overfitting. Then, based on the findings, I've adjusted model complexity and tuned hyperparameters using GridSearchCV and RandomizedSearchCV to improve generalization",
              "Boosted test accuracy from ~61% with logistic regression to ~75% with Random Forest, and lastly ~98% accuracy with XGBoost, verified through StratifiedKFold learning curves."
            ]
          }
        ],
        "certifications": []
      });
    //UNCOMMENT BELOW WHEN EVERYTHING IS READY. BUT THIS IS WORKING FINE. DON'T WANT TO WASTE TOKENS
    // try {
    //   const serverResponseKeywords = await serverResponseJobDescription(); // <- This works, but too much token use. So don't want to reiterate. 
    //   if (serverResponseKeywords && serverResponseKeywords.data && serverResponseKeywords.data.keyWordExtraction) {
    //     userInfo.setJobKeywords(serverResponseKeywords.data.keyWordExtraction);
    //   }
    //   console.log("Job Keywords: " + userInfo.jobkeywords);
    // } catch (err) {
    //   console.error("Error in getting the keyword extraction:", err);
    //   return;
    // }


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
