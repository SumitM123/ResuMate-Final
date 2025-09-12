import react, {useEffect, useState} from 'react'
import axios from 'axios';
import { useUser } from '../../Components/context/UserContext.js'    // Navigate to the output page with the PDF and LaTeX content
import { useNavigate } from 'react-router-dom';

//Hooks much be called inside functional components or custom hook functions. BUt the code inside the hooks runs based on the specifics

function LoadingPage() {
  const userInfo = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //JSON with {sucess, message, and data}
  // const handleFileUpload = async () => {
  //   if (!userInfo.file) {
  //     console.log("No file to upload");
  //     return;
  //   }

  //   // Check file size (limit to 10MB)
  //   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  //   if (userInfo.file.size > MAX_FILE_SIZE) {
  //     const errorMsg = `File size exceeds 10MB limit. Please upload a smaller file.`;
  //     setError(errorMsg);
  //     throw new Error(errorMsg);
  //   }

  //   try {
  //     // Compress PDF if needed (future implementation)
      
  //     // Convert file to base64 using Promise-based approach
  //     const base64Data = await new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = (e) => resolve(e.target.result);
  //       reader.onerror = (e) => reject(e);
  //       reader.readAsDataURL(userInfo.file);
  //     });

  //     // Send to server with increased timeout
  //     const response = await axios.post('/loadingPage/', {
  //       payLoad: base64Data,
  //     }, {
  //       timeout: 60000, // 60 second timeout
  //       maxContentLength: Infinity,
  //       maxBodyLength: Infinity,
  //       headers: {
  //         'Content-Type': 'application/json',
  //       }
  //     });

  //     if (!response.data.success) {
  //       throw new Error(response.data.error || 'Failed to process resume');
  //     }

  //     console.log("Successfully sent to parser", response);
      
  //     return response.data.data;
  //   } catch (error) {
  //     console.log("Here is the error", error);
  //     setError(error.message);
  //     throw error;
  //   }
  // };
  //JSON with {sucess, message, and data}
  // const checkJobDescription = async () => {
  //   try {
  //     const accuracyResponse = await axios.post('/loadingPage/jobDescriptionKeyWord', 
  //       {
  //         jobDescription: userInfo.jobDescription
  //       }
  //     );
  //     console.log("Successfully sent to job description parser", accuracyResponse);
  //     return accuracyResponse.data;
  //   } catch (error) {
  //     console.error("Error in job description parsing:", error);
  //     setError(error.message);
  //     throw error;
  //   }
  // }
/*

  * When getting a response from the llm, it's ob AIMessage object. Inside the object, the content has the actual text of the message. 
  * Now you have two variables, handleFileUpload, and checkJobDescription.
    handleFileUpload has is a JSON, and the data is also a JSON
    checkJobDescription is a JSON, with the data is not a JSON

  * Create a hashmap of the keywords, and write a program that'll linearly search through the resume and 
    check for those keywords. Then, it'll return to the user on what keywords aren't matched.

  * Based on those keywords that are missing, create a prompt to the LLM that can take the missing keywords
    and try to input that into the resume. Also determine if the way the user inputed the keywords is accrate
      This is done by editing the JSON parser.

  * Prompt to the LLM of the edited JSON structure, and input it into JAKE'S RESUME to make it ATS
      friendly
  
  * Whenever possible, use the XYZ format for the Resume. X : What was achieved?
      Y: How was it measured? And by how much did we it improve the outcome?
      Z: What were the actions taken to achieve this outcome?
      Ex: Instead of "Managed store inventory," use "Reduced inventory discrepancies by 20% (Y) 
      through implementing a digital tracking system (Z)".

  * Input the edited JSON structure into the JAKE'S RESUME, and then return the new resume to the user.

*/


//SPLIT THIS ONE BY ONE
useEffect(
  async () => {
    const resumeData = userInfo.parsedResumeData;
    const jobDescriptionKeywords = userInfo.jobkeywords;
    let responseTex;
    // Send resume + keywords to backend so keywords can be integrated into resume
    try {
      responseTex = await axios.post('/loadingPage/editResume', {
        resumeData,
        jobDescriptionKeywords
      }, {
        headers: {
        'Content-Type': 'application/json', 
        }
      });
    } catch (error) {
      console.error("Error in editing integrating keywords into resume:", error);
      return;
    }

    // Ask backend to convert LaTeX → PDF
    try {
      const pdfResponse = await axios.post(
        '/loadingPage/convertToPDF',
        { latexContent: responseTex.data.data },
        { responseType: 'blob' }
      );

      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

    } catch (error) {
      console.error("Error in convert resume to PDF:", error);
      return;
    }
    navigate('/outputPage', { 
      state: { 
        pdfUrl,
        latexContent: responseTex.data.data // send raw LaTeX if you want
      } 
    });
  }, []);

  


  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <h2 style={styles.text}>Loading, please wait...</h2>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  spinner: {
    border: '8px solid #eee',
    borderTop: '8px solid #007bff',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '20px',
    fontSize: '1.5rem',
    color: '#555',
  }
};

// Inject spinner animation keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default LoadingPage;