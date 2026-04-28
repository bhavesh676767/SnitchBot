/**
 * Hackathon Timeline Integrity Module
 * Checks if repo was created before/during hackathon and detects pre-built signs
 */

export const analyzeTimelineIntegrity = (repoData, hackathonTimes) => {
  const { created_at, first_commit_time, commits } = repoData;
  const { start_time, end_time } = hackathonTimes;

  const repoCreatedTime = new Date(created_at).getTime();
  const hackathonStartTime = new Date(start_time).getTime();
  const firstCommitTime = new Date(first_commit_time).getTime();
  const now = Date.now();

  let score = 100; // Start with perfect score
  const flags = [];

  // Check 1: Repo created before hackathon
  const daysBefore = (hackathonStartTime - repoCreatedTime) / (1000 * 60 * 60 * 24);
  if (daysBefore > 7) {
    score -= 35;
    flags.push({
      title: "Pre-created Repository",
      severity: "critical",
      reason: `Repo created ${Math.floor(daysBefore)} days before hackathon`,
      evidence: { days_before: daysBefore },
      impact: -35
    });
  } else if (daysBefore > 1) {
    score -= 15;
    flags.push({
      title: "Repository Created Before Start",
      severity: "medium",
      reason: `Repo created ~${Math.floor(daysBefore)} day(s) before hackathon`,
      evidence: { days_before: daysBefore },
      impact: -15
    });
  }

  // Check 2: First commit before hackathon
  const commitBeforeHackathon = (hackathonStartTime - firstCommitTime) / (1000 * 60 * 60);
  if (commitBeforeHackathon > 0) {
    score -= 25;
    flags.push({
      title: "Activity Before Hackathon Start",
      severity: "high",
      reason: `First commit occurred ${Math.floor(commitBeforeHackathon)} hours before hackathon start`,
      evidence: { hours_before: commitBeforeHackathon },
      impact: -25
    });
  }

  // Check 3: Repo dormant for long time then sudden activity
  if (commits.length > 0) {
    const oldestCommit = commits[commits.length - 1];
    const newestCommit = commits[0];
    const oldCommitTime = new Date(oldestCommit.commit_time).getTime();
    const newCommitTime = new Date(newestCommit.commit_time).getTime();
    
    // If there's a gap between hackathon start and first activity
    const gapBeforeActivity = (firstCommitTime - hackathonStartTime) / (1000 * 60);
    if (gapBeforeActivity > 480) { // 8+ hours gap
      score -= 10;
      flags.push({
        title: "Delayed Start After Hackathon Begin",
        severity: "low",
        reason: `${Math.floor(gapBeforeActivity / 60)} hours gap before first commit`,
        evidence: { gap_minutes: gapBeforeActivity },
        impact: -10
      });
    }
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeTimelineIntegrity;
