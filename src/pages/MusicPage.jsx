import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '../context/PageContext.jsx';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';
import { GalleryModal } from '../components/GalleryModal.jsx';
import AudioPlayerControls from '../components/AudioPlayerControls.jsx';
import '../styles/pages/_portfolioPage.scss'; // Reusing a generic portfolio page style
import '../styles/pages/_musicPage.scss'; // Specific styles for music page

function MusicPage() {
  const { getPageControls } = usePage();
  const { playTrack, togglePlayPause, pauseTrack, isPlaying, currentTrack, setTracks } = useNowPlaying();
  const controls = getPageControls('/music');

  // Track the current active track index for each control (independent)
  const [activeTrackIndices, setActiveTrackIndices] = useState({});

  // Handler for track changes in individual controls
  const handleTrackChange = (controlId, direction) => {
    // Get all audio tracks
    const audioTracks = musicItems.filter(item => item.isAudio);

    // Find the index of the currently playing track
    const currentPlayingIndex = currentTrack
      ? audioTracks.findIndex(track => track.title === currentTrack.title)
      : -1;

    // Calculate the new index based on direction (1 for next, -1 for previous)
    let newIndex;
    if (currentPlayingIndex === -1) {
      // No track is playing, start with the first track
      newIndex = 0;
    } else {
      newIndex = currentPlayingIndex + direction;
      // Wrap around
      if (newIndex < 0) newIndex = audioTracks.length - 1;
      if (newIndex >= audioTracks.length) newIndex = 0;
    }

    // Play the new track
    const newTrack = audioTracks[newIndex];
    if (newTrack) {
      playTrack({
        title: newTrack.title,
        category: 'Music',
        albumCover: newTrack.albumCover
      }, newTrack.src);
    }
  };

  // 🎯 MODAL STATE MANAGEMENT - Popout functionality
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎯 MODAL HANDLERS - Popout functionality
  const openModal = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemIndex(null);
    document.body.style.overflow = 'auto'; // Restore scroll
  };

  const navigateModal = (direction) => {
    const currentIndex = selectedItemIndex;
    const newIndex = currentIndex + direction;
    const maxIndex = musicItems.length - 1;

    if (newIndex >= 0 && newIndex <= maxIndex) {
      setSelectedItemIndex(newIndex);
    }
  };

  // Set tracks in global context for notification navigation
  useEffect(() => {
    const audioTracks = musicItems.filter(item => item.isAudio);
    setTracks(audioTracks);
  }, []);

  // 🎯 KEYBOARD EVENT HANDLING - Popout functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          navigateModal(-1);
          break;
        case 'ArrowRight':
          navigateModal(1);
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, selectedItemIndex]);

  // Centralized album cover mapping for consistent, meaningful cover assignment
  const albumCoverMapping = {
    "Banger": "/src/assets/images/glassesroompostpc1.png", // Futuristic room - energetic electronic
    "Blaaaaaaaa": "/src/assets/photography/Sushi-2.jpg", // Sushi - ambient, atmospheric
    "Melancholische Scheiße": "/src/assets/images/shader_pause.jpg", // Shader work - melancholic, introspective
    "Strange V2-1": "/src/assets/images/Sci_Fist.jpg", // Digital portrait - experimental, abstract
    "Strange V2": "/src/assets/images/Sci_Fist.jpg", // Digital portrait - experimental, abstract
    "Chronic Stress Syndrom": "/src/assets/photography/Sushi-1.jpg", // Sushi - meditative, calm
    "Idee1": "/src/assets/images/backhumanoid.png", // Sci-fi character - conceptual, abstract
    "Still": "/src/assets/photography/01090055.jpg", // Architecture - serene, calm
    "Sci Fist": "/src/assets/images/Sci_Fist.jpg", // Digital portrait - track cover
    "Shader Pause": "/src/assets/images/shader_pause.jpg", // Shader work - track cover
    "Sunken": "/src/assets/images/Sunken.jpeg", // Abstract art - track cover
    "Sword": "/src/assets/images/Sword.png", // Fantasy art - track cover
    "Pandora": "/src/assets/images/Pandora.png", // Character art - track cover
    "Back Humanoid": "/src/assets/images/backhumanoid.png", // Sci-fi character - track cover
    "Glasses Book Room": "/src/assets/images/glasses book room.png", // Room scene - album cover
    "Glasses Book Room Vol. 2": "/src/assets/images/glasses book room1.png", // Room scene variant - album cover
    "Room Perspective": "/src/assets/images/glassesroompostpc.png", // Room perspective - album cover
    "Pixel Art Collection": "/src/assets/images/Sharing my pixel art.png", // Pixel art - album cover
    "Untitled Study": "/src/assets/images/Untitled 08-07-2024 12-37-07.png", // Digital study - album cover
    "Digital Study": "/src/assets/images/Screenshot_2025.04.14_15.02.05.335.png" // Digital study - album cover
  };

  // Music items data for modal with proper album covers
  const musicItems = [
    {
      src: "/src/assets/music/Banger.mp4",
      alt: "Banger - Electronic Track",
      title: "Banger",
      category: "Music",
      description: "Genre: Electronic | Mood: Energetic, Driving",
      isAudio: true,
      albumCover: albumCoverMapping["Banger"],
      type: "audio"
    },
    {
      src: "/src/assets/music/blaaaaaaaaaaa.mp4",
      alt: "Blaaaaaaaa - Ambient Track",
      title: "Blaaaaaaaa",
      category: "Music",
      description: "Genre: Ambient | Mood: Atmospheric, Experimental",
      isAudio: true,
      albumCover: albumCoverMapping["Blaaaaaaaa"],
      type: "audio"
    },
    {
      src: "/src/assets/music/melancholische scheiße.mp4",
      alt: "Melancholische Scheiße - Ambient Track",
      title: "Melancholische Scheiße",
      category: "Music",
      description: "Genre: Ambient | Mood: Melancholic, Reflective",
      isAudio: true,
      albumCover: albumCoverMapping["Melancholische Scheiße"],
      type: "audio"
    },
    {
      src: "/src/assets/music/StrangeV2-1.wav",
      alt: "Strange V2-1 - Experimental Track",
      title: "Strange V2-1",
      category: "Music",
      description: "Genre: Experimental | Mood: Abstract, Unconventional",
      isAudio: true,
      albumCover: albumCoverMapping["Strange V2-1"],
      type: "audio"
    },
    {
      src: "/src/assets/music/StrangeV2.wav",
      alt: "Strange V2 - Experimental Track",
      title: "Strange V2",
      category: "Music",
      description: "Genre: Experimental | Mood: Abstract, Unconventional",
      isAudio: true,
      albumCover: albumCoverMapping["Strange V2"],
      type: "audio"
    },
    {
      src: "/src/assets/music/Chronic Stress Syndrom.mp3",
      alt: "Chronic Stress Syndrom - Ambient Track",
      title: "Chronic Stress Syndrom",
      category: "Music",
      description: "Genre: Ambient | Mood: Atmospheric, Meditative",
      isAudio: true,
      albumCover: albumCoverMapping["Chronic Stress Syndrom"],
      type: "audio"
    },
    {
      src: "/src/assets/music/idee1.mp3",
      alt: "Idee1 - Experimental Track",
      title: "Idee1",
      category: "Music",
      description: "Genre: Experimental | Mood: Abstract, Conceptual",
      isAudio: true,
      albumCover: albumCoverMapping["Idee1"],
      type: "audio"
    },
    {
      src: "/src/assets/music/still.mp3",
      alt: "Still - Ambient Track",
      title: "Still",
      category: "Music",
      description: "Genre: Ambient | Mood: Calm, Serene",
      isAudio: true,
      albumCover: albumCoverMapping["Still"],
      type: "audio"
    },
    {
      src: "/src/assets/images/Sci_Fist.jpg",
      alt: "Sci Fist - Track Cover Art",
      title: "Sci Fist",
      category: "Music",
      description: "Track cover artwork for Sci Fist composition",
      isAudio: false,
      albumCover: albumCoverMapping["Sci Fist"],
      type: "image"
    },
    {
      src: "/src/assets/images/shader_pause.jpg",
      alt: "Shader Pause - Track Cover Art",
      title: "Shader Pause",
      category: "Music",
      description: "Track cover artwork for Shader Pause composition",
      isAudio: false,
      albumCover: albumCoverMapping["Shader Pause"],
      type: "image"
    },
    {
      src: "/src/assets/images/Sunken.jpeg",
      alt: "Sunken - Track Cover Art",
      title: "Sunken",
      category: "Music",
      description: "Track cover artwork for Sunken composition",
      isAudio: false,
      albumCover: albumCoverMapping["Sunken"],
      type: "image"
    },
    {
      src: "/src/assets/images/Sword.png",
      alt: "Sword - Track Cover Art",
      title: "Sword",
      category: "Music",
      description: "Track cover artwork for Sword composition",
      isAudio: false,
      albumCover: albumCoverMapping["Sword"],
      type: "image"
    },
    {
      src: "/src/assets/images/Pandora.png",
      alt: "Pandora - Track Cover Art",
      title: "Pandora",
      category: "Music",
      description: "Track cover artwork for Pandora composition",
      isAudio: false,
      albumCover: albumCoverMapping["Pandora"],
      type: "image"
    },
    {
      src: "/src/assets/images/backhumanoid.png",
      alt: "Back Humanoid - Track Cover Art",
      title: "Back Humanoid",
      category: "Music",
      description: "Track cover artwork for Back Humanoid composition",
      isAudio: false,
      albumCover: albumCoverMapping["Back Humanoid"],
      type: "image"
    },
    {
      src: "/src/assets/images/glasses book room.png",
      alt: "Glasses Book Room - Album Cover Art",
      title: "Glasses Book Room",
      category: "Music",
      description: "Album cover artwork for Glasses Book Room collection",
      isAudio: false,
      albumCover: albumCoverMapping["Glasses Book Room"],
      type: "image"
    },
    {
      src: "/src/assets/images/glasses book room1.png",
      alt: "Glasses Book Room Vol. 2 - Album Cover Art",
      title: "Glasses Book Room Vol. 2",
      category: "Music",
      description: "Album cover artwork for Glasses Book Room Vol. 2 collection",
      isAudio: false,
      albumCover: albumCoverMapping["Glasses Book Room Vol. 2"],
      type: "image"
    },
    {
      src: "/src/assets/images/glassesroompostpc.png",
      alt: "Room Perspective - Album Cover Art",
      title: "Room Perspective",
      category: "Music",
      description: "Album cover artwork for Room Perspective collection",
      isAudio: false,
      albumCover: albumCoverMapping["Room Perspective"],
      type: "image"
    },
    {
      src: "/src/assets/images/Sharing my pixel art.png",
      alt: "Pixel Art Collection - Album Cover Art",
      title: "Pixel Art Collection",
      category: "Music",
      description: "Album cover artwork for Pixel Art Collection",
      isAudio: false,
      albumCover: albumCoverMapping["Pixel Art Collection"],
      type: "image"
    },
    {
      src: "/src/assets/images/Untitled 08-07-2024 12-37-07.png",
      alt: "Untitled Study - Album Cover Art",
      title: "Untitled Study",
      category: "Music",
      description: "Album cover artwork for Untitled Study collection",
      isAudio: false,
      albumCover: albumCoverMapping["Untitled Study"],
      type: "image"
    },
    {
      src: "/src/assets/images/Screenshot_2025.04.14_15.02.05.335.png",
      alt: "Digital Study - Album Cover Art",
      title: "Digital Study",
      category: "Music",
      description: "Album cover artwork for Digital Study collection",
      isAudio: false,
      albumCover: albumCoverMapping["Digital Study"],
      type: "image"
    }
  ];

  return (
    <section className="portfolio-page music-page">
      <h2 style={{ opacity: controls.titleOpacity || 1 }}>Music Portfolio</h2>
      <p style={{ opacity: controls.descriptionOpacity || 1 }}>
        Dive into my sonic creations, featuring synthwave, retro, and experimental tracks.
      </p>
      {/* Audio Tracks Section */}
      <div className="music-section">
        <h3>Audio Tracks</h3>
        <div
          className="music-list audio-tracks"
          style={{
            gap: controls.trackSpacing ? `${controls.trackSpacing}px` : '20px'
          }}
        >
          <div
            className="music-item"
            onClick={() => openModal(0)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Banger"]}
                  alt="Banger Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Banger"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Electronic | Mood: Energetic, Driving</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['banger'] || 0;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[0];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('banger', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(1)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Blaaaaaaaa"]}
                  alt="Blaaaaaaaa Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Blaaaaaaaa"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Ambient | Mood: Atmospheric, Experimental</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['blaaaaaaaaaaa'] || 1;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[1];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('blaaaaaaaaaaa', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(2)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Melancholische Scheiße"]}
                  alt="Melancholische Scheiße Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Melancholische Scheiße"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Ambient | Mood: Melancholic, Reflective</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['melancholische-scheiße'] || 2;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[2];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('melancholische-scheiße', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(3)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Strange V2-1"]}
                  alt="Strange V2-1 Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Strange V2-1"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Experimental | Mood: Abstract, Unconventional</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['strange-v2-1'] || 3;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[3];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('strange-v2-1', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(4)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Strange V2"]}
                  alt="Strange V2 Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Strange V2"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Experimental | Mood: Abstract, Unconventional</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['strange-v2'] || 4;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[4];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('strange-v2', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(5)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Chronic Stress Syndrom"]}
                  alt="Chronic Stress Syndrom Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Chronic Stress Syndrom"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Ambient | Mood: Atmospheric, Meditative</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <AudioPlayerControls
                    track={{ title: 'Chronic Stress Syndrom', category: 'Music', albumCover: albumCoverMapping["Chronic Stress Syndrom"] }}
                    audioSrc="/src/assets/music/Chronic Stress Syndrom.mp3"
                    tracks={musicItems.filter(item => item.isAudio)}
                    currentIndex={activeTrackIndices['chronic-stress-syndrom'] || 5}
                    onTrackChange={(newIndex) => handleTrackChange('chronic-stress-syndrom', newIndex)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(6)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Idee1"]}
                  alt="Idee1 Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Idee1"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Experimental | Mood: Abstract, Conceptual</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['idee1'] || 6;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[6];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('idee1', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div
            className="music-item"
            onClick={() => openModal(7)}
            style={{ cursor: 'pointer' }}
          >
            <div className="music-item-content">
              <div className="album-cover-section">
                <img
                  src={albumCoverMapping["Still"]}
                  alt="Still Album Cover"
                  className="track-album-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="album-cover-fallback" style={{ display: 'none' }}>
                  🎵
                </div>
              </div>
              <div className="track-info-section">
                <h4>"Still"</h4>
                {controls.showGenres !== false && (
                  <p>Genre: Ambient | Mood: Calm, Serene</p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const audioTracks = musicItems.filter(item => item.isAudio);
                    const currentIndex = activeTrackIndices['still'] || 7;
                    const currentTrack = audioTracks[currentIndex] || audioTracks[7];
                    return (
                      <AudioPlayerControls
                        track={{ title: currentTrack.title, category: 'Music', albumCover: currentTrack.albumCover }}
                        audioSrc={currentTrack.src}
                        tracks={audioTracks}
                        currentIndex={currentIndex}
                        onTrackChange={(newIndex) => handleTrackChange('still', newIndex)}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Cover Art Section */}
      <div className="music-section">
        <h3>Track Cover Art</h3>
        <div className="cover-art-grid track-covers">
          <div
            className="cover-art-item"
            onClick={() => openModal(8)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Sci_Fist.jpg"
              alt="Sci Fist Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Sci Fist' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Sci Fist') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Sci Fist',
                    category: 'Music',
                    albumCover: '/src/assets/images/Sci_Fist.jpg'
                  }, '/src/assets/music/Banger.mp4');
                }
              }}
              aria-label="Preview Sci Fist"
            >
              {isPlaying && currentTrack?.title === 'Sci Fist' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Sci Fist</p>
          </div>
          <div
            className="cover-art-item"
            onClick={() => openModal(9)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/shader_pause.jpg"
              alt="Shader Pause Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Shader Pause' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Shader Pause') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Shader Pause',
                    category: 'Music',
                    albumCover: '/src/assets/images/shader_pause.jpg'
                  }, '/src/assets/music/melancholische scheiße.mp4');
                }
              }}
              aria-label="Preview Shader Pause"
            >
              {isPlaying && currentTrack?.title === 'Shader Pause' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Shader Pause</p>
          </div>
          <div
            className="cover-art-item"
            onClick={() => openModal(10)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Sunken.jpeg"
              alt="Sunken Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Sunken' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Sunken') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Sunken',
                    category: 'Music',
                    albumCover: '/src/assets/images/Sunken.jpeg'
                  }, '/src/assets/music/StrangeV2-1.wav');
                }
              }}
              aria-label="Preview Sunken"
            >
              {isPlaying && currentTrack?.title === 'Sunken' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Sunken</p>
          </div>
          <div
            className="cover-art-item"
            onClick={() => openModal(11)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Sword.png"
              alt="Sword Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Sword' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Sword') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Sword',
                    category: 'Music',
                    albumCover: '/src/assets/images/Sword.png'
                  }, '/src/assets/music/Chronic Stress Syndrom.mp3');
                }
              }}
              aria-label="Preview Sword"
            >
              {isPlaying && currentTrack?.title === 'Sword' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Sword</p>
          </div>
          <div
            className="cover-art-item"
            onClick={() => openModal(12)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Pandora.png"
              alt="Pandora Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Pandora' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Pandora') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Pandora',
                    category: 'Music',
                    albumCover: '/src/assets/images/Pandora.png'
                  }, '/src/assets/music/idee1.mp3');
                }
              }}
              aria-label="Preview Pandora"
            >
              {isPlaying && currentTrack?.title === 'Pandora' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Pandora</p>
          </div>
          <div
            className="cover-art-item"
            onClick={() => openModal(13)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/backhumanoid.png"
              alt="Back Humanoid Track Cover"
              className="track-cover-image"
            />
            <button
              className={`preview-play-btn ${isPlaying && currentTrack?.title === 'Back Humanoid' ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying && currentTrack?.title === 'Back Humanoid') {
                  togglePlayPause();
                } else {
                  playTrack({
                    title: 'Back Humanoid',
                    category: 'Music',
                    albumCover: '/src/assets/images/backhumanoid.png'
                  }, '/src/assets/music/still.mp3');
                }
              }}
              aria-label="Preview Back Humanoid"
            >
              {isPlaying && currentTrack?.title === 'Back Humanoid' ? '⏸️' : '▶️'}
            </button>
            <p className="cover-caption">Back Humanoid</p>
          </div>
        </div>
      </div>

      {/* Album Art Section */}
      <div className="music-section">
        <h3>Album Art</h3>
        <div className="cover-art-grid album-covers">
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(14)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/glasses book room.png"
              alt="Glasses Book Room Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Glasses Book Room</p>
          </div>
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(15)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/glasses book room1.png"
              alt="Glasses Book Room Vol. 2 Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Glasses Book Room Vol. 2</p>
          </div>
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(16)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/glassesroompostpc.png"
              alt="Room Perspective Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Room Perspective</p>
          </div>
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(17)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Sharing my pixel art.png"
              alt="Pixel Art Collection Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Pixel Art Collection</p>
          </div>
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(18)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Untitled 08-07-2024 12-37-07.png"
              alt="Untitled Study Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Untitled Study</p>
          </div>
          <div
            className="cover-art-item album-item"
            onClick={() => openModal(19)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/src/assets/images/Screenshot_2025.04.14_15.02.05.335.png"
              alt="Digital Study Album Cover"
              className="album-cover-image"
            />
            <p className="cover-caption">Digital Study</p>
          </div>
        </div>
      </div>

      {/* Gallery Modal - Popout functionality */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={musicItems}
        currentIndex={selectedItemIndex}
        onNavigate={navigateModal}
      />
    </section>
  );
}

export default MusicPage;
