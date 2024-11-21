import React from 'react';
import axios from 'axios';

import Begin from './components/Begin';
import './App.css';

axios.defaults.baseURL=`http://18.209.111.111:8080`;
function App() {
  return (
    <div className="App">

     <Begin/>

    </div>
  );
}

export default App;
