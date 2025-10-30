import { ProjectContext, AIResponse } from './ai-prompts';

/**
 * Helper functions for AI integration
 * Makes it easier for developers to use AI features
 */

export class AIHelpers {
  /**
   * Create project context from tech stack string (for backward compatibility)
   * @param techStack - String like "React, TypeScript, Tailwind CSS"
   * @returns Structured project context
   */
  static createProjectContextFromString(techStack: string): ProjectContext {
    const context: ProjectContext = {};
    const stack = techStack.toLowerCase();

    // Framework detection
    if (stack.includes('react')) context.framework = 'React';
    else if (stack.includes('vue')) context.framework = 'Vue.js';
    else if (stack.includes('angular')) context.framework = 'Angular';
    else if (stack.includes('svelte')) context.framework = 'Svelte';
    else if (stack.includes('next')) context.framework = 'Next.js';
    else if (stack.includes('nuxt')) context.framework = 'Nuxt.js';
    else if (stack.includes('remix')) context.framework = 'Remix';

    // CSS Framework detection
    if (stack.includes('tailwind')) context.cssFramework = 'Tailwind CSS';
    else if (stack.includes('bootstrap')) context.cssFramework = 'Bootstrap';
    else if (stack.includes('material')) context.cssFramework = 'Material UI';
    else if (stack.includes('chakra')) context.cssFramework = 'Chakra UI';
    else if (stack.includes('styled'))
      context.cssFramework = 'Styled Components';
    else if (stack.includes('emotion')) context.cssFramework = 'Emotion';
    else if (stack.includes('css modules'))
      context.cssFramework = 'CSS Modules';

    // Language detection
    if (stack.includes('typescript')) context.language = 'TypeScript';
    else if (stack.includes('javascript')) context.language = 'JavaScript';

    // Build tool detection
    if (stack.includes('webpack')) context.buildTool = 'Webpack';
    else if (stack.includes('vite')) context.buildTool = 'Vite';
    else if (stack.includes('rollup')) context.buildTool = 'Rollup';
    else if (stack.includes('parcel')) context.buildTool = 'Parcel';

    // If no specific patterns matched, use as additional context
    if (
      !context.framework &&
      !context.cssFramework &&
      !context.language &&
      !context.buildTool
    ) {
      context.additionalContext = techStack;
    }

    return context;
  }

  /**
   * Create project context from individual components
   * @param options - Individual tech stack components
   * @returns Structured project context
   */
  static createProjectContextFromComponents(options: {
    framework?: string;
    cssFramework?: string;
    language?: string;
    buildTool?: string;
    additionalContext?: string;
  }): ProjectContext {
    return {
      framework: options.framework,
      cssFramework: options.cssFramework,
      language: options.language,
      buildTool: options.buildTool,
      additionalContext: options.additionalContext,
    };
  }

  /**
   * Get common tech stack presets
   * @param preset - Preset name
   * @returns Project context for the preset
   */
  static getTechStackPreset(
    preset:
      | 'react-tailwind'
      | 'vue-bootstrap'
      | 'angular-material'
      | 'next-typescript'
  ): ProjectContext {
    const presets = {
      'react-tailwind': {
        framework: 'React',
        cssFramework: 'Tailwind CSS',
        language: 'TypeScript',
      },
      'vue-bootstrap': {
        framework: 'Vue.js',
        cssFramework: 'Bootstrap',
        language: 'JavaScript',
      },
      'angular-material': {
        framework: 'Angular',
        cssFramework: 'Material UI',
        language: 'TypeScript',
      },
      'next-typescript': {
        framework: 'Next.js',
        cssFramework: 'Tailwind CSS',
        language: 'TypeScript',
        buildTool: 'Webpack',
      },
    };

    return presets[preset];
  }

  /**
   * Validate AI response structure
   * @param response - AI response object
   * @returns True if response is valid
   */
  static isValidAIResponse(response: unknown): response is AIResponse {
    const obj = response as Record<string, unknown>;
    return (
      response !== null &&
      typeof response === 'object' &&
      'rule_id' in response &&
      'plain_explanation' in response &&
      'remediation' in response &&
      typeof obj['rule_id'] === 'string' &&
      typeof obj['plain_explanation'] === 'string' &&
      typeof obj['remediation'] === 'string' &&
      (obj['rule_id'] as string).trim() !== '' &&
      (obj['plain_explanation'] as string).trim() !== '' &&
      (obj['remediation'] as string).trim() !== ''
    );
  }

  /**
   * Format tech stack for display
   * @param context - Project context
   * @returns Formatted string
   */
  static formatTechStack(context: ProjectContext): string {
    const parts: string[] = [];

    if (context.framework) parts.push(context.framework);
    if (context.cssFramework) parts.push(context.cssFramework);
    if (context.language) parts.push(context.language);
    if (context.buildTool) parts.push(context.buildTool);
    if (context.additionalContext) parts.push(context.additionalContext);

    return parts.join(', ');
  }
}

/**
 * Common tech stack patterns for easy use
 */
export const TECH_STACK_PATTERNS = {
  // React patterns
  REACT_TAILWIND: 'React, TypeScript, Tailwind CSS',
  REACT_BOOTSTRAP: 'React, JavaScript, Bootstrap',
  REACT_MATERIAL: 'React, TypeScript, Material UI',

  // Vue patterns
  VUE_BOOTSTRAP: 'Vue.js, JavaScript, Bootstrap',
  VUE_TAILWIND: 'Vue.js, TypeScript, Tailwind CSS',

  // Angular patterns
  ANGULAR_MATERIAL: 'Angular, TypeScript, Material UI',
  ANGULAR_BOOTSTRAP: 'Angular, TypeScript, Bootstrap',

  // Next.js patterns
  NEXT_TAILWIND: 'Next.js, TypeScript, Tailwind CSS',
  NEXT_BOOTSTRAP: 'Next.js, JavaScript, Bootstrap',

  // Svelte patterns
  SVELTE_TAILWIND: 'Svelte, TypeScript, Tailwind CSS',
} as const;

/**
 * Type for tech stack patterns
 */
export type TechStackPattern = keyof typeof TECH_STACK_PATTERNS;
