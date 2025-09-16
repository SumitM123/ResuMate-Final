import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import URL from 'url-parse';

function displayOnePastQuery(props) {
    //from the props, we're going to be given googleID, and the two URLS
    const [googleID, setGoogleID] = useState(props.googleID);
    const [originalResumeURL, setOriginalResumeURL] = useState(props.originalResumeURL);
    const [parsedResumeURL, setParsedResumeURL] = useState(props.parsedResumeURL);
    const [jobDescription, setJobDescription] = useState(props.jobDescription);


    const [originalResumeURLToDisplay, setOriginalResumeURLToDisplay] = useState(null);
    const [parsedResumeURLToDisplay, setParsedResumeURLToDisplay] = useState(null);

    useEffect(() => {
        async () => {
            const originalResumeStream = await axios.get(`/users/specificDocument/${googleID}?originalResumeURL=${originalResumeURL}`, { responseType: 'application/pdf' });
            const parsedResumeStream = await axios.get(`/users/specificDocument/${googleID}?parsedResumeURL=${parsedResumeURL}`, { responseType: 'application/pdf' });
            
            const originalResumeFile = new File([originalResumeStream.data], 'originalResume.pdf', { type: 'application/pdf' });
            const parsedResumeFile = new File([parsedResumeStream.data], 'parsedResume.pdf', { type: 'application/pdf' });
            // Now you can use originalResumeFile and parsedResumeFile as needed
            setOriginalResumeURLToDisplay(URL.createObjectURL(originalResumeFile));
            setParsedResumeURLToDisplay(URL.createObjectURL(parsedResumeFile));
        }
    }, [googleID, originalResumeURL, parsedResumeURL]);
    const gettingRespectiveQueries = async () => {
        
    }
    return (
        <div>
            <h2>Past Queries</h2>
            <img src={originalResumeURLToDisplay} alt="Original Resume" />
            <img src={parsedResumeURLToDisplay} alt="Parsed Resume" />
            <p>Job Description: {jobDescription}</p>
            {/* Code to display past queries will go here */}
        </div>
    );
}
export default displayOnePastQuery;