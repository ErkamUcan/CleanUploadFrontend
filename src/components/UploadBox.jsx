import React, { useRef, useState } from 'react';
import logo from '../assets/ornekLogo.svg';

export default function UploadBox() {
  const [fileName, setFileName] = useState(null);
  const [summaryPrompt, setSummaryPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      console.log('Dosya seçildi:', file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = event.dataTransfer.files;
      setFileName(file.name);
      console.log('Dosya bırakıldı:', file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSummarize = async () => {
    const file = fileInputRef.current.files[0];

    if (!file || !summaryPrompt) {
      alert('Lütfen bir video seçin ve özet konusu girin.');
      return;
    }

    setLoading(true);
    setSummary('');

    try {
      // 1️⃣ Aşama: Videoyu Uploads klasörüne gönder
      const uploadForm = new FormData();
      uploadForm.append('file', file);

      const uploadRes = await fetch('http://localhost:5236/upload-video', {
        method: 'POST',
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        throw new Error('Video yükleme başarısız.');
      }

      // 2️⃣ Aşama: Özetleme başlat
      const payload = {
        videoName: file.name,
        question: summaryPrompt,
      };

      const summaryRes = await fetch('http://localhost:5236/pipeline/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!summaryRes.ok) {
        throw new Error('Özetleme isteği başarısız.');
      }

      const data = await summaryRes.json();
      setSummary(data.summary || 'API özet döndürmedi.');
    } catch (error) {
      console.error('Hata:', error);
      setSummary('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl pt-4 px-6">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Smart Summary Logo" className="w-80 h-auto" />
      </div>

      {/* Sürükle/Bırak Yükleme Alanı */}
      <div
        className="border-2 border-dashed rounded-xl p-10 text-center transition duration-300 ease-in-out hover:border-blue-500 hover:shadow-lg cursor-pointer"
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-5xl mb-4">☁️</div>
        <p className="text-gray-600">Click to upload<br />or drop your video file here</p>
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {fileName && (
        <p className="mt-4 text-green-600 font-medium text-center">
          Seçilen dosya: {fileName}
        </p>
      )}

      {/* Prompt Alanı */}
      <div className="mt-8 flex flex-col gap-3">
        <input
          type="text"
          value={summaryPrompt}
          onChange={(e) => setSummaryPrompt(e.target.value)}
          placeholder="Ne hakkında özetlensin? (Örn: Dijital para)"
          className="p-3 border rounded text-sm shadow-sm"
        />
        <button
          onClick={handleSummarize}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Özetle
        </button>
      </div>

      {/* Yükleniyor Durumu */}
      {loading && (
        <p className="mt-6 text-center text-blue-500 font-semibold animate-pulse">
          ⏳ İşleniyor, lütfen bekleyin...
        </p>
      )}

      {/* Özet Kutusu */}
      {summary && (
        <div className="bg-gray-100 rounded p-4 mt-6 shadow">
          <h2 className="font-semibold text-lg mb-2">📄 Özet:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
