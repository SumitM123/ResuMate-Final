import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

function DisplayOnePastQuery(props) {
    //from the props, we're going to be given googleId, and the two URLS
    const [googleId, setGoogleID] = useState(props.googleId);
    const [originalResumeURL, setOriginalResumeURL] = useState(props.originalResumeURL);
    const [parsedResumeURL, setParsedResumeURL] = useState(props.parsedResumeURL);
    const [jobDescription, setJobDescription] = useState(props.jobDescription);


    const [originalResumeURLToDisplay, setOriginalResumeURLToDisplay] = useState(null);
    const [parsedResumeURLToDisplay, setParsedResumeURLToDisplay] = useState(null);

    useEffect(() => {
        async function funcCall() {
            await gettingRespectiveQueries();
        }
        funcCall();
    }, [googleId, originalResumeURL, parsedResumeURL]);
    const gettingRespectiveQueries = async () => {
        if(!googleId || !originalResumeURL || !parsedResumeURL) return;
        //const originalResumeStream = await axios.get(`/users/specificDocument/${googleId}?originalResumeURL=${originalResumeURL}`, { responseType: 'application/pdf' });
        //const parsedResumeStream = await axios.get(`/users/specificDocument/${googleId}?parsedResumeURL=${parsedResumeURL}`, { responseType: 'application/pdf' });
        
        const originalResumeStream = await axios.get(`/users/specificDocument/${googleId}`, { 
            params: {
                resumeURL: originalResumeURL,
                isOriginalResume: true
            },
            responseType: 'blob' });
        const parsedResumeStream = await axios.get(`/users/specificDocument/${googleId}`, {
            params: {
                parsedResumeURL: parsedResumeURL,
                isOriginalResume: false
            },
            responseType: 'blob'});
        /*
            The server's Content-Type header is a suggestion or hint to the browser about how to handle the data. However, the client's configuration (axios({ responseType: 'arraybuffer' })) is what ultimately tells the network request library how to interpret the incoming byte stream and format the final result for your JavaScript code. 
            So, a server can send a PDF with the header Content-Type: application/pdf, and if your client-side Axios call uses responseType: 'arraybuffer', your JavaScript code will correctly receive an ArrayBuffer.
        */
        const originalResumeFile = new File([originalResumeStream.data], 'originalResume.pdf', { type: 'application/pdf' });
        const parsedResumeFile = new File([parsedResumeStream.data], 'parsedResume.pdf', { type: 'application/pdf' });
        // Now you can use originalResumeFile and parsedResumeFile as needed
        setOriginalResumeURLToDisplay(window.URL.createObjectURL(originalResumeFile));
        setParsedResumeURLToDisplay(window.URL.createObjectURL(parsedResumeFile));
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
export default DisplayOnePastQuery;