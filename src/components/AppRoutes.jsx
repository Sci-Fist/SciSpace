import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import PageLoader from './PageLoader'; // Import the PageLoader component
import PageError from './PageError';   // Import the PageError component

// Lazy load all page components
const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const ThreeDArtPage = lazy(() => import('../pages/ThreeDArtPage.jsx'));
const TwoDArtPage = lazy(() => import('../pages/TwoDArtPage.jsx'));
const PhotographyPage = lazy(() => import('../pages/PhotographyPage.jsx'));
const SketchesPage = lazy(() => import('../pages/SketchesPage.jsx'));
const MusicPage = lazy(() => import('../pages/MusicPage.jsx'));
const AboutPage = lazy(() => import('../pages/AboutPage.jsx'));
const ResumePage = lazy(() => import('../pages/ResumePage.jsx'));
const ContactPage = lazy(() => import('../pages/ContactPage.jsx'));
const BlogPage = lazy(() => import('../pages/BlogPage.jsx'));
const ProcessPage = lazy(() => import('../pages/ProcessPage.jsx'));
const TestimonialsPage = lazy(() => import('../pages/TestimonialsPage.jsx'));
const ShopPage = lazy(() => import('../pages/ShopPage.jsx'));
const LinksPage = lazy(() => import('../pages/LinksPage.jsx'));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}> {/* Use PageLoader as the fallback */}
      <Routes>
        <Route path="/" element={<ErrorBoundary fallback={<PageError />}><HomePage /></ErrorBoundary>} />
        <Route path="/3d-art" element={<ErrorBoundary fallback={<PageError />}><ThreeDArtPage /></ErrorBoundary>} />
        <Route path="/2d-art" element={<ErrorBoundary fallback={<PageError />}><TwoDArtPage /></ErrorBoundary>} />
        <Route path="/photography" element={<ErrorBoundary fallback={<PageError />}><PhotographyPage /></ErrorBoundary>} />
        <Route path="/sketches" element={<ErrorBoundary fallback={<PageError />}><SketchesPage /></ErrorBoundary>} />
        <Route path="/music" element={<ErrorBoundary fallback={<PageError />}><MusicPage /></ErrorBoundary>} />
        <Route path="/about" element={<ErrorBoundary fallback={<PageError />}><AboutPage /></ErrorBoundary>} />
        <Route path="/resume" element={<ErrorBoundary fallback={<PageError />}><ResumePage /></ErrorBoundary>} />
        <Route path="/contact" element={<ErrorBoundary fallback={<PageError />}><ContactPage /></ErrorBoundary>} />
        <Route path="/blog" element={<ErrorBoundary fallback={<PageError />}><BlogPage /></ErrorBoundary>} />
        <Route path="/process" element={<ErrorBoundary fallback={<PageError />}><ProcessPage /></ErrorBoundary>} />
        <Route path="/testimonials" element={<ErrorBoundary fallback={<PageError />}><TestimonialsPage /></ErrorBoundary>} />
        <Route path="/shop" element={<ErrorBoundary fallback={<PageError />}><ShopPage /></ErrorBoundary>} />
        <Route path="/links" element={<ErrorBoundary fallback={<PageError />}><LinksPage /></ErrorBoundary>} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
