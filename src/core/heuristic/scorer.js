/**
 * Weighted Scoring System for Hackathon Context
 * 
 * Weights are tuned to detect AI/prebuilt abuse while respecting fast legitimate work
 */

const WEIGHTS = {
  timeline_integrity: 0.20,      // 20% - Critical: repo creation timing
  initial_commit: 0.25,          // 25% - MOST IMPORTANT: first commit analysis
  progression_pattern: 0.15,     // 15% - Development methodology
  commit_speed: 0.15,            // 15% - Velocity analysis
  file_growth: 0.05,             // 5%  - File creation patterns
  contributor_behavior: 0.05,    // 5%  - Team dynamics
  project_maturity: 0.05,        // 5%  - Architecture quality
  commit_messages: 0.05          // 5%  - Message patterns
};

/**
 * Calculate final weighted score (0-100)
 * @param {Object} components - Individual component scores
 * @returns {number} Final AI likelihood score (0-100)
 */
export const calculateWeightedScore = (components) => {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [component, weight] of Object.entries(WEIGHTS)) {
    const componentScore = components[component] ?? 50; // Default to neutral if missing
    const normalizedComponent = componentScore / 100; // Normalize to 0-1
    
    // Invert: low scores (clean development) should result in low AI likelihood
    const aiLikelihood = 100 - componentScore;
    
    totalScore += (aiLikelihood / 100) * weight;
    totalWeight += weight;
  }

  // Final score: weighted average, 0-100 scale
  const finalScore = Math.round((totalScore / Math.max(1, totalWeight)) * 100);
  
  return Math.min(100, Math.max(0, finalScore));
};

/**
 * Get component-wise scoring explanation
 */
export const getScoreBreakdown = (components) => {
  const breakdown = {};
  
  for (const [component, weight] of Object.entries(WEIGHTS)) {
    const componentScore = components[component] ?? 50;
    const aiLikelihood = 100 - componentScore;
    
    breakdown[component] = {
      component_score: componentScore,
      ai_likelihood: aiLikelihood,
      weight: Math.round(weight * 100),
      weighted_contribution: Math.round((aiLikelihood / 100) * weight * 100)
    };
  }
  
  return breakdown;
};

/**
 * Determine risk level based on score
 */
export const getRiskLevel = (score) => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 65) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 30) return 'LOW';
  return 'MINIMAL';
};

/**
 * Get color coding for visualization
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#ef4444'; // Red
  if (score >= 65) return '#f97316'; // Orange
  if (score >= 50) return '#eab308'; // Yellow
  if (score >= 30) return '#84cc16'; // Lime
  return '#22c55e'; // Green
};

export { WEIGHTS };

export default {
  calculateWeightedScore,
  getScoreBreakdown,
  getRiskLevel,
  getScoreColor
};
