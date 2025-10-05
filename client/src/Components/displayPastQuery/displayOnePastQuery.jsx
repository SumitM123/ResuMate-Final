import { useEffect, useState } from "react";
import axios from "axios";
import './displayOnePastQuery.css';

function DisplayOnePastQuery({ googleId, originalResumeURL, parsedResumeURL, jobDescription }) {
    const [originalResumeURLToDisplay, setOriginalResumeURLToDisplay] = useState(null);
    const [parsedResumeURLToDisplay, setParsedResumeURLToDisplay] = useState(null);
    console.log("Props received:", { googleId, originalResumeURL, parsedResumeURL});
    useEffect(() => {
        async function funcCall() {
            console.log("Inside funcCall");
            if(!googleId || !originalResumeURL || !parsedResumeURL) return;
            try {
                const originalResumeStream = await axios.get(`https://resumate-backend-xv4m.onrender.com/users/specificDocument/${googleId}`, { 
                    params: { resumeURL: originalResumeURL, isOriginalResume: true },
                    responseType: 'blob' 
                });
                console.log("Original Resume Stream fetched");
                const parsedResumeStream = await axios.get(`https://resumate-backend-xv4m.onrender.com/users/specificDocument/${googleId}`, {
                    params: { resumeURL: parsedResumeURL, isOriginalResume: false },
                    responseType: 'blob'
                });
                console.log("Parsed Resume Stream fetched");
                setOriginalResumeURLToDisplay(window.URL.createObjectURL(originalResumeStream.data));
                setParsedResumeURLToDisplay(window.URL.createObjectURL(parsedResumeStream.data));
                console.log("PDF URLs set");
            } catch (err) {
                console.error("Error fetching PDFs:", err);
            }

        }
        funcCall();
    }, [googleId, originalResumeURL, parsedResumeURL]);

    return (
        <div className="past-query-container">
            <h2 className="past-query-title">Past Query Details</h2>
            
            <div className="resume-viewer-container">
                {originalResumeURLToDisplay ? (
                    <div className="resume-section">
                        <h3>Original Resume</h3>
                        <iframe 
                            src={originalResumeURLToDisplay} 
                            className="resume-iframe" 
                            title="Original Resume" 
                        />
                    </div>
                ) : (
                    <div className="resume-section">
                        <h3>Original Resume</h3>
                        <div className="loading-message">
                            <div className="spinner"></div>
                            Loading original resume...
                        </div>
                    </div>
                )}
                
                {parsedResumeURLToDisplay ? (
                    <div className="resume-section">
                        <h3>Enhanced Resume</h3>
                        <iframe 
                            src={parsedResumeURLToDisplay} 
                            className="resume-iframe" 
                            title="Enhanced Resume" 
                        />
                    </div>
                ) : (
                    <div className="resume-section">
                        <h3>Enhanced Resume</h3>
                        <div className="loading-message">
                            <div className="spinner"></div>
                            Loading enhanced resume...
                        </div>
                    </div>
                )}
            </div>
            
            <div className="job-description-section">
                <h3 className="job-description-title">Job Description</h3>
                <div className="job-description-content">
                    {jobDescription || 'No job description available'}
                </div>
            </div>
        </div>
    );
}
export default DisplayOnePastQuery;
