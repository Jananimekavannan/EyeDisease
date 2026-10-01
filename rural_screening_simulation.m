% =========================================================================
% RURAL DIABETIC RETINOPATHY SCREENING WORKFLOW SIMULATION
% Theme: MathWorks | User Workflow & Rural Simulation
% =========================================================================
% Comparison: AI-Assisted Workflow vs. Traditional Manual Specialist Workflow
% Note: All parameters are modeled assumptions for health system evaluation.
% =========================================================================

clear; clc; close all;

fprintf('=================================================================\n');
fprintf(' MATLAB Rural Screening Queue & Capacity Simulation \n');
fprintf('=================================================================\n\n');

%% 1. Simulation Input Assumptions (Clearly Labeled)
ASSUMPTION.patients_per_day               = 120;  % Patients arriving at Primary Health Center (PHC)
ASSUMPTION.quality_failure_rate           = 0.10; % 10% fundus images require instant recapture
ASSUMPTION.ai_processing_time_sec         = 0.42; % XAI inference & Grad-CAM map generation
ASSUMPTION.manual_exam_time_min           = 15.0; % Time required for manual ophthalmologist dilation & exam
ASSUMPTION.connectivity_availability_pct = 75.0; % 75% edge connectivity (25% offline local buffer)
ASSUMPTION.human_review_capacity_per_day  = 30;   % Max borderline/high-risk reviews per remote doctor/day
ASSUMPTION.referral_rate_pct              = 18.0; % 18% referable DR cases needing tertiary referral

fprintf('[ASSUMPTION LOG]\n');
fprintf('  • Daily Patient Footfall: %d patients/PHC\n', ASSUMPTION.patients_per_day);
fprintf('  • Fundus Image Recapture Rate: %.1f%%\n', ASSUMPTION.quality_failure_rate * 100);
fprintf('  • AI Screening Time per Patient: %.2f seconds\n', ASSUMPTION.ai_processing_time_sec);
fprintf('  • Manual Specialist Exam Time: %.1f minutes\n', ASSUMPTION.manual_exam_time_min);
fprintf('  • Remote Doctor Daily Review Capacity: %d cases/day\n\n', ASSUMPTION.human_review_capacity_per_day);

%% 2. Workflow Queue Metrics Calculation
% Traditional Manual Workflow Metrics
manual_total_exam_hours = (ASSUMPTION.patients_per_day * ASSUMPTION.manual_exam_time_min) / 60;
manual_queue_length     = max(0, ASSUMPTION.patients_per_day - (8 * 4)); % assuming 4 cases/hr capacity
manual_turnaround_days  = manual_total_exam_hours / 8; % 8-hour workday

% AI-Assisted Workflow Metrics
ai_screening_time_hours = (ASSUMPTION.patients_per_day * (ASSUMPTION.ai_processing_time_sec / 3600));
ai_flagged_for_human_review = round(ASSUMPTION.patients_per_day * 0.22); % 22% flagged for human review or severe DR
ai_queue_length         = max(0, ai_flagged_for_human_review - ASSUMPTION.human_review_capacity_per_day);
ai_turnaround_hours     = (ai_screening_time_hours + (ai_flagged_for_human_review / ASSUMPTION.human_review_capacity_per_day) * 8);

%% 3. Print Results Summary
fprintf('=================================================================\n');
fprintf(' WORKFLOW PERFORMANCE COMPARISON SUMMARY\n');
fprintf('=================================================================\n');
fprintf(' Metric                              | Manual Workflow | AI-Assisted Workflow\n');
fprintf('-------------------------------------+-----------------+---------------------\n');
fprintf(' Total Screening Hours / 100 Patients| %13.2f h | %17.4f h\n', manual_total_exam_hours, ai_screening_time_hours);
fprintf(' Cases Requiring Specialist Time     | %13d   | %17d  \n', ASSUMPTION.patients_per_day, ai_flagged_for_human_review);
fprintf(' Unmet Doctor Queue Backlog (daily)  | %13d   | %17d  \n', manual_queue_length, ai_queue_length);
fprintf(' Average Patient Turnaround Time     | %11.1f days | %15.2f hours\n', manual_turnaround_days, ai_turnaround_hours);
fprintf('=================================================================\n\n');

%% 4. Plot Comparison Visualizations
figure('Name', 'Rural DR Screening Simulation', 'Color', [0.05 0.05 0.05]);

% Subplot 1: Turnaround Time Comparison
subplot(1, 2, 1);
bar_data = [manual_turnaround_days * 24, ai_turnaround_hours];
b = bar(bar_data, 'FaceColor', 'flat');
b.CData(1,:) = [0.78 0.15 0.15]; % Red for manual delay
b.CData(2,:) = [1.00 0.35 0.12]; % Orange for AI-assisted
set(gca, 'XTickLabel', {'Manual Workflow', 'AI-Assisted'}, 'Color', [0.1 0.1 0.1], 'XColor', 'w', 'YColor', 'w');
title('Average Turnaround Time (Hours)', 'Color', [0.83 0.66 0.31], 'FontSize', 12);
ylabel('Hours to Result', 'Color', 'w');
grid on; set(gca, 'GridColor', [0.3 0.3 0.3]);

% Subplot 2: Specialist Time Allocation
subplot(1, 2, 2);
pie_data = [ai_flagged_for_human_review, (ASSUMPTION.patients_per_day - ai_flagged_for_human_review)];
p = pie(pie_data, {'Human Review (22%)', 'AI Triaged Normal (78%)'});
set(gca, 'Color', [0.1 0.1 0.1]);
title('Ophthalmologist Time Saved via AI Triage', 'Color', [0.83 0.66 0.31], 'FontSize', 12);

fprintf('Simulation script completed successfully. Plot generated.\n');
