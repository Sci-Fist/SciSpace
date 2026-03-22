import React from 'react';

function PageError() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
      <h2>Error Loading Page</h2>
      <p>We encountered an issue loading this content. Please try refreshing the page.</p>
      {/* Consider adding a button to refresh or a link to a support page */}
    </div>
  );
}

export default PageError;
