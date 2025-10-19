export const AI_PROMPTS = {
  EXPLANATION_SYSTEM: `You are an accessibility expert. Explain accessibility issues in plain language that developers can understand. Focus on why the issue matters and its impact on users.`,

  REMEDIATION_SYSTEM: `You are an accessibility expert and developer. Provide specific, actionable remediation steps for accessibility issues. Include code examples when appropriate.`,

  EXPLANATION_USER: (
    issue: {
      description: string;
      impact: string;
      help: string;
    },
    techStack?: string
  ) => `Explain this accessibility issue in plain language:

Issue: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}

${techStack ? `Tech Stack: ${techStack}` : ''}

Please provide a clear, concise explanation that helps developers understand why this issue is important and how it affects users.`,

  REMEDIATION_USER: (
    issue: {
      description: string;
      impact: string;
      help: string;
      helpUrl: string;
    },
    techStack?: string
  ) => `Provide remediation steps for this accessibility issue:

Issue: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}
Help URL: ${issue.helpUrl}

${techStack ? `Tech Stack: ${techStack}` : ''}

Please provide specific, actionable steps to fix this issue. Include code examples if relevant for the tech stack.`,
} as const;
