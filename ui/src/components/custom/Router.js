import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';
import Welcome from '../../pages/Welcome';
import Home from '../../pages/Home';
import Settings from '../../pages/Settings';
import PrivateRoute from './PrivateRoute';
import Market from '../../pages/Market';
import Leaderboard from '../../pages/Leaderboard';
import Statistics from '../../pages/Statistics';
import JournalPage from '../../pages/JournalPage';
import JournalDetailPage from '../../pages/JournalDetailPage';
import Friends from '../../pages/Friends';
import Bookmarks from '../../pages/Bookmarks';
import Feed from '../../pages/Feed';
import Notifications from '../../pages/Notifications';
import { NotificationProvider } from '../../context/NotificationContext';
import Profile from '../../pages/Profile';
import { BananaProvider } from '../../context/BananaContext';
import LandingPage from '../../pages/LandingPage';

export default function Router() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <BananaProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Welcome />} />
            <Route path="/home" element={
              <PrivateRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/market" element={
              <PrivateRoute>
                <MainLayout>
                  <Market />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/leaderboard" element={
              <PrivateRoute>
                <MainLayout>
                  <Leaderboard />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/statistics" element={
              <PrivateRoute>
                <MainLayout>
                  <Statistics />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/journals" element={
              <PrivateRoute>
                <MainLayout>
                  <JournalPage />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/journals/:journalId" element={
              <PrivateRoute>
                <MainLayout>
                  <JournalDetailPage />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/friends" element={
              <PrivateRoute>
                <MainLayout>
                  <Friends />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/bookmarks" element={
              <PrivateRoute>
                <MainLayout>
                  <Bookmarks />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/feed" element={
              <PrivateRoute>
                <MainLayout>
                  <Feed />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </PrivateRoute>
            } />
          </Routes>
        </BananaProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
