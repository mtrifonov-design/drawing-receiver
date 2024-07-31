import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './Components/Main';
import reportWebVitals from './reportWebVitals';
import Receiver from './receiver';

const r = new Receiver();
window.PINS_AND_CURVES_RECEIVER = r;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
