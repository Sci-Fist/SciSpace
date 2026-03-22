import React from 'react';

function SystemInfo() {
  return (
    <div className="dev-info">
      <h4>System Info:</h4>
      <p>React Version: {React.version}</p>
      <p>Vite Environment: {import.meta.env.MODE}</p>
    </div>
  );
}

export default SystemInfo;