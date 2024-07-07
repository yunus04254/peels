import React, { useEffect, useState } from "react";
import ShortEntryView from "./entries/ShortEntryView";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Label } from "src/components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { Get } from "src/lib/api";

const FeedView = () => {
  const [personalEntries, setPersonalEntries] = useState([]);
  const [friendsEntries, setFriendsEntries] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      // Fetch the current user's entries
      try {
        const response = await Get("entries/fetch_user_entries", null, {
          user: user,
        });
        if (response.ok) {
          const data = await response.json();
          setPersonalEntries(data);
        } else {
          throw new Error("Failed to fetch personal entries");
        }
      } catch (error) {
        console.error("Error fetching personal entries:", error);
      }

      // Fetch friends' entries
      try {
        const response = await Get("entries/fetch_friends_entries", null, {
          user: user,
        });
        if (response.ok) {
          const data = await response.json();
          setFriendsEntries(data);
        } else {
          throw new Error("Failed to fetch friends entries");
        }
      } catch (error) {
        console.error("Error fetching friends entries:", error);
      }
    };

    fetchEntries();
  }, [user]);

  return (
    <Tabs>
      <TabList>
        <Tab>My Feed</Tab>
        <Tab>Friends Feed</Tab>
      </TabList>

      <TabPanel>
        {personalEntries.length > 0 ? (
          <div className="short-entries-list" style={{ marginTop: "30px" }}>
            {personalEntries.map((entry) => (
              <ShortEntryView
                key={entry.entryID}
                title={entry.title}
                journalName={entry.Journal.title}
                journalID={entry.JournalJournalID}
                date={entry.date}
                content={entry.content}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div style={{ marginTop: "30px", fontStyle: "italic" }}>
            <Label style={{ fontSize: "20px" }}>It's quiet in here...</Label>
          </div>
        )}
      </TabPanel>

      <TabPanel>
        <div className="friends-entries-list">
          {friendsEntries.length > 0 ? (
            friendsEntries.map((entry) => (
              <ShortEntryView
                key={entry.entryID}
                title={entry.title}
                journalName={entry.Journal.title}
                journalID={entry.JournalJournalID}
                date={entry.date}
                content={entry.content}
                user={entry.Journal.User}
              />
            ))
          ) : (
            <div style={{ marginTop: "30px", fontStyle: "italic" }}>
              <Label style={{ fontSize: "20px" }}>It's quiet in here...</Label>
            </div>
          )}
        </div>
      </TabPanel>
    </Tabs>
  );
};

export default FeedView;
