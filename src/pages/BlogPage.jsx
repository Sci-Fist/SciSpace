import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style

function BlogPage() {
  const { getPageControls } = usePage();
  const controls = getPageControls('/blog');

  const getBackgroundPattern = () => {
    switch (controls.backgroundPattern) {
      case 'dots':
        return 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px)';
      case 'grid':
        return 'linear-gradient(rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px)';
      case 'diagonal':
        return 'repeating-linear-gradient(45deg, rgba(var(--color-primary-rgb), 0.1) 0px, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px, transparent 10px)';
      default:
        return 'none';
    }
  };

  return (
    <section
      className="generic-page"
      style={{
        opacity: controls.contentOpacity || 1,


        backgroundImage: getBackgroundPattern(),
        backgroundSize: controls.backgroundPattern === 'dots' ? '20px 20px' :
                       controls.backgroundPattern === 'grid' ? '40px 40px' : 'auto',
        animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out' : 'none'
      }}
    >
      <h2
        style={{
          fontSize: controls.titleSize ? `${controls.titleSize}rem` : '2rem',
          animation: controls.showAnimations !== false ? 'fadeInDown 0.6s ease-out' : 'none'
        }}
      >
        Blog / News
      </h2>
      <div
        className="blog-content"
        style={{
          lineHeight: controls.lineHeight || 1.6,
          animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}
      >
        <p>
          Welcome to my blog! Here I share updates on my latest projects, behind-the-scenes insights,
          tutorials, and thoughts on art, music, and the creative process.
        </p>
        <div className="blog-posts">
          <article className="blog-post">
            <h3><a href="#">Crafting a Cyberpunk Alley in Blender</a></h3>
            <p className="post-meta">Posted on April 20, 2024 | Category: 3D Art</p>
            <p>
              A deep dive into the workflow of creating a detailed cyberpunk environment, from concept to final render.
              I'll cover modeling techniques, texturing in Substance Painter, and lighting for that perfect neon glow.
            </p>
            <a href="#" className="read-more">Read More &rarr;</a>
          </article>
          <article className="blog-post">
            <h3><a href="#">My Process for Composing Synthwave Tracks</a></h3>
            <p className="post-meta">Posted on March 15, 2024 | Category: Music</p>
            <p>
              Discover my approach to writing and producing synthwave music, including my favorite VSTs,
              drum programming tips, and how I achieve that signature retro sound.
            </p>
            <a href="#" className="read-more">Read More &rarr;</a>
          </article>
          {/* More blog posts can be added here */}
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
