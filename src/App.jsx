import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoggerProvider } from './context/LoggerContext';
import { ThemeProvider } from './context/ThemeContext';
import { DevToolsProvider } from './context/DevToolsContext';
import { ContentProvider } from './context/ContentContext';
import { FileManagerProvider } from './context/FileManagerContext';
import { PageProvider } from './context/PageContext';
import { SlideshowProvider } from './context/SlideshowContext';
import { NowPlayingProvider } from './context/NowPlayingContext';
import { TextContentProvider } from './context/TextContentContext';
import MainLayout from './components/MainLayout';
import AppRoutes from './components/AppRoutes';

/**
 * App - The root component of the application.
 * 
 * This component sets up the entire application structure by:
 * 1. Nesting all necessary context providers in the correct order.
 * 2. Setting up the React Router for navigation.
 * 3. Wrapping the main content with a global layout.
 */
const App = () => {
  return (
    <LoggerProvider>
      <BrowserRouter>
        <ThemeProvider>
          <DevToolsProvider>
            <ContentProvider>
              <FileManagerProvider>
                <SlideshowProvider>
                  <TextContentProvider>
                    <PageProvider>
                      <NowPlayingProvider>
                        <MainLayout>
                          <AppRoutes />
                        </MainLayout>
                      </NowPlayingProvider>
                    </PageProvider>
                  </TextContentProvider>
                </SlideshowProvider>
              </FileManagerProvider>
            </ContentProvider>
          </DevToolsProvider>
        </ThemeProvider>
      </BrowserRouter>
    </LoggerProvider>
  );
};

export default App;
