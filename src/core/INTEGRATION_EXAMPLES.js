/**
 * SnitchBot Engine Integration Examples
 * How to use the heuristic analysis engine in React components
 */

// ============================================================================
// EXAMPLE 1: Initialize Engine in App Component
// ============================================================================

import { useEffect, useState } from 'react';
import { initializeEngine } from '@/core/phaser/engine.js';

export function AppSetup() {
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    // Initialize engine with hackathon times
    const hackathonConfig = {
      start_time: '2024-04-20T09:00:00Z',
      end_time: '2024-04-21T09:00:00Z'
    };

    try {
      const engineInstance = initializeEngine(hackathonConfig);
      setEngine(engineInstance);
      console.log('✅ Analysis engine initialized');
    } catch (error) {
      console.error('❌ Engine initialization failed:', error);
    }
  }, []);

  return engine;
}

// ============================================================================
// EXAMPLE 2: Single Repository Analysis Hook
// ============================================================================

import { useState } from 'react';
import { getEngine } from '@/core/phaser/engine.js';

export function useRepositoryAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeRepo = async (githubData, teamInfo) => {
    setLoading(true);
    setError(null);

    try {
      const engine = getEngine();
      const analysisResult = await engine.analyzeRepository(githubData, teamInfo);
      
      setResult(analysisResult);
      console.log('Analysis complete:', {
        team: analysisResult.team,
        ai_likelihood: analysisResult.ai_likelihood,
        verdict: analysisResult.verdict
      });
      
      return analysisResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Analysis failed:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, analyzeRepo };
}

// ============================================================================
// EXAMPLE 3: Live Analyzer Component Integration
// ============================================================================

import { useEffect } from 'react';

