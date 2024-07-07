import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "src/components/ui/card";
import { 
  Avatar, 
  AvatarImage,
  AvatarFallback } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { useNavigate } from 'react-router-dom';
import Zoom from 'react-medium-image-zoom'
import {getTimeAgo} from "src/lib/helpers-date";

const ShortEntryView = ({ 
  title, 
  journalName, 
  date, 
  journalID, 
  user, 
  content }) => {
  const navigate = useNavigate();

//view the journal when the button is clicked
  const viewJournal = () => {
    navigate(`/journals/${journalID}`);
  };

//get the entry content and return a snippet of it appended with '...' if it is too long
  const getContentSnippet = (contentJSON, maxLength = 100) => {
    try {
      const contentObj = JSON.parse(contentJSON);
      let contentString = '';
      if (contentObj){
        contentString = contentObj.ops.map(op => op.insert).join('');
        
        if (contentString.length > maxLength) {
          contentString = contentString.substring(0, maxLength) + '...';
        }
      }
  
      return contentString;
    } catch (error) {
      console.error('Error parsing content:', error);
      return '';
    }
  };

  const contentSnippet = getContentSnippet(content);

  const timeAgo = getTimeAgo(date);


  //return the card with the entry details
  return (
    <Card className="short-entry-view">
      <CardHeader>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={user.favPfp} />
            <AvatarFallback>
              User
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-gray-500 ml-1" style={{fontWeight:"Bold"}}>
              {user.username}
            </div>

          {user.favBadge &&
          <div className="text-sm ml-4">
            <Zoom>
            <img src={user.favBadge} className="w-[40px] h-[40px]"/>
            </Zoom>
          </div>}
          <div className="text-sm text-gray-500 ml-1">
          <p>
           . {timeAgo}
          </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div>
            <p className='flex justify-between' style={{fontSize:"20px"}}>
              {contentSnippet}
              </p>
          </div>
          <CardFooter className="flex justify-between" style={{
             marginBottom: '0',
             paddingBottom: '0', 
             color:"grey", }}>
          <span>
            <div style={{whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    maxWidth: '150px'}}>
            from: {journalName}
            </div>
            </span>
<Button 
  onClick={viewJournal} 
  style={{
    color: "white",
    padding: "10px 15px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "8px",
    marginLeft: "20px",
    // smooth transition for hover effect
    transitionDuration: "0.4s", 
  }}
  >
          Jump to Journal
          </Button>
      </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortEntryView;
