import React from 'react';
import ReactDOM from 'react-dom/client';
import ForKalkisPreview from './App'; // sørg for at stien er korrekt
import './index.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ForKalkisPreview />
  </React.StrictMode>
);
