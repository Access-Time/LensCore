import { ViolationTransformer } from '../../src/utils/violation-transformer';
import { AccessibilityIssue, AIProcessedIssue } from '../../src/types/ai';
import { UserStoryService } from '../../src/services/user-stories';

jest.mock('../../src/services/user-stories', () => {
  const mockGetRuleData = jest.fn();
  return {
    UserStoryService: {
      getInstance: jest.fn(() => ({
        getRuleData: mockGetRuleData,
        loadRulesData: jest.fn(),
      })),
    },
  };
});

describe('ViolationTransformer', () => {
  let mockGetRuleData: jest.Mock;

  beforeEach(() => {
    const mockService = UserStoryService.getInstance();
    mockGetRuleData = mockService.getRuleData as jest.Mock;
    mockGetRuleData.mockClear();
  });

  const mockIssue: AccessibilityIssue = {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Ensure all text elements have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
    nodes: [
      {
        target: ['h1'],
        html: '<h1>Low contrast text</h1>',
        failureSummary:
          'Fix any of the following: Element has insufficient color contrast',
      },
    ],
  };

  describe('transform', () => {
    it('should remove helpUrl from transformed violation', async () => {
      mockGetRuleData.mockResolvedValue(undefined);

      const result = await ViolationTransformer.transform(mockIssue);

      expect(result).not.toHaveProperty('helpUrl');
      expect(result.id).toBe(mockIssue.id);
      expect(result.impact).toBe(mockIssue.impact);
      expect(result.description).toBe(mockIssue.description);
      expect(result.help).toBe(mockIssue.help);
      expect(result.nodes).toEqual(mockIssue.nodes);
    });

    it('should add data from rulesData when available', async () => {
      const mockRuleData = {
        title: 'Color Contrast Issue',
        summary: 'Text does not meet contrast requirements',
        description: 'Detailed description of color contrast issue',
        severity: 'serious',
        type: 'failure',
        wcag: [
          {
            level: 'AA',
            name: '1.4.3 Contrast (Minimum)',
            link: 'https://www.w3.org/TR/WCAG22/#contrast-minimum',
          },
        ],
        act_rules: [
          {
            name: 'ACT Rule',
            link: 'https://act-rules.github.io/rules/abc123',
          },
        ],
        supporting_links: [
          {
            name: 'MDN Documentation',
            link: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
          },
        ],
      };

      mockGetRuleData.mockResolvedValue(mockRuleData);

      const result = await ViolationTransformer.transform(mockIssue);

      expect(result.title).toBe(mockRuleData.title);
      expect(result.summary).toBe(mockRuleData.summary);
      expect(result.explanation).toBe(mockRuleData.description);
      expect(result.wcag).toEqual(mockRuleData.wcag);
      expect(result.act_rules).toEqual(mockRuleData.act_rules);
      expect(result.supporting_links).toEqual(mockRuleData.supporting_links);
    });

    it('should handle missing optional fields in ruleData', async () => {
      const mockRuleData = {
        title: 'Color Contrast Issue',
        summary: 'Text does not meet contrast requirements',
        description: 'Detailed description',
        severity: 'serious',
        type: 'failure',
        wcag: [],
      };

      mockGetRuleData.mockResolvedValue(mockRuleData);

      const result = await ViolationTransformer.transform(mockIssue);

      expect(result.title).toBe(mockRuleData.title);
      expect(result.summary).toBe(mockRuleData.summary);
      expect(result.explanation).toBe(mockRuleData.description);
      expect(result.wcag).toEqual(mockRuleData.wcag);
      expect(result.act_rules).toBeUndefined();
      expect(result.supporting_links).toBeUndefined();
    });

    it('should preserve all original issue properties except helpUrl', async () => {
      mockGetRuleData.mockResolvedValue(undefined);

      const result = await ViolationTransformer.transform(mockIssue);

      expect(result.id).toBe(mockIssue.id);
      expect(result.impact).toBe(mockIssue.impact);
      expect(result.description).toBe(mockIssue.description);
      expect(result.help).toBe(mockIssue.help);
      expect(result.nodes).toEqual(mockIssue.nodes);
      expect(result).not.toHaveProperty('helpUrl');
    });

    it('should handle issue without helpUrl', async () => {
      const issueWithoutHelpUrl: AccessibilityIssue = {
        ...mockIssue,
        helpUrl: undefined,
      };

      mockGetRuleData.mockResolvedValue(undefined);

      const result = await ViolationTransformer.transform(issueWithoutHelpUrl);

      expect(result).not.toHaveProperty('helpUrl');
      expect(result.id).toBe(issueWithoutHelpUrl.id);
    });
  });

  describe('transformMany', () => {
    it('should transform multiple issues', async () => {
      const issues: AccessibilityIssue[] = [
        mockIssue,
        {
          ...mockIssue,
          id: 'image-alt',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
        },
      ];

      mockGetRuleData.mockResolvedValue(undefined);

      const results = await ViolationTransformer.transformMany(issues);

      expect(results).toHaveLength(2);
      expect(results[0]).not.toHaveProperty('helpUrl');
      expect(results[1]).not.toHaveProperty('helpUrl');
      expect(results[0]?.id).toBe('color-contrast');
      expect(results[1]?.id).toBe('image-alt');
    });

    it('should handle empty array', async () => {
      const results = await ViolationTransformer.transformMany([]);

      expect(results).toEqual([]);
      expect(results).toHaveLength(0);
    });

    it('should apply ruleData to each issue', async () => {
      const mockRuleData = {
        title: 'Test Rule',
        summary: 'Test Summary',
        description: 'Test Description',
        severity: 'serious',
        type: 'failure',
        wcag: [],
      };

      mockGetRuleData.mockResolvedValue(mockRuleData);

      const issues: AccessibilityIssue[] = [
        mockIssue,
        { ...mockIssue, id: 'other-rule' },
      ];
      const results = await ViolationTransformer.transformMany(issues);

      expect(results).toHaveLength(2);
      expect(results[0]?.title).toBe(mockRuleData.title);
      expect(results[1]?.title).toBe(mockRuleData.title);
      expect(mockGetRuleData).toHaveBeenCalledTimes(2);
    });
  });

  describe('type safety', () => {
    it('should return AIProcessedIssue type', async () => {
      mockGetRuleData.mockResolvedValue(undefined);

      const result = await ViolationTransformer.transform(mockIssue);

      const processedIssue: AIProcessedIssue = result;
      expect(processedIssue).toBeDefined();
      expect(processedIssue.id).toBe(mockIssue.id);
    });

    it('should handle invalid ruleData gracefully', async () => {
      mockGetRuleData.mockResolvedValue(null as unknown);

      const result = await ViolationTransformer.transform(mockIssue);

      expect(result).not.toHaveProperty('title');
      expect(result).not.toHaveProperty('summary');
      expect(result).not.toHaveProperty('helpUrl');
    });
  });
});
