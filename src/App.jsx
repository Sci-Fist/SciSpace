import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { DevToolsProvider } from './context/DevToolsContext.jsx';
import { PageProvider } from './context/PageContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import { LoggerProvider } from './context/LoggerContext.jsx';
import { NowPlayingProvider } from './context/NowPlayingContext.jsx';

import MainLayout from './components/MainLayout.jsx';
import AppRoutes from './components/AppRoutes.jsx';
import NowPlayingNotification from './components/NowPlayingNotification.jsx';

function App() {
  return (
    <Router>
      <LoggerProvider>
        <ThemeProvider>
          <DevToolsProvider>
            <PageProvider>
              <ContentProvider>
                <NowPlayingProvider>
                  <MainLayout>
                    <AppRoutes />
                  </MainLayout>
                  <NowPlayingNotification />
                </NowPlayingProvider>
              </ContentProvider>
            </PageProvider>
          </DevToolsProvider>
        </ThemeProvider>
      </LoggerProvider>
    </Router>
  );
}

export default App;
