export default {
  id: 'image-alt-text',
  name: 'Image Alt Text Check',
  description: 'Checks that images have appropriate alt text',
  enabled: true,
  severity: 'moderate',
  run: async (context) => {
    const { page } = context;

    const images = await page.$$eval('img', (imgs) => {
      return imgs.map((img, index) => ({
        index,
        src: img.src,
        alt: img.alt,
        hasAlt: !!img.alt,
        isDecorative:
          img.getAttribute('role') === 'presentation' ||
          img.getAttribute('aria-hidden') === 'true',
      }));
    });

    const violations = images
      .filter((img) => !img.hasAlt && !img.isDecorative)
      .map((img) => ({
        id: 'image-alt-text',
        name: 'Image Alt Text Check',
        passed: false,
        severity: 'moderate',
        description: `Image at ${img.src} is missing alt text`,
        nodes: [
          {
            target: [`img:nth-of-type(${img.index + 1})`],
            html: `<img src="${img.src}">`,
            failureSummary: `Image is missing alt text. Add alt attribute or mark as decorative with role="presentation"`,
          },
        ],
      }));

    return {
      id: 'image-alt-text',
      name: 'Image Alt Text Check',
      passed: violations.length === 0,
      severity: 'moderate',
      description:
        violations.length === 0
          ? 'All images have appropriate alt text'
          : `Found ${violations.length} images without alt text`,
      nodes: violations.length > 0 ? violations[0].nodes : undefined,
    };
  },
};
