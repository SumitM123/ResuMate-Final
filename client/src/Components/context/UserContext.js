import React, { createContext, useContext, useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context object. This object DOESN'T HOLD DATA, but rather provides a way for components to publish and subcribe to data changes
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  //is a react hook that lets you read and subscribe to context from your compoent, allowing components to consume the values provided by a context.
  //It takes in a Context object and returns the current context 'value' provided by the nearest UerContext.Provider above in the component tree
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component. IT'S A COMPONENT AT THE END OF THE DAY. THINK ABOUT THAT. It's responsible for managing the user's state and providing it to its children. HOLD THE DATA THAT CHILDREN HAVE ACCESS TO. 
//UserProvider is where the state is managed, and any changes to that state lead to a new 'value' being passed down the context, updating the information available
export const UserProvider = ({ children }) => {
  //the children prop represents whatever components are rendered between the opening and closing tags of the UserProvider component
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [isLoading, setIsLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState(JSON.parse(sessionStorage.getItem('userContext'))?.jobDescription || "");
  const [jobkeywords, setJobKeywords] = useState(JSON.parse(sessionStorage.getItem('userContext'))?.jobkeywords || "");
  //the File object that the user originially uploaded
  const [file, setFile] =  useState(JSON.parse(sessionStorage.getItem('userContext'))?.file || null);
  const [parsedResumeData, setParsedResumeData] = useState(JSON.parse(sessionStorage.getItem('userContext'))?.parsedResumeData || null);
  //state for the output pdf
  const [pdfContent, setPdfContent] = useState(null); 
  const [latexContent, setLatexContent] = useState(JSON.parse(sessionStorage.getItem('userContext'))?.latexContent || null);
  const navigate = useNavigate();
  // Check if user is already logged in (from localStorage). localStorage object is a built-in feature of modern web browswers. It allows web applications to store key-value pairs of data persistently within the user's brower
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   setIsLoading(false);
  // }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    navigate('/'); 
    setUser(null);
    setIsLoading(true);
    setJobDescription('');
    setJobKeywords('');
    setFile(null);
    setParsedResumeData(null);
    setPdfContent(null);
    setLatexContent(null);
    localStorage.removeItem('user');
  };

  //this creates an object containing all the values that will be exposed through UserContext
  const value = {
    user,
    login,
    logout,
    isLoading,
    file,
    setFile,
    jobDescription,
    setJobDescription,
    parsedResumeData,
    setParsedResumeData,
    isAuthenticated: !!user,
    jobkeywords,
    setJobKeywords,
    pdfContent,
    setPdfContent,
    latexContent,
    setLatexContent
  };
  useEffect(() => {
    const userData = {
      user,
      file,
      jobDescription,
      parsedResumeData,
      jobkeywords,
      latexContent
    };
    sessionStorage.setItem('userContext', JSON.stringify(userData));
  }, [user, file, jobDescription, parsedResumeData, jobkeywords, latexContent]);
  return (
    //It renders the UserContext.Provider component. And then  value property is crucial because it passes the value object above to all the components with the Context subtree
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>

    //All the components wrapped around <UserContext> will be considered children of the Component, and therefore will have access to the properties. Check app.js
  );
};
