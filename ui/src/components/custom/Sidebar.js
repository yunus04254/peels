import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import "../../styles/components/Sidebar.css";
import monkeyLogo from "../../styles/monkey.png";
import peelsLogo from "../../styles/peels.png";
import bananaLogo from "../../styles/banana.png";
import profilePicture from "../../styles/monkey.png";
import { useAuth } from "../../context/AuthContext";
import { Label } from "src/components/ui/label";
import {
  FiMenu,
  FiHome,
  FiBookOpen,
  FiShoppingCart,
  FiAward,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiEdit3,
  FiBookmark,
  FiTv,
} from "react-icons/fi";
import BananaCounter from "./BananaCounter";

import "../../styles/components/Sidebar.css";
import { Button } from "src/components/ui/button";
import { LogoutIcon } from "@heroicons/react/outline";
import NewEntryCarousel from "src/components/custom/entries/NewEntryCarousel";
import SearchBar from "./search/SearchBar";
import NotificationButton from "src/components/custom/notifications/NotificationButton";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const usernameWithAt = user ? `@${user.username}` : "@guest";

  useEffect(() => {
    const handleResize = () => {
      // Assuming 768px is the breakpoint for mobile view
      if (window.innerWidth > 768 && isSidebarOpen) {
        setIsSidebarOpen(false); // or true, depending on your desired behavior
      }
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout Error:", error);
      });
  };

  const handleClick = (path) => {
    setActiveLink(path);
    navigate(path);
  };

  const handleProfileClick = (event) => {
    if (window.innerWidth > 768) {
      toggleDropdown(event);
    } else {
      navigate("/profile");
    }
  };

  const toggleDropdown = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setShowDropdown(!showDropdown);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const closeDropdown = () => {
      setShowDropdown(false);
      document.removeEventListener("click", closeDropdown);
    };

    if (showDropdown) {
      setTimeout(() => {
        document.addEventListener("click", closeDropdown);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, [showDropdown]);

  const handleClickOutside = (event) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      !toggleButtonRef.current.contains(event.target) &&
      window.innerWidth <= 768
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-auto sidebar-border">
      <button
        ref={toggleButtonRef}
        className="menu-button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FiMenu />
      </button>
      <div
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? "active" : ""}`}
      >
        <div className="sidebar-top">
          <img src={peelsLogo} alt="Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <SearchBar />
          <Link
            to="/home"
            className={activeLink === "/home" ? "active" : ""}
            onClick={() => handleClick("/home")}
          >
            <FiHome className="icon" />
            <span>Home</span>
          </Link>
          <Link
            to="/feed"
            className={activeLink === "/feed" ? "active" : ""}
            onClick={() => handleClick("/feed")}
          >
            <FiTv className="icon" /> <span>Feed</span>
          </Link>
          <Link
            to="/journals"
            className={activeLink === "/journals" ? "active" : ""}
            onClick={() => handleClick("/journals")}
          >
            <FiBookOpen className="icon" />
            <span>Journals</span>
          </Link>
          <Link
            to="/market"
            className={activeLink === "/market" ? "active" : ""}
            onClick={() => handleClick("/market")}
          >
            <FiShoppingCart className="icon" />
            <span>Market</span>
          </Link>
          <Link
            to="/leaderboard"
            className={activeLink === "/leaderboard" ? "active" : ""}
            onClick={() => handleClick("/leaderboard")}
          >
            <FiAward className="icon" />
            <span>Leaderboard</span>
          </Link>
          <Link
            to="/statistics"
            className={activeLink === "/statistics" ? "active" : ""}
            onClick={() => handleClick("/statistics")}
          >
            <FiBarChart2 className="icon" />
            <span>Statistics</span>
          </Link>
          <Link
            to="/friends"
            className={activeLink === "/friends" ? "active" : ""}
            onClick={() => handleClick("/friends")}
          >
            <FiUsers className="icon" />
            <span>Friends</span>
          </Link>
          {/* Dynamically added links from the dropdown for smaller screens or when the sidebar becomes togglable */}
          {isSidebarOpen && (
            <>
              <Link
                to="/bookmarks"
                className={activeLink === "/bookmarks" ? "active" : ""}
                onClick={() => handleClick("/bookmarks")}
              >
                <FiBookmark className="icon" />
                <span>Bookmarks</span>
              </Link>
              <Link
                to="/settings"
                className={activeLink === "/settings" ? "active" : ""}
                onClick={() => handleClick("/settings")}
              >
                <FiSettings className="icon" />
                <span>Settings</span>
              </Link>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <FiLogOut className="icon" />
                <span>Log Out</span>
              </Link>
            </>
          )}
          <div className="entry-box">
            <NewEntryCarousel />
          </div>
        </nav>
        <div className="sidebar-footer">
          <NotificationButton user={user} />
          <div className="profile-container" onClick={handleProfileClick}>
            <div className="profile-image-container">
              <img
                src={"/" + user.favPfp}
                alt="Profile"
                className="profile-image"
              />
            </div>
            {/* Hide dropdown in the DOM structure when sidebar is open for consistent behavior */}
            {!isSidebarOpen && (
              <div
                ref={dropdownRef}
                className={`profile-options ${showDropdown ? "active" : ""}`}
              >
                <Link to="/profile" onClick={() => setShowDropdown(false)}>
                  Profile
                </Link>
                <Link to="/bookmarks" onClick={() => setShowDropdown(false)}>
                  Bookmarks
                </Link>
                <Link to="/settings" onClick={() => setShowDropdown(false)}>
                  Settings
                </Link>
                {/* This log out option is hidden when sidebar is open to avoid duplication */}
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Log Out
                </Link>
              </div>
            )}
            <span className="username">{usernameWithAt}</span>
            <BananaCounter user={user} bananaLogo={bananaLogo} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
