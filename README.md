# Sci-Fist Portfolio Website

A retro-futuristic artist portfolio website showcasing 3D art, 2D art, photography, sketches, and music. Features a dark mode with vibrant teal highlights and an immersive sci-fi aesthetic.

## ✨ Key Features

### 🎨 Art & Media
- **3D Art Gallery** - Interactive masonry layout with responsive column system
- **2D Art Gallery** - Advanced masonry algorithm for optimal space filling
- **Photography Portfolio** - Professional image showcase
- **Sketches Collection** - Traditional art digitized
- **Music Player** - Integrated audio playback with Now Playing notifications
- **Mixed Media Gallery** - Combined display of all media types

### 🎵 Music Integration
- **Cloudinary CDN** - Cloud-based media storage and delivery
- **Audio Player Controls** - Play/pause, seek, volume
- **Now Playing Notification** - Real-time track info
- **Playlist Management** - Sequential and shuffle playback

### 🛠️ Developer Tools
- **Runtime Content Editing** - Edit page content directly from the browser
- **Image Upload System** - Cloudinary integration for media management
- **Text Editor** - Rich text editing with live preview
- **Page Controls** - Per-page customization panels
- **Logger Dashboard** - Real-time logging and debugging
- **Performance Monitoring** - Memory and render tracking

### 🎨 Design System
- **Retro-Futuristic Aesthetic** - Sci-fi inspired UI
- **Dark Mode** - Eye-friendly dark theme with teal accents
- **Responsive Design** - Mobile-first, works on all devices
- **Smooth Animations** - CSS transitions and transforms
- **Accessibility** - Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sci-Fist/MyWebsite.git
cd MyWebsite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Cloudinary credentials
```

4. Start development server:
```bash
npm run dev
```

5. Open browser at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, music, documents)
│   ├── 2D Art/
│   ├── 3D Art/
│   ├── images/
│   ├── music/
│   ├── photography/
│   ├── sketching/
│   └── videos/
├── components/          # Reusable UI components
│   ├── dev-tools/       # Developer tools
│   ├── AudioPlayerControls.jsx
│   ├── GalleryModal.jsx
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── MusicCard.jsx
│   └── ...
├── context/             # React Context providers
│   ├── ContentContext.jsx
│   ├── DevToolsContext.jsx
│   ├── NowPlayingContext.jsx
│   ├── PageContext.jsx
│   └── ...
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── HomePage.jsx
│   ├── ThreeDArtPage.jsx
│   ├── TwoDArtPage.jsx
│   ├── PhotographyPage.jsx
│   ├── MusicPage.jsx
│   └── ...
├── services/            # External service integrations
│   └── cloudinary.js
├── styles/              # SCSS stylesheets
│   ├── _variables.scss
│   ├── _base.scss
│   ├── _layout.scss
│   ├── components/
│   └── pages/
└── utils/               # Utility functions
    ├── logger.js
    ├── indexedDB.js
    ├── performanceMonitor.js
    └── sessionManager.js
```

## 🎨 Gallery System

### Masonry Layout
The gallery uses an advanced masonry algorithm that:
- **Content-Sized Containers** - Containers match image dimensions
- **Intelligent Space Filling** - Minimizes total layout height
- **Responsive Columns** - 3-6 columns based on viewport
- **True Masonry Behavior** - CSS columns for natural flow

### Layout Modes
- **Masonry** - True masonry with CSS columns
- **Grid** - Flexbox with intelligent arrangement
- **List** - Single column layout

### Responsive Breakpoints
- 1400px+: 6 columns
- 1200px+: 5 columns
- 992px+: 4 columns
- 768px+: 3 columns
- Minimum 3 columns guaranteed

## 🔧 Configuration

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name and Upload Preset
3. Update `.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Vercel Deployment
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## 📊 Performance

### Optimization Features
- **Lazy Loading** - Images load on demand
- **Dimension Caching** - Avoid recalculations
- **Memory Leak Prevention** - Proper cleanup on unmount
- **IndexedDB Persistence** - Client-side data storage
- **Performance Monitoring** - Real-time metrics

### Memory Management
- RequestAnimationFrame cleanup
- Interval/Timeout cleanup
- Fetch override restoration
- Event listener cleanup

## 🧹 Code Quality Improvements

### Component Deduplication
- **HomePage.jsx** - Removed duplicate MusicCard, ModalMusicPlayer, and GalleryModal components
- Now imports from existing components in `src/components/` instead of duplicating code
- Reduced HomePage.jsx from 600+ lines to ~170 lines

### IndexedDB Race Condition Fix
- **ContentContext.jsx** - Fixed race condition in metadata saving
- Implemented debounced save queue (100ms delay)
- Sequential processing of IndexedDB operations to prevent data corruption
- Added proper cleanup for save timeouts on unmount

### CSS Cleanup
- **_header.scss** - Removed excessive `!important` declarations
- Cleaned up positioning properties (position, top, left, right, width, z-index)
- Maintained specificity without forcing important overrides
- Improved maintainability and readability of styles

## 🔐 Security

### Environment Variables
- `.env` file excluded from git
- Sensitive credentials not committed
- Cloudinary upload presets configured

### API Security
- CORS headers configured
- Input validation on uploads
- Error boundary handling

## 📚 Documentation

- [Masonry Gallery Achievement](docs/MASONRY_GALLERY_ACHIEVEMENT.md) - Technical deep dive
- [Implementation Plan](implementation/plan.md) - Development roadmap

## 🛠️ Tech Stack

- **Framework**: React 18 with JSX
- **Build Tool**: Vite
- **Styling**: SCSS with CSS Custom Properties
- **State Management**: React Context API
- **Media Storage**: Cloudinary CDN
- **Deployment**: Vercel
- **Testing**: Jest + React Testing Library

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

Private project - All rights reserved

## 👨‍🎨 Artist

**Sci-Fist**
- GitHub: [@Sci-Fist](https://github.com/Sci-Fist)
- Portfolio: [MyWebsite](https://github.com/Sci-Fist/MyWebsite)

---

*Built with a retro-futuristic vibe and a touch of teal.*