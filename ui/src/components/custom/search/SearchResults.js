import React, { useEffect, useState } from "react";
import { Get } from "src/lib/api";
import { formatDate } from "src/lib/helpers-date";
import { useAuth } from "src/context/AuthContext";

import { Link } from "react-router-dom";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "src/components/ui/command";
import { Button } from "src/components/ui/button";
import { toast } from "sonner";

function SearchResults({ setOpen }) {
  const [journals, setJournals] = useState([]);
  const [entries, setEntries] = useState([]);

  const { user } = useAuth();

  const fetchJournals = async () => {
    try {
      const response = await Get("journals/get_user_journal", null, {
        user: user,
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching journals:", error);
      return [];
    }
  };

  const fetchEntriesForJournal = async (journalID) => {
    // Fetch the entries by iterating each journal
    try {
      const response = await Get(
        "entries/find_entries",
        { journalID: journalID },
        { user: user }
      );
      const data = await response.json();
      // Add journalId field to each entry object
      return data.map((entry) => ({ ...entry, journalId: journalID }));
    } catch (error) {
      console.error(
        `Error fetching entries for journal ID ${journalID}:`,
        error
      );
      return [];
    }
  };

  // Within your SearchResults.js

  useEffect(() => {
    let isMounted = true; // Flag to track mount status

    const fetchData = async () => {
      try {
        const journals = await fetchJournals();
        const entriesPromises = journals.map((journal) =>
          fetchEntriesForJournal(journal.journalID)
        );
        const entriesArrays = await Promise.all(entriesPromises);
        const entries = entriesArrays.flat(); // Flatten the array of arrays into a single array

        if (isMounted) {
          // Only update state if component is mounted
          setJournals(journals);
          setEntries(entries);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        // Optionally handle the error for an unmounted component
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Set flag to false when component unmounts
    };
  }, []);

  const handleClickResult = () => {
    toast.success("Redirect to the result", {
      className: "text-white",
      description: "Now you are at the corresponding journal page. ",
      action: {
        label: "Okay",
        onClick: () => {},
      },
    });
    setOpen(false);
  };

  return (
    <div>
      {/* The result list for journals */}
      <CommandGroup heading="Journals">
        {journals.map((journal) => (
          <Link
            to={`/journals/${journal.journalID}`}
            key={`journal_${journal.journalID}`}
            onClick={handleClickResult}
          >
            <CommandItem className="flex justify-between mx-2">
              <Button variant="link">
                <span>
                  {journal.title.length > 20
                    ? journal.title.slice(0, 20) + "..."
                    : journal.title}
                </span>
              </Button>
              <div className="flex-end text-sm">
                <span>created by </span>
                <span style={{ fontStyle: "italic" }}>
                  {formatDate(journal.creationDate)}
                </span>
              </div>
            </CommandItem>
          </Link>
        ))}
      </CommandGroup>
      <CommandSeparator />
      {/* The result list for entries */}
      <CommandGroup heading="Entries">
        {entries.map((entry) => (
          <Link
            to={`/journals/${entry.journalId}`}
            key={`entry_${entry.entryID}`}
            onClick={handleClickResult}
          >
            <CommandItem className="flex justify-between mx-2">
              <div>
                <Button variant="link">
                  <span>
                    {entry.title.length > 20
                      ? entry.title.slice(0, 20) + "..."
                      : entry.title}
                  </span>
                </Button>
              </div>
              <div className="flex-end text-sm">
                <span>created by </span>
                <span style={{ fontStyle: "italic" }}>
                  {formatDate(entry.date)}
                </span>
              </div>
            </CommandItem>
          </Link>
        ))}
      </CommandGroup>
    </div>
  );
}

export default SearchResults;
