# 🎨 IconFlow - Headless Design API

![IconFlow](https://img.shields.io/badge/Status-Operational-success?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

IconFlow is a lightning-fast, headless API that serves dynamic SVG icons directly via URL. It unites popular icon sets (Material Design, FontAwesome, etc.) and custom brand logos into one simple endpoint. 

Just type the name, pick a color, set the size, and paste the URL into your project.

## ✨ Features

* **Universal Compatibility:** Works instantly in raw HTML, React, Vue, Webflow, Framer, and WordPress.
* **On-the-Fly Customization:** Change colors (hex codes or standard names) and sizes directly via URL parameters.
* **Format Flexibility:** Use as an `<img>` source, a CSS `background-image`, or grab the raw `<svg>` code.
* **Edge-Ready:** Designed to run on Vercel Edge Functions for `<50ms` latency worldwide.
* **Smart Fallbacks:** Includes high-fidelity brand SVGs (Google, GitHub, Apple) and routes thousands of others through the Iconify network.

---

## 🚀 Usage Guide

You don't need to install any heavy npm packages. Just use the URL.

### 1. HTML & No-Code
The easiest method. Perfect for Webflow, WordPress, or plain HTML.
```html
<img 
  src="[https://icon-flow-pi.vercel.app/api/render?q=google&color=red&size=24](https://your-domain.vercel.app/api/render?q=google&color=red&size=24)" 
  alt="Google Logo" 
  width="24" 
/>
```
### 2. React & Next.js
Build a dynamic icon component that changes based on props.
```jsx
export const Icon = ({ name, color, size = 24 }) => (
  <img 
    src={`https://icon-flow-pi.vercel.app/api/render?q=${name}&color=${color}&size=${size}`}
    className="w-6 h-6"
    alt={`${name} icon`}
  />
);

// Usage: <Icon name="github" color="black" />
```
### 3. CSS Backgrounds
Perfect for pseudo-elements (::before) or custom buttons.
```css
.btn-icon {
  background-image: url('[https://icon-flow-pi.vercel.app/api/render?q=menu&color=white&size=20](https://your-domain.vercel.app/api/render?q=menu&color=white&size=20)');
  background-repeat: no-repeat;
  background-position: center;
}
```
### 🛠 API Parameters
```
|Parameter| Type   | Default | Example        | Description                                 |  
|q        | string | circle  | rocket, google | The name of the icon or brand.              |
|color    | string | black   | FF0000, blue   | Hex code (without #) or standard color name.|
|size     | number | 24      | 48, 128         | The width and height of the SVG in pixels.  |
```
### 📂 Project Structure
IconFlow is split into a frontend generator and a backend edge function.
```
iconflow/
├── api/
│   └── index.js      # The API Edge Function (Fetches & generates SVGs)
├── index.html        # The Frontend UI (Tailwind CSS + Vanilla JS)
├── package.json      # Dependencies & Scripts
└── vercel.json       # Vercel Routing Configuration
```
### 🌩 Deployment (Vercel)
This project is optimized for 1-click deployment on Vercel.
1.Clone or Download this repository.
2. Ensure you have the Vercel CLI installed, or link the repo to your Vercel dashboard.
3. The vercel.json file automatically routes all requests to /api/render to the backend function, while serving index.html on the root /.
4. Deploy:
```bash
vercel --prod
```
### Running Locally
To test the API and frontend together on your local machine:
```bash
npm install -g vercel
vercel dev
```
Open http://localhost:3000 to view the generator.

### 🤝 Support & Contributing
If you found this project helpful, consider supporting the development!
# Binance Pay:- 992313441
# Upi:- sedniumdevz4@ptyes
