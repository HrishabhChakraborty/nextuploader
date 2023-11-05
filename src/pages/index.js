// pages/index.js or any other client-side component
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        const filename = file.name;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file: base64, filename }),
        });
        const data = await response.json();
        console.log(data);
      };
      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}
