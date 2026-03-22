import React from 'react';
import HomePageControls from './HomePageControls.jsx';
import MusicPageControls from './MusicPageControls.jsx';
import ThreeDArtPageControls from './ThreeDArtPageControls.jsx';
import TwoDArtPageControls from './TwoDArtPageControls.jsx';
import ContactPageControls from './ContactPageControls.jsx';
import ShopPageControls from './ShopPageControls.jsx';
import ResumePageControls from './ResumePageControls.jsx';
import GenericPageControls from './GenericPageControls.jsx';
import SlideshowControls from './SlideshowControls.jsx';

function PageControlsRenderer({ currentPage }) {
  const pageControls = [];

  // Add page-specific controls
  switch (currentPage) {
    case '/':
      pageControls.push(<HomePageControls key="home" />);
      break;
    case '/music':
      pageControls.push(<MusicPageControls key="music" />);
      break;
    case '/3d-art':
      pageControls.push(<ThreeDArtPageControls key="3d-art" />);
      break;
    case '/2d-art':
      pageControls.push(<TwoDArtPageControls key="2d-art" />);
      break;
    case '/contact':
      pageControls.push(<ContactPageControls key="contact" />);
      break;
    case '/about':
      pageControls.push(<GenericPageControls key="about" pagePath="/about" pageName="About" />);
      break;
    case '/resume':
      pageControls.push(<ResumePageControls key="resume" />);
      break;
    case '/blog':
      pageControls.push(<GenericPageControls key="blog" pagePath="/blog" pageName="Blog" />);
      break;
    case '/process':
      pageControls.push(<GenericPageControls key="process" pagePath="/process" pageName="Process" />);
      break;
    case '/testimonials':
      pageControls.push(<GenericPageControls key="testimonials" pagePath="/testimonials" pageName="Testimonials" />);
      break;
    case '/shop':
      pageControls.push(<ShopPageControls key="shop" />);
      break;
    case '/links':
      pageControls.push(<GenericPageControls key="links" pagePath="/links" pageName="Links" />);
      break;
    default:
      pageControls.push(<div key="no-controls" className="page-controls"><p>No controls available for this page</p></div>);
  }

  // Always add slideshow controls
  pageControls.push(<SlideshowControls key="slideshow" />);

  return pageControls;
}

export default PageControlsRenderer;
