import type { Page } from 'playwright';

export async function scrollPageToWaitForAnimations(
  page: Page
): Promise<void> {
  try {
    await page.evaluate(async () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      if (scrollHeight > viewportHeight) {
        const scrollSteps = Math.max(
          3,
          Math.ceil(scrollHeight / viewportHeight)
        );
        const stepDelay = 300;
        const finalDelay = 500;

        for (let i = 0; i <= scrollSteps; i++) {
          const progress = i / scrollSteps;
          const targetScroll = Math.floor(scrollHeight * progress);
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
          await new Promise((resolve) => setTimeout(resolve, stepDelay));
        }

        window.scrollTo({
          top: scrollHeight,
          behavior: 'smooth',
        });
        await new Promise((resolve) => setTimeout(resolve, finalDelay));

        for (let i = scrollSteps; i >= 0; i--) {
          const progress = i / scrollSteps;
          const targetScroll = Math.floor(scrollHeight * progress);
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
          await new Promise((resolve) => setTimeout(resolve, stepDelay));
        }

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        await new Promise((resolve) => setTimeout(resolve, finalDelay));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    });
  } catch {
    // Silently handle scroll errors
  }
}

