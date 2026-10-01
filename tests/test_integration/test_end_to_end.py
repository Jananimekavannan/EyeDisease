"""
Integration Tests for SIH26038 Screening Pipeline.
Validates the interconnected flow:
Quality Check -> Ben Graham Preprocessing -> Inference / Placeholder -> Decision Engine.
"""
import sys
from pathlib import Path
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from quality_gate.quality_check import assess_image_quality
from ml.inference.predictor import DRPredictor
from reliability.decision_engine import ClinicalDecisionEngine


def test_screening_pipeline_integration():
    # 1. Simulate a clear retinal fundus image
    synthetic_fundus = np.zeros((300, 300, 3), dtype=np.uint8)
    # Draw simulated circular retinal disk with edge details
    synthetic_fundus[40:260, 40:260, :] = 160
    synthetic_fundus[80:120, 80:120, 0] = 220  # red vessels / optic disc

    # 2. Quality Gate
    quality_result = assess_image_quality(synthetic_fundus)
    assert "is_gradable" in quality_result
    assert "quality_score" in quality_result

    # 3. Model Predictor
    predictor = DRPredictor()
    prediction_result = predictor.predict(synthetic_fundus)
    assert "status" in prediction_result
    assert "preprocessing_completed" in prediction_result

    # 4. Clinical Decision Engine
    decision_engine = ClinicalDecisionEngine()
    triage_result = decision_engine.evaluate_triage(
        quality_result=quality_result,
        prediction_result=prediction_result
    )

    assert "decision" in triage_result
    assert "reasons" in triage_result
    assert "action_steps" in triage_result
