import analyze from '../heuristic/analyzer.js';
import { getRiskLevel, getScoreColor } from '../heuristic/scorer.js';
import { createSummaryBadge, groupFlagsBySeverity } from '../heuristic/flagGenerator.js';

/**
 * Process GitHub repository for heuristic analysis
 * Transforms raw GitHub data into analysis format
 */
export const processAnalysis = (githubData, hackathonConfig, teamInfo) => {
  // Transform GitHub data to expected format
  const repoData = transformGithubData(githubData);
  
  // Get hackathon timing
  const hackathonTimes = {
    start_time: hackathonConfig.start_time,
    end_time: hackathonConfig.end_time
  };

  // Run analysis
  const analysisResult = analyze(repoData, hackathonTimes, teamInfo.team_name);

  // Enrich with visual data
  const enrichedResult = {
    ...analysisResult,
    visual_data: {
      risk_level: getRiskLevel(analysisResult.ai_likelihood),
      score_color: getScoreColor(analysisResult.ai_likelihood),
      flag_summary: createSummaryBadge(analysisResult.flags),
      flags_grouped: groupFlagsBySeverity(analysisResult.flags)
    }
  };

  return enrichedResult;
};

/**
 * Transform GitHub API response to analysis format
 */
const transformGithubData = (githubData) => {
  const {
    created_at,
    updated_at,
    commits: rawCommits = [],
    contributors: rawContributors = [],
    repo_url,
    html_url,
    files_structure
  } = githubData;

  // Transform commits
  const commits = rawCommits.map(commit => ({
    commit_time: commit.commit.author.date,
    author: commit.commit.author.name || commit.author?.login || 'unknown',
    commit_message: commit.commit.message,
    additions: commit.stats?.additions || 0,
    deletions: commit.stats?.deletions || 0,
    files_changed: commit.files?.length || 0,
    file_names: commit.files?.map(f => f.filename) || []
  }));

  // Transform contributors
  const contributors = rawContributors.map(contributor => ({
    login: contributor.login,
    contributions: contributor.contributions
  }));

  // Calculate first commit
  const firstCommit = commits.length > 0 ? commits[commits.length - 1] : null;

  return {
    created_at,
    updated_at,
    repo_url: repo_url || html_url,
    commits: commits.sort((a, b) => 
      new Date(b.commit_time).getTime() - new Date(a.commit_time).getTime()
    ),
    contributors,
    first_commit_time: firstCommit?.commit_time || created_at,
    file_structure: files_structure || {}
  };
};

/**
 * Batch process multiple repositories
 */
export const processBatchAnalysis = (repositoriesData, hackathonConfig) => {
  return repositoriesData.map((repoData, index) => {
    try {
      return {
        status: 'success',
        data: processAnalysis(
          repoData.github_data,
          hackathonConfig,
          { team_name: repoData.team_name }
        )
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        team_name: repoData.team_name
      };
    }
  });
};

/**
 * Format analysis for display in Arena
 */
export const formatForArenaDisplay = (analysisResult) => {
  return {
    team: analysisResult.team,
    repo: analysisResult.repo,
    ai_likelihood: analysisResult.ai_likelihood,
    verdict: analysisResult.verdict,
    summary: analysisResult.summary,
    risk_level: analysisResult.visual_data.risk_level,
    score_color: analysisResult.visual_data.score_color,
    metrics: {
      total_commits: analysisResult.metrics.total_commits,
      contributors: analysisResult.metrics.unique_contributors,
      largest_commit: analysisResult.metrics.largest_commit,
      files_added: analysisResult.metrics.files_added
    },
    flag_summary: analysisResult.visual_data.flag_summary,
    top_flags: analysisResult.flags.slice(0, 5),
    timestamp: analysisResult.timestamp
  };
};

/**
 * Export analysis as JSON report
 */
export const exportAsReport = (analysisResult) => {
  return {
    report_type: 'Hackathon Repository Analysis',
    timestamp: analysisResult.timestamp,
    team: analysisResult.team,
    repository: analysisResult.repo,
    verdict: analysisResult.verdict,
    ai_likelihood_score: analysisResult.ai_likelihood,
    risk_level: analysisResult.visual_data.risk_level,
    summary: analysisResult.summary,
    context: analysisResult.hackathon_context,
    metrics: analysisResult.metrics,
    component_scores: analysisResult.analysis_breakdown,
    flags: analysisResult.flags.map(f => ({
      title: f.title,
      severity: f.severity,
      reason: f.reason,
      impact: f.impact,
      evidence: f.evidence
    }))
  };
};

/**
 * Legacy processData function wrapper
 */
export const processData = (githubData, hackathonConfig, teamInfo) => {
  return processAnalysis(githubData, hackathonConfig, teamInfo);
};

export default {
  processAnalysis,
  processBatchAnalysis,
  formatForArenaDisplay,
  exportAsReport,
  processData
};
