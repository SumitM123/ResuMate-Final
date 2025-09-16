import { useEffect } from "react";

function allPastQueriesBar(props) {
    const googleID = props.googleID;
    useEffect(() => {
        async () => {
            //in .data.pastQueries, we should have an array of objects
            let pastQueries;
            try {
                pastQueries = await axios.get(`/users/getAllDocments/${googleID}`);
            } catch (error) {
                console.error("Error fetching past queries:", error);
                return;
            }
            for(let i = 0; i < pastQueries.data.pastQueries.length; i++) {
                const currentQuery = pastQueries.data.pastQueries[i];

                
                // Do something with each query object
            }

            
        }
    }, []); 
    return (
        <div>
            <h2> Past Queries Bar </h2>
        </div>
    );
}
export default allPastQueriesBar;