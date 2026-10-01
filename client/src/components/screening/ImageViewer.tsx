import React, { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Layers, Eye, Sparkles } from 'lucide-react';
import type { FullScreeningResponse } from '../../types/screening';

interface ImageViewerProps {
  imageSrc: string;
  heatmapOverlay?: boolean;
  result?: FullScreeningResponse | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageSrc,
  heatmapOverlay = true,
  result = null,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHeatmap, setActiveHeatmap] = useState(heatmapOverlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const actualGradcam = result?.explainability?.overlay_base64 || null;
  const isRecapture = result?.triage.decision === 'IMAGE_RECAPTURE_REQUIRED';

  const showActualHeatmap = Boolean(
    activeHeatmap && actualGradcam && !isRecapture
  );

  const viewerLabel = useMemo(() => {
    if (!result) return 'Awaiting screening result';
    if (isRecapture) return 'Model attention unavailable — quality gate failed';
    if (actualGradcam) return 'Backend generated Grad-CAM attention map';
    return result.explainability?.message || 'Grad-CAM unavailable';
  }, [result, isRecapture, actualGradcam]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 3.5));

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const setPresetZoom = (val: number) => {
    setZoom(val);
    if (val === 1) setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  return (
    <div
      className={`relative bg-bg-darkest border border-surface-border overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'w-full'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface-1 border-b border-surface-border font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-orange animate-pulse" />
          <span className="font-bold text-text-primary uppercase tracking-wider">
            RETINAL WORKSTATION VIEWER
          </span>
          <span className="text-[10px] text-accent-gold bg-accent-gold/10 px-2 py-0.5 border border-accent-gold/30">
            MAG: {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-2 p-1 border border-surface-border">
          <button
            onClick={() => actualGradcam && !isRecapture && setActiveHeatmap(!activeHeatmap)}
            disabled={!actualGradcam || isRecapture}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 border ${
              showActualHeatmap
                ? 'bg-accent-orange text-bg-darkest border-accent-bright'
                : 'bg-surface-3 text-text-secondary border-surface-border'
            } ${!actualGradcam || isRecapture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={
              isRecapture
                ? 'Unavailable because image quality failed'
                : actualGradcam
                  ? 'Toggle verified Grad-CAM overlay'
                  : 'Grad-CAM unavailable'
            }
          >
            <Sparkles className="w-3 h-3" /> Heatmap
          </button>

          <button
            disabled
            className="px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 border bg-surface-3 text-text-muted border-surface-border opacity-50 cursor-not-allowed"
            title="No validated vessel segmentation model is connected"
          >
            <Layers className="w-3 h-3" /> Vessels
          </button>

          <button
            disabled
            className="px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 border bg-surface-3 text-text-muted border-surface-border opacity-50 cursor-not-allowed"
            title="No validated lesion detector is connected"
          >
            <Eye className="w-3 h-3" /> Lesions
          </button>
        </div>

        <div className="flex items-center gap-1">
          {[1, 1.5, 2.2, 3].map((value) => (
            <button
              key={value}
              onClick={() => setPresetZoom(value)}
              className={`px-2 py-1 border text-[10px] font-bold ${
                zoom === value
                  ? 'bg-accent-orange text-bg-darkest border-accent-orange'
                  : 'bg-surface-2 text-text-secondary border-surface-border hover:text-text-primary'
              }`}
            >
              {value}x
            </button>
          ))}

          <div className="w-px h-4 bg-surface-border mx-1" />

          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-surface-2 hover:bg-surface-3 border border-surface-border text-text-primary"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1.5 bg-surface-2 hover:bg-surface-3 border border-surface-border text-text-secondary"
            title="Reset Zoom & Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-surface-2 hover:bg-surface-3 border border-surface-border text-text-primary"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-surface-2 hover:bg-surface-3 border border-surface-border text-accent-orange"
            title="Toggle Fullscreen View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative w-full min-h-[420px] max-h-[620px] bg-bg-darkest flex items-center justify-center overflow-hidden p-6 select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className={`relative w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] aspect-square rounded-full border-4 border-accent-orange/80 shadow-royal overflow-hidden bg-black flex items-center justify-center ${
            zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            }}
          >
            <img
              src={imageSrc}
              alt="Retinal Fundus Scan"
              className="w-full h-full object-cover rounded-full pointer-events-none"
            />

            {showActualHeatmap && (
              <img
                src={actualGradcam as string}
                alt="Verified Grad-CAM attention overlay"
                className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none"
              />
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="w-full h-[1px] bg-accent-orange" />
            <div className="h-full w-[1px] bg-accent-orange absolute" />
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-bg-darkest/90 border border-surface-border p-2 text-center text-[10px] font-mono text-text-muted pointer-events-none">
            {viewerLabel}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-surface-1 border-t border-surface-border font-mono text-[11px] text-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-orange" />
          {result
            ? isRecapture
              ? 'QUALITY GATE FAILED • SCREENING UNAVAILABLE'
              : 'IMAGE • VERIFIED MODEL OUTPUT'
            : 'IMAGE • AWAITING ANALYSIS'}
        </span>
        <span className="text-accent-gold font-bold">
          MAGNIFICATION: {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
};
