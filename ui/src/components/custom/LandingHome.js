import React from "react";
import BannerBackground from "../../styles/Assets/home-banner-background.png";
import BannerImage from "../../styles/monkey_writing.png";
import Navbar from "src/components/custom/LandingNavbar";
import { FiArrowRight } from "react-icons/fi";
import LandingStyling from "src/styles/components/LandingPage.css";

const LandingHome = () => {
  return (
    <div className="landing-home-container">
      <Navbar />
      <div className="landing-home-banner-container">
        <div className="landing-home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="landing-home-text-section">
          <div className="landing-home-body">
          <h1 className="landing-primary-heading">
            Peel your thoughts one entry at a time
          </h1>
          <p className="landing-primary-text">
            Become a part of the Peels community and start journaling today to keep track of your thoughts and emotions.
          </p>
          </div>
        </div>
        <div className="landing-home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default LandingHome;