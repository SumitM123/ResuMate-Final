import { set } from "mongoose";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useUser } from '../../Components/context/UserContext.js'
import DisplayOnePastQuery from '../../Components/displayPastQuery/displayOnePastQuery.jsx'
import { useNavigate } from "react-router-dom";
function allPastQueriesPage() {
    const userInfo = useUser();
    const navigate = useNavigate();

    const{ googleID } = userInfo.user;
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
            queriesList.push(<li onClick={(e) => queryClick(e, key)} key={key}>{queryName}</li>);
        }
        return <ul>{queriesList}</ul>;
    };
    const queryClick = (e, key) => {
        e.preventDefault();
        setIndex(prevValue => {
                    let newValue = key;
                    setCurrentQuery(queryMap.get(newValue));
                    return newValue;
                }
        )
        setIndex(key);
        setCurrentQuery(queryMap.get(key));
    }
    const previousClick = (e) => {
        e.preventDefault();
        if(index <=0) {
            alert("Cannot go further back");
            return;
        }
        setIndex(prevIndex => {
            const newIndex = prevIndex - 1;
            setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    const nextClick = (e) => {
        e.preventDefault();
        if(index >= queryMap.size - 1) {
            alert("Cannot go further forward");
            return;
        };
        setIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            setCurrentQuery(queryMap.get(newIndex));
            return newIndex;
        });
    }
    const deleteClick = (e) => {
        e.preventDefault();
        setQueryMap(prevMap => {
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
                            break;
                        }
                    }
                }   
            }

            //MAKE A DELETE REQUEST TO BACK END TO DELETE FROM MONGODB AND S3
            return newMap;
        });
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
                {currentQuery != null ? (
                    <DisplayOnePastQuery 
                        googleID={googleID} 
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
export default allPastQueriesPage;