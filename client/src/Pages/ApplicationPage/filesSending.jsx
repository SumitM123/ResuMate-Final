import React, {useState} from "react";
import JobDescription from '../../Components/JobDescription/JobDescription.jsx'
import displayPastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import axios from "axios";
import {useNavigate} from "react-router-dom";

// import { useState } from "react";

//show previous queries

function filesSending() {
    //const [u]
    const navigate = useNavigate();
    const goToPastQueries = () => {
        navigate('/pastQueries');
    }
    return(
        <>
            <h1> Files Sending </h1>
            <div> 
                <div>
                    <button onClick={goToPastQueries}> Past Queries </button>
                </div>
                <JobDescription/>
            </div>
        </>
    );
}
export default filesSending;