import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "src/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import EditJournal from "src/components/custom/EditJournal";
import { Delete } from "src/lib/api";
import { Separator } from "../ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog"
import { useAuth } from "src/context/AuthContext";




function Journal({ journalID, title, theme, reminder, isPrivate, onUpdateJournal, onDeleteJournal, ownerUsername, isOwner, onClick, styleVariant }) {

  let navigate = useNavigate();

  const { user } = useAuth();

  const openJournal = () => {
    navigate(`/journals/${journalID}`);
  };

  const themeColors = {
    "Theme 1": "turquoise",
    "Theme 2": "lightpink",
    "Theme 3": "lightyellow"
  };


  const handleDelete = async () => {
    try {

        const response = await Delete(`journals/${journalID}`, null, { user: user });

        if (!response.ok) throw new Error("Failed to delete journal");

        onDeleteJournal(journalID);
    } catch (error) {
        console.error("Error deleting journal:", error);
        alert("Failed to delete journal.");
    }
};

//Journal components are displayed in both the dashboard and journal page, and hence have different styling
const selectJournalStyle = () => {

  const journalCardStyle1 = {
    backgroundColor: themeColors[theme] || theme,
    width: "180px",
    height: "270px",
    margin: "10px",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
    transition: "0.3s",
    borderRadius: "5px",
    border: "3px solid #ddd",
    borderColor: "black",
    padding: "16px",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
    marginLeft: "30px",
  };


  const journalCardStyle2 = {
    backgroundColor: themeColors[theme] || theme,
    width: '100%',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2), 0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: '0.3s',
    borderRadius: '5px',
    border: '3px solid #ddd',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    paddingTop: '141.42%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  switch (styleVariant) {
    case 'variant1':
      return journalCardStyle1;
    case 'variant2':
      return journalCardStyle2;
    default:
      return {};
  }
};

const journalStyle = selectJournalStyle();


const journalHoverStyle = {
  boxShadow: '0 15px 20px 0 rgba(0,0,0,0.2)'
};

const titleStyle = {
  position: 'absolute',
  bottom: '-50px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  fontSize: '1.5em',
  fontWeight: 'bold',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const ownerUsernameStyle = {
  position: 'absolute',
  bottom: '-70px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '0.9em',
  color: 'grey',
  fontStyle: 'italic'
};

const buttonContainerStyle = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
};



  return (
    <div
      className="journal-container"
      style={{
        margin: "10px",
        width: "180px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className="journal"
        onClick={onClick ? onClick : openJournal}
        style={journalStyle}
        onMouseOver={(e) =>
          (e.currentTarget.style.boxShadow = journalHoverStyle.boxShadow)
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.boxShadow = journalStyle.boxShadow)
        }
      >
        {isOwner && (
          <div style={buttonContainerStyle}>
            {" "}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-testid="delete-journal-button"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  variant="translucent"
                  size="icon"
                  aria-label="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your journal and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div
              onClick={(event) => event.stopPropagation()}
              data-testid="edit-journal-button"
            >
              <EditJournal
                journal={{
                  journalID,
                  title,
                  theme,
                  reminder,
                  isPrivate,
                }}
                onUpdateJournal={onUpdateJournal}
              />
            </div>
          </div>
        )}
        <Separator className="my-4" />
        {ownerUsername && (
          <span style={ownerUsernameStyle}>@{ownerUsername}</span>
        )}
        <span style={titleStyle}>{title}</span>
      </div>
    </div>
  );
}

export default Journal;