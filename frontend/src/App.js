// frontend/src/App.js

import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    setLoading(true);
    const file = event.target.files[0];

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:3000/parse-logs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Parsed Logs:', response.data);

      const downloadData = encodeURIComponent(JSON.stringify(response.data));
      const downloadLink = document.createElement('a');
      downloadLink.href = `data:application/json;charset=utf-8,${downloadData}`;
      downloadLink.download = 'parsedLogs.json';
      downloadLink.click();
    } catch (error) {
      console.error('Error parsing logs:', error.response?.data || error.message || error);
      alert('Error parsing logs. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={loading} />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default App;
