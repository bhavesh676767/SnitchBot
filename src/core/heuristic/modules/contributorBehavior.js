/**
 * Contributor Behavior Module
 * Detects suspicious contributor patterns
 */

export const analyzeContributorBehavior = (repoData) => {
  const { contributors, commits } = repoData;
  
  let score = 100;
  const flags = [];

  if (!contributors || contributors.length === 0) {
    return { score, flags };
  }

  // Analyze contributor distribution
  const contributorCommits = {};
  const contributorLines = {};

  for (const commit of commits) {
    const author = commit.author || 'unknown';
    contributorCommits[author] = (contributorCommits[author] || 0) + 1;
    contributorLines[author] = (contributorLines[author] || 0) + (commit.additions + commit.deletions);
  }

  // Check dominance by single contributor
  const sortedContributors = Object.entries(contributorCommits)
    .sort(([, a], [, b]) => b - a);
  
  if (sortedContributors.length === 1) {
    // Single person doing everything - mild suspicion
    score -= 5;
  } else if (sortedContributors.length > 0) {
    const topContributor = sortedContributors[0][1];
    const totalCommits = commits.length;
    const dominancePercent = (topContributor / totalCommits) * 100;

    if (dominancePercent > 95) {
      score -= 10;
      flags.push({
        title: "Single Contributor Dominance",
        severity: "low",
        reason: `One person made ${Math.round(dominancePercent)}% of commits`,
        hackathon_context: "Small teams are normal, but 100% dominance is unusual",
        evidence: {
          top_contributor_commits: topContributor,
          total_commits: totalCommits,
          dominance_percent: Math.round(dominancePercent)
        },
        impact: -10
      });
    } else if (dominancePercent > 85 && sortedContributors.length > 1) {
      score -= 5;
    }
  }

  // Check for suspicious contributor overlap patterns
  if (sortedContributors.length > 1) {
    // Get all contributors sorted by commits
    const topTwo = sortedContributors.slice(0, 2);
    
    if (topTwo.length === 2) {
      const ratio = topTwo[0][1] / Math.max(1, topTwo[1][1]);
      
      if (ratio > 10) {
        // One person doing 10x more than second
        score -= 8;
        flags.push({
          title: "Unbalanced Contribution",
          severity: "low",
          reason: `Top contributor made ${Math.round(ratio)}x more commits than second`,
          evidence: {
            top_contributor: topTwo[0][1],
            second_contributor: topTwo[1][1],
            ratio: Math.round(ratio * 10) / 10
          },
          impact: -8
        });
      }
    }
  }

  // Check for realistic team size (reward normal team sizes)
  const activeContributors = sortedContributors.length;
  
  if (activeContributors >= 2 && activeContributors <= 4) {
    score += 5; // Typical hackathon team
  }

  // Analyze lines distribution
  if (Object.keys(contributorLines).length > 1) {
    const sortedByLines = Object.entries(contributorLines)
      .sort(([, a], [, b]) => b - a);
    
    const totalLines = Object.values(contributorLines).reduce((a, b) => a + b, 0);
    const topContributorLines = sortedByLines[0][1];
    const linesDominancePercent = (topContributorLines / totalLines) * 100;

    if (linesDominancePercent > 95) {
      score -= 5;
      flags.push({
        title: "Highly Skewed Code Distribution",
        severity: "low",
        reason: `${Math.round(linesDominancePercent)}% of code from single contributor`,
        evidence: {
          top_contributor_lines: topContributorLines,
          total_lines: totalLines
        },
        impact: -5
      });
    }
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeContributorBehavior;
