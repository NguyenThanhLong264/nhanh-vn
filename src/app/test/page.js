"use client";
// In your page or component
import { useEffect, useState } from 'react';

const ConfigPage = () => {
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    const fetchConfigData = async () => {
      const response = await fetch('/api/get-token-vercel');
      const data = await response.json();
      setConfigData(data);
    };

    fetchConfigData();
  }, []);

  if (!configData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Config Data</h1>
      <pre>{JSON.stringify(configData, null, 2)}</pre>
    </div>
  );
};

export default ConfigPage;
