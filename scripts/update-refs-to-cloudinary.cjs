/**
 * Update all component references to use Cloudinary URLs
 * Reads the mapping file and replaces all asset paths
 */

const fs = require('fs');
const path = require('path');

// Load URL mapping
const mappingPath = path.join(process.cwd(), 'src/config/cloudinary-urls.json');
const urlMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Files to update
const filesToUpdate = [
  'src/context/NowPlayingContext.jsx',
  'src/pages/TwoDArtPage.jsx',
  'src/pages/ThreeDArtPage.jsx',
  'src/pages/SketchesPage.jsx',
  'src/pages/ResumePage.jsx',
  'src/pages/PhotographyPage.jsx',
  'src/pages/MusicPage.jsx',
  'src/pages/HomePage.jsx',
  'src/components/MixedMediaGallery.jsx',
  'src/components/GalleryModal.jsx',
  'src/components/dev-tools/ResumePageControls.jsx',
  'src/__tests__/MusicPlayerSync.test.js'
];

let totalReplacements = 0;
const updatedFiles = [];

/**
 * Replace asset paths in file content
 */
function replaceAssetPaths(content) {
  let updatedContent = content;
  let replacements = 0;
  
  // Replace each mapped path
  Object.entries(urlMapping).forEach(([oldPath, newUrl]) => {
    // Create different variations of the path to match
    const variations = [
      oldPath,
      oldPath.replace('/src/', '/'),
      oldPath.replace('src/assets/', '/assets/'),
      `"${oldPath}"`,
      `'${oldPath}'`,
      `"${oldPath.replace('/src/', '/')}"`,
      `'${oldPath.replace('/src/', '/')}'`,
      `"${oldPath.replace('src/assets/', '/assets/')}"`,
      `'${oldPath.replace('src/assets/', '/assets/')}'`
    ];
    
    variations.forEach(variant => {
      const regex = new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = updatedContent.match(regex);
      if (matches) {
        replacements += matches.length;
        // Use the URL without quotes for replacement
        updatedContent = updatedContent.replace(regex, newUrl);
      }
    });
  });
  
  return { content: updatedContent, replacements };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const { content: updatedContent, replacements } = replaceAssetPaths(content);
  
  if (replacements > 0) {
    fs.writeFileSync(fullPath, updatedContent, 'utf8');
    console.log(`✅ ${filePath}: ${replacements} replacements`);
    totalReplacements += replacements;
    updatedFiles.push(filePath);
  } else {
    console.log(`⏭️  ${filePath}: No changes`);
  }
}

/**
 * Main update function
 */
function updateAll() {
  console.log('🔄 Updating component references to Cloudinary URLs...\n');
  
  filesToUpdate.forEach(processFile);
  
  console.log('\n✅ Update complete!');
  console.log(`📊 Total replacements: ${totalReplacements}`);
  console.log(`📄 Files updated: ${updatedFiles.length}`);
  
  if (updatedFiles.length > 0) {
    console.log('\n📝 Updated files:');
    updatedFiles.forEach(file => console.log(`   • ${file}`));
  }
}

// Run
if (require.main === module) {
  updateAll();
}

module.exports = { updateAll };