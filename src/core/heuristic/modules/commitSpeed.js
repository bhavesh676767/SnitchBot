/**
 * Commit Speed & Output Module
 * Detects extreme coding velocity (too fast = suspicious)
 */

export const analyzeCommitSpeed = (repoData, hackathonTimes) => {
  const { commits } = repoData;
  
  let score = 100;
  const flags = [];

  if (!commits || commits.length === 0) {
    return { score, flags };
  }

  // Analyze time between commits
  const timeDiffs = [];
  for (let i = 0; i < commits.length - 1; i++) {
    const curr = new Date(commits[i].commit_time).getTime();
    const next = new Date(commits[i + 1].commit_time).getTime();
    const diffMinutes = (curr - next) / (1000 * 60);
    
    if (diffMinutes > 0) {
      timeDiffs.push(diffMinutes);
    }
  }

  // Check for suspiciously fast commits
  let extremeFastCommits = 0;
  let veryFastCommits = 0;

  for (let i = 0; i < commits.length - 1; i++) {
    const curr = new Date(commits[i].commit_time).getTime();
    const next = new Date(commits[i + 1].commit_time).getTime();
    const diffMinutes = (curr - next) / (1000 * 60);
    const lineCount = commits[i].additions + commits[i].deletions;

    // Extreme: 500+ lines in <2 minutes
    if (lineCount > 500 && diffMinutes < 2) {
      extremeFastCommits++;
      score -= 25;
      flags.push({
        title: "Extreme Velocity Detected",
        severity: "critical",
        reason: `${lineCount} lines added in ${Math.round(diffMinutes)} minute(s)`,
        hackathon_context: "Impossible for human typing; suggests copy-pasted code",
        evidence: {
          lines: lineCount,
          time_minutes: Math.round(diffMinutes * 10) / 10,
          lines_per_minute: Math.round(lineCount / Math.max(1, diffMinutes))
        },
        impact: -25
      });
    }
    // Very fast: 300+ lines in <3 minutes
    else if (lineCount > 300 && diffMinutes < 3) {
      veryFastCommits++;
      score -= 12;
      flags.push({
        title: "Very High Velocity Commit",
        severity: "high",
        reason: `${lineCount} lines in ${Math.round(diffMinutes)} minutes`,
        evidence: {
          lines: lineCount,
          time_minutes: Math.round(diffMinutes * 10) / 10,
          lines_per_minute: Math.round(lineCount / Math.max(1, diffMinutes))
        },
        impact: -12
      });
    }
  }

  // Calculate average velocity
  if (commits.length > 1) {
    let totalLines = 0;
    let totalTime = 0;

    for (let i = 0; i < commits.length; i++) {
      totalLines += commits[i].additions + commits[i].deletions;
    }

    if (timeDiffs.length > 0) {
      totalTime = timeDiffs.reduce((a, b) => a + b, 0);
      const avgVelocity = totalLines / Math.max(1, totalTime);

      // If average is > 200 lines/min for whole project, suspicious
      if (avgVelocity > 200) {
        score -= 15;
        flags.push({
          title: "Abnormally High Average Velocity",
          severity: "medium",
          reason: `Average ${Math.round(avgVelocity)} lines per minute across project`,
          hackathon_context: "Typical hackathon pace: 30-80 lines/min (accounting for debugging)",
          evidence: {
            lines_per_minute: Math.round(avgVelocity),
            total_lines: totalLines,
            total_time_minutes: Math.round(totalTime)
          },
          impact: -15
        });
      } else if (avgVelocity > 100) {
        score -= 5;
      } else if (avgVelocity < 30 && commits.length > 3) {
        // Reward normal or slow development
        score += 10;
      }
    }
  }

  // Check for burst pattern (sudden spike)
  if (commits.length > 3) {
    const sortedBySize = [...commits].sort((a, b) => 
      (b.additions + b.deletions) - (a.additions + a.deletions)
    );
    const topCommitSize = sortedBySize[0].additions + sortedBySize[0].deletions;
    const avgSize = commits.reduce((sum, c) => sum + c.additions + c.deletions, 0) / commits.length;

    if (topCommitSize > avgSize * 5) {
      score -= 10;
      flags.push({
        title: "Suspicious Code Burst",
        severity: "medium",
        reason: `One commit is 5x larger than average (${topCommitSize} vs ${Math.round(avgSize)} avg)`,
        evidence: {
          largest_commit: topCommitSize,
          average: Math.round(avgSize),
          ratio: Math.round(topCommitSize / avgSize)
        },
        impact: -10
      });
    }
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeCommitSpeed;
