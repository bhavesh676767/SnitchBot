/**
 * Development Progression Pattern Module
 * Detects iterative development vs sudden completeness
 */

export const analyzeProgressionPattern = (repoData, hackathonTimes) => {
  const { commits } = repoData;
  
  let score = 100;
  const flags = [];

  if (!commits || commits.length < 2) {
    return { score, flags }; // Too few commits to analyze pattern
  }

  // Analyze commit sequence
  let gradualGrowth = true;
  let hasRefinements = false;
  let hasEdits = false;
  let commitSizes = commits.map(c => c.additions + c.deletions);
  let maxSize = Math.max(...commitSizes);
  let minSize = Math.min(...commitSizes);
  
  // Check for refinement commits (typically smaller, editing existing files)
  const refinementKeywords = ['fix', 'refactor', 'improve', 'update', 'bug', 'cleanup', 'adjust', 'tweak'];
  
  let refinementCount = 0;
  let largeCommits = 0;
  let mediumCommits = 0;
  let smallCommits = 0;
  let fileEditPercentage = 0;

  for (const commit of commits) {
    const lineCount = commit.additions + commit.deletions;
    
    // Categorize commits
    if (lineCount > 500) {
      largeCommits++;
    } else if (lineCount > 100) {
      mediumCommits++;
    } else {
      smallCommits++;
    }

    // Check for refinement
    const message = commit.commit_message.toLowerCase();
    if (refinementKeywords.some(kw => message.includes(kw))) {
      refinementCount++;
      hasRefinements = true;
    }

    // Check for edits vs new files (rough estimate from message)
    if (message.includes('edit') || message.includes('update') || message.includes('fix')) {
      hasEdits = true;
    }
  }

  // If only 1-2 commits, especially with large code, it's suspicious
  if (commits.length <= 2 && commitSizes[0] > 1000) {
    score -= 35;
    flags.push({
      title: "Minimal Commit History",
      severity: "high",
      reason: `Only ${commits.length} commit(s) for a hackathon project`,
      hackathon_context: "Normal workflow includes multiple iterations and bug fixes",
      evidence: { total_commits: commits.length },
      impact: -35
    });
  }

  // Check for no gradual growth
  if (commitSizes.length > 2) {
    // Check if there's actual growth or just one big dump
    const sortedSizes = [...commitSizes].sort((a, b) => a - b);
    const variance = sortedSizes[sortedSizes.length - 1] / Math.max(1, sortedSizes[0]);
    
    if (variance > 5 && commitSizes[commitSizes.length - 1] > 1000) {
      // Huge first commit then tiny ones
      score -= 20;
      flags.push({
        title: "No Gradual Development Pattern",
        severity: "medium",
        reason: "Massive initial commit followed by minimal changes",
        hackathon_context: "Expected: gradual build with iterations",
        evidence: {
          first_commit_lines: commitSizes[commitSizes.length - 1],
          later_commits_average: Math.round(commitSizes.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(1, commitSizes.length - 1))
        },
        impact: -20
      });
    }
  }

  // Reward iteration and refinement
  if (hasRefinements) {
    score += 15;
  } else if (commits.length > 3) {
    score -= 20;
    flags.push({
      title: "No Refinement or Bug Fixes",
      severity: "medium",
      reason: "No commits with fix/refactor/update keywords detected",
      hackathon_context: "Normal: developers fix bugs and refine as they build",
      evidence: { refinement_commits: refinementCount },
      impact: -20
    });
  }

  // Reward varied commit messages (shows natural development)
  const uniqueMessages = new Set(commits.map(c => c.commit_message.toLowerCase())).size;
  const messageVariety = uniqueMessages / commits.length;
  
  if (messageVariety > 0.7) {
    score += 10;
  } else if (messageVariety < 0.3 && commits.length > 5) {
    score -= 10;
    flags.push({
      title: "Repetitive Commit Messages",
      severity: "low",
      reason: "Very similar/repeated commit messages",
      evidence: { unique_messages: uniqueMessages, total_commits: commits.length },
      impact: -10
    });
  }

  // Check for consistent development velocity
  if (commits.length >= 3) {
    const avgSize = commitSizes.reduce((a, b) => a + b) / commitSizes.length;
    const variance = commitSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / commitSizes.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev / avgSize > 1.5 && maxSize / minSize > 10) {
      // High variance = inconsistent pattern (possible prebuilt then tweaks)
      score -= 15;
      flags.push({
        title: "Highly Inconsistent Commit Sizes",
        severity: "medium",
        reason: "Wildly varying commit sizes suggests non-linear development",
        hackathon_context: "Human development shows more consistent velocity",
        evidence: {
          largest: maxSize,
          smallest: minSize,
          ratio: Math.round(maxSize / minSize)
        },
        impact: -15
      });
    }
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeProgressionPattern;
