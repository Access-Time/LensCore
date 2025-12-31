import type { CustomRuleResult } from '../types/custom-rules';

export interface CustomRuleReportRenderer {
  renderReportSection(result: CustomRuleResult): string;
  getCustomStyles?(): string;
}

const rendererRegistry = new Map<string, CustomRuleReportRenderer>();
const stylesRegistry = new Map<string, string>();

export function registerCustomRuleRenderer(
  ruleId: string,
  renderer: CustomRuleReportRenderer
): void {
  rendererRegistry.set(ruleId, renderer);
  if (renderer.getCustomStyles) {
    stylesRegistry.set(ruleId, renderer.getCustomStyles());
  }
}

export function getCustomRuleRenderer(
  ruleId: string
): CustomRuleReportRenderer | undefined {
  return rendererRegistry.get(ruleId);
}

export function hasCustomRenderer(ruleId: string): boolean {
  return rendererRegistry.has(ruleId);
}

export function getAllCustomStyles(): string {
  return Array.from(stylesRegistry.values()).join('\n\n');
}
