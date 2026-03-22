# Development Guide

## 🚀 Getting Started

### Environment Setup

1. **Node.js 16+** required
2. **Clone and install**:
   ```bash
   git clone https://github.com/Sci-Fist/MyWebsite.git
   cd MyWebsite
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Cloudinary credentials
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

### Component Hierarchy

```
App.jsx
├── ErrorBoundary
├── ThemeContext
├── DevToolsContext
├── PageContext
├── NowPlayingContext
├── ContentContext (unified)
├── LoggerContext
├── MainLayout
│   ├── Header
│   ├── AppRoutes
│   └── Footer
└── AudioPlayerControls
```

### State Management

The app uses React Context API with a **unified ContentContext** that consolidates:

- **SlideshowContext** - Slideshow state and controls
- **TextContentContext** - Text content and fonts
- **FileManagerContext** - File management and uploads

**Why this approach?**
- Eliminates race conditions between overlapping contexts
- Single source of truth for IndexedDB operations
- Simplified provider nesting (9 → 6 providers)
- Better performance with fewer re-renders

### Data Flow

```
User Action → Component → Context → IndexedDB → Persist
                ↓
            Cloudinary CDN
```

## 🎨 Styling Architecture

### SCSS Structure

```
src/styles/
├── _variables.scss      # CSS custom properties and SCSS vars
├── _base.scss           # Global styles and resets
├── _layout.scss         # Layout containers
├── components/          # Component-specific styles
└── pages/               # Page-specific styles
```

### CSS Custom Properties

```scss
:root {
  --primary-teal: #00d4ff;
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
}
```

### Naming Conventions

- **BEM-like**: `.block__element--modifier`
- **Component-scoped**: `.ComponentName-element`
- **Utility classes**: `.u-text-center`, `.u-mt-20`

## 🛠️ Developer Tools

### Accessing Dev Tools

1. Click the **⚙️** button (bottom-right corner)
2. Or press `Ctrl+Shift+D` (if configured)

### Available Tools

#### Global Controls
- **Theme Settings** - Color scheme customization
- **Performance Monitor** - Memory and render tracking
- **Logger Dashboard** - Real-time logging

#### Page Controls
Each page has specific controls:
- **HomePage** - Gallery settings, hero content
- **3D/2D Art Pages** - Gallery layout, filters
- **Music Page** - Player settings, playlist management
- **Resume Page** - PDF upload, content editing
- **Contact Page** - Form settings, social links

### Runtime Editing

Most content can be edited directly in the browser:

1. **Text content**: Click on text to edit
2. **Images**: Use upload controls in dev sidebar
3. **Layout**: Switch between masonry/grid/list views
4. **Colors**: Use color pickers in theme controls

## 📦 Adding New Features

### Adding a New Page

1. Create page component in `src/pages/`:
   ```jsx
   // src/pages/NewPage.jsx
   import React from 'react';
   
   const NewPage = () => {
     return (
       <div className="new-page">
         {/* Your content */}
       </div>
     );
   };
   
   export default NewPage;
   ```

2. Add route in `src/components/AppRoutes.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```

3. Add navigation link in `src/components/Header.jsx`

4. Create styles in `src/styles/pages/_newPage.scss`

5. Import styles in `src/styles/main.scss`

### Adding a New Component

1. Create component in `src/components/`:
   ```jsx
   // src/components/NewComponent.jsx
   import React from 'react';
   import '../styles/components/_newComponent.scss';
   
   const NewComponent = ({ prop1, prop2 }) => {
     return (
       <div className="new-component">
         {/* Component JSX */}
       </div>
     );
   };
   
   export default NewComponent;
   ```

2. Create styles in `src/styles/components/_newComponent.scss`

3. Import in `src/styles/main.scss`

### Adding Context

If you need global state:

1. Create context in `src/context/`:
   ```jsx
   // src/context/NewContext.jsx
   import React, { createContext, useContext, useState } from 'react';
   
   const NewContext = createContext();
   
   export const NewProvider = ({ children }) => {
     const [state, setState] = useState(initialState);
     
     return (
       <NewContext.Provider value={{ state, setState }}>
         {children}
       </NewContext.Provider>
     );
   };
   
   export const useNew = () => useContext(NewContext);
   ```

2. Add provider in `src/App.jsx`:
   ```jsx
   <NewProvider>
     {/* Other providers */}
   </NewProvider>
   ```

## 🎵 Music Player System

### Adding Tracks

1. Place audio files in `src/assets/music/`
2. Update `src/context/NowPlayingContext.jsx` with track metadata:
   ```javascript
   const tracks = [
     {
       id: 'track-1',
       title: 'Track Name',
       artist: 'Artist Name',
       src: '/assets/music/track.mp3',
       duration: 180
     }
   ];
   ```

### Player Controls

The `AudioPlayerControls` component provides:
- Play/Pause
- Seek bar
- Volume control
- Track info display
- Next/Previous track

## 🖼️ Gallery System

### Masonry Layout

The gallery uses an advanced masonry algorithm:

```javascript
// Calculate columns based on viewport
const calculateColumns = (width) => {
  if (width >= 1400) return 6;
  if (width >= 1200) return 5;
  if (width >= 992) return 4;
  if (width >= 768) return 3;
  return Math.max(3, Math.floor(width / 200));
};
```

### Layout Modes

1. **Masonry** - CSS columns for true masonry behavior
2. **Grid** - Flexbox with intelligent arrangement
3. **List** - Single column layout

### Image Loading

Images use lazy loading and dimension caching:

```javascript
const loadImageDimensions = useCallback((src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = src;
  });
}, []);
```

## ☁️ Cloudinary Integration

### Upload Flow

1. User selects file via `ContentUploadSection`
2. File uploaded to Cloudinary via `src/services/cloudinary.js`
3. Cloudinary returns secure URL
4. URL stored in IndexedDB and component state

### Service Structure

```javascript
// src/services/cloudinary.js
export const uploadToCloudinary = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    { method: 'POST', body: formData }
  );
  
  return response.json();
};
```

## 🐛 Debugging

### Logger System

The app includes a comprehensive logging system:

```javascript
import { useLogger } from '../hooks/useLogger';

