# Smart Move — Integration Fixes Applied

## Root causes found in the uploaded codebase

1. The frontend had a large mock fallback in `client/src/services/screeningService.ts`.
   If the backend request failed or returned an incomplete response, the UI could fabricate grades, probabilities, quality scores, and lesion evidence.

2. `client/src/components/screening/ImageViewer.tsx` generated synthetic image-specific heatmap hotspots and synthetic vessel trees from a hash of the image URI. These were not model outputs.

3. The quality gate evaluated blur/illumination over the whole frame, including black/white capture borders. This could make otherwise usable retinal images fail quality checks.

4. The backend generated Grad-CAM even after a quality failure. That could display an attention map for an image that was already deemed unsuitable for screening.

5. The screening UI contained demo preset labels and a demo state simulator that could be mistaken for actual model behavior.

## Changes

- Quality evaluation now focuses on an estimated retinal field and excludes capture borders.
- Quality failure still takes precedence over screening; it is not bypassed.
- Grad-CAM is skipped when the quality gate fails.
- Frontend uses only the real FastAPI response; no mock prediction fallback remains.
- Missing model/calibrated probabilities now produce a visible error instead of fabricated values.
- ImageViewer displays the actual backend Grad-CAM overlay when available.
- Synthetic vessel/heatmap overlays were removed.
- Vessel and lesion controls are marked unavailable because no validated production vessel/lesion model is connected.
- Demo state simulator and misleading sample labels were removed from the screening page.
- Static lesion-detection claims were softened to match the actual project capability.
- The frozen E2 checkpoint was not changed.

## Frozen checkpoint verification

SHA-256:

`6c342eb3bf432fce8a078e55a9027a4c107bdaabe1e55c23d2c8070b3bd7c24a`

Size:

`16,354,403 bytes`

## Verification performed

- Python compileall: PASS
- Backend pytest: 13 passed
- TypeScript `npx tsc --noEmit`: PASS
- Oxlint could not be executed in this Linux verification environment because the packaged native optional binding was unavailable. This is an environment/package-install issue, not a reported lint result.

## Important

After replacing the project with this fixed version, stop any old FastAPI process and start the backend again so that the running server is using the modified files.

The model weights, E2 architecture, production preprocessing, calibration temperature, and referable threshold were not changed.
