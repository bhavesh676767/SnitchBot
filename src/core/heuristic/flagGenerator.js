/**
 * Flag Generator for Live Display
 * Produces clean, audience-ready flag output
 */

export const generateFlags = (allFlags) => {
  return allFlags.map(flag => ({
    title: flag.title,
    severity: flag.severity, // 'critical' | 'high' | 'medium' | 'low'
    reason: flag.reason,
    impact: flag.impact,
    hackathon_context: flag.hackathon_context,
    evidence: flag.evidence,
    icon: getSeverityIcon(flag.severity),
    color: getSeverityColor(flag.severity),
    displayText: formatFlagForDisplay(flag)
  }));
};

/**
 * Get icon for severity level (emoji for display)
 */
const getSeverityIcon = (severity) => {
  switch(severity) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '⚡';
    case 'low': return 'ℹ️';
    default: return '•';
  }
};

/**
 * Get color coding for UI display
 */
const getSeverityColor = (severity) => {
  switch(severity) {
    case 'critical': return '#ef4444'; // Red
    case 'high': return '#f97316';     // Orange
    case 'medium': return '#eab308';   // Yellow
    case 'low': return '#6b7280';      // Gray
    default: return '#808080';
  }
};

/**
 * Format flag for readable display
 */
const formatFlagForDisplay = (flag) => {
  return {
    main: `${flag.title}`,
    detail: flag.reason,
    context: flag.hackathon_context ? `(${flag.hackathon_context})` : undefined
  };
};

/**
 * Create compact flag view for streaming/live display
 */
export const createCompactFlagView = (flag) => {
  return {
    title: flag.title.substring(0, 50),
    severity: flag.severity,
    impact: flag.impact,
    icon: getSeverityIcon(flag.severity)
  };
};

/**
 * Create detailed flag card for modal/expanded view
 */
export const createDetailedFlagCard = (flag) => {
  return {
    title: flag.title,
    severity: flag.severity,
    icon: getSeverityIcon(flag.severity),
    color: getSeverityColor(flag.severity),
    reason: flag.reason,
    context: flag.hackathon_context,
    evidence: flag.evidence,
    impact: flag.impact,
    timestamp: new Date().toISOString()
  };
};

/**
 * Group flags by severity for dashboard display
 */
export const groupFlagsBySeverity = (allFlags) => {
  return {
    critical: allFlags.filter(f => f.severity === 'critical'),
    high: allFlags.filter(f => f.severity === 'high'),
    medium: allFlags.filter(f => f.severity === 'medium'),
    low: allFlags.filter(f => f.severity === 'low')
  };
};

/**
 * Create summary badge for live display
 */
export const createSummaryBadge = (allFlags) => {
  const grouped = groupFlagsBySeverity(allFlags);
  
  return {
    critical_count: grouped.critical.length,
    high_count: grouped.high.length,
    medium_count: grouped.medium.length,
    low_count: grouped.low.length,
    total_flags: allFlags.length,
    display_text: formatBadgeText(grouped),
    severity_level: determineSeverityLevel(grouped)
  };
};

/**
 * Determine overall severity level
 */
const determineSeverityLevel = (grouped) => {
  if (grouped.critical.length > 0) return 'CRITICAL';
  if (grouped.high.length > 0) return 'HIGH';
  if (grouped.medium.length > 0) return 'MEDIUM';
  if (grouped.low.length > 0) return 'LOW';
  return 'NONE';
};

/**
 * Format badge text for display
 */
const formatBadgeText = (grouped) => {
  const parts = [];
  
  if (grouped.critical.length > 0) {
    parts.push(`🚨 ${grouped.critical.length} Critical`);
  }
  if (grouped.high.length > 0) {
    parts.push(`⚠️ ${grouped.high.length} High`);
  }
  if (grouped.medium.length > 0) {
    parts.push(`⚡ ${grouped.medium.length} Medium`);
  }
  
  if (parts.length === 0) {
    return 'No flags';
  }
  
  return parts.join(' | ');
};

/**
 * Create timeline view of flags
 */
export const createFlagTimeline = (allFlags) => {
  return allFlags
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999);
    })
    .map((flag, index) => ({
      order: index + 1,
      title: flag.title,
      severity: flag.severity,
      icon: getSeverityIcon(flag.severity),
      reason: flag.reason
    }));
};

export default {
  generateFlags,
  createCompactFlagView,
  createDetailedFlagCard,
  groupFlagsBySeverity,
  createSummaryBadge,
  createFlagTimeline
};