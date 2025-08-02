import React from 'react';
import { useUser } from '../../Components/context/UserContext';

function OutputPage() {
    const userInfo = useUser();
    const parsedData = userInfo.parsedResumeData;

    if (!parsedData) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>No parsed data available</h1>
                <p>Please upload a resume first.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Affinda Resume Parsing Results</h1>
            
            {/* Display Affinda's JSON structure */}
            <div style={{ marginBottom: '30px' }}>
                <h2>Affinda JSON Response</h2>
                <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                    <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(parsedData, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default OutputPage;