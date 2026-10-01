# 🌾 Rural Tele-Screening Workflow Simulation

In rural India, public health screening involves Primary Health Centres (PHCs), Community Health Centres (CHCs), mobile screening vans, and tertiary referral eye hospitals. 

This module models and simulates the end-to-end rural tele-ophthalmology screening workflow using **MATLAB** and **Simulink**.

---

## 🎯 Objectives
1. **Queueing & Throughput**: Model patient arrival rates at village screening camps (Poisson distribution), image capture duration, AI processing latency, and network transmission times.
2. **Triage Efficiency**: Quantify reduction in ophthalmologist workload when Grade 0 (No DR) cases are screened out locally by reliable AI, reserving specialist tele-consultations for Grade 1-4 and uncertain cases.
3. **Bandwidth Optimization**: Simulate offline-first edge deployment vs. cloud-based Grad-CAM generation over intermittent 2G/3G/4G connectivity.

---

## 📁 Subdirectories
- `matlab/`: Discrete-event Monte Carlo scripts simulating patient batches, triage latency, and cost savings.
- `simulink/`: Block-diagram dynamic state-flow simulation of screening queues, server processing buffers, and human-in-the-loop review nodes.
