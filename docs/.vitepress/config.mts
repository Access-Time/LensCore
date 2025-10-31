import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'LensCore',
  description: 'Open-source accessibility testing and web crawling platform',

  // Clean URLs (no .html extension)
  cleanUrls: true,

  // Base path for GitHub Pages (adjust if needed)
  base: '/LensCore/',

  // Ignore dead links for localhost API docs
  ignoreDeadLinks: [/^http:\/\/localhost/],

  // Theme configuration
  themeConfig: {
    logo: '/img/logo.jpeg',

    // Layout configuration for full-screen
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Back to top',

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Access-Time/LensCore' },
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Made with ❤️ by the AccessTime team',
    },

    // Search
    search: {
      provider: 'local',
      options: {
        locales: {
          id: {
            translations: {
              button: {
                buttonText: 'Cari',
                buttonAriaLabel: 'Cari dokumentasi',
              },
              modal: {
                displayDetails: 'Tampilkan detail',
                resetButtonTitle: 'Reset pencarian',
                backButtonTitle: 'Tutup pencarian',
                noResultsText: 'Tidak ada hasil untuk',
                footer: {
                  selectText: 'untuk memilih',
                  selectKeyAriaLabel: 'masuk',
                  navigateText: 'untuk navigasi',
                  navigateUpKeyAriaLabel: 'panah atas',
                  navigateDownKeyAriaLabel: 'panah bawah',
                  closeText: 'untuk menutup',
                  closeKeyAriaLabel: 'escape',
                },
              },
            },
          },
        },
      },
    },
  },

  // Localization
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/',

      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Documentation', link: '/en/getting-started' },
          { text: 'API', link: '/en/api' },
          { text: 'CLI', link: '/en/cli' },
          { text: 'Contributing', link: '/en/contributing' },
        ],

        sidebar: {
          '/en/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/getting-started' },
                {
                  text: 'Installation',
                  link: '/en/getting-started#installation',
                },
                {
                  text: 'Quick Start',
                  link: '/en/getting-started#quick-start',
                },
              ],
            },
            {
              text: 'CLI',
              items: [
                { text: 'Overview', link: '/en/cli' },
                { text: 'Commands', link: '/en/cli#commands-overview' },
                { text: 'Examples', link: '/en/cli#real-world-examples' },
              ],
            },
            {
              text: 'API Reference',
              items: [
                { text: 'Overview', link: '/en/api' },
                { text: 'Endpoints', link: '/en/api#api-endpoints' },
              ],
            },
            {
              text: 'Guides',
              items: [
                { text: 'Accessibility', link: '/en/accessibility' },
                { text: 'Contributing', link: '/en/contributing' },
              ],
            },
          ],
        },

        editLink: {
          pattern:
            'https://github.com/Access-Time/LensCore/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },

        lastUpdated: {
          text: 'Last updated',
          formatOptions: {
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        },
      },
    },

    id: {
      label: 'Bahasa Indonesia',
      lang: 'id',
      link: '/id/',

      themeConfig: {
        nav: [
          { text: 'Beranda', link: '/id/' },
          { text: 'Dokumentasi', link: '/id/getting-started' },
          { text: 'API', link: '/id/api' },
          { text: 'CLI', link: '/id/cli' },
          { text: 'Kontribusi', link: '/id/contributing' },
        ],

        sidebar: {
          '/id/': [
            {
              text: 'Memulai',
              items: [
                { text: 'Pengenalan', link: '/id/getting-started' },
                { text: 'Instalasi', link: '/id/getting-started#instalasi' },
                {
                  text: 'Mulai Cepat',
                  link: '/id/getting-started#mulai-cepat',
                },
              ],
            },
            {
              text: 'CLI',
              items: [
                { text: 'Ringkasan', link: '/id/cli' },
                { text: 'Perintah', link: '/id/cli#ringkasan-perintah' },
                {
                  text: 'Contoh',
                  link: '/id/cli#contoh-penggunaan-real-world',
                },
              ],
            },
            {
              text: 'Referensi API',
              items: [
                { text: 'Ringkasan', link: '/id/api' },
                { text: 'Endpoints', link: '/id/api#endpoint-api' },
              ],
            },
            {
              text: 'Panduan',
              items: [
                { text: 'Aksesibilitas', link: '/id/accessibility' },
                { text: 'Kontribusi', link: '/id/contributing' },
              ],
            },
          ],
        },

        editLink: {
          pattern:
            'https://github.com/Access-Time/LensCore/edit/main/docs/:path',
          text: 'Edit halaman ini di GitHub',
        },

        lastUpdated: {
          text: 'Terakhir diperbarui',
          formatOptions: {
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        },

        docFooter: {
          prev: 'Sebelumnya',
          next: 'Selanjutnya',
        },

        outline: {
          label: 'Di halaman ini',
        },

        returnToTopLabel: 'Kembali ke atas',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Tema',
        lightModeSwitchTitle: 'Ganti ke mode terang',
        darkModeSwitchTitle: 'Ganti ke mode gelap',
      },
    },
  },

  // Accessibility
  lang: 'en',
  head: [
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'LensCore' }],
  ],

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
});
