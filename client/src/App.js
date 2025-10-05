// import logo from './logo.svg';
// import './App.css';
// import Home from './Pages/HomePage/home.jsx';
// function App() {
//   return (
//     <Home/>
//   );
// }

// export default App;

// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/HomePage/home.jsx';
import SignIn from './Pages/SignInPage/SignIn';
import SignUp from './Pages/SignUpPage/SignUpPage';
import NavBar from './Components/NavBar/NavBar';
import FilesSend from './Pages/ApplicationPage/filesSending.jsx'
import OutputPage from './Pages/OutputPage/OutputPage.jsx'
import BadOutputPage from './Pages/OutputPage/BadOutputPage.jsx';
import LoadingPage from './Pages/LoadingPage/LoadingPage.jsx'
import { UserProvider } from './Components/context/UserContext.js';
import AllPastQueriesPage from './Pages/AllPastQueriesPage/allPastQueriesBar.jsx';
function App() {
  //Route is a component used to define a mapping between a specific URL path and the React component that should be rendered when the application's URL matches that path. 
    //basically, if the path is something, then render this component
  return (
    <UserProvider>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path='/application' element={<FilesSend/>}/>
        <Route path='/loadingPage' element={<LoadingPage/>}/>
        {/* <Route path="/signUp" element={<SignUp />} /> */}
        <Route path='/outputPage' element={<OutputPage/>}/>
        <Route path="/pastQueries" element={<AllPastQueriesPage/>}/>
        <Route path="/badOutputPage" element={<BadOutputPage/>}/>
      </Routes>
    </UserProvider>
  );
}

export default App;
