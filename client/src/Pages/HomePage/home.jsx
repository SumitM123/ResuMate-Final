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
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">AI-Powered Resume Enhancement</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-main">ResuMate</span>
              {/* <span className="title-accent">Pro</span> */}
            </h1>
            
            {/* <p className="hero-subtitle">
              Transform your resume with AI-powered optimization tailored to specific job descriptions. 
              Stand out from the competition and land your dream job.
            </p> */}
            
            {/* <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Resumes Enhanced</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Available</span>
              </div>
            </div> */}
            
            <div className="cta-section">
              <button className="cta-button primary" onClick={goToApp}>
                <span className="button-icon">🚀</span>
                <span className="button-text">Get Started Free</span>
                <span className="button-arrow">→</span>
              </button>
              
              {!userInfo.user && (
                <p className="auth-notice">
                  <span className="notice-icon">📝</span>
                  Sign in required to save your progress and access past queries
                </p>
              )}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-container">
              <div className="floating-card card-1">
                <div className="card-header">
                  <span className="card-icon">📄</span>
                  <span className="card-title">Original Resume</span>
                </div>
                <div className="card-content">
                  <div className="content-line line-1"></div>
                  <div className="content-line line-2"></div>
                  <div className="content-line line-3"></div>
                </div>
              </div>
              
              <div className="transform-arrow">
                <span className="arrow-icon">✨</span>
              </div>
              
              <div className="floating-card card-2">
                <div className="card-header">
                  <span className="card-icon">⭐</span>
                  <span className="card-title">Enhanced Resume</span>
                </div>
                <div className="card-content">
                  <div className="content-line line-1 enhanced"></div>
                  <div className="content-line line-2 enhanced"></div>
                  <div className="content-line line-3 enhanced"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <div className="container">
            <h2 className="section-title">Why Choose ResuMate?</h2>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3 className="feature-title">Targeted Optimization</h3>
                <p className="feature-description">
                  AI analyzes job descriptions and optimizes your resume with relevant keywords and skills.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Lightning Fast</h3>
                <p className="feature-description">
                  Get your enhanced resume in minutes, not hours. Perfect for quick applications.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3 className="feature-title">Track Progress</h3>
                <p className="feature-description">
                  Save and compare different versions for various job applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
