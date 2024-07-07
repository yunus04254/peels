import React, { useEffect, useState } from "react";
import Journal from "../components/custom/Journal";
import CreateJournal from "../components/custom/CreateJournal";
import { Separator } from "../components/ui/separator";
import '../styles/pages/Journals.css';
import { Get } from "src/lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";

function JournalPage() {
  const [journals, setJournals] = useState([]);
  const [friendsJournals, setFriendsJournals] = useState([]);
  const { user } = useAuth();

  const fetchJournals = async () => {
    try {
      const response = await Get("journals/get_user_journal", null, {
        user: user,
      });
      if (!response.ok) throw new Error("Failed to fetch journals");
      const data = await response.json();
      setJournals(data);
    } catch (error) {
      console.error("Error fetching journals:", error);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchFriendsJournals = async () => {
    try {
      const response = await Get("journals/friends_journals", null, {
        user: user,
      });
      if (!response.ok) throw new Error("Failed to fetch friends' journals");
      const data = await response.json();
      setFriendsJournals(data);
    } catch (error) {
      console.error("Error fetching friends' journals:", error);
    }
  };

  useEffect(() => {
    fetchFriendsJournals();
  }, []);

  const handleAddJournal = (newJournal) => {
    setJournals([...journals, newJournal]);
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

  const journalContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    coloumnGap: "2.5rem",
    rowGap: "5rem",
    padding: "2rem",
  };

  return (
    <div className="content">
      <Separator className="my-2" />
      <h1 style={{ fontSize: "30px", fontWeight: "bold" }}> Journals</h1>
      <Separator className="my-4" />
      <Card className="w-auto" style={{ backgroundColor: "white" }}>
        <CardHeader>
          <CardTitle>Owned by you</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="journals-container" style={journalContainerStyle}>
            <CreateJournal onAddJournal={handleAddJournal} />
            {journals.map((journal) => (
              <Journal
                key={journal.journalID}
                journalID={journal.journalID}
                title={journal.title}
                theme={journal.theme}
                reminder={journal.reminder}
                isPrivate={journal.isPrivate}
                onUpdateJournal={onUpdateJournal}
                onDeleteJournal={handleDeleteJournal}
                isOwner={true}
                styleVariant="variant1"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4" />
      <Card className="w-auto" style={{ backgroundColor: "white" }}>
        <CardHeader>
          <CardTitle>Friends Journals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="journals-container" style={journalContainerStyle}>
            {friendsJournals.map((journal) => (
              <Journal
                key={journal.journalID}
                journalID={journal.journalID}
                title={journal.title}
                theme={journal.theme}
                reminder={journal.reminder}
                isPrivate={journal.isPrivate}
                ownerUsername={journal.ownerUsername}
                isOwner={false}
                styleVariant="variant1"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default JournalPage;
