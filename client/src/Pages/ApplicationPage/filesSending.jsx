import React, {useState} from "react";
import JobDescription from '../../Components/JobDescription/JobDescription.jsx'
import displayPastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import axios from "axios";
import {useNavigate} from "react-router-dom";
import './filesSending.css';

// import { useState } from "react";

//show previous queries

function FilesSending() {
    //const [u]
    const navigate = useNavigate();
    const goToPastQueries = () => {
        navigate('/pastQueries');
    }
    return(
        <div className="files-sending-container">
            <div className="files-sending-header">
                <h1 className="files-sending-title">ResuMate Application</h1>
            </div>
            
            <div className="past-queries-section">
                <div className="past-queries-container">
                    <button className="past-queries-button" onClick={goToPastQueries}>
                        View Past Queries
                    </button>
                </div>
            </div>
            
            <div className="job-description-wrapper">
                <JobDescription/>
            </div>
        </div>
    );
}
export default FilesSending;