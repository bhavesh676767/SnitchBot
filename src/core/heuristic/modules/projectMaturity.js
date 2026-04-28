/**
 * Project Maturity Signal Module
 * Detects if project appears too polished/complete for a hackathon start
 */

export const analyzeProjectMaturity = (repoData) => {
  const { commits, file_structure } = repoData;
  
  let score = 100;
  const flags = [];

  if (!file_structure) {
    return { score, flags };
  }

  // Analyze folder structure quality
  const maturityIndicators = {
    hasConfigFolder: false,
    hasTestFolder: false,
    hasDocumentation: false,
    hasBuildScripts: false,
    hasEnvironmentFiles: false,
    hasGitignore: false,
    hasPackageJson: false,
    hasReadme: false,
    hasLinting: false,
    hasCICD: false,
    hasComplexArchitecture: false
  };

  const flattenAndAnalyze = (obj, depth = 0) => {
    if (!obj) return;
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check for configuration folders
      if (['config', 'configs', 'settings'].includes(lowerKey)) {
        maturityIndicators.hasConfigFolder = true;
      }
      if (['test', 'tests', '__tests__', 'spec', 'specs'].includes(lowerKey)) {
        maturityIndicators.hasTestFolder = true;
      }
      if (['docs', 'documentation'].includes(lowerKey)) {
        maturityIndicators.hasDocumentation = true;
      }
      if (['.github', 'scripts', 'build'].includes(lowerKey)) {
        maturityIndicators.hasBuildScripts = true;
      }
      if (['.env', '.env.example', 'env.sample'].includes(lowerKey)) {
        maturityIndicators.hasEnvironmentFiles = true;
      }
      if (['middleware', 'controllers', 'services', 'models', 'utils', 'lib'].includes(lowerKey)) {
        maturityIndicators.hasComplexArchitecture = true;
      }
      
      // Check for specific files
      if (lowerKey === '.gitignore') maturityIndicators.hasGitignore = true;
      if (lowerKey === 'package.json') maturityIndicators.hasPackageJson = true;
      if (lowerKey === 'readme.md') maturityIndicators.hasReadme = true;
      if (['eslint', 'prettier', '.eslintrc'].includes(lowerKey)) {
        maturityIndicators.hasLinting = true;
      }
      if (['.github', 'gitlab-ci', 'circle.yml', '.travis.yml'].includes(lowerKey)) {
        maturityIndicators.hasCICD = true;
      }
      
      // Recurse
      if (typeof value === 'object' && depth < 3) {
        flattenAndAnalyze(value, depth + 1);
      }
    }
  };

  flattenAndAnalyze(file_structure);

  // Count maturity indicators
  const maturityScore = Object.values(maturityIndicators).filter(Boolean).length;
  
  // Scoring logic:
  // Too many mature indicators in first commit = suspicious
  
  if (commits && commits.length > 0) {
    const firstCommit = commits[commits.length - 1];
    const firstCommitSize = firstCommit.additions + firstCommit.deletions;

    // If massive first commit AND many maturity indicators = prebuilt
    if (firstCommitSize > 1000 && maturityScore >= 6) {
      score -= 30;
      flags.push({
        title: "Overly Mature Architecture",
        severity: "high",
        reason: `Complete ${maturityScore}-indicator mature structure in first commit`,
        hackathon_context: "Humans sketch quick code first, structure comes later",
        evidence: {
          maturity_indicators: maturityScore,
          indicators_found: Object.entries(maturityIndicators)
            .filter(([, v]) => v)
            .map(([k]) => k)
        },
        impact: -30
      });
    } else if (maturityScore >= 7) {
      // Even with normal commits, 7+ indicators is unusual
      score -= 15;
      flags.push({
        title: "Professional Structure Immediately",
        severity: "medium",
        reason: `${maturityScore} maturity indicators present from start`,
        hackathon_context: "Typical: folders appear gradually, best practices added later",
        evidence: {
          maturity_indicators: maturityScore,
          indicators_found: Object.entries(maturityIndicators)
            .filter(([, v]) => v)
            .map(([k]) => k)
        },
        impact: -15
      });
    }
  }

  // Reward lean, simple starts
  if (maturityScore <= 2) {
    score += 10;
  } else if (maturityScore <= 3) {
    score += 5;
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeProjectMaturity;
