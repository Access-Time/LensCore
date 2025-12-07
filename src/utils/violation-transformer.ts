import { AccessibilityIssue, AIProcessedIssue } from '../types/ai';
import { UserStoryService } from '../services/user-stories';

interface RuleData {
  title: string;
  summary: string;
  description: string;
  severity: string;
  type: string;
  wcag: Array<{ level: string; name: string; link: string }>;
  act_rules?: Array<{ name: string; link: string }>;
  supporting_links?: Array<{ name: string; link: string }>;
}

function isRuleData(data: unknown): data is RuleData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj['title'] === 'string' &&
    typeof obj['summary'] === 'string' &&
    typeof obj['description'] === 'string' &&
    typeof obj['severity'] === 'string' &&
    typeof obj['type'] === 'string' &&
    Array.isArray(obj['wcag'])
  );
}

export class ViolationTransformer {
  private static userStoryService = UserStoryService.getInstance();

  static async transform(issue: AccessibilityIssue): Promise<AIProcessedIssue> {
    const rawRuleData = await this.userStoryService.getRuleData(issue.id);
    const ruleData = isRuleData(rawRuleData) ? rawRuleData : undefined;

    const transformed: AIProcessedIssue = {
      id: issue.id,
      impact: issue.impact,
      description: issue.description,
      help: issue.help,
      nodes: issue.nodes,
    };

    if (ruleData) {
      transformed.title = ruleData.title;
      transformed.summary = ruleData.summary;
      transformed.explanation = ruleData.description;
      transformed.wcag = ruleData.wcag;
      if (ruleData.act_rules && ruleData.act_rules.length > 0) {
        transformed.act_rules = ruleData.act_rules;
      }
      if (ruleData.supporting_links && ruleData.supporting_links.length > 0) {
        transformed.supporting_links = ruleData.supporting_links;
      }
    }

    return transformed;
  }

  static async transformMany(
    issues: AccessibilityIssue[]
  ): Promise<AIProcessedIssue[]> {
    return Promise.all(issues.map((issue) => this.transform(issue)));
  }
}
