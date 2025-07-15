import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

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
      
      // Check if userData is valid before navigating
      if (userData.data) {
        console.log('User info:', userData.data);
        // Save user data to context
        login(userData.data);
        navigate('/application');
      } else {
        console.error('No user data received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error details:', err.response?.data || err.message);
    }
  };
  return (
    <GoogleOAuthProvider clientId="305627446808-daj9lmdn792fhqsg1smsv7prrt9db3p4.apps.googleusercontent.com">
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #ece9e6, #ffffff)', // soft gradient
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log('Login Failed')}
          theme="outline"
          size="large"
          width="300"
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default SignInPage;
