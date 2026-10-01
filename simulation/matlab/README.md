# 📊 MATLAB Screening Workflow Simulation

This folder contains MATLAB scripts that model patient queues, screening throughput, and clinical resource allocation across rural primary health clinics.

---

## 🏃 Running the Simulation
1. Launch MATLAB (R2022b or later).
2. Open `rural_screening_workflow.m`.
3. Set simulation parameters (number of rural camps, daily patient intake, AI false negative tolerance).
4. Run the script:
   ```matlab
   run('rural_screening_workflow.m')
   ```
5. View generated plots:
   - Patient wait-time distributions (Traditional manual referral vs. AI triage).
   - Specialist workload reduction curve.
   - Quality gate recapture overhead.
