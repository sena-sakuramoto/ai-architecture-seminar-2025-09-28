import React from 'react';
import ReactDOM from 'react-dom/client';
import SeminarLanding from './SeminarLanding';
import './gate';

document.title = '実務で使える　AI×建築セミナー';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SeminarLanding />
  </React.StrictMode>,
);
