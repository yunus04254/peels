import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import WelcomeSection from "../components/custom/WelcomeSection";
import StatisticsSection from "../components/custom/StatisticsSection";
import JournalSection from "../components/custom/JournalSection";
import GoalSetting from "../components/custom/GoalSection";
import { Get } from "src/lib/api";
import { useNavigate } from "react-router-dom";

import "src/styles/pages/Home.css";
import NotificationPanel from "../components/custom/notifications/NotificationPanel";
import { useNotification } from "src/context/NotificationContext";
import TemplateSelect from "src/components/custom/templates/TemplateSelect";
import NewEntryCarousel from "src/components/custom/entries/NewEntryCarousel";

const Home = () => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const { sendNotification, updateNotifications, deleteNotification } =
    useNotification();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    const fetchStatistics = async () => {
      try {
        const statsResponse = await Get(`statistics`, null, { user: user });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalEntries: statsData.totalEntries.toString(),
            totalJournals: statsData.totalJournals.toString(),
            longestStreak: statsData.longestStreak.toString(),
            currentStreak: statsData.currentStreak.toString(),
          });
        } else {
          console.error("Failed to fetch statistics");
        }

        const endDate = new Date();
        const startDate = new Date(
          new Date().setFullYear(endDate.getFullYear() - 10)
        );
        const formatToISODate = (date) => date.toISOString().split("T")[0];

        const graphResponse = await Get(
          `statistics/graphs?startDate=${formatToISODate(
            startDate
          )}&endDate=${formatToISODate(endDate)}`,
          null,
          { user: user }
        );
        if (graphResponse.ok) {
          const graphData = await graphResponse.json();
          setMoodData(graphData.moodData);
        } else {
          console.error("Failed to fetch graph data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchStatistics();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const onTemplateClick = (content, description) => {
    setSelectedTemplate(content);
  };

  return (
    <div className="content home-layout">
      <div className="main-content">
        <NewEntryCarousel
          disableTrigger={true}
          defaultContent={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />
        <WelcomeSection username={user?.username || "Guest"} />
        <TemplateSelect carousel={true} onTemplateClick={onTemplateClick} />
        <JournalSection />
        <GoalSetting />

        {isMobile && <StatisticsSection stats={stats} moodData={moodData} />}
      </div>
      {!isMobile && (
        <div className="statistics-section">
          <StatisticsSection stats={stats} moodData={moodData} />
        </div>
      )}
    </div>
  );
};

export default Home;
