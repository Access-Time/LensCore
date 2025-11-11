---
layout: home

hero:
  name: LensCore
  text: Testing Aksesibilitas & Web Crawling
  tagline: Platform open-source untuk testing aksesibilitas komprehensif dan web crawling yang cerdas
  image:
    src: /img/logo.jpeg
    alt: Logo LensCore
  actions:
    - theme: brand
      text: Mulai Sekarang
      link: /id/getting-started
    - theme: alt
      text: Lihat di GitHub
      link: https://github.com/Access-Time/LensCore

features:
  - icon: 🔍
    title: Testing Komprehensif
    details: Testing aksesibilitas otomatis dengan axe-core dan rekomendasi berbasis AI

  - icon: 🕷️
    title: Crawling Cerdas
    details: Web crawling canggih dengan kedalaman, konkurensi, dan penemuan URL yang dapat dikonfigurasi

  - icon: 🤖
    title: Analisis AI
    details: Integrasi OpenAI opsional untuk insight aksesibilitas kontekstual dan rekomendasi

  - icon: 📊
    title: Laporan Detail
    details: Generate laporan HTML dan JSON komprehensif dengan screenshot dan insight yang actionable

  - icon: ⚡
    title: Performa Tinggi
    details: Dibangun dengan TypeScript dan Puppeteer untuk testing yang cepat dan reliable dalam skala besar

  - icon: 🌐
    title: Multi-Bahasa
    details: Dukungan penuh untuk dokumentasi dan interface dalam Bahasa Inggris dan Indonesia

  - icon: 🐳
    title: Docker Ready
    details: Deployment mudah dengan dukungan Docker dan Docker Compose

  - icon: 🔌
    title: API Fleksibel
    details: RESTful API dengan spesifikasi OpenAPI untuk integrasi yang mudah

  - icon: ♿
    title: Sesuai WCAG
    details: Mengikuti standar WCAG 2.1 AA untuk testing aksesibilitas dan dokumentasi
---

## Mulai Cepat

Jalankan LensCore dalam hitungan menit:

```bash
# Install secara global
npm install -g @accesstime/lenscore

# Setup awal (wizard interaktif)
lens-core setup

# Atau dengan custom port
lens-core setup --port 8080

# Build dan start services
lens-core build

# Jalankan test pertama Anda
lens-core test https://example.com
```

## Mengapa LensCore?

LensCore menggabungkan testing aksesibilitas yang powerful dengan web crawling yang cerdas untuk membantu Anda:

- **Identifikasi Masalah Aksesibilitas**: Deteksi otomatis pelanggaran WCAG dan dapatkan rekomendasi yang actionable
- **Scale Testing Anda**: Crawl seluruh website dan test banyak halaman secara bersamaan
- **Dapatkan AI Insights**: Manfaatkan OpenAI untuk analisis kontekstual dan saran perbaikan
- **Integrasi Mudah**: Gunakan via CLI, API, atau integrasikan ke CI/CD pipeline Anda
- **Hemat Waktu**: Testing dan reporting otomatis mengurangi upaya testing manual

## Selanjutnya?

<div class="vp-doc">

- [Panduan Memulai](/id/getting-started) - Pelajari dasar-dasar dan setup environment Anda
- [Dokumentasi CLI](/id/cli) - Jelajahi semua perintah dan opsi CLI
- [Referensi API](/id/api) - Integrasikan LensCore ke aplikasi Anda
- [Panduan Kontribusi](/id/contributing) - Bantu membuat LensCore lebih baik

</div>

## Komunitas & Dukungan

- **GitHub**: [Laporkan issue](https://github.com/Access-Time/LensCore/issues) atau berkontribusi
- **Dokumentasi**: Panduan komprehensif untuk semua fitur
- **Lisensi**: MIT - Gratis untuk penggunaan personal dan komersial
