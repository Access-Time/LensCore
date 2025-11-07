import { OpenAIMessage } from '../services/openai';
import { AccessibilityIssue } from '../types/ai';

export interface ProjectContext {
  framework?: string;
  cssFramework?: string;
  language?: string;
  buildTool?: string;
  additionalContext?: string;
}

export interface AIResponse {
  rule_id: string;
  plain_explanation: string;
  remediation: string;
  user_story?: string;
}

export class AIPromptEngine {
  private static readonly SYSTEM_PROMPT = `You are an accessibility expert and developer. Your task is to analyze accessibility issues and provide clear explanations and actionable remediation steps.

CRITICAL RULES:
1. For code examples in remediation, use markdown code blocks format: \`\`\`html\n<code here>\n\`\`\`
2. Always escape special characters in HTML attributes (use &lt; for <, &gt; for >, &quot; for ")
3. Provide specific, actionable remediation steps with clear before/after examples
4. Be concise but thorough

IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "rule_id": "rule-identifier",
  "plain_explanation": "Clear explanation in plain language",
  "remediation": "Specific actionable steps with markdown code examples",
  "user_story": "A relatable user story from the perspective of someone affected by this issue"
}

Do not include any other text, explanations, or formatting outside the JSON.`;

  private static readonly FALLBACK_RESPONSES = {
    explanation:
      'This accessibility issue needs to be addressed to ensure proper user experience.',
    remediation: 'Please refer to the help URL for detailed remediation steps.',
  };

  static generatePrompt(
    issue: AccessibilityIssue,
    projectContext?: ProjectContext
  ): OpenAIMessage[] {
    const context = this.buildProjectContext(projectContext);

    const htmlContexts =
      issue.nodes
        ?.map(
          (node, idx) =>
            `HTML Example ${idx + 1}:\nSelector: ${node.target.join(' ')}\nCode: ${node.html}\n${node.failureSummary ? `Issue: ${node.failureSummary}` : ''}`
        )
        .join('\n\n') || '';

    const userPrompt = `Analyze this accessibility issue and provide a detailed JSON response:

Rule ID: ${issue.id}
Description: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}
Help URL: ${issue.helpUrl}

${htmlContexts ? `CURRENT PROBLEMATIC CODE:\n${htmlContexts}\n` : ''}

${context}

CRITICAL REQUIREMENTS FOR REMEDIATION:
1. Analyze the problematic code above
2. Provide BEFORE and AFTER examples
3. Show complete code snippets with proper HTML structure
4. Use markdown code blocks format: \`\`\`html\n<code>\n\`\`\`
5. Make solutions specific to the actual code shown
6. Ensure code is production-ready and complete

FORMAT YOUR RESPONSE:
- **Explanation**: Brief explanation of why this matters
- **Before Code**: Show the problematic code as-is (from nodes above)
- **After Code**: Show the fixed, accessible version
- **Key Changes**: List what was changed and why

Provide explanation in plain language and specific remediation steps with complete code examples.`;

    return [
      {
        role: 'system',
        content: this.SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];
  }

  private static buildProjectContext(projectContext?: ProjectContext): string {
    if (!projectContext) return '';

    const parts: string[] = [];

    if (projectContext.framework) {
      parts.push(`Framework: ${projectContext.framework}`);
    }

    if (projectContext.cssFramework) {
      parts.push(`CSS Framework: ${projectContext.cssFramework}`);
    }

    if (projectContext.language) {
      parts.push(`Language: ${projectContext.language}`);
    }

    if (projectContext.buildTool) {
      parts.push(`Build Tool: ${projectContext.buildTool}`);
    }

    if (projectContext.additionalContext) {
      parts.push(`Additional Context: ${projectContext.additionalContext}`);
    }

    return parts.length > 0 ? `Tech Stack Context:\n${parts.join('\n')}\n` : '';
  }

  static parseResponse(response: string, ruleId: string): AIResponse {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanResponse = response.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '');

      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);

      if (!parsed.rule_id || !parsed.plain_explanation || !parsed.remediation) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        rule_id: parsed.rule_id || ruleId,
        plain_explanation: parsed.plain_explanation.trim(),
        remediation: parsed.remediation.trim(),
        user_story: parsed.user_story?.trim(),
      };
    } catch {
      // Fallback to default response
      return {
        rule_id: ruleId,
        plain_explanation: this.FALLBACK_RESPONSES.explanation,
        remediation: this.FALLBACK_RESPONSES.remediation,
      };
    }
  }

  static createFallbackResponse(issue: AccessibilityIssue): AIResponse {
    return {
      rule_id: issue.id,
      plain_explanation: this.FALLBACK_RESPONSES.explanation,
      remediation: this.FALLBACK_RESPONSES.remediation,
      user_story: undefined,
    };
  }
}

// Legacy support - keep old interface for backward compatibility
export const AI_PROMPTS = {
  EXPLANATION_SYSTEM: `You are an accessibility expert and developer. Your task is to analyze accessibility issues and provide clear explanations and actionable remediation steps.`,
  REMEDIATION_SYSTEM: `You are an accessibility expert and developer. Your task is to analyze accessibility issues and provide clear explanations and actionable remediation steps.`,

  EXPLANATION_USER: (
    issue: {
      description: string;
      impact: string;
      help: string;
    },
    techStack?: string
  ) => {
    const projectContext: ProjectContext = techStack
      ? { additionalContext: techStack }
      : {};
    const prompt = AIPromptEngine.generatePrompt(
      issue as AccessibilityIssue,
      projectContext
    );
    return prompt[1]?.content || '';
  },

  REMEDIATION_USER: (
    issue: {
      description: string;
      impact: string;
      help: string;
      helpUrl: string;
    },
    techStack?: string
  ) => {
    const projectContext: ProjectContext = techStack
      ? { additionalContext: techStack }
      : {};
    const prompt = AIPromptEngine.generatePrompt(
      issue as AccessibilityIssue,
      projectContext
    );
    return prompt[1]?.content || '';
  },
} as const;
