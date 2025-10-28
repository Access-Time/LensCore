import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { createOpenAIService, isAIEnabled } from '../utils/openai';
import { OpenAIMessage } from './openai';
import { AccessibilityIssue } from '../types/ai';
import { z } from 'zod';

interface RulesData {
  [ruleId: string]: {
    title: string;
    summary: string;
    description: string;
    severity: string;
    type: string;
    user_stories: string[];
    wcag: Array<{ level: string; name: string; link: string }>;
    act_rules?: Array<{ name: string; link: string }>;
    supporting_links?: Array<{ name: string; link: string }>;
  };
}

export interface UserStory {
  ruleId: string;
  stories: string[];
}

export class UserStoryService {
  private static instance: UserStoryService | null = null;
  private userStories: Map<string, string[]> = new Map();
  private rulesData: RulesData = {};
  private loaded = false;

  static getInstance(): UserStoryService {
    if (!UserStoryService.instance) {
      UserStoryService.instance = new UserStoryService();
    }
    return UserStoryService.instance;
  }

  private async loadRulesData(): Promise<void> {
    if (this.loaded) return;

    try {
      const dataPath =
        process.env['NODE_ENV'] === 'production'
          ? path.join(__dirname, '..', '..', 'src', 'data', 'rulesData.json')
          : path.join(__dirname, '..', 'data', 'rulesData.json');
      const data = await fs.readFile(dataPath, 'utf8');
      this.rulesData = JSON.parse(data);

      for (const [ruleId, ruleData] of Object.entries(this.rulesData)) {
        if (ruleData.user_stories && ruleData.user_stories.length > 0) {
          this.userStories.set(ruleId, ruleData.user_stories);
        }
      }

      this.loaded = true;
      logger.info('Rules data loaded successfully', {
        rulesCount: Object.keys(this.rulesData).length,
        storiesCount: this.userStories.size,
      });
    } catch (error) {
      logger.error('Failed to load rules data', { error });
      this.loaded = true;
    }
  }

  async getUserStories(ruleId: string): Promise<string[]> {
    await this.loadRulesData();
    return this.userStories.get(ruleId) || [];
  }

  async getUserStory(ruleId: string): Promise<string | null> {
    await this.loadRulesData();
    const stories = this.userStories.get(ruleId);
    if (!stories || stories.length === 0) return null;
    const dayNumber = new Date().getDate();
    const selectedStory = stories[dayNumber % stories.length] || stories[0];
    return selectedStory || null;
  }

  async getAllUserStories(): Promise<UserStory[]> {
    await this.loadRulesData();
    return Array.from(this.userStories.entries()).map(([ruleId, stories]) => ({
      ruleId,
      stories,
    }));
  }

  async hasUserStories(ruleId: string): Promise<boolean> {
    const stories = await this.getUserStories(ruleId);
    return stories.length > 0;
  }

  private getRuleData(ruleId: string) {
    return this.rulesData[ruleId];
  }

  async generateUserStoryWithAI(
    issue: AccessibilityIssue,
    apiKey?: string,
    projectContext?: {
      framework?: string;
      cssFramework?: string;
      language?: string;
      buildTool?: string;
      additionalContext?: string;
    }
  ): Promise<string | null> {
    if (!isAIEnabled(apiKey)) {
      return this.getUserStory(issue.id);
    }

    try {
      const ruleData = this.getRuleData(issue.id);
      if (!ruleData) {
        return this.getUserStory(issue.id);
      }

      const openaiService = createOpenAIService(apiKey || '');
      if (!openaiService) {
        return this.getUserStory(issue.id);
      }

      const format = z.object({
        userStory: z.string(),
      });

      const prompt = this.buildUserStoryPrompt(issue, ruleData, projectContext);
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a friendly accessibility expert. Create a user story from the perspective of a user affected by this particular accessibility issue. Use simple language and make it relatable. Focus on how this issue impacts real users in their daily activities.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await openaiService.generateResponse(messages);
      const parsed = format.parse(JSON.parse(response.content));

      return parsed.userStory;
    } catch (error) {
      logger.warn('Failed to generate user story with AI', {
        issueId: issue.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.getUserStory(issue.id);
    }
  }

  private buildUserStoryPrompt(
    issue: AccessibilityIssue,
    ruleData: RulesData[string],
    projectContext?: {
      framework?: string;
      cssFramework?: string;
      language?: string;
      buildTool?: string;
      additionalContext?: string;
    }
  ): string {
    const htmlContexts =
      issue.nodes
        ?.map(
          (node, idx) =>
            `HTML Example ${idx + 1}:\nSelector: ${node.target.join(' ')}\nCode: ${node.html}\n${node.failureSummary ? `Issue: ${node.failureSummary}` : ''}`
        )
        .join('\n\n') || '';

    const context = projectContext
      ? Object.entries(projectContext)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '';

    return `Create a user story for this accessibility violation:

Rule: ${ruleData.title}
Summary: ${ruleData.summary}
Description: ${ruleData.description}
Severity: ${ruleData.severity}
Type: ${ruleData.type}

Related WCAG Guidelines: ${ruleData.wcag.map((g) => `(${g.level}) ${g.name}`).join(', ')}

Violation Details:
ID: ${issue.id}
Impact: ${issue.impact}
Help: ${issue.help}

${context ? `Project Context: ${context}\n` : ''}
${htmlContexts ? `Problematic Code:\n${htmlContexts}\n` : ''}

${ruleData.user_stories.length > 0 ? `Example user stories from this rule:\n${ruleData.user_stories.slice(0, 3).join('\n\n')}` : ''}

Create a specific, relatable user story (1-2 sentences) from the perspective of someone affected by THIS PARTICULAR violation on the page. Make it personal and show how this specific issue impacts their ability to use the website.`;
  }
}
