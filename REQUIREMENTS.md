# 📌 **🔥 Prompt Lengkap untuk AI Agent: “LensCore Responsive AI Test Design & Implementation”**

**You are an expert system architect + Playwright engineer + accessibility testing specialist working on LensCore.
Your task is to design and implement a new responsive test feature powered by AI.**

---

## **🎯 Context**

LensCore is an accessibility + quality-testing tool that supports:

- axe-core rules
- Playwright-based custom test rules
- HTML/JSON reporting
- `--custom-tests` or `--extra-tests` flags to trigger specific tests

A new major feature will be added:
**Responsive Layout Testing using AI.**

This feature will:

- take screenshots at Desktop / Tablet / Mobile sizes
- send screenshots + a prompt to an AI model
- detect horizontal scroll issues, overflow, layout breaking, element clipping
- return structured results compatible with LensCore reporting

Users must provide:

```
AI_API_KEY=xxxxx // Bisa disesuaikan dengan config yang telah ada
```

If the API key is missing, the responsive test should automatically fail.

This test will be included under:

```
--custom-tests=responsive
```

---

## **🧩 Your goals**

You must design the full architecture and deliverables for this feature, including:

---

## **1. AI Prompt Engineering**

Create:

- an optimized, deterministic prompt for evaluating responsiveness
- prompt variants for Desktop, Tablet, Mobile (if needed)
- instructions for how screenshots should be described to the model
- format of expected AI output
- mitigation for LLM hallucinations
- versioning strategy for prompt evolution

---

## **2. Playwright Implementation Plan**

Design:

- the code that captures screenshots for the 3 viewport sizes
- error-handling for pages that block screenshotting
- timeout/retry logic
- concurrency strategy
- expected Playwright test directory layout under the “custom test rules” system

---

## **3. AI Evaluation Pipeline**

Explain:

- how screenshots are encoded (base64 / file path / buffer)
- how they are sent to the LLM
- recommended API structures
- how to validate the LLM response
- fallback behavior if AI call fails
- cost mitigation strategies

---

## **4. rules.json Format**

Define a sample rules.json entry for the responsive test, including:

- rule_id
- title
- severity
- description
- reference links
- expected output fields
- sample failure messages

---

## **5. Output Format (Critical)**

Design the exact JSON output produced by the responsive test, including:

- pass/fail
- detected issues
- issue type (overflow, clipped element, horizontal scroll…)
- screenshot references
- rule metadata
- remediation suggestions (optional)

This output **must be compatible with existing LensCore JSON/HTML reporting.**

---

## **6. CLI Integration**

Describe how LensCore should detect and run this test via:

```
--custom-tests=responsive
```

and how it should behave when:

- AI_API_KEY is missing
- user has invalid key
- user disables this test

---

## **7. Repository Integration**

Define:

- directory structure for this new test
- naming conventions
- how this test can become part of “approved rules” in LensCore
- version-aware compatibility strategy

---

## **8. Deliver Complete Example**

Provide:

- full example JSON result (pass & fail)
- example HTML report section
- example code snippets (pseudocode or TypeScript)
- example rules.json entry

---

## **9. Step-by-step Implementation Roadmap**

Give a development breakdown:

1. R&D: prompt testing with good vs broken websites
2. AI determinism evaluation
3. Build the Playwright script
4. Build AI pipeline
5. Build rule integration
6. Build output mapper
7. Add documentation
8. Add automated tests
9. Merge strategy

---

## **10. Recommendations**

Give expert recommendations for:

- choosing LLM models
- cost control
- ensuring consistency in CI
- preventing flaky tests
- future expansion of AI-powered LensCore tests

---

## **Final Output Expected From You**

The final answer must include:

- Architecture
- Prompts
- Rules
- API schema
- Example outputs
- Code structure
- Implementation plan

**Write the entire solution clearly, deeply detailed, and ready for development.**

---
