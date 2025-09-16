import React, {useState} from "react";
import JobDescription from '../../Components/JobDescription/JobDescription.jsx'
import displayPastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import axios from "axios";

// import { useState } from "react";

//show previous queries
function filesSending() {
    //const [u]
    
    return(
        <>
            <h1> Files Sending </h1>
            <div>
                Previous Queries
                
            </div>
            <div> 
                <JobDescription/>
            </div>
        </>
    );
}
export default filesSending;