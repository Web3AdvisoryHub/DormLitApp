const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  branch: 'main',
  remote: 'origin',
  commitMessage: 'Final build phase: Subscription tiers, wallet integration, and grandfathered status'
};

// Git commands
const commands = [
  // Initialize git if not already initialized
  'git init',
  
  // Add all files
  'git add .',
  
  // Commit changes
  `git commit -m "${config.commitMessage}"`,
  
  // Add remote if not already added
  'git remote add origin https://github.com/yourusername/dormlit.git || true',
  
  // Pull latest changes
  `git pull ${config.remote} ${config.branch} --rebase`,
  
  // Push changes
  `git push ${config.remote} ${config.branch}`
];

// Execute commands
function executeCommands() {
  console.log('Starting GitHub push...');
  
  commands.forEach((command, index) => {
    try {
      console.log(`Executing: ${command}`);
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error executing command ${index + 1}:`, error);
      process.exit(1);
    }
  });
  
  console.log('Push to GitHub complete!');
}

// Check if .gitignore exists
function checkGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/
out/

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
Thumbs.db
    `.trim();
    
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('Created .gitignore file');
  }
}

// Main function
function main() {
  // Check and create .gitignore
  checkGitignore();
  
  // Execute git commands
  executeCommands();
}

// Run main function
main(); 