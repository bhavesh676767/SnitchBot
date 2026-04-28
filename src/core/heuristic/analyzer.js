import analyzeTimelineIntegrity from './modules/timelineIntegrity.js';
import analyzeInitialCommit from './modules/initialCommit.js';
import analyzeProgressionPattern from './modules/progressionPattern.js';
import analyzeCommitSpeed from './modules/commitSpeed.js';
import analyzeFileGrowth from './modules/fileGrowth.js';
import analyzeContributorBehavior from './modules/contributorBehavior.js';
import analyzeProjectMaturity from './modules/projectMaturity.js';
import analyzeCommitMessages from './modules/commitMessages.js';
import { calculateWeightedScore } from './scorer.js';
import { generateFlags } from './flagGenerator.js';

/**
 * Main Heuristic Analyzer
 * Orchestrates all analysis modules and produces comprehensive output
 */
export const analyze = (repoData, hackathonTimes, teamName) => {
  if (!repoData || !hackathonTimes) {
    throw new Error('Repository data and hackathon times are required');
  }

  // Run all analysis modules
  const timelineResults = analyzeTimelineIntegrity(repoData, hackathonTimes);
  const initialCommitResults = analyzeInitialCommit(repoData, hackathonTimes);
  const progressionResults = analyzeProgressionPattern(repoData, hackathonTimes);
  const speedResults = analyzeCommitSpeed(repoData, hackathonTimes);
  const fileGrowthResults = analyzeFileGrowth(repoData);
  const contributorResults = analyzeContributorBehavior(repoData);
  const maturityResults = analyzeProjectMaturity(repoData);
  const messageResults = analyzeCommitMessages(repoData);

  // Combine all scores with weights
  const components = {
    timeline_integrity: timelineResults.score,
    initial_commit: initialCommitResults.score,
    progression_pattern: progressionResults.score,
    commit_speed: speedResults.score,
    file_growth: fileGrowthResults.score,
    contributor_behavior: contributorResults.score,
    project_maturity: maturityResults.score,
    commit_messages: messageResults.score
  };

  // Calculate final weighted score
  const finalScore = calculateWeightedScore(components);

  // Combine all flags
  const allFlags = [
    ...timelineResults.flags,
    ...initialCommitResults.flags,
    ...progressionResults.flags,
    ...speedResults.flags,
    ...fileGrowthResults.flags,
    ...contributorResults.flags,
    ...maturityResults.flags,
    ...messageResults.flags
  ].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999);
  });

  // Determine verdict based on score
  const verdict = getVerdict(finalScore);

  // Prepare metrics
  const metrics = {
    repo_created: repoData.created_at,
    repo_age_days: Math.floor((Date.now() - new Date(repoData.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    total_commits: repoData.commits?.length || 0,
    unique_contributors: Object.keys(repoData.commits?.reduce((acc, c) => {
      acc[c.author || 'unknown'] = true;
      return acc;
    }, {}) || {}).length,
    largest_commit: Math.max(...(repoData.commits?.map(c => c.additions + c.deletions) || [0])),
    total_lines: repoData.commits?.reduce((sum, c) => sum + c.additions + c.deletions, 0) || 0,
    avg_lines_per_commit: repoData.commits?.length > 0 
      ? Math.round(repoData.commits.reduce((sum, c) => sum + c.additions + c.deletions, 0) / repoData.commits.length)
      : 0,
    files_added: repoData.commits?.reduce((sum, c) => sum + (c.files_changed || 0), 0) || 0
  };

  // Calculate average velocity
  if (repoData.commits && repoData.commits.length > 1) {
    let totalTime = 0;
    for (let i = 0; i < repoData.commits.length - 1; i++) {
      const curr = new Date(repoData.commits[i].commit_time).getTime();
      const next = new Date(repoData.commits[i + 1].commit_time).getTime();
      totalTime += (curr - next) / (1000 * 60);
    }
    if (totalTime > 0) {
      metrics.avg_lines_per_minute = Math.round((metrics.total_lines / totalTime) * 10) / 10;
    }
  }

  return {
    team: teamName || 'Unknown Team',
    repo: repoData.repo_url || 'unknown/repo',
    ai_likelihood: finalScore,
    verdict,
    summary: generateSummary(finalScore, allFlags),
    hackathon_context: generateHackathonContext(finalScore, components),
    metrics,
    flags: allFlags.slice(0, 20), // Top 20 flags for display
    analysis_breakdown: components,
    timestamp: new Date().toISOString()
  };
};

/**
 * Determine verdict based on AI likelihood score
 */
const getVerdict = (score) => {
  if (score >= 80) {
    return 'Highly Suspicious - Likely AI/Prebuilt';
  } else if (score >= 65) {
    return 'Suspicious - Possible AI Assistance';
  } else if (score >= 50) {
    return 'Moderate Concern - Review Recommended';
  } else if (score >= 30) {
    return 'Low Concern - Likely Legitimate';
  } else {
    return 'Clean - Appears Genuine';
  }
};

/**
 * Generate concise summary for display
 */
const generateSummary = (score, flags) => {
  if (flags.length === 0) {
    return 'No suspicious patterns detected. Development appears natural.';
  }

  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const highFlags = flags.filter(f => f.severity === 'high');

  let summary = '';
  
  if (criticalFlags.length > 0) {
    summary += `${criticalFlags.length} critical issue(s) detected: `;
    summary += criticalFlags.map(f => f.title).join(', ');
  } else if (highFlags.length > 0) {
    summary += `${highFlags.length} high-severity concern(s): `;
    summary += highFlags.slice(0, 2).map(f => f.title).join(', ');
  }

  if (summary.length > 200) {
    summary = summary.substring(0, 197) + '...';
  }

  return summary || 'Multiple indicators suggest non-standard development pattern.';
};

/**
 * Generate hackathon-specific context
 */
const generateHackathonContext = (score, components) => {
  const concerns = [];

  if (components.timeline_integrity < 60) {
    concerns.push('Repository timeline inconsistent with hackathon start');
  }
  if (components.initial_commit < 50) {
    concerns.push('Initial commit appears to contain pre-built code');
  }
  if (components.progression_pattern < 50) {
    concerns.push('Development pattern lacks natural iteration');
  }
  if (components.commit_speed < 50) {
    concerns.push('Commit velocity suggests copy-pasted code');
  }

  if (concerns.length === 0) {
    return 'Development pattern consistent with normal hackathon workflow.';
  }

  return 'Behavior inconsistent with typical hackathon development: ' + 
         concerns.join('; ');
};

export default analyze;
