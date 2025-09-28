import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useUser } from '../../Components/context/UserContext.js'
import DisplayOnePastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import { useNavigate } from "react-router-dom";
import './allPastQueriesBar.css';
function AllPastQueriesPage() {
    const userInfo = useUser();
    const navigate = useNavigate();

    const{ googleId } = userInfo.user;
    const [queryMap, setQueryMap] = useState(new Map());
    const [index, setIndex] = useState(0); // This will be used to keep track of the index of the queries
    
    const [currentQuery, setCurrentQuery] = useState(null); // This will be used to display the current query
    useEffect(() => {
        setCurrentQuery(queryMap.get(index) ?? null);
    }, [index, queryMap]);
    useEffect(() => {
        async function fetchData() {
            await gettingDocuments();
            displayingAllQueries();
        }
        fetchData();
    }, []); 

    const gettingDocuments = async () => {
        let allQueries;
        try {
            allQueries = await axios.get(`/users/getAllDocuments/${googleId}`);
        } catch (error) {
            console.error("Error fetching past queries:", error);
            return;
        }
        console.log("All Queries:", JSON.stringify(allQueries.data.pastQueries));
        const newMap = new Map();
        for(let i = 0; i < allQueries.data.pastQueries.length; i++) {
            const tempQuery = allQueries.data.pastQueries[i];
            newMap.set(i, tempQuery);
        }
        setQueryMap(newMap);
        setCurrentQuery(newMap.get(index));   
        console.log("Query Map:", queryMap);
        console.log("Current Query:", currentQuery);
        console.log("New map:", newMap);
    }
    const displayingAllQueries = () => {
        const queriesList = [];
        for (const [key, value] of queryMap) {
            const index = value.originalResumeKey.indexOf('-');
            const queryName = value.originalResumeKey.substring(0, index);
            queriesList.push(
                <button 
                    className="query-button" 
                    onClick={(e) => queryClick(e)} 
                    key={key} 
                    value={key}
                >
                    {queryName}
                </button>
            );
        }
        return <ul className="queries-list">{queriesList}</ul>;
    };
    const queryClick = (e, key) => {
        e.preventDefault();
        const value = parseInt(e.target.getAttribute("value"));
        setIndex(prevValue => {
            let newValue = value;
            //setCurrentQuery(queryMap.get(newValue));
            return newValue;
        });
    }
    const previousClick = (e) => {
        e.preventDefault();
        //if index is the same as the first key in the map. NOT 0. BECAUSE OF DELETE
        let beforeIndex = index - 1;
        const mapKeys = Array.from(queryMap.keys());
        const firstKey = mapKeys[0];
        if(beforeIndex <= firstKey) {
            alert("Cannot go further back");
            return;
        }
        while(beforeIndex > firstKey && !queryMap.has(beforeIndex)) {
            beforeIndex--;
        }
        setIndex(prevIndex => {
            const newIndex = beforeIndex;
            //setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    const nextClick = (e) => {
        e.preventDefault();
        //if index is the same as the LAST key in the map. NOT queryMap.size - 1. BECAUSE OF DELETE
        let afterIndex = index + 1;
        const mapKeys = Array.from(queryMap.keys());
        const lastKey = mapKeys[mapKeys.length - 1];
        if(afterIndex >= lastKey) {
            alert("Cannot go further forward");
            return;
        }
        while(afterIndex < lastKey && !queryMap.has(afterIndex)) {
            afterIndex++;
        }
        setIndex(prevIndex => {
            const newIndex = afterIndex;
            //setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    // a state setter function should ony be used to update the state and no side effects. Because all though the state may change async, the code inside it will me synchronously. 
    //If one state is dependent on another, use the useEffect hook so that it updates the state whenever the other state is changed
    // You never put a state changer function as async because then, it'll return a promise     const deleteClick = async (e) => {
    const deleteClick = async (e) => {
        e.preventDefault();
        if (!currentQuery) return alert("No query selected");

        try {
            await axios.delete(`/users/specificDocument/${googleId}`, {
                data: {
                    originalResumeKey: currentQuery.originalResumeKey,
                    parsedResumeKey: currentQuery.parsedResumeKey
                }
            });

            // Update state only after server confirms deletion
            const newMap = new Map(queryMap);
            newMap.delete(index);
            setQueryMap(newMap);

            // Update currentQuery
            const remainingKeys = Array.from(newMap.keys());
            if (remainingKeys.length === 0) {
                setCurrentQuery(null);
                setIndex(0);
            } else {
                const nextIndex = remainingKeys.find(i => i > index) ?? remainingKeys[remainingKeys.length - 1];
                setIndex(nextIndex);
                setCurrentQuery(newMap.get(nextIndex));
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document. See console for details.");
        }
    };

    const backToApplication = (e) => { 
        e.preventDefault();
        navigate('/application')
    }
    //REMOVE THE NEXT AND PREVIOUS BUTTONS LOL
    return (
        <div className="all-queries-container">
            <div className="queries-header">
                <h1 className="queries-title">Resume Query History</h1>
            </div>
            
            <div className="queries-sidebar">
                <h2>Your Past Queries</h2>
                {displayingAllQueries()}
            </div>
            
            <div className="navigation-controls">
                {/* <button className="nav-button previous" onClick={previousClick}>
                    ← Previous
                </button>
                <button className="nav-button next" onClick={nextClick}>
                    Next →
                </button> */}
                <button className="nav-button delete" onClick={deleteClick}>
                    🗑️ Delete
                </button>
                <button className="nav-button back" onClick={backToApplication}>
                    ← Back to Application
                </button>
            </div>
            
            <div className="query-content">
                {queryMap.size !== 0 ? (
                    <DisplayOnePastQuery 
                        googleId={googleId} 
                        originalResumeURL={currentQuery?.originalResumeKey}
                        parsedResumeURL={currentQuery?.parsedResumeKey}
                        jobDescription={currentQuery?.jobDescription} 
                    />
                ) : (
                    <div className="no-queries-message">
                        No Past Queries Available
                        <p>Start by creating your first resume query!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AllPastQueriesPage;