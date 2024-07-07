import React from "react";
 import { FiEdit, FiEdit3, FiSmile, FiAward, FiUsers } from 'react-icons/fi';

const LandingWorking = () => {
  console.log("LandingWorking.js has been rendered");
  const workInfoData = [
    {
      IconComponent: () => <FiEdit size={100} color="orange"/>,
      title: "Create an Account",
      text: "An account can be created with access to all the features of the app. One can change the password and email address associated with the account.",
    },
    {
      IconComponent: () => <FiEdit3 size={100} color="orange"/>,
      title: "Write an Entry",
      text: "You can create a journal and start writing entries. You can also edit and delete the entries. You can also bookmark the entries.",
    },
    {
      IconComponent: () => <FiSmile size={100} color="orange"/>,
      title: "Mood Tracking",
      text: "You can track your mood and emotions by selecting from a range of emojis. You can also view the mood history in the form of a graph.",
    },
    {
      IconComponent: () => <FiAward size={100} color="orange"/>,
      title: "Gamification",
      text: "You can earn bananas by writing entries and completing tasks. You can use bananas to buy new themes and templates from the marketplace.",
    },
    {
      IconComponent: () => <FiUsers size={100} color="orange"/>,
      title: "Friends",
      text: "You can add friends and view their journals and entries. You can also compete with them on the leaderboard.",

    },
  ];
  return (
    <div id="work-section" className="landing-work-section-wrapper">
      <div className="landing-work-section-top">
        <p className="landing-primary-subheading">Work</p>
        <h1 className="landing-primary-heading">How It Works</h1>
        <p className="landing-primary-text">
          This is a journaling web app made to help you keep track of your thoughts and emotions.
          This is the submission by Team Banana Byte for the large group coursework of module 5CCS2SEG for session 2023-24.
          Below are some functionalities that we have implemented in our web app.
        </p>
      </div>
      <div className="landing-work-section-bottom">
        {workInfoData.map((data) => (
          <div className="landing-work-section-info" key={data.title}>
            <div className="landing-info-boxes-img-container">
              <data.IconComponent/>
            </div>
            <div style={{fontSize:"40px", fontFamily:"Verdana", fontWeight:"5px"}}><h1>{data.title}</h1></div>
            <p>{data.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingWorking;