import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import JournalView from "../components/custom/JournalView";
import { useMediaQuery } from "@react-hook/media-query";
import "../styles/pages/JournalDetail.css";
import { useAuth } from "src/context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useRef } from "react";
import { Get } from "src/lib/api";

function JournalDetailPage() {
  let { journalId } = useParams();
  const [journal, setJournal] = useState(null);
  const { user } = useAuth();
  const toastShown = useRef(false);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await Get(
          `journals/get_journal`,
          { id: journalId },
          { user: user }
        );
        if (!response.ok) throw new Error("Failed to fetch journal details");
        const data = await response.json();
        setJournal(data);
        //find the friends of the user who is logged in
        const friends_response = await Get("friends/list", null, {
          user: user,
        });
        if (!friends_response.ok) throw new Error("Failed to fetch friends");
        const friends_data = await friends_response.json();
        setFriends(friends_data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching journal details:", error);
      } finally {
      }
    };

    fetchJournal();
  }, [journalId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  //A journal can be accessed if either the journal or it belongs to a friend who has made the journal public
  const canAccessJournal = () => {
    // User can access their own journal
    if (journal && journal.UserUserID === user.userID) return true;

    // Check if the journal is public and logged-in user friend list includes the journal owner
    if (journal && !journal.isPrivate) {
      const isFriend = friends.some(
        (friend) => friend.userID === journal.UserUserID
      );
      return isFriend;
    }

    return false;
  };

  // Determine if the user can access the journal
  const canAccess = canAccessJournal();

  if (!journal || !canAccess) {
    if (!toastShown.current) {
      toastShown.current = true;
      toast.error("Error", {
        className: "background-white",
        description: "Cannot access journal...",
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
      });
    }
    return <Navigate to="/home" />;
  }

  return (
    <>
      <JournalView journal={journal} />
    </>
  );
}

export default JournalDetailPage;
