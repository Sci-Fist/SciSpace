/**
 * Cloudinary Migration Script
 * Uploads all assets from src/assets/ to Cloudinary using unsigned upload preset
 * Uses only built-in Node.js modules - no dependencies required
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLOUD_NAME = 'ddrvulhwz';
const UPLOAD_PRESET = 'SciSpace';

// Asset directories to scan
const ASSET_DIRS = [
  { dir: 'src/assets/images', folder: 'scispace/media' },
  { dir: 'src/assets/gifs', folder: 'scispace/media' },
  { dir: 'src/assets/photography', folder: 'scispace/media' },
  { dir: 'src/assets/sketching', folder: 'scispace/media' },
  { dir: 'src/assets/music', folder: 'scispace/music' },
  { dir: 'src/assets/videos', folder: 'scispace/music' },
  { dir: 'src/assets/2D Art', folder: 'scispace/media' },
  { dir: 'src/assets/3D Art', folder: 'scispace/media' }
];

// URL mapping
const urlMapping = {};

/**
 * Upload a single file to Cloudinary using unsigned preset
 */
async function uploadFile(filePath, folder) {
  const fileName = path.basename(filePath);
  const publicId = path.parse(fileName).name.replace(/\s+/g, '-').toLowerCase();
  
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    
    // Build multipart form data manually
    const parts = [];
    
    // File part
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`));
    parts.push(Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`));
    parts.push(fileBuffer);
    parts.push(Buffer.from(`\r\n`));
    
    // Upload preset
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="upload_preset"\r\n\r\n`));
    parts.push(Buffer.from(`${UPLOAD_PRESET}\r\n`));
    
    // Folder
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="folder"\r\n\r\n`));
    parts.push(Buffer.from(`${folder}\r\n`));
    
    // Public ID
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="public_id"\r\n\r\n`));
    parts.push(Buffer.from(`${publicId}\r\n`));
    
    // End boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    
    const bodyBuffer = Buffer.concat(parts);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/auto/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.secure_url) {
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id
            });
          } else {
            resolve({
              success: false,
              error: result.error?.message || 'Upload failed'
            });
          }
        } catch (e) {
          resolve({
            success: false,
            error: 'Failed to parse response: ' + data.substring(0, 100)
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.write(bodyBuffer);
    req.end();
  });
}

/**
 * Scan directory and upload all files
 */
async function processDirectory(dirConfig) {
  const { dir, folder } = dirConfig;
  const fullDir = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(fullDir)) {
    console.log(`⏭️  Skipping ${dir} (not found)`);
    return [];
  }
  
  const files = fs.readdirSync(fullDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mp3', '.wav', '.webm'];
    return validExts.includes(ext);
  });
  
  if (files.length === 0) {
    console.log(`⏭️  No media files in ${dir}`);
    return [];
  }
  
  console.log(`\n📁 Processing ${files.length} files from ${dir}...`);
  
  const results = [];
  for (const file of files) {
    const filePath = path.join(fullDir, file);
    const result = await uploadFile(filePath, folder);
    
    if (result.success) {
      const originalPath = `/${dir}/${file}`;
      const originalPathSrc = `/src/${dir}/${file}`;
      
      urlMapping[originalPath] = result.url;
      urlMapping[originalPathSrc] = result.url;
      
      results.push({ file, originalPath, cloudinaryUrl: result.url });
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file}: ${result.error}`);
    }
  }
  
  return results;
}

/**
 * Main migration
 */
async function migrate() {
  console.log('🚀 Cloudinary Migration Starting...\n');
  console.log(`☁️  Cloud: ${CLOUD_NAME}`);
  console.log(`📦  Preset: ${UPLOAD_PRESET}\n`);
  
  const allResults = [];
  
  for (const dirConfig of ASSET_DIRS) {
    const results = await processDirectory(dirConfig);
    allResults.push(...results);
  }
  
  // Save URL mapping
  const mappingDir = path.join(process.cwd(), 'src/config');
  if (!fs.existsSync(mappingDir)) {
    fs.mkdirSync(mappingDir, { recursive: true });
  }
  
  const mappingPath = path.join(mappingDir, 'cloudinary-urls.json');
  fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
  
  console.log('\n✅ Migration complete!');
  console.log(`📊 Uploaded: ${allResults.length} files`);
  console.log(`📄 Mapping saved to: src/config/cloudinary-urls.json`);
  
  // Generate summary by folder
  const byFolder = {};
  allResults.forEach(r => {
    const folder = r.originalPath.split('/')[2];
    byFolder[folder] = (byFolder[folder] || 0) + 1;
  });
  
  console.log('\n📈 Summary:');
  Object.entries(byFolder).forEach(([folder, count]) => {
    console.log(`   ${folder}: ${count} files`);
  });
  
  return urlMapping;
}

// Run
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };