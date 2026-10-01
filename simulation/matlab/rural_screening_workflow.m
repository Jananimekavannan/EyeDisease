%% SIH26038: Rural Tele-Ophthalmology Screening Workflow Simulation
% Models patient intake at a rural Primary Health Centre (PHC),
% automated Image Quality Gate, AI DR classification, and triage routing.

clc;
clear;
close all;

fprintf('=======================================================\n');
fprintf('  SIH26038: Rural DR Screening Queue & Triage Simulation\n');
fprintf('=======================================================\n\n');

%% 1. Simulation Parameters
num_patients = 500;             % Daily screened population across rural cluster
p_dr_prevalence = 0.18;         % Estimated Diabetic Retinopathy prevalence (18%)
p_poor_quality = 0.12;          % Initial ungradable fundus capture rate (12%)
recapture_success_rate = 0.85;  % Operator correction success on retake

% AI Screening Performance Metrics (Target specifications)
ai_sensitivity = 0.94;          % Sensitivity for referable DR (Grade >= 2)
ai_specificity = 0.92;          % Specificity for healthy retina
ai_uncertainty_rate = 0.08;     % Cases routed to human review (8%)

%% 2. Monte Carlo Cohort Generation
rng(42); % For reproducibility

% Ground Truth DR Status: 0 = Healthy, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = PDR
% Using categorical distribution representing rural diabetes population
dr_distribution = [0.82, 0.08, 0.06, 0.03, 0.01]; % Probabilities for grades 0-4
ground_truth_grades = randsample(0:4, num_patients, true, dr_distribution);

%% 3. Image Quality Gate Stage
initial_quality_pass = rand(1, num_patients) > p_poor_quality;
recapture_pass = rand(1, num_patients) < recapture_success_rate;
final_quality_pass = initial_quality_pass | recapture_pass;

num_recaptures = sum(~initial_quality_pass);
num_permanently_ungradable = sum(~final_quality_pass);

fprintf('Screening Cohort: %d patients\n', num_patients);
fprintf(' - Images passing first capture: %d\n', sum(initial_quality_pass));
fprintf(' - Immediate on-site recaptures required: %d\n', num_recaptures);
fprintf(' - Permanently ungradable (direct hospital referral): %d\n\n', num_permanently_ungradable);

%% 4. Automated AI Screening & Triage Flow
triage_decisions = strings(1, num_patients);
% Categories: "DIRECT_DISCHARGE_ANNUAL", "SPECIALIST_REFERRAL", "HUMAN_TELE_REVIEW"

specialist_workload_traditional = num_patients; % All patients traditionally referred
specialist_workload_ai = 0;

for i = 1:num_patients
    if ~final_quality_pass(i)
        triage_decisions(i) = "HOSPITAL_EXAM_UNGRADABLE";
        specialist_workload_ai = specialist_workload_ai + 1;
        continue;
    end
    
    true_grade = ground_truth_grades(i);
    is_referable = (true_grade >= 2);
    
    % Simulate AI decision with uncertainty
    is_uncertain = rand() < ai_uncertainty_rate;
    
    if is_uncertain
        triage_decisions(i) = "HUMAN_TELE_REVIEW";
        specialist_workload_ai = specialist_workload_ai + 1;
    else
        % Deterministic classification based on sensitivity & specificity
        if is_referable
            ai_detected = (rand() < ai_sensitivity);
        else
            ai_detected = (rand() > ai_specificity);
        end
        
        if ai_detected
            triage_decisions(i) = "SPECIALIST_REFERRAL";
            specialist_workload_ai = specialist_workload_ai + 1;
        else
            triage_decisions(i) = "DIRECT_DISCHARGE_ANNUAL";
        end
    end
end

%% 5. Results & Clinical Impact Summary
workload_reduction_pct = ((specialist_workload_traditional - specialist_workload_ai) / specialist_workload_traditional) * 100;

fprintf('Clinical Triage Outcomes:\n');
fprintf(' - Direct Local Discharge (Annual Follow-up): %d (%.1f%%)\n', ...
    sum(triage_decisions == "DIRECT_DISCHARGE_ANNUAL"), ...
    (sum(triage_decisions == "DIRECT_DISCHARGE_ANNUAL")/num_patients)*100);
fprintf(' - Confirmed Specialist Referrals: %d (%.1f%%)\n', ...
    sum(triage_decisions == "SPECIALIST_REFERRAL"), ...
    (sum(triage_decisions == "SPECIALIST_REFERRAL")/num_patients)*100);
fprintf(' - Asynchronous Human Tele-Review Queue: %d (%.1f%%)\n', ...
    sum(triage_decisions == "HUMAN_TELE_REVIEW"), ...
    (sum(triage_decisions == "HUMAN_TELE_REVIEW")/num_patients)*100);
fprintf(' - Workload Reduction for District Ophthalmologists: %.2f%%\n', workload_reduction_pct);
fprintf('=======================================================\n');
