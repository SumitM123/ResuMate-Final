import { useEffect, useState } from "react";
import axios from "axios";

function DisplayOnePastQuery({ googleId, originalResumeURL, parsedResumeURL, jobDescription }) {
    const [originalResumeURLToDisplay, setOriginalResumeURLToDisplay] = useState(null);
    const [parsedResumeURLToDisplay, setParsedResumeURLToDisplay] = useState(null);
    console.log("Props received:", { googleId, originalResumeURL, parsedResumeURL});
    useEffect(() => {
        async function funcCall() {
            console.log("Inside funcCall");
            if(!googleId || !originalResumeURL || !parsedResumeURL) return;
            try {
                const originalResumeStream = await axios.get(`/users/specificDocument/${googleId}`, { 
                    params: { resumeURL: originalResumeURL, isOriginalResume: true },
                    responseType: 'blob' 
                });
                console.log("Original Resume Stream fetched");
                const parsedResumeStream = await axios.get(`/users/specificDocument/${googleId}`, {
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
        <div>
            <h2>Past Queries</h2>
            {originalResumeURLToDisplay && (
                <iframe src={originalResumeURLToDisplay} width="600" height="800" title="Original Resume" />
            )}
            {parsedResumeURLToDisplay && (
                <iframe src={parsedResumeURLToDisplay} width="600" height="800" title="Parsed Resume" />
            )}
            <p>Job Description: {jobDescription}</p>
        </div>
    );
}
export default DisplayOnePastQuery;