import { set } from "mongoose";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useUser } from '../../Components/context/UserContext.js'
import displayOnePastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import { useNavigate } from "react-router-dom";
function allPastQueriesPage() {
    const userInfo = useUser();
    const navigate = useNavigate();
    
    const{ googleID } = userInfo.user;
    const [queryMap, setQueryMap] = useState(new Map());
    const [index, setIndex] = useState(0); // This will be used to keep track of the index of the queries
    
    const [currentQuery, setCurrentQuery] = useState(null); // This will be used to display the current query
    useEffect(() => {
        async () => {
            await gettingDocuments();
            displayingAllQueries();
        }
    }, []); 

    const gettingDocuments = async () => {
        let allQueries;
        try {
            allQueries = await axios.get(`/users/getAllDocments/${googleID}`);
        } catch (error) {
            console.error("Error fetching past queries:", error);
            return;
        }
        for(let i = 0; i < allQueries.data.pastQueries.length; i++) {
            const tempQuery = allQueries.data.pastQueries[i];
            setQueryMap(prevMap => {
                const newMap = new Map(prevMap);
                newMap.set(i, tempQuery);
                return newMap;
            });
            // Do something with each query object
        }
        setCurrentQuery(prevValue => queryMap.get(index));    
    }
    const displayingAllQueries = () => {
        const queriesList = [];
        for (const [key, value] of queryMap) {
            const index = value.originalResumeKey.indexOf('-');
            const queryName = value.originalResumeKey.substring(0, index);
            queriesList.push(<li key={key}>{queryName}</li>);
        }
        return <ul>{queriesList}</ul>;
    };
    const previousClick = (e) => {
        e.preventDefault();
    }
    const nextClick = (e) => {
        e.preventDefault();
    }
    const deleteClick = (e) => {
        e.preventDefault();
    }
    const backToApplication = (e) => { 
        e.preventDefault();
        navigate('/applicationPage')
    }
    return (
        <>
        
            <div>
                <h2> Past Queries Bar </h2>
                {displayingAllQueries()}
            </div>
            <div>
                <button onClick={previousClick}> Previous </button>
                <button onClick={nextClick}> Next </button>
                <button onClick={deleteClick}> Delete </button>
                <button onClick={backToApplication}> Back to Application </button>
            </div>
            <div>
                <displayOnePastQuery 
                    googleID={googleID} 
                    originalResumeURL={queryMap.get(index)?.originalResumeURL}
                    parsedResumeURL={queryMap.get(index)?.parsedResumeURL}
                    jobDescription={queryMap.get(index)?.jobDescription}
                />
            </div>
        </>
    );
}
export default allPastQueriesPage;