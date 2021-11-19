import React, { useState } from "react";
import DownloaderStream from "./DownloaderStream";

function App() {
  const [downloader, setDownloader] = useState<DownloaderStream | null>(null);
  const [text, setText] = useState("");

  const handleCreateDownload = async () => {
    const newDownloader = new DownloaderStream("test.txt", -1);
    const result = await newDownloader.setUpDownload();
    console.log(result);
    setDownloader(newDownloader);
  };

  const handlePushData = async () => {
    if (downloader) {
      const message = new TextEncoder().encode(text);
      downloader.push(message.buffer);
      setText("");
    }
  };

  const handleFinished = async () => {
    if (downloader) {
      downloader.close();
      setDownloader(null);
    }
  };

  return (
    <div className="App">
      <div style={{ width: 400, height: 300, margin: "auto" }}>
        <div>Download stream with SW</div>
        <div>
          <textarea
            disabled={!downloader}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            style={{ width: 300, height: 200 }}
          />
        </div>
        <button onClick={handleCreateDownload} disabled={!!downloader}>
          setUpDownload
        </button>
        <button onClick={handlePushData} disabled={!downloader}>
          push
        </button>
        <button onClick={handleFinished} disabled={!downloader}>
          Finish
        </button>
      </div>
    </div>
  );
}

export default App;