export function LiveAnalyzerWithAnalysis({ githubRepo, teamName }) {
  const { result, loading, analyzeRepo } = useRepositoryAnalysis();

  useEffect(() => {
    if (githubRepo) {
      analyzeRepo(githubRepo, { team_name: teamName });
    }
  }, [githubRepo, teamName]);

  if (loading) {
    return <div className="loading-spinner">Analyzing repository...</div>;
  }

  if (!result) {
    return <div>No analysis available</div>;
  }

  return (
    <div className="analysis-display">
      {/* AI Likelihood Score - Large & Prominent */}
      <div className={`score-badge score-${result.visual_data.risk_level.toLowerCase()}`}>
        <div className="score-number">{result.ai_likelihood}%</div>
        <div className="score-label">AI Likelihood</div>
      </div>

      {/* Verdict */}
      <div className="verdict-section">
        <h3>{result.verdict}</h3>
        <p>{result.summary}</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric">
          <span className="label">Total Commits</span>
          <span className="value">{result.metrics.total_commits}</span>
        </div>
        <div className="metric">
          <span className="label">Contributors</span>
          <span className="value">{result.metrics.unique_contributors}</span>
        </div>
        <div className="metric">
          <span className="label">Avg Lines/Commit</span>
          <span className="value">{result.metrics.avg_lines_per_commit}</span>
        </div>
        <div className="metric">
          <span className="label">Avg Lines/Min</span>
          <span className="value">{result.metrics.avg_lines_per_minute}</span>
        </div>
      </div>

      {/* Top Flags */}
      <div className="flags-section">
        <h4>⚠️ Analysis Flags ({result.flags.length})</h4>
        {result.visual_data.flags_grouped.critical.length > 0 && (
          <div className="flag-group critical">
            <h5>🚨 Critical ({result.visual_data.flags_grouped.critical.length})</h5>
            {result.visual_data.flags_grouped.critical.map((flag, i) => (
              <div key={i} className="flag critical">
                <span className="flag-title">{flag.title}</span>
                <span className="flag-reason">{flag.reason}</span>
              </div>
            ))}
          </div>
        )}
        {result.visual_data.flags_grouped.high.length > 0 && (
          <div className="flag-group high">
            <h5>⚠️ High ({result.visual_data.flags_grouped.high.length})</h5>
            {result.visual_data.flags_grouped.high.map((flag, i) => (
              <div key={i} className="flag high">
                <span className="flag-title">{flag.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Breakdown */}
      <div className="breakdown-section">
        <h4>Module Scores (0-100)</h4>
        <div className="breakdown-grid">
          {Object.entries(result.analysis_breakdown).map(([module, score]) => (
            <div key={module} className="breakdown-item">
              <span className="module-name">{module.replace(/_/g, ' ')}</span>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${score}%`,
                    backgroundColor: score < 30 ? '#22c55e' : 
                                     score < 50 ? '#84cc16' :
                                     score < 65 ? '#eab308' :
                                     score < 80 ? '#f97316' : '#ef4444'
                  }}
                />
              </div>
              <span className="score-text">{score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Arena View - Batch Analysis & Rankings
// ============================================================================

export function ArenaViewWithAnalysis({ repositories }) {
  const [rankings, setRankings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeBatch();
  }, [repositories]);

  const analyzeBatch = async () => {
    try {
      const engine = getEngine();
      
      // Analyze all repositories
      const batchResults = await engine.analyzeRepositories(
        repositories.map(repo => ({
          github_data: repo.data,
          team_name: repo.teamName
        }))
      );

      // Get rankings and summary
      const ranked = engine.rankRepositories(batchResults.results);
      const stats = engine.generateSummary(batchResults.results);

      setRankings(ranked);
      setSummary(stats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Analyzing all repositories...</div>;
  }

  return (
    <div className="arena-view">
      {/* Summary Stats */}
      {summary && (
        <div className="summary-stats">
          <div className="stat">
            <span className="label">Analyzed</span>
            <span className="value">{summary.analyzed}/{summary.total_teams}</span>
          </div>
          <div className="stat">
            <span className="label">Average Score</span>
            <span className="value">{summary.average_ai_likelihood}%</span>
          </div>
          <div className="stat critical">
            <span className="label">🚨 Critical</span>
            <span className="value">{summary.critical_count}</span>
          </div>
          <div className="stat high">
            <span className="label">⚠️ Suspicious</span>
            <span className="value">{summary.high_count}</span>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="rankings-table">
        <h3>Repository Rankings (Most Suspicious First)</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Repository</th>
              <th>AI Likelihood</th>
              <th>Verdict</th>
              <th>Critical Flags</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((repo) => (
              <tr 
                key={`${repo.team}-${repo.repo}`}
                className={`risk-${repo.risk_level.toLowerCase()}`}
              >
                <td className="rank">#{repo.rank}</td>
                <td className="team">{repo.team}</td>
                <td className="repo">{repo.repo}</td>
                <td className="score">
                  <div className="score-badge">
                    {repo.ai_likelihood}%
                  </div>
                </td>
                <td className="verdict">{repo.verdict}</td>
                <td className="flags">
                  {repo.critical_flags > 0 ? (
                    <span className="badge critical">🚨 {repo.critical_flags}</span>
                  ) : (
                    <span className="badge clean">✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Suspicious Teams */}
      {summary?.top_suspicious.length > 0 && (
        <div className="top-suspicious">
          <h3>🚨 Most Suspicious Teams</h3>
          {summary.top_suspicious.map((team) => (
            <div key={team.team} className="team-card critical">
              <div className="team-name">{team.team}</div>
              <div className="repo-url">{team.repo}</div>
              <div className="score">{team.ai_likelihood}% AI Likelihood</div>
              <div className="verdict">{team.verdict}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Admin Dashboard Integration
// ============================================================================

export function AdminDashboard() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { analyzeRepo, loading } = useRepositoryAnalysis();

  const handleAnalyzeTeam = async (team) => {
    const result = await analyzeRepo(team.githubData, { team_name: team.name });
    setAnalysisResult(result);
    setSelectedTeam(team);
  };

  return (
    <div className="admin-dashboard">
      <div className="teams-list">
        {/* List of teams */}
      </div>

      {selectedTeam && (
        <div className="analysis-panel">
          <h2>{selectedTeam.name}</h2>
          {loading && <div className="spinner">Analyzing...</div>}
          {analysisResult && (
            <>
              {/* Render detailed analysis from Example 3 */}
              <div className="export-actions">
                <button onClick={() => exportAnalysis(analysisResult)}>
                  📥 Download Report
                </button>
                <button onClick={() => shareAnalysis(analysisResult)}>
                  🔗 Share Results
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Export Report
// ============================================================================

export function exportAnalysis(analysisResult) {
  const engine = getEngine();
  const report = engine.exportReport(analysisResult);
  
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `snitchbot-report-${analysisResult.team}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// EXAMPLE 7: Real-time Score Display Component
// ============================================================================

export function ScoreDisplay({ aiLikelihood, verdict, riskLevel }) {
  const getColor = (score) => {
    if (score >= 80) return '#ef4444'; // Red
    if (score >= 65) return '#f97316'; // Orange
    if (score >= 50) return '#eab308'; // Yellow
    if (score >= 30) return '#84cc16'; // Lime
    return '#22c55e'; // Green
  };

  return (
    <div className="score-display" style={{
      borderColor: getColor(aiLikelihood)
    }}>
      <div className="score-circle" style={{
        backgroundColor: getColor(aiLikelihood),
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        fontWeight: 'bold',
        color: 'white'
      }}>
        {aiLikelihood}%
      </div>
      <div className="verdict-text">
        <div className="risk-badge">{riskLevel}</div>
        <div className="verdict">{verdict}</div>
      </div>
    </div>
  );
}

// ============================================================================

export const INTEGRATION_NOTES = `
Quick Integration Checklist:

1. App.jsx
   □ Import initializeEngine at startup
   □ Get hackathon times from config
   □ Call initializeEngine in useEffect
   □ Store engine in context or state

2. LiveAnalyzer.jsx
   □ Import useRepositoryAnalysis hook
   □ Call analyzeRepo when GitHub data arrives
   □ Display result.ai_likelihood prominently
   □ Show flags using result.visual_data.flags_grouped

3. Arena.jsx
   □ Import getEngine for batch analysis
   □ Call analyzeRepositories on component mount
   □ Call rankRepositories for sorted view
   □ Call generateSummary for stats
   □ Display as table or cards

4. Admin.jsx
   □ Add ability to select teams
   □ Trigger single analysis
   □ Show detailed breakdown
   □ Provide export/share functionality

5. Styling
   □ Color code by risk level (red/orange/yellow/lime/green)
   □ Make score prominent (large, centered)
   □ Group flags by severity
   □ Show module scores as progress bars

6. Testing
   □ Use sample repos from ANALYSIS_GUIDE.js
   □ Verify scores match expected ranges
   □ Test flag generation and grouping
   □ Verify batch analysis works
`;