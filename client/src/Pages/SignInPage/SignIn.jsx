import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Components/context/UserContext';
import './SignIn.css';


function SignInPage() {
  //only receives the totken, not the full user profile.
  const navigate = useNavigate();
  const { login } = useUser();
  //the onSuccess property of the GoogleLogin element automatically passes in credentialResponse as an argument to the function
  const handleSuccess = async (credentialResponse) => {
    try {
      //promises can have different types. In this case, the type of promise in the axios.post() is an AxiosResponse object. 
      
      const userData = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });
      
      console.log('Google login successful:', userData);
      console.log('Google object stringified:', JSON.stringify(userData));
      // Check if userData is valid before navigating
      if (userData.data) {
        console.log('User info:', userData.data);
        // Save user data to context. You do so by accessing the value property of component through useUser() hook, and then modifying the properies of the value object
        console.log("Logging in user with data:", userData.data);
        // will contain the properties
        login(userData.data);

        //Add User to the database
        const dataToSend = {
          googleId: userData.data.googleId,
          name: userData.data.name,
          email: userData.data.email,
        }
        try {
          const addingUser = await axios.post('/users/addUser', dataToSend, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('User addition response:', addingUser.data);
        } catch (error) {
          console.error('Error adding user:', error);
        }
        try{
          const addingDocumentModel = await axios.post('/users/addingDocumentModel', {googleId: userData.data.googleId}, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('Document model addition response:', addingDocumentModel.data);
        } catch (error) {
          console.error('Error adding document model:', error);
        }
      } else {
        console.error('No user data received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', err.response?.data || err.message);
    }
    navigate('/application');
  };
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="signin-container">
        <div className="signin-card">
          <h1 className="signin-title">Welcome to ResuMate</h1>
          <p className="signin-subtitle">
            Sign in to create enhanced resumes tailored to your job applications
          </p>
          
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log('Login Failed')}
              theme="outline"
              size="large"
              width="300"
            />
          </div>
          
          {/* <div className="signin-footer">
            <p>Don't have an account? <a href="/signUp">Sign up here</a></p>
          </div> */}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default SignInPage;
