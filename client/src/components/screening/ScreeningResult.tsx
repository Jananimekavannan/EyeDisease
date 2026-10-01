import { AlertTriangle, RefreshCcw, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { FullScreeningResponse, ReliabilityStatus } from '../../types/screening';

interface ScreeningResultProps {
  result: FullScreeningResponse;
  onReset: () => void;
}

const GRADE_NAMES = ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'];
const REFERABLE_THRESHOLD = 0.29;

function triageExplanation(decision: ReliabilityStatus): string {
  switch (decision) {
    case 'RELIABLE_SCREENING':
      return "Screening result is within the system's engineering reliability criteria. This is an AI screening prediction, not a medical diagnosis.";
    case 'HUMAN_REVIEW_RECOMMENDED':
      return 'The system recommends human review. Do not treat this AI result as a final clinical decision.';
    case 'IMAGE_RECAPTURE_REQUIRED':
      return 'The image did not meet the image-quality requirements. Capture another fundus image before screening.';
    case 'PENDING_MODEL_TRAINING':
      return 'The backend reports that screening is pending model training.';
  }
}

export const ScreeningResult: React.FC<ScreeningResultProps> = ({ result, onReset }) => {
  const { quality_gate: quality, prediction, explainability, triage } = result;
  const rejected = !quality.is_gradable || triage.decision === 'IMAGE_RECAPTURE_REQUIRED';
  const probabilities = prediction.grade_probabilities;
  const badgeVariant = rejected
    ? 'danger'
    : triage.decision === 'HUMAN_REVIEW_RECOMMENDED'
      ? 'warning'
      : 'success';

  return (
    <div className="space-y-5 font-sans w-full max-w-full overflow-hidden">
      <section className={`brutal-card p-5 border-2 space-y-4 ${rejected ? 'border-status-danger' : 'border-accent-orange'}`}>
        <header className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-border font-mono text-xs">
          <strong className="text-text-muted uppercase">AI screening prediction · not a medical diagnosis</strong>
          <Badge variant={badgeVariant}>{triage.decision.replace(/_/g, ' ')}</Badge>
        </header>

        {rejected ? (
          <div className="p-4 bg-status-danger/10 border border-status-danger/40 space-y-2">
            <h2 className="text-xl font-black text-status-danger uppercase">Image recapture required</h2>
            <p className="font-mono text-xs font-bold text-status-danger">{triageExplanation(triage.decision)}</p>
            <p className="font-mono text-xs text-text-primary">{quality.action_required}</p>
          </div>
        ) : (
          <div className="p-4 bg-surface-2 border-l-4 border-accent-orange space-y-1">
            <span className="font-mono text-[10px] uppercase text-accent-gold">AI screening prediction</span>
            <h2 className="text-xl font-black text-text-primary uppercase">
              {prediction.grade !== null ? `AI-predicted Grade ${prediction.grade}` : 'AI prediction unavailable'}
              {prediction.severity_label ? ` · ${prediction.severity_label}` : ''}
            </h2>
            <p className="text-xs text-text-secondary">{prediction.description}</p>
            <p className="text-xs text-text-muted">This is a model prediction, not a confirmed diagnosis.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          <div className="p-3 bg-surface-2 border border-surface-border">
            <span className="block text-[10px] text-text-muted uppercase">Image-quality engineering score</span>
            <strong>{quality.quality_score.toFixed(1)} / 100 · {quality.status}</strong>
            <p className="mt-1 text-[10px] text-text-muted">A quality-gate score, not a probability or diagnostic confidence.</p>
          </div>
          {!rejected && (
            <>
              <div className="p-3 bg-surface-2 border border-surface-border">
                <span className="block text-[10px] text-text-muted uppercase">Model confidence</span>
                <strong>{prediction.confidence !== null ? `${(prediction.confidence * 100).toFixed(1)}%` : 'Unavailable'}</strong>
                <p className="mt-1 text-[10px] text-text-muted">Model output confidence, not diagnostic certainty.</p>
              </div>
              <div className="p-3 bg-surface-2 border border-surface-border sm:col-span-2 space-y-2">
                <span className="block text-[10px] text-text-muted uppercase">Referable probability and frozen threshold</span>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <strong>P(Grade 2–4): {prediction.p_referable !== null ? `${(prediction.p_referable * 100).toFixed(1)}%` : 'Unavailable'}</strong>
                  <strong>Referable threshold: 29%</strong>
                </div>
                <div
                  className="relative h-3 bg-surface-3 border border-surface-border"
                  role="img"
                  aria-label={`Backend P(Grade 2–4) ${prediction.p_referable !== null ? `${(prediction.p_referable * 100).toFixed(1)} percent` : 'unavailable'}; referable threshold 29 percent`}
                >
                  {prediction.p_referable !== null && (
                    <div
                      className="h-full bg-accent-orange"
                      style={{ width: `${Math.min(Math.max(prediction.p_referable * 100, 0), 100)}%` }}
                    />
                  )}
                  <div className="absolute -top-1 -bottom-1 w-0.5 bg-status-success" style={{ left: `${REFERABLE_THRESHOLD * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0%</span>
                  <span>Green marker = 29% threshold</span>
                  <span>100%</span>
                </div>
                <p className="text-[10px] text-text-secondary">
                  Backend referable flag: {prediction.referable === null ? 'Unavailable' : prediction.referable ? 'Referable' : 'Not referable'}.
                </p>
              </div>
            </>
          )}
          <div className="p-3 bg-surface-2 border border-surface-border">
            <span className="block text-[10px] text-text-muted uppercase">Uploaded file</span>
            <strong className="break-all">{result.filename || 'Unavailable'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px] text-text-secondary">
          <span>Focus variance: {quality.blur_metrics?.blur_score ?? 'Unavailable'}{quality.blur_metrics?.blur_threshold !== undefined ? ` (threshold ${quality.blur_metrics.blur_threshold})` : ''}</span>
          <span>Mean luminance: {quality.illumination_metrics?.mean_luminance ?? 'Unavailable'}</span>
        </div>

        {!rejected && probabilities && (
          <section className="space-y-2">
            <h3 className="font-mono text-xs uppercase font-bold text-accent-orange">Backend grade probabilities</h3>
            {GRADE_NAMES.map((name, grade) => {
              const probability = probabilities[`grade_${grade}`];
              return (
                <div key={name} className="font-mono text-xs">
                  <div className="flex justify-between"><span>Grade {grade} · {name}</span><strong>{(probability * 100).toFixed(1)}%</strong></div>
                  <div className="h-2 bg-surface-3"><div className="h-full bg-accent-orange" style={{ width: `${probability * 100}%` }} /></div>
                </div>
              );
            })}
          </section>
        )}
      </section>

      <section className="brutal-card p-4 space-y-2">
        <h3 className="font-mono text-xs font-bold uppercase flex items-center gap-2"><Sparkles className="w-4 h-4" /> Model interpretability — Grad-CAM</h3>
        {rejected ? (
          <p className="font-mono text-xs text-text-muted">Not generated because the image-quality gate rejected this image.</p>
        ) : explainability?.available && explainability.overlay_base64 ? (
          <img src={explainability.overlay_base64} alt="Backend generated Grad-CAM overlay" className="w-full border border-surface-border" />
        ) : (
          <p className="font-mono text-xs text-text-muted">{explainability?.message || 'Grad-CAM unavailable.'}</p>
        )}
        <p className="font-mono text-[10px] text-text-muted">Grad-CAM highlights image regions contributing to the model prediction. It is not lesion detection and does not confirm a lesion location.</p>
        <p className="font-mono text-xs font-bold text-text-secondary">Lesion analysis: Unavailable</p>
      </section>

      <section className="p-4 bg-surface-1 border border-surface-border space-y-2">
        <h3 className="font-mono text-xs font-bold uppercase">Backend triage</h3>
        <p className="text-xs text-text-primary">{triageExplanation(triage.decision)}</p>
        {triage.reasons.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-mono text-[10px] text-text-muted uppercase">Backend reasons</h4>
            <ul className="list-disc pl-5 text-xs text-text-secondary">{triage.reasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}</ul>
          </div>
        )}
        {triage.action_steps.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-mono text-[10px] text-text-muted uppercase">Backend action steps</h4>
            <ul className="list-disc pl-5 text-xs text-text-primary">{triage.action_steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ul>
          </div>
        )}
      </section>

      <p className="font-mono text-[10px] text-text-muted">Prototype screening output; not a clinically validated diagnosis. Model: {prediction.model_name}</p>
      {rejected && <div className="text-status-danger text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Recapture the fundus image to continue screening.</div>}
      <Button variant="ghost" size="sm" onClick={onReset} icon={<RefreshCcw className="w-4 h-4" />}>New Screening</Button>
    </div>
  );
};
