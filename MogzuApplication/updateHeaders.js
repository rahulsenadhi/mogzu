const fs = require('fs');
const path = require('path');

const directory = '../src/app/components';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('<header')) return;
  if (content.includes('<SharedHeader')) return;

  // Extract import statement
  if (!content.includes("import { SharedHeader }")) {
     // Find the last import statement
     const lastImportIndex = content.lastIndexOf('import ');
     if (lastImportIndex !== -1) {
       const endOfLastImport = content.indexOf('\n', lastImportIndex);
       const importPath = "import { SharedHeader } from '@/app/components/layouts/SharedHeader';";
       content = content.slice(0, endOfLastImport) + `\n${importPath}` + content.slice(endOfLastImport);
     }
  }

  let fileChanged = false;

  // Replace all <header>...</header> blocks
  while (content.includes('<header')) {
    const headerStart = content.indexOf('<header');
    const headerEnd = content.indexOf('</header>', headerStart);
    if (headerStart === -1 || headerEnd === -1) break;

    const fullHeaderEnd = headerEnd + '</header>'.length;
    const headerStr = content.slice(headerStart, fullHeaderEnd);

    let replacement = '<SharedHeader';
    
    if (headerStr.includes('setSidebarOpen')) {
      replacement += ' onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}';
    } else if (headerStr.includes('setSidebarCollapsed(!sidebarCollapsed)')) {
      replacement += ' onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}';
    } else if (headerStr.includes('setSidebarCollapsed')) {
      replacement += ' onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}';
    }
    
    replacement += ' />';

    content = content.slice(0, headerStart) + replacement + content.slice(fullHeaderEnd);
    fileChanged = true;
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('SharedHeader.tsx')) {
      processFile(fullPath);
    }
  }
}

traverse(directory);
