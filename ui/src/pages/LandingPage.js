import React from "react";
import LandingHome from "src/components/custom/LandingHome";
import LandingTeam from "src/components/custom/LandingTeam";
import LandingWorking from "src/components/custom/LandingWorking";
import LandingStyling from "src/styles/components/LandingPage.css";

function Landing() {
  return (
    <div className="landing-App">
    <LandingHome/>
    <LandingWorking/>
    <LandingTeam/>
    </div>

  );
}

export default Landing;