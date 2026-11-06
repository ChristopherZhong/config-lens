# OmniCalc

OmniCalc is a full-featured, modern minimalist calculator built with vanilla HTML, CSS, and TypeScript. It leverages the power of **Web Components** for a modular and performant experience, and is deployed as part of the Developer Tools monorepo.

🔗 **Live Demo:** [https://christopherzhong.github.io/tools/calculator/](https://christopherzhong.github.io/tools/calculator/)

## ✨ Features

- **Basic Arithmetic:** Addition, subtraction, multiplication, and division.
- **Scientific Mode:** Access advanced functions like square root, power (xʸ), trigonometric functions (sin, cos, tan), logarithms, and constants (π, e).
- **History Log:** Keep track of your previous calculations and recall them with a click.
- **Dark/Light Mode:** Seamlessly toggle between light and dark themes to suit your preference.
- **Modern Minimalist UI:** Clean lines, subtle shadows, and a focus on usability.
- **Responsive Design:** Fully functional on both desktop and mobile devices.
- **Keyboard Support:** Speed up your calculations using your keyboard:
  - Numbers: `0-9`
  - Operators: `+`, `-`, `*`, `/`
  - Result: `Enter` or `=`
  - Clear: `Escape`
  - Backspace: `Backspace`
  - Decimal: `.`

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** None (Vanilla JS with Web Components)
- **Build Tool:** Vite
- **Styling:** CSS3 (using CSS Variables)
- **Font:** [Inter](https://fonts.google.com/specimen/Inter)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v24.22.2 or higher)
- npm (comes with Node.js)

### Installation

From the tools repository root, install dependencies:
   ```bash
   npm install
   ```

### Development

Run the calculator development server from the repository root:
   ```bash
   npx nx run calculator:dev
   ```

### Build

To create a production-ready build in `dist/calculator`:
```bash
npx nx run calculator:build
```

### Deployment

The tools monorepo deploys the calculator to GitHub Pages at `/tools/calculator/`.

## 🎨 Design Philosophy

OmniCalc follows a **Modern Minimalist** design philosophy. By removing unnecessary clutter and focusing on whitespace and typography, it provides a calm and efficient user experience. The use of CSS variables ensures that theme switching is smooth and consistent across all components.

## 📜 License

This project is open-source and available under the [Apache License 2.0](LICENSE).
