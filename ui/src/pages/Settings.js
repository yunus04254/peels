import React from "react";
import "../styles/pages/Settings.css";
import SettingsSection from "../components/custom/SettingsSection";

const Settings = () => {
  return (
    <div className="content settings-content">
      <div
        className="page-header"
        style={{ fontSize: "30px", fontWeight: "Bold" }}
      >
        <h1>Settings</h1>
      </div>
      <SettingsSection />
    </div>
  );
};

export default Settings;
