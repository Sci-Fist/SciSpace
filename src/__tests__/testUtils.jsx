import React from 'react';
import { LoggerProvider } from '../context/LoggerContext.jsx';
import { NowPlayingProvider } from '../context/NowPlayingContext.jsx';
import { PageProvider } from '../context/PageContext.jsx';
import { ContentProvider } from '../context/ContentContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { DevToolsProvider } from '../context/DevToolsContext.jsx';

/**
 * TestProviders - Wrapper component for providing all necessary contexts in tests
 *
 * This component wraps test components with all the context providers they need,
 * ensuring consistent test setup and avoiding "context not found" errors.
 */
export function TestProviders({ children }) {
  return (
    <LoggerProvider>
      <ThemeProvider>
        <DevToolsProvider>
          <PageProvider>
            <ContentProvider>
              <NowPlayingProvider>
                {children}
              </NowPlayingProvider>
            </ContentProvider>
          </PageProvider>
        </DevToolsProvider>
      </ThemeProvider>
    </LoggerProvider>
  );
}

/**
 * MusicTestProviders - Minimal providers needed for music-related tests
 *
 * Includes only the essential providers for music functionality testing.
 */
export function MusicTestProviders({ children }) {
  return (
    <LoggerProvider>
      <NowPlayingProvider>
        {children}
      </NowPlayingProvider>
    </LoggerProvider>
  );
}

/**
 * GalleryTestProviders - Providers needed for gallery/modal tests
 *
 * Includes providers needed for components that use GalleryModal.
 */
export function GalleryTestProviders({ children }) {
  return (
    <LoggerProvider>
      <PageProvider>
        <ContentProvider>
          {children}
        </ContentProvider>
      </PageProvider>
    </LoggerProvider>
  );
}
