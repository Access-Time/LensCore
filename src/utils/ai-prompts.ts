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
}

export class AIPromptEngine {
  private static readonly SYSTEM_PROMPT = `You are an accessibility expert and developer. Your task is to analyze accessibility issues and provide clear explanations and actionable remediation steps.

IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "rule_id": "rule-identifier",
  "plain_explanation": "Clear explanation in plain language",
  "remediation": "Specific actionable steps with code examples"
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

    const userPrompt = `Analyze this accessibility issue and provide a JSON response:

Rule ID: ${issue.id}
Description: ${issue.description}
Impact: ${issue.impact}
Help: ${issue.help}
Help URL: ${issue.helpUrl}

${context}

Provide explanation in plain language and specific remediation steps tailored to the tech stack.`;

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

      // Validate required fields
      if (!parsed.rule_id || !parsed.plain_explanation || !parsed.remediation) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        rule_id: parsed.rule_id || ruleId,
        plain_explanation: parsed.plain_explanation.trim(),
        remediation: parsed.remediation.trim(),
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
