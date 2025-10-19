import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger';

export interface UserStory {
  ruleId: string;
  stories: string[];
}

export class UserStoryService {
  private static instance: UserStoryService | null = null;
  private userStories: Map<string, string[]> = new Map();
  private loaded = false;

  static getInstance(): UserStoryService {
    if (!UserStoryService.instance) {
      UserStoryService.instance = new UserStoryService();
    }
    return UserStoryService.instance;
  }

  private async loadUserStories(): Promise<void> {
    if (this.loaded) return;

    try {
      const dataPath = path.join(__dirname, '..', 'data', 'user-stories.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const stories: Record<string, string[]> = JSON.parse(data);

      // Convert to Map for faster lookup
      for (const [ruleId, storyList] of Object.entries(stories)) {
        this.userStories.set(ruleId, storyList);
      }

      this.loaded = true;
      logger.info('User stories loaded successfully', {
        count: this.userStories.size,
      });
    } catch (error) {
      logger.error('Failed to load user stories', { error });
      this.loaded = true; // Prevent retry loops
    }
  }

  async getUserStories(ruleId: string): Promise<string[]> {
    await this.loadUserStories();
    return this.userStories.get(ruleId) || [];
  }

  async getUserStory(ruleId: string): Promise<string | null> {
    const stories = await this.getUserStories(ruleId);
    return stories[0] || null;
  }

  async getAllUserStories(): Promise<UserStory[]> {
    await this.loadUserStories();
    return Array.from(this.userStories.entries()).map(([ruleId, stories]) => ({
      ruleId,
      stories,
    }));
  }

  async hasUserStories(ruleId: string): Promise<boolean> {
    const stories = await this.getUserStories(ruleId);
    return stories.length > 0;
  }
}
