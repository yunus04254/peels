import React from "react";
import ProfilePic from "../../styles/Assets/john-doe-image.png"; 
import ahmetProfilePic from "../../styles/Assets/teamProfiles/ahm.png";
import medantProfilePic from "../../styles/Assets/teamProfiles/med.png";
import bivasProfilePic from "../../styles/Assets/teamProfiles/biv.png";
import hassanProfilePic from "../../styles/Assets/teamProfiles/has.png";
import imranProfilePic from "../../styles/Assets/teamProfiles/imr.png";
import yunusProfilePic from "../../styles/Assets/teamProfiles/yun.png";
import yifeiProfilePic from "../../styles/Assets/teamProfiles/yif.png";
import yasithProfilePic from "../../styles/Assets/teamProfiles/yas.png";
import kotaProfilePic from "../../styles/Assets/teamProfiles/kot.png";

const Team = () => {
  const teamInfoData = [
    {
        name: "Ahmet Kucuk",
        image: ahmetProfilePic,
      },
    {
      name: "Bivas Aryal",
      image: bivasProfilePic,
    },
    {
      name: "Hassan Mahmood",
      image: hassanProfilePic,
    },
    {
        name: "Imran Mehdiyev",
        image: imranProfilePic,
    },
    {
        name: "Kota Amemiya",
        image: kotaProfilePic,
    },
    {
        name: "Medant Sharan",
        image: medantProfilePic,
    },
    {
      name: "Yasith M Desanayakage",
      image: yasithProfilePic,
    },
    {
        name: "Yifei Shi",
        image: yifeiProfilePic,
    },

    {
        name: "Yunus Sufian",
        image: yunusProfilePic,
    },

  ];

  return (
    <div id="team-section" className="landing-work-section-wrapper">
      <div className="landing-work-section-top">
        <p className="landing-primary-subheading">Team</p>
        <h1 className="landing-primary-heading">Team Banana Bytes</h1>
        <p className="landing-primary-text">
          This is the banana-studded team that worked on the project together to make it a success.
        </p>
      </div>
      <div className="landing-work-section-bottom">
        {teamInfoData.map((member) => (
          <div key={member.name} className="landing-team-section-bottom">
            <h2><img src={member.image} alt={member.name}/></h2>
            <p style={{fontSize:"25px", }}>{member.name}</p>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;