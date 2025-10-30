# Accessibility

LensCore follows WCAG 2.1 AA principles to ensure that our documentation and tools are accessible to everyone, including people with disabilities. We're committed to providing an inclusive experience for all users.

## WCAG 2.1 Compliance

The Web Content Accessibility Guidelines (WCAG) 2.1 provide a shared standard for web content accessibility. LensCore adheres to Level AA compliance, meeting the following key principles:

### Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

- ✓ Text alternatives for images
- ✓ Sufficient color contrast
- ✓ Resizable text
- ✓ Adaptable content

### Operable

User interface components and navigation must be operable by all users.

- ✓ Keyboard accessible
- ✓ Sufficient time to read
- ✓ No seizure-inducing content
- ✓ Easy navigation

### Understandable

Information and user interface operation must be understandable.

- ✓ Readable text
- ✓ Predictable behavior
- ✓ Input assistance
- ✓ Error prevention

### Robust

Content must be robust enough to be interpreted by a wide variety of user agents.

- ✓ Valid HTML markup
- ✓ Proper ARIA labels
- ✓ Compatible with assistive tech
- ✓ Standards compliant

## Our Accessibility Practices

### Semantic HTML

We use proper HTML5 semantic elements (header, nav, main, article, section, footer) and heading hierarchy (h1-h6) to provide meaningful structure for screen readers and assistive technologies.

### Keyboard Navigation

All interactive elements are keyboard accessible. Visible focus indicators show which element has focus. Users can navigate through the entire site using only the keyboard (Tab, Shift+Tab, Enter, Escape).

### Color Contrast

We maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text, meeting WCAG AA standards. Both light and dark themes are tested for sufficient contrast.

### Screen Reader Support

We use ARIA labels, roles, and properties where appropriate. Skip links allow users to bypass repetitive content. Alt text describes images meaningfully.

### Language Support

We provide proper language attributes (lang) for English and Indonesian content, enabling screen readers to use the correct pronunciation and voice.

### Responsive Design

Our documentation is fully responsive and works on all device sizes. Text can be resized up to 200% without loss of content or functionality.

## Accessibility Features

- **Skip Navigation Links**: Skip to main content links at the top of each page
- **Visible Focus Indicators**: Clear visual indication of keyboard focus
- **Dark Mode Support**: Automatically detects system preferences with manual toggle
- **Descriptive Link Text**: Links clearly describe their destination
- **Logical Tab Order**: Tab navigation follows visual layout
- **ARIA Labels**: Appropriate ARIA attributes for better screen reader experience
- **Consistent Navigation**: Predictable navigation structure across all pages
- **Bilingual Support**: Content available in English and Indonesian

## Testing Accessibility with LensCore

LensCore itself is a tool for testing accessibility. Here's how to use it:

### Basic Accessibility Test

```bash
lens-core test https://your-site.com
```

### Test with AI Recommendations

```bash
lens-core test https://your-site.com --enable-ai
```

### Test Specific WCAG Levels

```bash
lens-core test https://your-site.com --tags "wcag2a,wcag2aa"
```

### Generate HTML Report

```bash
lens-core test https://your-site.com --web
```

## Common Accessibility Issues

LensCore tests for common accessibility issues including:

1. **Color Contrast**: Insufficient contrast between text and background
2. **Missing Alt Text**: Images without descriptive alternative text
3. **Form Labels**: Form inputs without associated labels
4. **Heading Structure**: Skipped heading levels or missing headings
5. **Link Text**: Links with non-descriptive text like "click here"
6. **Keyboard Access**: Interactive elements not keyboard accessible
7. **ARIA Usage**: Improper or missing ARIA attributes
8. **Language Declaration**: Missing or incorrect lang attributes

## Best Practices

### For Developers

- Use semantic HTML elements
- Provide text alternatives for non-text content
- Ensure sufficient color contrast
- Make all functionality keyboard accessible
- Use ARIA attributes correctly
- Test with screen readers
- Validate HTML markup

### For Content Creators

- Write clear and concise content
- Use descriptive link text
- Provide captions for videos
- Structure content with proper headings
- Use lists for sequential information
- Avoid relying on color alone to convey information

### For Designers

- Design with high contrast ratios
- Ensure focus indicators are visible
- Make clickable areas large enough
- Provide visual hierarchy
- Design for different screen sizes
- Consider dark mode

## Accessibility Feedback

We're continuously working to improve the accessibility of LensCore. If you encounter any accessibility barriers or have suggestions for improvement, please let us know.

### Report Accessibility Issues

You can report accessibility issues through:

- **GitHub Issues**: [Report an issue](https://github.com/Access-Time/LensCore/issues)
- **Email**: accessibility@accesstime.com
- **Community Discussions**

Please include:

- Description of the issue
- Page URL where you encountered the issue
- Browser and assistive technology used
- Steps to reproduce (if applicable)

## Resources

### Learn More

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/) - Web accessibility resources
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools

- **LensCore**: Automated accessibility testing
- **axe DevTools**: Browser extension for testing
- **WAVE**: Web accessibility evaluation tool
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

## Accessibility Statement

LensCore is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

### Conformance Status

The LensCore documentation conforms to WCAG 2.1 level AA.

### Feedback

We welcome your feedback on the accessibility of LensCore. Please let us know if you encounter accessibility barriers.

---

Thank you for helping us make LensCore more accessible for everyone! ♿
