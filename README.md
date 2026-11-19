# Kerala School of Mathematics - Library OPAC Portal

Official single-page portal for the **Online Public Access Catalogue (OPAC)** of the **Kerala School of Mathematics (KSoM)** Library.

- **GitHub Repository**: [https://github.com/kerala-school-of-mathematics/opac-ksom](https://github.com/kerala-school-of-mathematics/opac-ksom)
- **OPAC Server**: [http://210.212.228.235](http://210.212.228.235)
- **KSoM Official Website**: [https://ksom.res.in](https://ksom.res.in)
- **Library Contact**: [library@ksom.res.in](mailto:library@ksom.res.in)

---

## Overview

The Kerala School of Mathematics (KSoM), an autonomous institute under the Kerala State Council for Science, Technology and Environment (KSCSTE), Government of Kerala, houses a comprehensive collection of advanced research literature in pure and applied mathematics.

This repository hosts the clean, modern, and responsive landing portal connecting researchers, faculty, students, and visitors directly to the institutional Koha Integrated Library System (ILS) and OPAC.

### Key Features
- **Official Institutional Branding**: Features the official emblem and typography for KERALA SCHOOL OF MATHEMATICS, Online Public Access Catalogue, and Library.
- **Direct OPAC Access**: One-click quick link to the Koha OPAC server (`http://210.212.228.235`).
- **Interactive Search Widget**: Directly queries the live Koha catalogue by Title, Author, Subject, ISBN, or Call Number.
- **Popular Subject Filters**: Quick one-click research topics (Algebra, Analysis, Topology, Number Theory, etc.).
- **Institutional Resources**: Links to subscribed academic databases including MathSciNet (AMS) and JSTOR.
- **Accessibility & Responsive Design**: 100% responsive across mobile, tablet, and desktop devices, complete with light/dark theme toggle and smooth transitions.
- **Zero Heavy Dependencies**: Pure semantic HTML5, modern CSS3, and vanilla JavaScript.

---

## Directory Structure

```text
opac/
├── index.html                  # Main single-page application & portal
├── assets/
│   └── images/
│       ├── logo.png            # Official KSoM transparent emblem
│       ├── favicon.png         # Browser favicon
│       ├── logo-hires.jpg      # High-resolution institute logo
│       └── library-banner.png  # Library title banner
├── README.md                   # Repository documentation
└── .gitignore                  # Git ignore rules
```

---

## Local Development & Preview

You can open `index.html` directly in any web browser, or serve it using any static HTTP server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js npx serve
npx serve .
```

Then visit `http://localhost:8080`.

---

## Deployment (GitHub Pages)

This project is ready to be hosted with GitHub Pages:
1. Go to repository **Settings** &rarr; **Pages**.
2. Under **Source**, select the `main` (or `master`) branch and `/ (root)` folder.
3. Save to publish.
