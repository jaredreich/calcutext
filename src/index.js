import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const rootElement = global.window.document.getElementById('root');
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement,
);
