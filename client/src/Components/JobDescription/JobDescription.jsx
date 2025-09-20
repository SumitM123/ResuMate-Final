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
      const response = await axios.post('https://localhost:5000/loadingPage/JobDescriptionKeyWord', {jobDescription}, {
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
    navigate('/loadingPage');
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

    // UNCOMMENT BELOW WHEN EVERYTHING IS READY. BUT THIS IS WORKING FINE. DON'T WANT TO WASTE TOKENS
    try {
      console.log("Getting the JSON extraction Resume");
      const serverResponseJSON = await responseFromServerJSON();
      if (serverResponseJSON && serverResponseJSON.data && serverResponseJSON.data.parsedResume) {
        userInfo.setParsedResumeData(serverResponseJSON.data.parsedResume);
      }
      console.log("Parsed Resume Data: " + JSON.stringify(userInfo.parsedResumeData));
    } catch (err) {
      console.error("Error in getting the JSON extraction:", err);
      return;
    }
    // userInfo.setParsedResumeData(
    //   {
    //     "personalInfo": {
    //       "name": "Sumit Mantri",
    //       "location": "Mountain House, CA",
    //       "email": "smantri@ucdavis.edu",
    //       "phone": "669-268-7993",
    //       "links": [
    //         {
    //           "label": "GitHub",
    //           "url": ""
    //         }
    //       ]
    //     },
    //     "experience": [
    //       {
    //         "organization": "UC Davis Research - Dr. Tagkopoulos Lab",
    //         "title": "Researcher",
    //         "startDate": "May 2025",
    //         "endDate": "Present",
    //         "description": [
    //           "Working under Phd. Student Pranav Gupta in implementing classification models for peptides through transformers, 1D Convolution, and other RNN layers for sequences of data",
    //           "Understood the D3PM model implementation and fine tuning of the model in creating synthetic sequences that can be tested in real world"
    //         ]
    //       },
    //       {
    //         "organization": "Artificial Intelligence Student Collective",
    //         "title": "SWE in Object Detection",
    //         "startDate": "October 2024",
    //         "endDate": "Present",
    //         "description": [
    //           "Web-Scraping to gather data for our test set via Selenium and chrome Web Driver",
    //           "Used You Only Look Once (YOLO) model through TensorFlow framework to provide live haptic feedback to the user",
    //           "Implementing customizable volume output based on proximity of the object that are in focus"
    //         ]
    //       },
    //       {
    //         "organization": "Deep Learning.AI",
    //         "title": "Student",
    //         "startDate": "June 2024",
    //         "endDate": "October 2024",
    //         "description": [
    //           "Acquired in-depth knowledge of supervised learning techniques",
    //           "Developed and optimized neural network architectures, including Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), LSTMs, and Transformers Network.",
    //           "Enhanced model performance using techniques such as Dropout, Batch Normalization, and Xavier/He initialization.",
    //           "Gained expertise in theoretical concepts and applied them to real-world problems in Python and TensorFlow, with practical experience in speech recognition, music synthesis, chatbots, machine translation, and Natural Language Processing (NLP)."
    //         ]
    //       },
    //       {
    //         "organization": "Cisco",
    //         "title": "Programmer/Marketer (Job Shadow)",
    //         "startDate": "June 2022",
    //         "endDate": "July 2022",
    //         "description": [
    //           "Expanded industry knowledge and professional network through engagement with Cisco employees, and gained valuable insights into the company's organizational structure",
    //           "Developed a marketing strategy during a hackathon, conducting surveys with Cisco employees on mental health to inform solution implementation",
    //           "Served as programming lead for the hackathon team alongside my colleague, developing a personalized mental health Webex chatbot named Carely to address user needs using Javascript and Express"
    //         ]
    //       }
    //     ],
    //     "education": [
    //       {
    //         "institution": "University of California, Davis",
    //         "degree": "Computer Science and Statistics",
    //         "areaOfStudy": "Machine Learning Track",
    //         "gradDate": "May 2025"
    //       }
    //     ],
    //     "skills": [
    //       "Python 3",
    //       "C++",
    //       "Java",
    //       "R",
    //       "MATLAB",
    //       "HTML",
    //       "CSS",
    //       "Node.JS",
    //       "Javascript",
    //       "MongoDB",
    //       "TensorFlow",
    //       "Keras",
    //       "NumPy",
    //       "Pandas",
    //       "scikit-learn",
    //       "React",
    //       "Express",
    //       "Selenium",
    //       "Transformers",
    //       "Convolutional Neural Networks (CNNs)",
    //       "Recurrent Neural Networks (RNNs)",
    //       "LSTMs",
    //       "YOLO",
    //       "U-Net",
    //       "XGBoost",
    //       "Random Forest",
    //       "Logistic Regression",
    //       "Natural Language Processing (NLP)",
    //       "GridSearchCV",
    //       "RandomizedSearchCV",
    //       "StratifiedKFold",
    //       "Dropout",
    //       "Batch Normalization",
    //       "Visual Studio Code",
    //       "R Studio",
    //       "Jupyter",
    //       "Git",
    //       "GitHub",
    //       "Compass"
    //     ],
    //     "projects": [
    //       {
    //         "name": "Image Segmentation",
    //         "startDate": "June 2024",
    //         "endDate": "July 2024",
    //         "description": [
    //           "Built a U-Net convolutional neural network in TensorFlow/Keras for semantic image segmentation on a self-driving car dataset.",
    //           "Preprocessed image and mask data using tf.data pipelines and custom augmentation functions to prepare inputs for training.",
    //           "Achieved 90% accuracy by designing and testing modular U-Net blocks (convolution, pooling, upsampling) to ensure correct architecture using model summaries"
    //         ]
    //       },
    //       {
    //         "name": "Chronic Kidney Disease Detection",
    //         "startDate": "March 2025",
    //         "endDate": "April 2025",
    //         "description": [
    //           "Built machine learning models to classify Chronic Kidney Disease stages using patient lab data.",
    //           "Preprocessed features with imputation, scaling, and one-hot encoding through scikit-learn pipelines.",
    //           "Performed detailed error analysis by comparing training and validation performance to identify underfitting and overfitting. Then, based on the findings, I've adjusted model complexity and tuned hyperparameters using GridSearchCV and RandomizedSearchCV to improve generalization",
    //           "Boosted test accuracy from ~61% with logistic regression to ~75% with Random Forest, and lastly ~98% accuracy with XGBoost, verified through StratifiedKFold learning curves."
    //         ]
    //       }
    //     ],
    //     "certifications": []
    //   });
    //UNCOMMENT BELOW WHEN EVERYTHING IS READY. BUT THIS IS WORKING FINE. DON'T WANT TO WASTE TOKENS
    try {
      console.log("Getting the keyword extraction from job description");
      const serverResponseKeywords = await serverResponseJobDescription(); // <- This works, but too much token use. So don't want to reiterate. 
      if (serverResponseKeywords && serverResponseKeywords.data && serverResponseKeywords.data.keyWordExtraction) {
        userInfo.setJobKeywords(serverResponseKeywords.data.keyWordExtraction);
      }
      console.log("Job Keywords: " + userInfo.jobkeywords);
    } catch (err) {
      console.error("Error in getting the keyword extraction:", err);
      return;
    }

    // navigate('/loadingPage');
/*
 Actual job description: 
 The Company
PayPal has been revolutionizing commerce globally for more than 25 years. Creating innovative experiences that make moving money, selling, and shopping simple, personalized, and secure, PayPal empowers consumers and businesses in approximately 200 markets to join and thrive in the global economy.

We operate a global, two-sided network at scale that connects hundreds of millions of merchants and consumers. We help merchants and consumers connect, transact, and complete payments, whether they are online or in person. PayPal is more than a connection to third-party payment networks. We provide proprietary payment solutions accepted by merchants that enable the completion of payments on our platform on behalf of our customers.

We offer our customers the flexibility to use their accounts to purchase and receive payments for goods and services, as well as the ability to transfer and withdraw funds. We enable consumers to exchange funds more safely with merchants using a variety of funding sources, which may include a bank account, a PayPal or Venmo account balance, PayPal and Venmo branded credit products, a credit card, a debit card, certain cryptocurrencies, or other stored value products such as gift cards, and eligible credit card rewards. Our PayPal, Venmo, and Xoom products also make it safer and simpler for friends and family to transfer funds to each other. We offer merchants an end-to-end payments solution that provides authorization and settlement capabilities, as well as instant access to funds and payouts. We also help merchants connect with their customers, process exchanges and returns, and manage risk. We enable consumers to engage in cross-border shopping and merchants to extend their global reach while reducing the complexity and friction involved in enabling cross-border trade.

Our beliefs are the foundation for how we conduct business every day. We live each day guided by our core values of Inclusion, Innovation, Collaboration, and Wellness. Together, our values ensure that we work together as one global team with our customers at the center of everything we do – and they push us to ensure we take care of ourselves, each other, and our communities.

Job Description Summary:
At PayPal, we’re literally reinventing how the world pays and gets paid. We understand that it’s about people. We connect individuals to let them shop, get paid, donate, and send money using today’s technology with the confidence that comes from the security and control PayPal enables. Are you ready to help us change the world? The world’s leading payments company, PayPal, brings together a family of brands that are revolutionizing the way people move money. At PayPal you will be immersed in an amazing community with a vibrant culture that thrives on innovation, collaboration, inclusion, and wellness. Software Engineer Interns at PayPal develop innovative solutions and high-quality products that touch millions of people every day. Our engineers solve some of the most complex technical problems in the world of connected payments across multiple business units, (including PayPal, Braintree, Venmo, Paydiant). We are looking for the highest levels of technical talent and programming skills, as well as a keen desire to deeply understand our products and services to push our technology forward with respect to functionality, performance, reliability, and scalability.

Job Description:
As a Full Stack Software Engineer Intern, you’ll work alongside the best and the brightest engineering talent in the industry. As a core participant of your team, you’ll estimate engineering efforts, design your changes, implement, and test your changes, push to live, and triage production issues. You need to be dynamic, collaborative, and curious as we build new experiences, improve existing products, and develop distributed systems powering the world’s largest e-commerce and payments websites at a scale only a few companies can match.

Key Responsibilities:

Code high-volume and scalable software (front-end and back-end focused). This may include creating web applications using React/Node, creating back-end services using Java, ExpressJS/NodeJS, SQL, REST API, and/or building and developing new user-facing experiences. 
Partner closely with cross functional teams in design, product, and other business units 


 Basic Requirements:

Must possess basic Front-End Skills in:

HTML/CSS – Understanding layout, semantics, and responsive design. 
JavaScript (ES6+) – Ability to write and manipulate DOM elements. 
Front-end frameworks – Familiarity with React, Vue, or Angular (React is the most common). 
Basic UI/UX Awareness – Understanding how to build usable, accessible interfaces. 


Must possess basic Back-End Skills in:

Server-Side Programming – Experience with languages like: 
Node.js (JavaScript/TypeScript) 
Python (Django or Flask) 
Java, Ruby, Go, etc. 
API Development – Build and consume RESTful APIs (GraphQL is a plus). 
Authentication – Understand how login systems work (JWT, sessions, OAuth). 


 Databases

SQL – PostgreSQL, MySQL 
NoSQL – MongoDB or similar 
Know how to read/write data and model simple schemas. 


 Tools & Dev Practices

Version Control – Git/GitHub 
Basic Deployment Knowledge – Hosting apps on Heroku, Vercel, Render, Netlify, or similar. 
Internship Program Information and Requirements: 
This is a Summer 2026 Internship program. Spring and Fall 2026 internships are not available. 
Must currently be pursuing Bachelor’s or Master’s degree in Computer Science or related field from an accredited college or university. 
Must be returning to school in the Fall of 2026. 
Must reside in the U.S. during the Summer internship program. 
Must be able to obtain authorization to work in the U.S. for the summer. 


Position Location: Varies within U.S. PayPal Office Locations

globaluniversityinternsoftwareengineering

PayPal does not charge candidates any fees for courses, applications, resume reviews, interviews, background checks, or onboarding. Any such request is a red flag and likely part of a scam. To learn more about how to identify and avoid recruitment fraud please visit https://careers.pypl.com/contact-us.

For the majority of employees, PayPal's balanced hybrid work model offers 3 days in the office for effective in-person collaboration and 2 days at your choice of either the PayPal office or your home workspace, ensuring that you equally have the benefits and conveniences of both locations.

Our Benefits:

At PayPal, we’re committed to building an equitable and inclusive global economy. And we can’t do this without our most important asset-you. That’s why we offer benefits to help you thrive in every stage of life. We champion your financial, physical, and mental health by offering valuable benefits and resources to help you care for the whole you.

We have great benefits including a flexible work environment, employee shares options, health and life insurance and more. To learn more about our benefits please visit https://www.paypalbenefits.com

Who We Are:

To learn more about our culture and community visit https://about.pypl.com/who-we-are/default.aspx

Commitment to Diversity and Inclusion

PayPal provides equal employment opportunity (EEO) to all persons regardless of age, color, national origin, citizenship status, physical or mental disability, race, religion, creed, gender, sex, pregnancy, sexual orientation, gender identity and/or expression, genetic information, marital status, status with regard to public assistance, veteran status, or any other characteristic protected by federal, state, or local law. In addition, PayPal will provide reasonable accommodations for qualified individuals with disabilities. If you are unable to submit an application because of incompatible assistive technology or a disability, please contact us at paypalglobaltalentacquisition@paypal.com.

Belonging at PayPal:

Our employees are central to advancing our mission, and we strive to create an environment where everyone can do their best work with a sense of purpose and belonging. Belonging at PayPal means creating a workplace with a sense of acceptance and security where all employees feel included and valued. We are proud to have a diverse workforce reflective of the merchants, consumers, and communities that we serve, and we continue to take tangible actions to cultivate inclusivity and belonging at PayPal.

Any general requests for consideration of your skills, please Join our Talent Community.

We know the confidence gap and imposter syndrome can get in the way of meeting spectacular candidates. Please don’t hesitate to apply.
 */
    // userInfo.setJobKeywords(
    //   {
    //     "Technical_Skills": {
    //       "Programming_Languages": [
    //         "JavaScript (ES6+)",
    //         "TypeScript",
    //         "Java",
    //         "Python (Django, Flask)",
    //         "Ruby",
    //         "Go"
    //       ],
    //       "Front_End": [
    //         "HTML",
    //         "CSS",
    //         "React",
    //         "Vue",
    //         "Angular",
    //         "Responsive Design",
    //         "DOM Manipulation"
    //       ],
    //       "Back_End": [
    //         "Node.js",
    //         "Express.js",
    //         "REST API",
    //         "GraphQL",
    //         "Authentication (JWT, OAuth, Sessions)"
    //       ],
    //       "Databases": [
    //         "SQL",
    //         "PostgreSQL",
    //         "MySQL",
    //         "NoSQL",
    //         "MongoDB",
    //         "Data Modeling"
    //       ],
    //       "Tools_Dev_Practices": [
    //         "Git",
    //         "GitHub",
    //         "Heroku",
    //         "Vercel",
    //         "Render",
    //         "Netlify",
    //         "CI/CD",
    //         "API Development"
    //       ],
    //       "Other": [
    //         "UI/UX Awareness",
    //         "Accessibility",
    //         "Scalable Software Development",
    //         "Distributed Systems"
    //       ]
    //     },
    //     "Soft_Skills": [
    //       "Collaboration",
    //       "Communication",
    //       "Problem-solving",
    //       "Curiosity",
    //       "Adaptability",
    //       "Teamwork",
    //       "Innovation"
    //     ],
    //     "Experience_Level": [
    //       "Internship",
    //       "Entry-level",
    //       "Summer 2026",
    //       "Returning student"
    //     ],
    //     "Industry_Terms": [
    //       "Full Stack Development",
    //       "Scalable Systems",
    //       "High-volume Software",
    //       "E-commerce",
    //       "Payments Platform",
    //       "Cross-border Shopping",
    //       "Cross-border Trade",
    //       "Risk Management",
    //       "Authorization & Settlement",
    //       "End-to-End Payments Solution"
    //     ],
    //     "Education_Certifications": [
    //       "Bachelor’s in Computer Science (or related field)",
    //       "Master’s in Computer Science (or related field)",
    //       "Returning to school Fall 2026",
    //       "Work authorization in the U.S."
    //     ],
    //     "Job_Functions": [
    //       "Estimate engineering efforts",
    //       "Design, implement, and test software changes",
    //       "Push code to live",
    //       "Triage production issues",
    //       "Build web applications (React/Node)",
    //       "Develop back-end services (Java, Node.js, Express.js)",
    //       "Partner with cross-functional teams",
    //       "Develop user-facing experiences",
    //       "Ensure performance, reliability, scalability"
    //     ]
    //   });

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
