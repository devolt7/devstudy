import React, { useState, useRef } from 'react';
import { Button, Card, Spinner, TextArea } from '../components/UI';
import { GeminiService } from '../services/geminiService';
import TypedPaper from '../components/TypedPaper';
import { Camera, Upload, RefreshCw } from 'lucide-react';

const ImageTools: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // Extract base64 (remove data:image/xxx;base64, prefix)
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const analysis = await GeminiService.analyzeImage(base64Data, mimeType, prompt);
      setResult(analysis);
    } catch (error) {
      alert("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Image Intelligence</h1>
        <p className="text-slate-500 mt-2">Upload handwritten notes, question papers, or book pages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
            <Card className="p-6 border-dashed border-2 border-slate-300 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center min-h-[300px] relative bg-slate-50">
                {image ? (
                    <>
                        <img src={image} alt="Preview" className="max-h-[300px] w-auto object-contain rounded-lg shadow-md" />
                        <button 
                            onClick={() => { setImage(null); setResult(null); }}
                            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 text-red-500"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                            <Upload size={32} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-400">JPG, PNG, WEBP supported</p>
                        </div>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Select Image
                        </Button>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
            </Card>

            <TextArea 
                placeholder="Optional: Add specific instructions (e.g., 'Solve question 3', 'Transcribe this handwriting')" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
            />

            <Button 
                className="w-full py-3" 
                onClick={handleAnalyze} 
                disabled={!image} 
                isLoading={loading}
            >
                Analyze Image
            </Button>
        </div>

        {/* Result Section */}
        <div className="h-full">
            {loading ? (
                <Card className="h-full min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Spinner />
                        <p className="text-slate-500">Analyzing content...</p>
                    </div>
                </Card>
            ) : result ? (
                <div className="h-full">
                     <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
                        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                            <h3 className="font-bold text-indigo-900">Analysis Result</h3>
                            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result)}>Copy</Button>
                        </div>
                        <div className="p-6 overflow-auto max-h-[600px] prose prose-sm max-w-none">
                            <TypedPaper content={result} />
                        </div>
                     </div>
                </div>
            ) : (
                <Card className="h-full min-h-[300px] flex items-center justify-center bg-slate-50 border-slate-200">
                    <p className="text-slate-400">Analysis results will appear here</p>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageTools;
