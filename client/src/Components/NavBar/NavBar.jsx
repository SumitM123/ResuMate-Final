import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './NavBar.css'; // optional styling

function NavBar() {
  const { user, logout, isAuthenticated } = useUser();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">📄</span>
            <span className="brand-text">ResuMate</span>
          </Link>
        </div>
        
        <div className="navbar-menu">
          <div className="navbar-nav">
            {/* <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              Home
            </Link> */}
            
            {isAuthenticated && (
              <>
                <Link to="/application" className="nav-link">
                  <span className="nav-icon">⚡</span>
                  Application
                </Link>
                <Link to="/pastQueries" className="nav-link">
                  <span className="nav-icon">📋</span>
                  Past Queries
                </Link>
              </>
            )}
          </div>
          
          {/* Right-aligned authentication section */}
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-profile">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="user-avatar"
                  title={user.name}
                />
                <span className="user-name">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="logout-button"
                title="Logout"
              >
                <span className="logout-icon">🚪</span>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/signIn" className="nav-link">
              <span className="nav-icon">🔐</span>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
export default NavBar;