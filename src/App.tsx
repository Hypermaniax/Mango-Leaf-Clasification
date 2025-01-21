import React, { useState, ChangeEvent, DragEvent, FormEvent } from "react";
import { Camera, Upload, Loader2, CheckCircle, Leaf, AlertTriangle } from "lucide-react";

// Define interfaces for type safety
interface Prediction {
  class: string;
  confidence: number;
}

const MangoClassification: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  
  const healthyRecommendations = `Rekomendasi Tindakan : berikan pupuk sesuai kebutuhan nutrisi, sesuaikan penyiraman untuk menghindari kekeringan atau genangan, potong daun rusak parah, kendalikan hama dengan pestisida alami, gunakan fungisida untuk infeksi jamur, atur pencahayaan sesuai kebutuhan tanaman, cuci daun untuk menghilangkan polutan, dan tambahkan suplemen tanaman seperti pupuk cair atau vitamin B1 untuk pemulihan.`;

  const unhealthyRecommendations = `Tips : Untuk menjaga daun mangga tetap sehat, sirami secara teratur tanpa genangan, berikan pupuk NPK atau organik, kendalikan hama dan penyakit, pastikan mendapat sinar matahari 6-8 jam sehari, pangkas daun tua, gunakan tanah gembur dengan drainase baik, hindari polusi, dan tambahkan suplemen seperti vitamin B1 atau pupuk cair.`;
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
    setIsUploaded(true);
    setTimeout(() => setIsUploaded(false), 1500);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Silakan pilih file gambar terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak mengembalikan respon JSON yang valid");
      }

      const text = await response.text();
      
      if (!text) {
        throw new Error("Server mengembalikan respon kosong");
      }

      let result: Prediction;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Raw response:", text);
        throw new Error("Format JSON tidak valid dari server");
      }

      if (!result.class || typeof result.confidence !== 'number') {
        throw new Error("Format respon tidak sesuai yang diharapkan");
      }

      setPrediction(result);
      setError(null);

    } catch (error) {
      console.error("Error details:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memproses gambar");
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 animate-gradient-x">
      <div className="w-full max-w-3xl bg-gray-800/90 border border-gray-700 rounded-lg shadow-xl backdrop-blur transition-all duration-500 hover:backdrop-blur-none transform hover:scale-[1.01]">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-center text-white animate-fade-in">
            Klasifikasi Daun Mangga
          </h1>
          <p className="text-gray-400 text-center mt-2 transform transition-all duration-300 hover:text-gray-300">
            Unggah gambar daun mangga untuk mengidentifikasi jenisnya
          </p>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 transform ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                  : "border-gray-600 hover:border-gray-500"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className={`p-4 rounded-full bg-gray-700 transition-transform duration-300 ${
                  isUploaded ? 'scale-110' : ''
                }`}>
                  {isUploaded ? (
                    <CheckCircle className="w-8 h-8 text-green-400 animate-bounce" />
                  ) : previewUrl ? (
                    <Camera className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 font-medium">
                    Drag & drop gambar atau klik untuk memilih
                  </p>
                  <p className="text-sm text-gray-400">
                    Format yang didukung: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
                <div className="space-y-4">
                  <p className="text-gray-300 font-medium">Preview:</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-700 transform transition-all duration-500 hover:scale-[1.02]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-contain w-full h-full transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white flex items-center justify-center space-x-2`}
              type="submit"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Analisis Gambar</span>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-400 animate-shake">
              {error}
            </div>
          )}

          {prediction && (
            <div className="space-y-6 animate-fade-slide-up">
              <div className="p-6 rounded-lg bg-green-500/10 border border-green-500">
                <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Leaf className="w-6 h-6" />
                  Hasil Analisis
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium">Jenis Mangga:</span>{" "}
                    <span className="text-green-400">{prediction.class}</span>
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Tingkat Kepercayaan:</span>{" "}
                    <span className="text-green-400">
                      {(prediction.confidence * 100).toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${
                prediction.class === 'Healthy' 
                  ? 'bg-emerald-500/10 border border-emerald-500' 
                  : 'bg-amber-500/10 border border-amber-500'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                  prediction.class === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {prediction.class === 'Healthy' ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Rekomendasi Perawatan
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6" />
                      Tips Perawatan
                    </>
                  )}
                </h3>
                <p className={`text-base leading-relaxed ${
                  prediction.class === 'Healthy' ? 'text-emerald-200' : 'text-amber-200'
                }`}>
                  {prediction.class === 'Healthy' 
                    ? healthyRecommendations 
                    : unhealthyRecommendations}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes slide-in {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes fade-slide-up {
    0% { transform: translateY(10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 15s ease infinite;
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
  .animate-slide-in {
    animation: slide-in 0.5s ease-out;
  }
  .animate-fade-slide-up {
    animation: fade-slide-up 0.5s ease-out;
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

export default MangoClassification;