const MyComponent = () => {
  const { log, error, warn } = useLogger();
  
  log('Component mounted');
  error('Something went wrong', { details: '...' });
  warn('Warning message');
};
```

### Performance Monitoring

Track memory and performance:

```javascript
import performanceMonitor from '../utils/performanceMonitor';

// Start monitoring
performanceMonitor.startMonitoring();

// Track specific operation
performanceMonitor.trackRender('ComponentName');

// Get metrics
const metrics = performanceMonitor.getMetrics();
```

### Common Issues

**Gallery not displaying correctly**
- Check CSS specificity conflicts
- Verify image dimensions are loading
- Check console for errors

**Music not playing**
- Verify audio file format (MP3, WAV, MP4)
- Check browser autoplay policies
- Inspect NowPlayingContext state

**Upload failing**
- Verify Cloudinary credentials in .env
- Check network tab for CORS errors
- Ensure upload preset allows unsigned uploads

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- layout.test.js
```

### Writing Tests

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 📝 Code Style

### JavaScript/React

- Use functional components with hooks
- Prefer `const` over `let`
- Use destructuring for props
- Keep components small and focused
- Add PropTypes for type checking

### CSS/SCSS

- Use CSS custom properties for theming
- Mobile-first responsive design
- Avoid `!important` unless necessary
- Use meaningful class names
- Comment complex selectors

### Git Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit with descriptive message
4. Push and create pull request

## 🚀 Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`

The `vercel.json` configures:
- SPA routing (all routes → index.html)
- Asset caching (1 year for static assets)
- Clean URLs

### Environment Variables

Set in Vercel dashboard:
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [SCSS Documentation](https://sass-lang.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vercel Documentation](https://vercel.com/docs)

---

*Happy coding! 🎨*