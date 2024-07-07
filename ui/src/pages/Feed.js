import React from 'react';
import FeedView from '../components/custom/FeedView';
import { Separator } from "../components/ui/separator";
const Feed = () => {
  return (
    <div className="content">
      <div className="page-header" style={{fontSize:"30px", fontWeight:"Bold"}}>
      <h1>Feeds</h1>
      </div>
      <div className="page-sub-header" style={{fontSize:"20px"}}>
      </div>
      <Separator />
      <FeedView />
    </div>
  );
}

export default Feed;