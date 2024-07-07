import React, { useState, useEffect } from 'react';
import EntryView from './EntryView';
import { Get } from 'src/lib/api';
import { useAuth } from 'src/context/AuthContext';


function ListEntries (props) {
    //make api call to backend to get the entry data
    const [entry, setEntry] = React.useState([]);
    const { user } = useAuth();
    
    React.useEffect(()=>{
        const call = async () => {
            try {
                const response = await Get('entries/find_entries', {journalID: props.journalID},{user: user}); 
                if (!response.ok) console.error('Failed to fetch entries');
                const data = await response.json();
                setEntry(data);
            } catch (error) {
                console.error('Api call failed to fetch entries');
            }
        }
        call();
    },[props.entryCreated, props.refresh]);

    return (
        <>
            {entry.map(value => (
                <div key={value.entryID} id={value.entryID}>
                    <EntryView  
                               contentjson={JSON.parse(value.content)}
                               entry={value} 
                               click={()=>{props.onEntryClicked(value)}}
                               toggleRefresh={props.toggleRefresh}
                               />
                </div>
            ))}
        </>
        
    );
}

export default ListEntries;