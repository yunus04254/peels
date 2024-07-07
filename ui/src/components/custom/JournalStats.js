import React, { useState, useEffect } from 'react';
import {
    Card,
    CardTitle, 
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
  } from "src/components/ui/card"
import {Get} from "src/lib/api"
import { useAuth } from "src/context/AuthContext";
function JournalStats(props){

    const [journal, setJournal] = useState({});
    const { user } = useAuth();
    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const response = await Get('journals/get_journal', {
                    id: props.journalID
                }, {user: user});
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setJournal(data);
            } catch (error) {
                console.error('Error fetching journal:', error);
            }
        }
        fetchJournal();
    }, [props.journalID, props.refresh]);

    //get date and time right now 
    const date = new Date();
    const dateNow = date.toLocaleDateString('en-GB');
    const timeNow = date.toLocaleTimeString();

    //get mood count of all entries
    const moodCount = {};

    if(journal.Entries){
        journal.Entries.forEach(entry => {
            if(moodCount[entry.mood]){
                moodCount[entry.mood] += 1;
            } else {
                moodCount[entry.mood] = 1;
            }
        });
    }

    //get most common mood
    let max = 0;
    let commonMood = "";
    for (const mood in moodCount) {
        if (moodCount[mood] === max) {
            commonMood += " and " + mood;
        }
        if (moodCount[mood] > max) {
            max = moodCount[mood];
            commonMood = mood;
        }
    }

    var creationDate = journal.creationDate;
    if (journal.creationDate){
        const [year,month,day] = journal.creationDate.slice(0,10).split("-");
        creationDate = day + "/" + month + "/" + year;
    }
   
    
    return (
        <Card className="rounded-3xl border-4 shadow-lg">
            <CardHeader>
                <CardTitle>{journal.title} Stats</CardTitle>
                <CardDescription className="italic">Last Updated: {dateNow + " " + timeNow} </CardDescription>
            </CardHeader>
            <CardContent>
                {journal.isPrivate && <p><b>Private</b></p>}
                {!journal.isPrivate && <p><b>Public</b></p>}
                <p>Number of entries made: {journal.Entries? journal.Entries.length : 0}</p>
                <p>Created Since: {creationDate}</p>
                {moodCount && <p>Most common mood: {commonMood==0? "none": commonMood}</p>}

            </CardContent>
        </Card>
    );
}

export default JournalStats;