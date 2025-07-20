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
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={user.picture} 
              alt={user.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
              title={user.name}
            />
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textDecoration: 'underline',
                color: 'white',
                fontSize: '18px'
              }}
            >
              Logout
            </button>
          </li>
        ) : (
          <li><Link to="/signIn">Sign In</Link></li>
        )}
      </ul>
    </nav>
  );
}
export default NavBar;