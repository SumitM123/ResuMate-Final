import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useUser } from '../../Components/context/UserContext.js'
import DisplayOnePastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import { useNavigate } from "react-router-dom";
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
            queriesList.push(<button onClick={(e) => queryClick(e)} key={key} value={key}>{queryName}</button>);
        }
        return <ul>{queriesList}</ul>;
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
        if(queryMap.size === 0) {
            alert("No queries to delete");
            return;
        }
        // Synchronously update the map
        const newMap = new Map(queryMap);
        newMap.delete(index);
        let tempQuery = null;
        if(newMap.size === 0) {
            setCurrentQuery(null);
            setIndex(0);
        } else {
            const tempIndex = index + 1;
            for(let i = tempIndex; i < newMap.size; i++) {
                if(newMap.has(i)) {
                    setIndex(i);
                    setCurrentQuery(newMap.get(i));
                    tempQuery = newMap.get(i);
                    break;
                }
            }
            if(!tempQuery) {
                for(let i = 0; i < tempIndex; i++) {
                    if(newMap.has(i)) {
                        setIndex(i);
                        setCurrentQuery(newMap.get(i));
                        tempQuery = newMap.get(i);
                        break;
                    }
                }
            }   
        }
        setQueryMap(newMap); // <-- Synchronous update only

        // Async delete after state update
        try {
            await axios.delete(`/users/deleteDocument/${googleId}`, {
                data: { originalResumeKey: currentQuery.originalResumeKey,
                        parsedResumeKey: currentQuery.parsedResumeKey
                }
            });
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };
    const backToApplication = (e) => { 
        e.preventDefault();
        navigate('/application')
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
                {queryMap.size !== 0 ? (
                    <DisplayOnePastQuery 
                        googleId={googleId} 
                        originalResumeURL={currentQuery?.originalResumeKey}
                        parsedResumeURL={currentQuery?.parsedResumeKey}
                        jobDescription={currentQuery?.jobDescription} 
                    />
                ) : (
                    <h2>No Past Queries</h2>
                )}
            </div>
        </>
    );
}
export default AllPastQueriesPage;