import {
  CustomPlaywrightTest,
  PlaywrightTestContext,
  CustomTestResult,
} from '../../../types/custom-rules';

interface FormLabelData {
  inputId: string;
  inputName: string;
  inputType: string;
  hasLabel: boolean;
  labelText: string;
}

interface FormLabelViolationNode {
  target: string[];
  html: string;
  failureSummary: string;
}

const formLabelAssociationRule: CustomPlaywrightTest = {
  id: 'form-label-association',
  name: 'Form Label Association',
  description: 'Ensures all form inputs have associated labels',
  enabled: true,
  severity: 'serious',
  run: async (context: PlaywrightTestContext): Promise<CustomTestResult> => {
    const { page } = context;

    const formInputs: FormLabelData[] = await page.$$eval(
      'input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select',
      (elements: HTMLElement[]): FormLabelData[] => {
        return elements.map((element) => {
          const input = element as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement;
          const inputId = input.id || '';
          const inputName = input.name || '';

          let hasLabel = false;
          let labelText = '';

          if (inputId) {
            const label = document.querySelector(
              `label[for="${inputId}"]`
            ) as HTMLLabelElement | null;
            if (label) {
              hasLabel = true;
              labelText = label.textContent || '';
            }
          }

          if (!hasLabel && inputName) {
            const label = document.querySelector(
              `label[for="${inputName}"]`
            ) as HTMLLabelElement | null;
            if (label) {
              hasLabel = true;
              labelText = label.textContent || '';
            }
          }

          const inputType = input.getAttribute('type') || 'text';

          return {
            inputId,
            inputName,
            inputType,
            hasLabel,
            labelText,
          };
        });
      }
    );

    const inputsWithoutLabel: FormLabelData[] = formInputs.filter(
      (input): boolean =>
        !input.hasLabel && !!(input.inputId || input.inputName)
    );

    const violationNodes: FormLabelViolationNode[] = inputsWithoutLabel.map(
      (input) => ({
        target: [
          input.inputId
            ? `input[id="${input.inputId}"]`
            : `input[name="${input.inputName}"]`,
        ],
        html: `<input type="${input.inputType}" ${input.inputId ? `id="${input.inputId}"` : ''} ${input.inputName ? `name="${input.inputName}"` : ''} />`,
        failureSummary: 'Form input does not have an associated label element',
      })
    );

    const result: CustomTestResult = {
      id: 'form-label-association',
      name: 'Form Label Association',
      passed: inputsWithoutLabel.length === 0,
      severity: 'serious',
      description:
        inputsWithoutLabel.length === 0
          ? 'All form inputs have associated labels'
          : `Found ${inputsWithoutLabel.length} form input${inputsWithoutLabel.length > 1 ? 's' : ''} without associated labels`,
      nodes: violationNodes.length > 0 ? violationNodes : undefined,
    };

    return result;
  },
};

export default formLabelAssociationRule;
