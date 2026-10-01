import { AlertTriangle, RefreshCcw, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { FullScreeningResponse } from '../../types/screening';

interface ScreeningResultProps {
  result: FullScreeningResponse;
  onReset: () => void;
}

const GRADE_NAMES = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'];

export const ScreeningResult: React.FC<ScreeningResultProps> = ({ result, onReset }) => {
  const { quality_gate: quality, prediction, explainability, triage } = result;
  const rejected = !quality.is_gradable || triage.decision === 'IMAGE_RECAPTURE_REQUIRED';
  const probabilities = prediction.grade_probabilities;

  return (
    <div className="space-y-5 font-sans w-full max-w-full overflow-hidden">
      <section className={`brutal-card p-5 border-2 space-y-4 ${rejected ? 'border-status-danger' : 'border-accent-orange'}`}>
        <header className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-border font-mono text-xs">
          <strong className="text-text-muted uppercase">AI screening result</strong>
          <Badge variant={rejected ? 'danger' : triage.decision === 'HUMAN_REVIEW_RECOMMENDED' ? 'warning' : 'success'}>
            {triage.decision.replace(/_/g, ' ')}
          </Badge>
        </header>

        {rejected ? (
          <div className="p-4 bg-status-danger/10 border border-status-danger/40 space-y-2">
            <h2 className="text-xl font-black text-status-danger uppercase">Screening unavailable</h2>
            <p className="font-mono text-xs font-bold text-status-danger">Image quality insufficient. Image recapture required.</p>
            <p className="font-mono text-xs text-text-primary">{quality.action_required}</p>
          </div>
        ) : (
          <div className="p-4 bg-surface-2 border-l-4 border-accent-orange">
            <span className="font-mono text-[10px] uppercase text-accent-gold">Model predicted grade</span>
            <h2 className="text-xl font-black text-text-primary uppercase">{prediction.severity_label}</h2>
            <p className="text-xs text-text-secondary">{prediction.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="p-3 bg-surface-2 border border-surface-border">
            <span className="block text-[10px] text-text-muted uppercase">Image quality score</span>
            <strong>{quality.quality_score} / 100 · {quality.status}</strong>
          </div>
          {!rejected && (
            <>
              <div className="p-3 bg-surface-2 border border-surface-border">
                <span className="block text-[10px] text-text-muted uppercase">Model confidence</span>
                <strong>{(prediction.confidence! * 100).toFixed(1)}%</strong>
              </div>
              <div className="p-3 bg-surface-2 border border-surface-border">
                <span className="block text-[10px] text-text-muted uppercase">P(Grade 2–4)</span>
                <strong>{(prediction.p_referable! * 100).toFixed(1)}% · {prediction.referable ? 'Referable' : 'Below threshold'}</strong>
              </div>
            </>
          )}
          <div className="p-3 bg-surface-2 border border-surface-border">
            <span className="block text-[10px] text-text-muted uppercase">Uploaded file</span>
            <strong className="break-all">{result.filename}</strong>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-text-secondary">
          <span>Focus variance: {quality.blur_metrics?.blur_score ?? 'Unavailable'}{quality.blur_metrics?.blur_threshold !== undefined ? ` (threshold ${quality.blur_metrics.blur_threshold})` : ''}</span>
          <span>Mean luminance: {quality.illumination_metrics?.mean_luminance ?? 'Unavailable'}</span>
        </div>

        {!rejected && probabilities && (
          <section className="space-y-2">
            <h3 className="font-mono text-xs uppercase font-bold text-accent-orange">Calibrated grade probabilities</h3>
            {GRADE_NAMES.map((name, grade) => {
              const probability = probabilities[`grade_${grade}`];
              return (
                <div key={name} className="font-mono text-xs">
                  <div className="flex justify-between"><span>{name}</span><strong>{(probability * 100).toFixed(1)}%</strong></div>
                  <div className="h-2 bg-surface-3"><div className="h-full bg-accent-orange" style={{ width: `${probability * 100}%` }} /></div>
                </div>
              );
            })}
          </section>
        )}
      </section>

      <section className="brutal-card p-4 space-y-2">
        <h3 className="font-mono text-xs font-bold uppercase flex items-center gap-2"><Sparkles className="w-4 h-4" /> Grad-CAM · interpretability only</h3>
        {rejected ? (
          <p className="font-mono text-xs text-text-muted">Not generated because the quality gate rejected this image.</p>
        ) : explainability?.available && explainability.overlay_base64 ? (
          <img src={explainability.overlay_base64} alt="Backend generated Grad-CAM overlay" className="w-full border border-surface-border" />
        ) : (
          <p className="font-mono text-xs text-text-muted">{explainability?.message || 'Grad-CAM unavailable.'}</p>
        )}
        <p className="font-mono text-[10px] text-text-muted">Lesion detection unavailable. Grad-CAM is an attention map, not lesion detection.</p>
      </section>

      <section className="p-4 bg-surface-1 border border-surface-border space-y-2">
        <h3 className="font-mono text-xs font-bold uppercase">Backend triage actions</h3>
        {triage.action_steps.map((step) => <p key={step} className="text-xs text-text-primary">{step}</p>)}
        {triage.reasons.length > 0 && <p className="font-mono text-[10px] text-text-muted">Reasons: {triage.reasons.join(', ')}</p>}
      </section>

      <p className="font-mono text-[10px] text-text-muted">Prototype engineering triage; not a clinically validated diagnosis. Model: {prediction.model_name}</p>
      {rejected && <div className="text-status-danger text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Recapture the fundus image to continue screening.</div>}
      <Button variant="ghost" size="sm" onClick={onReset} icon={<RefreshCcw className="w-4 h-4" />}>New Screening</Button>
    </div>
  );
};
