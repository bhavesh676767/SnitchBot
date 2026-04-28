/**
 * Commit Message Quality Module
 * Analyzes commit messages for signs of natural development
 */

export const analyzeCommitMessages = (repoData) => {
  const { commits } = repoData;
  
  let score = 100;
  const flags = [];

  if (!commits || commits.length === 0) {
    return { score, flags };
  }

  // Analyze message patterns
  const messageWords = [];
  const messages = commits.map(c => c.commit_message.toLowerCase());
  const messageFrequency = {};
  let genericMessageCount = 0;
  let tooShortCount = 0;

  const genericMessages = [
    'update', 'fix', 'add', 'initial', 'first', 'setup', 'init', 'start',
    'work', 'code', 'commit', 'changes', 'test', 'debug', 'temp'
  ];

  for (const msg of messages) {
    // Count frequency
    messageFrequency[msg] = (messageFrequency[msg] || 0) + 1;
    
    // Check for generic messages
    if (genericMessages.some(gm => msg === gm || msg.startsWith(gm + ' '))) {
      genericMessageCount++;
    }
    
    // Check for very short messages
    if (msg.length < 3) {
      tooShortCount++;
    }
  }

  // Identify repeated messages
  const repeatedMessages = Object.entries(messageFrequency)
    .filter(([msg, count]) => count > 1)
    .sort(([, a], [, b]) => b - a);

  // Analyze message variety
  const uniqueMessages = Object.keys(messageFrequency).length;
  const messageVariety = uniqueMessages / commits.length;

  // If mostly repeated same messages = suspicious
  if (repeatedMessages.length > 0) {
    const topRepeated = repeatedMessages[0];
    const repetitionPercent = (topRepeated[1] / commits.length) * 100;

    if (repetitionPercent > 60) {
      score -= 20;
      flags.push({
        title: "Repeated Commit Messages",
        severity: "high",
        reason: `${topRepeated[1]} commits with "${topRepeated[0]}" (${Math.round(repetitionPercent)}%)`,
        hackathon_context: "Natural development shows varied messages",
        evidence: {
          repeated_message: topRepeated[0],
          count: topRepeated[1],
          total_commits: commits.length,
          repetition_percent: Math.round(repetitionPercent)
        },
        impact: -20
      });
    } else if (repetitionPercent > 40) {
      score -= 10;
      flags.push({
        title: "Message Pattern Detected",
        severity: "medium",
        reason: `"${topRepeated[0]}" appears in ${topRepeated[1]} commits`,
        evidence: { count: topRepeated[1] },
        impact: -10
      });
    }
  }

  // Check message variety
  if (messageVariety < 0.3 && commits.length > 5) {
    score -= 12;
    flags.push({
      title: "Low Message Variety",
      severity: "medium",
      reason: `Only ${uniqueMessages} unique messages for ${commits.length} commits`,
      hackathon_context: "Developers naturally vary their commit messages",
      evidence: {
        unique_messages: uniqueMessages,
        total_commits: commits.length,
        variety_ratio: Math.round(messageVariety * 100) / 100
      },
      impact: -12
    });
  } else if (messageVariety > 0.8) {
    score += 5; // Reward good message variety
  }

  // Check generic message ratio
  const genericRatio = genericMessageCount / commits.length;
  
  if (genericRatio > 0.8 && commits.length > 3) {
    score -= 8;
    flags.push({
      title: "Generic Commit Messages",
      severity: "low",
      reason: `${genericMessageCount}/${commits.length} commits have generic messages`,
      evidence: {
        generic_count: genericMessageCount,
        total_commits: commits.length,
        generic_ratio: Math.round(genericRatio * 100)
      },
      impact: -8
    });
  } else if (genericRatio < 0.3) {
    score += 5;
  }

  // Check for unrealistically detailed messages (suspicious for quick coding)
  let veryDetailedCount = 0;
  for (const msg of messages) {
    if (msg.length > 100 && msg.split(' ').length > 15) {
      veryDetailedCount++;
    }
  }

  if (veryDetailedCount > commits.length * 0.5) {
    score -= 5;
    flags.push({
      title: "Unusually Detailed Messages",
      severity: "low",
      reason: `${veryDetailedCount} commits have very detailed descriptions`,
      hackathon_context: "Hackers typically use short, quick commit messages",
      evidence: { detailed_count: veryDetailedCount },
      impact: -5
    });
  }

  return { score: Math.max(0, score), flags };
};

export default analyzeCommitMessages;
