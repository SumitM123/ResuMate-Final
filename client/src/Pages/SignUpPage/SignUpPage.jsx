import React from "react";
import './SignUpPage.css';
function SignUpPage () {
    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="coming-soon-notice">
                    Sign up functionality is coming soon!
                </div>
                
                <h1 className="signup-title">Join ResuMate</h1>
                <p className="signup-subtitle">
                    Create an account to save your resume queries and track your job application progress.
                </p>
                
                <form className="signup-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Enter your full name"
                            disabled
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            placeholder="Enter your email address"
                            disabled
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="Create a strong password"
                            disabled
                        />
                    </div>
                    
                    <button type="button" className="signup-button" disabled>
                        Create Account
                    </button>
                </form>
                
                <div className="divider">
                    <span>OR</span>
                </div>
                
                <div className="social-signup">
                    <button type="button" className="google-signup-button" disabled>
                        <span className="google-icon">🔗</span>
                        Sign up with Google
                    </button>
                </div>
                
                <div className="signin-link">
                    Already have an account? <a href="/signIn">Sign in here</a>
                </div>
            </div>
        </div>
    )
}
export default SignUpPage;