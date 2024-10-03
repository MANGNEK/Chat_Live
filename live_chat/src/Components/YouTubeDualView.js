import React from 'react';

const YouTubeDualView = React.memo(() => {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <webview
        src="https://www.youtube.com"
        style={{ width: '50%', height: '100%' }}
        partition="persist:youtube1" // Giữ cookie cho webview đầu tiên
      />
      <webview
        src="https://www.youtube.com"
        style={{ width: '50%', height: '100%' }}
        partition="persist:youtube2" // Giữ cookie cho webview thứ hai
      />
    </div>
  );
});

export default YouTubeDualView;
