const fs = require('fs');

const path = 'src/components/SidePanel.tsx';
let content = fs.readFileSync(path, 'utf-8');

const replacements = [
  { from: /\bbg-black\b/g, to: 'bg-white dark:bg-black' },
  { from: /\btext-white\b/g, to: 'text-neutral-900 dark:text-white' },
  { from: /\bbg-neutral-900\b/g, to: 'bg-neutral-100 dark:bg-neutral-900' },
  { from: /\bbg-neutral-800\b/g, to: 'bg-neutral-200 dark:bg-neutral-800' },
  { from: /\bbg-neutral-900\/30\b/g, to: 'bg-neutral-100/30 dark:bg-neutral-900/30' },
  { from: /\bborder-neutral-800\b/g, to: 'border-neutral-200 dark:border-neutral-800' },
  { from: /\bborder-neutral-700\b/g, to: 'border-neutral-300 dark:border-neutral-700' },
  { from: /\btext-neutral-400\b/g, to: 'text-neutral-600 dark:text-neutral-400' },
  { from: /\btext-neutral-300\b/g, to: 'text-neutral-700 dark:text-neutral-300' },
  { from: /\bhover:bg-neutral-900\b/g, to: 'hover:bg-neutral-100 dark:hover:bg-neutral-900' },
  { from: /\bhover:bg-neutral-800\b/g, to: 'hover:bg-neutral-200 dark:hover:bg-neutral-800' },
  { from: /\bhover:text-white\b/g, to: 'hover:text-neutral-900 dark:hover:text-white' },
  { from: /\bprose-invert\b/g, to: 'dark:prose-invert' },
  { from: /\bprose-pre:bg-neutral-900\b/g, to: 'prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900' },
  { from: /\bprose-pre:border-neutral-800\b/g, to: 'prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800' },
  { from: /\[&::-webkit-scrollbar-thumb\]:bg-neutral-800/g, to: '[&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800' },
  { from: /\bfill-white\b/g, to: 'fill-neutral-900 dark:fill-white' },
  { from: /\bfocus:border-white\b/g, to: 'focus:border-neutral-900 dark:focus:border-white' }
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

fs.writeFileSync(path, content, 'utf-8');
console.log('Classes refactored successfully.');
