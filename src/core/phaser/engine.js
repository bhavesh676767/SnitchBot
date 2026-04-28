import { processAnalysis, processBatchAnalysis, formatForArenaDisplay, exportAsReport } from './processor.js';

/**
 * SnitchBot Heuristic Analysis Engine
 * Main orchestrator for GitHub repository analysis in hackathon context
 */

export class HeuristicEngine {
  constructor(hackathonConfig) {
    this.hackathonConfig = hackathonConfig;
    this.analysisCache = new Map();
    this.validatedConfig = this.validateConfig(hackathonConfig);
  }

  /**
   * Validate hackathon configuration
   */
  validateConfig(config) {
    if (!config || !config.start_time || !config.end_time) {
      throw new Error('Hackathon configuration must include start_time and end_time');
    }
    
    const startTime = new Date(config.start_time).getTime();
    const endTime = new Date(config.end_time).getTime();
    
    if (startTime >= endTime) {
      throw new Error('Hackathon start_time must be before end_time');
    }
    
    return {
      ...config,
      start_time: config.start_time,
      end_time: config.end_time,
      duration_hours: (endTime - startTime) / (1000 * 60 * 60)
    };
  }

  /**
   * Analyze a single repository
   */
  async analyzeRepository(githubData, teamInfo) {
    const cacheKey = `${teamInfo.team_name}-${githubData.repo_url}`;
    
    // Check cache
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    try {
      const result = processAnalysis(
        githubData,
        this.validatedConfig,
        teamInfo
      );
      
      // Cache result
      this.analysisCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw new Error(`Analysis failed for ${teamInfo.team_name}: ${error.message}`);
    }
  }

  /**
   * Analyze multiple repositories (batch)
   */
  async analyzeRepositories(repositoriesData) {
    const results = repositoriesData.map((repoData, index) => {
      try {
        return {
          index,
          status: 'success',
          data: processAnalysis(
            repoData.github_data,
            this.validatedConfig,
            { team_name: repoData.team_name }
          )
        };
      } catch (error) {
        return {
          index,
          status: 'error',
          error: error.message,
          team_name: repoData.team_name
        };
      }
    });

    return {
      total_analyzed: repositoriesData.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    };
  }

  /**
   * Get formatted output for live Arena display
   */
  formatForArena(analysisResult) {
    return formatForArenaDisplay(analysisResult);
  }

  /**
   * Export analysis as detailed JSON report
   */
  exportReport(analysisResult) {
    return exportAsReport(analysisResult);
  }

  /**
   * Rank repositories by suspicion level
   */
  rankRepositories(analysisResults) {
    return analysisResults
      .filter(r => r.status === 'success')
      .map(r => ({
        rank: 0, // Will be set in sort
        team: r.data.team,
        repo: r.data.repo,
        ai_likelihood: r.data.ai_likelihood,
        verdict: r.data.verdict,
        risk_level: r.data.visual_data.risk_level,
        flag_count: r.data.flags.length,
        critical_flags: r.data.visual_data.flags_grouped.critical.length
      }))
      .sort((a, b) => {
        // Sort by AI likelihood (descending), then by critical flags
        if (b.ai_likelihood !== a.ai_likelihood) {
          return b.ai_likelihood - a.ai_likelihood;
        }
        return b.critical_flags - a.critical_flags;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }

  /**
   * Generate summary statistics
   */
  generateSummary(analysisResults) {
    const successful = analysisResults.filter(r => r.status === 'success');
    
    if (successful.length === 0) {
      return {
        total_teams: analysisResults.length,
        analyzed: 0,
        critical_count: 0,
        high_count: 0,
        suspicious_teams: []
      };
    }

    const scores = successful.map(r => r.data.ai_likelihood);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const critical = successful.filter(r => r.data.ai_likelihood >= 80);
    const high = successful.filter(r => r.data.ai_likelihood >= 65 && r.data.ai_likelihood < 80);

    return {
      total_teams: analysisResults.length,
      analyzed: successful.length,
      failed: analysisResults.filter(r => r.status === 'error').length,
      average_ai_likelihood: avgScore,
      critical_count: critical.length,
      high_count: high.length,
      distribution: {
        clean: successful.filter(r => r.data.ai_likelihood < 30).length,
        low_concern: successful.filter(r => r.data.ai_likelihood >= 30 && r.data.ai_likelihood < 50).length,
        moderate: successful.filter(r => r.data.ai_likelihood >= 50 && r.data.ai_likelihood < 65).length,
        suspicious: high.length,
        highly_suspicious: critical.length
      },
      top_suspicious: critical
        .slice(0, 5)
        .map(r => ({
          team: r.data.team,
          repo: r.data.repo,
          ai_likelihood: r.data.ai_likelihood,
          verdict: r.data.verdict
        }))
    };
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }

  /**
   * Get cached analysis
   */
  getCachedAnalysis(teamName, repoUrl) {
    const cacheKey = `${teamName}-${repoUrl}`;
    return this.analysisCache.get(cacheKey);
  }
}

/**
 * Singleton engine instance
 */
let engineInstance = null;

/**
 * Initialize global engine instance
 */
export const initializeEngine = (hackathonConfig) => {
  engineInstance = new HeuristicEngine(hackathonConfig);
  return engineInstance;
};

/**
 * Get global engine instance
 */
export const getEngine = () => {
  if (!engineInstance) {
    throw new Error('Engine not initialized. Call initializeEngine() first.');
  }
  return engineInstance;
};

/**
 * Run engine with quick API
 */
export const runEngine = async (githubData, hackathonConfig, teamInfo) => {
  if (!engineInstance || JSON.stringify(engineInstance.hackathonConfig) !== JSON.stringify(hackathonConfig)) {
    initializeEngine(hackathonConfig);
  }
  
  return engineInstance.analyzeRepository(githubData, teamInfo);
};

export default {
  HeuristicEngine,
  initializeEngine,
  getEngine,
  runEngine
};
