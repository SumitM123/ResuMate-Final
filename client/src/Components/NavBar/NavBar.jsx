// import React from 'react';
// import './NavBar.css';
// import { useNavigate } from 'react-router-dom';
// //axios is used for data (JSON). You send data to server as a JSON, then the server converts the JSON to JS object from the middleware and attaches it to the request
// // body property. Then, when sending back a response, it sends it through JSON format
// import axios from 'axios';
// function NavBar() {
//   const navigate = useNavigate();
//   function getHomePage() {
//     navigate('/');
//   }
//   function signIn() {
//     navigate("/signIn")
//   }
//   function signUp() {
//     navigate('/signUp');
//   }
//   return (
//     <nav>
//       <ul className="nav-list">
//         <li onClick={getHomePage}> Home</li>
//         <li onClick={signIn}>Sign In</li>
//         <li onClick={signUp}>Sign Up</li>
//       </ul>
//     </nav>
//   );
// }

// export default NavBar;

import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // optional styling

function NavBar() {
  //Link will change the path of the URL. It's like <a href=>
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/signIn">Sign In</Link></li>
        {/*<li><Link to="/signUp">Sign Up</Link></li>*/}
      </ul>
    </nav>
  );
}
export default NavBar;