import react, {useEffect, useState} from 'react'
import axios from 'axios';
import { useUser } from '../../Components/context/UserContext';
import { useNavigate } from 'react-router-dom';

//Hooks much be called inside functional components or custom hook functions. BUt the code inside the hooks runs based on the specifics

function LoadingPage() {
  const userInfo = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const handleFileUpload = async () => {
    if (!userInfo.file) {
      console.log("No file to upload");
      return;
    }

    try {
      // Convert file to base64 using Promise-based approach
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(userInfo.file);
      });

      // Send to server
      const response = await axios.post('/loadingPage/', {
        payLoad: base64Data,
      });

      console.log("Successfully sent to parser", response);
      
      return response.content;
    } catch (error) {
      console.log("Here is the error", error);
      setError(error.message);
      throw error;
    }
  };
  
  const checkJobDescrition = async () => {
    try {
      const accuracyResponse = await axios.post('/loadingPage/jobDescriptionAccuracy');
      
    } catch (error) {
      console.log("Here is the error" + error);
    }
  }
  // This is the function where all the async functions are going to be called
  useEffect(() => {
    handleFileUpload();
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