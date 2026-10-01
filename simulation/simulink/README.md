# ⚙️ Simulink Rural Screening Model

This directory houses the dynamic Simulink model (`rural_telemedicine_model.slx`) simulating the discrete-event queuing network of a rural healthcare cluster.

---

## 🏗️ Model Architecture (SimEvents / Stateflow)

```text
[Patient Arrival (Poisson Gen)] 
        ↓
[Fundus Camera Capture Station (Server)] 
        ↓
[Quality Gate Switch] 
    ├── Pass (88%) ──→ [Edge AI Inference Engine (Server)] 
    │                          ↓
    │                  [Triage Splitter]
    │                  ├── Normal / Grade 0 (Discharge Sink)
    │                  ├── Reliable Referable (Fast-Track Hospital Queue)
    │                  └── Uncertain Cases (Tele-Consultation Queue)
    └── Fail (12%) ──→ [Immediate Recapture Buffer]
```

---

## 📋 Key Output Scenarios
1. **Camp Wait Time**: Average minutes spent by a patient from registration to screening result.
2. **Network Bandwidth Bottleneck**: Comparison of edge processing (local Raspberry Pi/Jetson) vs. cloud upload over 128 kbps rural uplink.
3. **Doctor Tele-queue Backlog**: Peak queue length for the remote ophthalmologist reviewing ambiguous cases.
