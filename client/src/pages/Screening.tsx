import React, { useState } from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { ImageUploader } from '../components/screening/ImageUploader';
import { ImageViewer } from '../components/screening/ImageViewer';
import { ScreeningProgress } from '../components/screening/ScreeningProgress';
import { ScreeningResult } from '../components/screening/ScreeningResult';
import { analyzeRetinalImage } from '../services/screeningService';
import type { FullScreeningResponse } from '../types/screening';
import { Cpu, RefreshCw } from 'lucide-react';

export const Screening: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<FullScreeningResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (src: string, name: string) => {
    setSelectedImage(src);
    setImageName(name);
    setResult(null);
    setError(null);
  };

  const handleStartScreening = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const apiResult = await analyzeRetinalImage(imageName, selectedImage);
      setResult(apiResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Screening request failed.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageName('');
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
  };

  return (
    <PublicLayout activePath="/screening">
      <div className="pt-28 pb-20 bg-bg-darkest min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accent-gold">
                <span className="w-2 h-2 rounded-full bg-accent-orange animate-ping" />
                EXPLAINABLE AI SCREENING WORKFLOW & RURAL SIMULATION
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-sans uppercase text-text-primary tracking-tight">
                AI Retinal Screening Console
              </h1>
            </div>

          </div>

          {/* Main Workstation Layout */}
          {!selectedImage ? (
            <div className="max-w-3xl mx-auto">
              <ImageUploader onImageSelected={handleImageSelected} />
            </div>
          ) : isAnalyzing ? (
            <ScreeningProgress />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: ImageViewer */}
              <div className="lg:col-span-7 space-y-4">
                <ImageViewer imageSrc={selectedImage} result={result} />
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-text-muted">File: {imageName}</span>
                  <button onClick={handleReset} className="text-accent-orange hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> Select Different Image
                  </button>
                </div>
              </div>

              {/* Right Column: Control or Result */}
              <div className="lg:col-span-5 space-y-6">
                {error && (
                  <div className="p-4 bg-status-danger/10 border border-status-danger/40 font-mono text-xs text-status-danger">
                    <strong className="block uppercase mb-1">SCREENING ERROR</strong>
                    {error}
                    <div className="mt-2 text-text-secondary">
                      Verify that the FastAPI backend is running on port 8000 and the frozen E2 checkpoint is available.
                    </div>
                  </div>
                )}
                {!result ? (
                  <div className="brutal-card p-6 space-y-6">
                    <div className="border-b border-surface-border pb-4">
                      <span className="font-mono text-xs text-status-success uppercase font-bold block mb-1">
                        IMAGE SELECTED
                      </span>
                      <h3 className="font-mono text-lg font-bold text-text-primary uppercase">
                        Ready for Server Quality Gate & AI Inference
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Calls POST /api/v1/predict/full-screening (E2 Ordinal EfficientNet-B0 + Grad-CAM XAI Pipeline).
                      </p>
                    </div>

                    <div className="space-y-3 font-mono text-xs text-text-secondary">
                      <div className="flex justify-between p-2 bg-surface-2 border border-surface-border">
                        <span>Target API Endpoint:</span>
                        <span className="text-accent-orange font-bold">/v1/predict/full-screening</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full bg-accent-orange text-bg-darkest font-mono font-bold uppercase p-4 flex items-center justify-center gap-2 hover:bg-accent-bright"
                      onClick={handleStartScreening}
                    >
                      <Cpu className="w-5 h-5" /> Start AI Screening Analysis
                    </button>
                  </div>
                ) : (
                  <ScreeningResult result={result} onReset={handleReset} />
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
};
