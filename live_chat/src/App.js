import './Css/App.css';
import React, { useState } from 'react';
import ViewLive from './Components/ViewliveComponent';
import MenuSidebar from './Components/MenuSidebar';
import YouTubeDualView from './Components/YouTubeDualView';
import UserCoinview from './Components/UserCoin';
import { DataProvider } from './Components/DataContext';

function App() {
  const [selected, setSelected] = useState('ViewLive');

  const renderContent = () => {
    switch (selected) {
      case 'ViewLive':
        return <ViewLive />;
      case 'youtube':
        return <YouTubeDualView />;
      case 'userCoin':
        return<UserCoinview/>;
      default:
        return <ViewLive />;
    }
  };

  return (
    <DataProvider>
      <div className="App">
        <div className="main-container">
          <div className="sidebar">
            <MenuSidebar selected={selected} setSelected={setSelected} />
          </div>
          <div className="content">
            {renderContent()}
          </div>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;
