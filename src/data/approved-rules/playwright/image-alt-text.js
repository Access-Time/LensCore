/* eslint-env node */
module.exports = {
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

    const imagesWithoutAlt = images.filter(
      (img) => !img.hasAlt && !img.isDecorative
    );

    const violationNodes = imagesWithoutAlt.map((img) => ({
      target: [`img:nth-of-type(${img.index + 1})`],
      html: `<img src="${img.src}">`,
      failureSummary: `Image is missing alt text. Add alt attribute or mark as decorative with role="presentation"`,
    }));

    return {
      id: 'image-alt-text',
      name: 'Image Alt Text Check',
      passed: imagesWithoutAlt.length === 0,
      severity: 'moderate',
      description:
        imagesWithoutAlt.length === 0
          ? 'All images have appropriate alt text'
          : `Found ${imagesWithoutAlt.length} image${imagesWithoutAlt.length > 1 ? 's' : ''} without alt text`,
      nodes: violationNodes.length > 0 ? violationNodes : undefined,
    };
  },
};
