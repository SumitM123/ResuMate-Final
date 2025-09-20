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
            queriesList.push(<li onClick={(e) => queryClick(e)} value={key}>{queryName}</li>);
        }
        return <ul>{queriesList}</ul>;
    };
    const queryClick = (e) => {
        e.preventDefault();
        const key = parseInt(e.target.getAttribute("value"));
        setIndex(prevValue => {
            let newValue = key;
            setCurrentQuery(queryMap.get(newValue));
            return newValue;
        });
    }
    const previousClick = (e) => {
        e.preventDefault();
        //if index is the same as the first key in the map. NOT 0. BECAUSE OF DELETE
        let beforeIndex = index - 1;
        while(beforeIndex >= 0 && !queryMap.has(beforeIndex)) {
            beforeIndex--;
        }
        if(beforeIndex < 0) {
            alert("Cannot go further back");
            return;
        }
        setIndex(prevIndex => {
            const newIndex = beforeIndex;
            setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    const nextClick = (e) => {
        e.preventDefault();
        //if index is the same as the LAST key in the map. NOT queryMap.size - 1. BECAUSE OF DELETE
        let afterIndex = index + 1;
        while(afterIndex < queryMap.size && !queryMap.has(afterIndex)) {
            afterIndex++;
        }
        if(afterIndex >= queryMap.size) {
            alert("Cannot go further forward");
            return;
        }
        setIndex(prevIndex => {
            const newIndex = afterIndex;
            setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    const deleteClick = (e) => {
        e.preventDefault();
        if(queryMap.size === 0) {
            alert("No queries to delete");
            return;
        }
        setQueryMap(async (prevMap) => {
            const newMap = new Map(prevMap);
            newMap.delete(index);
            let tempQuery = null;
            if(newMap.size === 0) {
                setCurrentQuery(null);
                setIndex(0);
                return newMap;
            } else {
                const tempIndex = index + 1;
                //trying to display the next query
                for(let i = tempIndex; i < newMap.size; i++) {
                    if(newMap.has(i)) {
                        setIndex(prevValue => {
                            let newValue = i;
                            setCurrentQuery(newMap.get(newValue));
                            tempQuery = newMap.get(newValue);
                            return newValue;
                        });
                        break;
                    }
                }
                if(!tempQuery) {
                    for(let i = 0; i < tempIndex; i++) {
                        if(newMap.has(i)) {
                            setIndex(prevValue => {
                            let newValue = i;
                            setCurrentQuery(newMap.get(newValue));
                            tempQuery = newMap.get(newValue);
                            return newValue;
                            });
                            break;
                        }
                    }
                }   
            }
            try {
                await axios.delete(`/users/deleteDocument/${googleId}`, {
                    data: { originalResumeKey: currentQuery.originalResumeKey }
                });
            } catch (error) {
                console.error("Error deleting document:", error);
            }
            const rerender = displayingAllQueries();
            return newMap;
        });
    }
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
                        originalResumeURL={currentQuery?.originalResumeURL}
                        parsedResumeURL={currentQuery?.parsedResumeURL}
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