import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger';

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

  getRuleData(ruleId: string) {
    return this.rulesData[ruleId];
  }
}
