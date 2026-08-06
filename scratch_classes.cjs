const fs = require('fs'); 
const content = fs.readFileSync('src/components/SidePanel.tsx', 'utf-8'); 
const classes = [...content.matchAll(/className="([^"]+)"/g)].map(m => m[1]).join(' ').split(' ').filter(c => c.includes('bg-') || c.includes('text-') || c.includes('border-')); 
console.log([...new Set(classes)].sort());
