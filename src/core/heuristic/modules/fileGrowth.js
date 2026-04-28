/**
 * File Growth Pattern Module
 * Detects when too many files appear at once vs gradual addition
 */

export const analyzeFileGrowth = (repoData) => {
  const { commits, file_structure } = repoData;
  
  let score = 100;
  const flags = [];

  if (!commits || commits.length === 0) {
    return { score, flags };
  }

  // Track file creation patterns
  const fileCreationByCommit = commits.map(c => ({
    time: c.commit_time,
    files_changed: c.files_changed || 0,
    additions: c.additions || 0
  }));

  // Check first commit file count
  const firstCommitFiles = fileCreationByCommit[fileCreationByCommit.length - 1].files_changed;
  
  if (firstCommitFiles > 50) {
    score -= 30;
    flags.push({
      title: "Massive Initial File Dump",
      severity: "high",
      reason: `${firstCommitFiles} files created in first commit`,
      hackathon_context: "Typical start: 5-15 files (templates, config, basic structure)",
      evidence: { files_in_first_commit: firstCommitFiles },
      impact: -30
    });
  } else if (firstCommitFiles > 20) {
    score -= 15;
    flags.push({
      title: "Many Files Created Initially",
      severity: "medium",
      reason: `${firstCommitFiles} files in first commit`,
      evidence: { files: firstCommitFiles },
      impact: -15
    });
  } else if (firstCommitFiles <= 5) {
    score += 10;
  }

  // Analyze file creation velocity
  let totalFilesCreated = 0;
  let singleCommitFileMax = 0;
  let filesCreatedInSingleCommit = [];

  for (const commit of fileCreationByCommit) {
    totalFilesCreated += commit.files_changed;
    if (commit.files_changed > singleCommitFileMax) {
      singleCommitFileMax = commit.files_changed;
      filesCreatedInSingleCommit.push({
        count: commit.files_changed,
        time: commit.time
      });
    }
  }

  // Check for abnormal file burst patterns
  if (singleCommitFileMax > 30) {
    score -= 20;
    flags.push({
      title: "File Creation Burst",
      severity: "high",
      reason: `${singleCommitFileMax} files created in a single commit`,
      hackathon_context: "Prebuilt templates create many files at once",
      evidence: { files_in_single_commit: singleCommitFileMax },
      impact: -20
    });
  }

  // Calculate files per commit ratio
  const avgFilesPerCommit = totalFilesCreated / Math.max(1, commits.length);
  
  if (avgFilesPerCommit > 10 && commits.length <= 5) {
    score -= 15;
    flags.push({
      title: "High File-to-Commit Ratio",
      severity: "medium",
      reason: `Average ${Math.round(avgFilesPerCommit)} files per commit`,
      hackathon_context: "Normal: consolidate files, ~3-5 per commit",
      evidence: {
        total_files: totalFilesCreated,
        total_commits: commits.length,
        average_per_commit: Math.round(avgFilesPerCommit * 10) / 10
      },
      impact: -15
    });
  }

  // Check file structure diversity (reward varied file types)
  if (file_structure) {
    const fileExtensions = new Set();
    const flattenFiles = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj || {})) {
        if (typeof value === 'object') {
          flattenFiles(value, path + key + '/');
        } else if (typeof value === 'string' && value.includes('.')) {
          const ext = value.split('.').pop();
          fileExtensions.add(ext);
        }
      }
    };
    flattenFiles(file_structure);

    // Reward diverse tech stack
    if (fileExtensions.size > 5) {
      score += 5;
    }
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeFileGrowth;
