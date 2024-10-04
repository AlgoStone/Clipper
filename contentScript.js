// contentScript.js
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
document.head.appendChild(link);
