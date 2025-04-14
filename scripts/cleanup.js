const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean
const directories = [
  'client/src',
  'server',
  'shared'
];

// Files to remove
const filesToRemove = [
  '**/*.test.*',
  '**/*.spec.*',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/coverage/**',
  '**/.DS_Store'
];

// Clean up console logs
function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove console.log statements
  content = content.replace(/console\.log\([^)]*\);?/g, '');
  
  // Remove console.error statements
  content = content.replace(/console\.error\([^)]*\);?/g, '');
  
  // Remove console.warn statements
  content = content.replace(/console\.warn\([^)]*\);?/g, '');
  
  // Remove console.debug statements
  content = content.replace(/console\.debug\([^)]*\);?/g, '');
  
  // Remove console.info statements
  content = content.replace(/console\.info\([^)]*\);?/g, '');
  
  fs.writeFileSync(filePath, content);
}

// Clean up directories
function cleanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (file === 'node_modules' || file === '.git') {
        return;
      }
      
      cleanDirectory(filePath);
    } else {
      // Check if file should be removed
      const shouldRemove = filesToRemove.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(filePath);
      });
      
      if (shouldRemove) {
        fs.unlinkSync(filePath);
        console.log(`Removed: ${filePath}`);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        // Remove console logs from code files
        removeConsoleLogs(filePath);
        console.log(`Cleaned: ${filePath}`);
      }
    }
  });
}

// Main cleanup function
function cleanup() {
  console.log('Starting codebase cleanup...');
  
  // Clean each directory
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      cleanDirectory(dir);
    }
  });
  
  // Run prettier to format code
  try {
    execSync('npx prettier --write "**/*.{js,ts,tsx,json,css,scss}"');
    console.log('Code formatted with Prettier');
  } catch (error) {
    console.error('Error running Prettier:', error);
  }
  
  console.log('Cleanup complete!');
}

// Run cleanup
cleanup(); 