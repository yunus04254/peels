import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Get } from "src/lib/api";
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import '../../styles/components/JournalSection.css';
import { useAuth } from '../../context/AuthContext';
import Journal from '../../components/custom/Journal';

const JournalSection = () => {
  const [journals, setJournals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await Get('journals/recent', null, {user:user});
        if (!response.ok) throw new Error('Failed to fetch journals');
        const data = await response.json();
        setJournals(data);
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    };
    fetchJournals();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + journals.length) % journals.length);
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % journals.length);
  };


  const onUpdateJournal = (updatedJournal) => {
    const updatedJournals = journals.map((journal) => {
      if (journal.journalID === updatedJournal.journalID) {
        return updatedJournal;
      }
      return journal;
    });
    setJournals(updatedJournals);
  };

  const handleDeleteJournal = (deletedJournalId) => {
    setJournals(
      journals.filter((journal) => journal.journalID !== deletedJournalId)
    );
  };


  let visibleJournals = [];
  if (journals.length > 0) {
    if (windowWidth <= 500) {
      visibleJournals = [journals[currentIndex % journals.length]];
    } else {
      visibleJournals = [
        journals[currentIndex % journals.length],
        journals[(currentIndex + 1) % journals.length],
        journals[(currentIndex + 2) % journals.length],
      ].slice(0, Math.min(3, journals.length));
    }
  }

  return (
    <div className="journal-section">
      <div className="journal-section-header">
        <h2 className="journal-section-title">Recent Journals</h2>
        {journals.length > 0 && (
          <Link to="/journals" className="see-all-button">See All</Link>
        )}
      </div>
      {journals.length > 0 ? (
        <>
          {journals.length > 3 && (
            <>
              <button className="scroll-button prev" onClick={handlePrev}><FiArrowLeft /></button>
              <div className="journal-grid">
                {visibleJournals.map((journal, index) => (
                  <div key={index} className="journal-card-wrapper">
                    <Journal
                      key={journal.journalID}
                      journalID={journal.journalID}
                      title={journal.title}
                      theme={journal.theme}
                      reminder={journal.reminder}
                      isPrivate={journal.isPrivate}
                      image={journal.image}
                      onUpdateJournal={() => {}}
                      onDeleteJournal={() => {}}
                      isOwner={true}
                      styleVariant="variant2"
                    />
                  </div>
                ))}
              </div>
              <button className="scroll-button next" onClick={handleNext}><FiArrowRight /></button>
            </>
          )}
          {journals.length <= 3 && (
            <div className="journal-grid">
              {journals.map((journal, index) => (
                <div key={index} className="journal-card-wrapper">
                  <Journal
                   key={journal.journalID}
                   journalID={journal.journalID}
                   title={journal.title}
                   theme={journal.theme}
                   reminder={journal.reminder}
                   isPrivate={journal.isPrivate}
                   image={journal.image}
                   onUpdateJournal={onUpdateJournal}
                   onDeleteJournal={handleDeleteJournal}
                   isOwner={true}
                   styleVariant="variant2"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-journals-content">
          <p className="no-journals-text">No journals found. Start by creating a new one!</p>
          <Link to="/journals" className="btn create-journal-btn">Create Journal</Link>
        </div>
      )}
    </div>
  );
};

export default JournalSection;