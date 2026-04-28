/**
 * Initial Commit Analysis Module
 * CRITICAL: Detects if first commit contains massive prebuilt codebase
 */

export const analyzeInitialCommit = (repoData, hackathonTimes) => {
  const { commits } = repoData;
  
  let score = 100;
  const flags = [];

  if (!commits || commits.length === 0) {
    return { score, flags };
  }

  const firstCommit = commits[commits.length - 1]; // Oldest commit first
  const { additions, deletions, files_changed, commit_message } = firstCommit;
  
  const totalLines = additions + deletions;

  // Check 1: Massive initial commit (>1000 lines)
  if (totalLines > 2000) {
    score -= 40;
    flags.push({
      title: "Massive Initial Commit",
      severity: "critical",
      reason: `First commit added ${totalLines}+ lines of code`,
      hackathon_context: "Highly unusual for fresh hackathon start",
      evidence: {
        lines_added: additions,
        files_changed,
        total_lines: totalLines
      },
      impact: -40
    });
  } else if (totalLines > 1000) {
    score -= 30;
    flags.push({
      title: "Large Initial Commit",
      severity: "high",
      reason: `First commit added ${totalLines} lines`,
      hackathon_context: "Suggests pre-existing codebase",
      evidence: {
        lines_added: additions,
        files_changed,
        total_lines: totalLines
      },
      impact: -30
    });
  } else if (totalLines > 500) {
    score -= 15;
    flags.push({
      title: "Substantial Initial Commit",
      severity: "medium",
      reason: `First commit added ${totalLines} lines`,
      evidence: {
        lines_added: additions,
        files_changed
      },
      impact: -15
    });
  } else {
    // Reward small, focused initial commit
    score += 10;
  }

  // Check 2: Too many files in first commit
  if (files_changed > 50) {
    score -= 25;
    flags.push({
      title: "Excessive Files in First Commit",
      severity: "high",
      reason: `${files_changed} files created at once`,
      hackathon_context: "Normal: create core files gradually, not all at once",
      evidence: { files_changed },
      impact: -25
    });
  } else if (files_changed > 20) {
    score -= 10;
    flags.push({
      title: "Many Files Created Initially",
      severity: "medium",
      reason: `${files_changed} files in first commit`,
      evidence: { files_changed },
      impact: -10
    });
  } else if (files_changed <= 5) {
    score += 5;
  }

  // Check 3: Perfect project structure in first commit (bad sign)
  const structuredFolders = [
    'src/', 'components/', 'utils/', 'services/', 'models/',
    'views/', 'controllers/', 'middleware/', 'config/', 'lib/'
  ];
  
  // If first commit has many structured folders, it suggests a template/prebuilt
  // This is inferred from file names in the commit
  const indicatesStructure = firstCommit.file_names && 
    structuredFolders.filter(f => firstCommit.file_names.some(fn => fn.includes(f))).length > 3;
  
  if (indicatesStructure && totalLines > 500) {
    score -= 20;
    flags.push({
      title: "Complete Folder Structure Instantly",
      severity: "high",
      reason: "Professional folder structure appeared in first commit with large codebase",
      hackathon_context: "Humans build structure gradually; templates/prebuilt arrive complete",
      evidence: { structured_immediately: true },
      impact: -20
    });
  }

  // Check 4: Suspicious initial commit message
  const vague_messages = ['initial commit', 'first commit', 'start', 'init', 'setup'];
  const isVagueMessage = vague_messages.some(msg => 
    commit_message.toLowerCase().includes(msg)
  );
  
  if (isVagueMessage && totalLines > 1000) {
    score -= 10;
    flags.push({
      title: "Generic Initial Commit Message",
      severity: "low",
      reason: `Vague message "${commit_message}" with massive codebase`,
      evidence: { message: commit_message },
      impact: -10
    });
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeInitialCommit;
