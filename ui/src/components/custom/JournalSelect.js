import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Get } from "src/lib/api";
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import '../../styles/components/JournalSection.css';
import { useAuth } from 'src/context/AuthContext';
import Journal from 'src/components/custom/Journal';

/*
  JournalSelect component is a generic component used to display a list of journals and allow the user to select one.
  There is a callback function that is called when a journal is selected.
  The component uses the Journal component to display each journal.

  @param props.onJournalClick - The callback function to call when a journal is selected.

*/
const JournalSelect = (props) => {
  const [journals, setJournals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user } = useAuth();

  // useEffect hook to fetch the journals from the server
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await Get('journals/get_user_journal', null, { user: user });
        if (!response.ok) throw new Error('Failed to fetch journals');
        const data = await response.json();
        setJournals(data);
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    };
    fetchJournals();
  }, []);



  return (
    <div>
      <h2 className="text-xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Select Journal</h2>
      <h1>Select a journal to get started!</h1>
      <br />
      <br />
      {journals.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[75vh] sm:max-h-[40vh]">
            {journals.map((journal, index) => (

              <Journal
                key={journal.journalID}
                journalID={journal.journalID}
                title={journal.title}
                theme={journal.theme}
                reminder={journal.reminder}
                isPrivate={journal.isPrivate}
                image={journal.image}
                onUpdateJournal={()=>{}}
                onDeleteJournal={()=>{}}
                isOwner={false}
                onClick={() => props.onJournalClick(journal.journalID)} 
                styleVariant="variant1"
            />

            ))}
          </div>
        </>
      ) : (
        <div className="no-journals-content">
            <p className="no-journals-text">No journals found. Start by <Link className="bold underline text-black" onClick={() => {
              if (props.setDialogOpen) {
                props.setDialogOpen(false)
              }
            }} to="/journals">creating</Link> a new one!</p>
        </div>
      )}
    </div>
  );
};

export default JournalSelect;
