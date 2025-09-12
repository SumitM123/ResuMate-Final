import React from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import './home.css'; // Import CSS file
import { useUser }  from '../../Components/context/UserContext.js';
function Home() {
  const navigate = useNavigate();
  const userInfo = useUser();
  const goToApp = () => {
    if(userInfo.user) {
      navigate('/application');
      return;
    }
    alert("Please log in  to continue.");
  };

  return (
    <>
      {/* <NavBar /> */}
      <div className="home-container">
        <h1 className="home-title">ResuMate</h1>
        <p className="home-subtitle">Your smart job application assistant</p>
        <button className="home-button" onClick={goToApp}>
          Get Started
        </button>
      </div>
    </>
  );
}

export default Home;
