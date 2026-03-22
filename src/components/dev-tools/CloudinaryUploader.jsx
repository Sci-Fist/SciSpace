import { useState, useRef } from 'react';
import { uploadImage, uploadVideo, uploadAudio, getOptimizedUrl } from '../../services/cloudinary';

const CloudinaryUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const getFileType = (file) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
    
    if (imageTypes.includes(file.type)) return 'image';
    if (videoTypes.includes(file.type)) return 'video';
    if (audioTypes.includes(file.type)) return 'audio';
    return 'unknown';
  };

  const getCloudinaryFolder = (file, fileName) => {
    const name = fileName.toLowerCase();
    const ext = fileName.split('.').pop().toLowerCase();
    
    // Audio/video files go to scispace/music
    const audioVideoExts = ['mp4', 'mp3', 'wav', 'webm', 'ogg'];
    if (audioVideoExts.includes(ext)) {
      return 'scispace/music';
    }
    
    // All images go to scispace/media
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (imageExts.includes(ext)) {
      return 'scispace/media';
    }
    
    // Default fallback
    return 'scispace/media';
  };

  const handleUpload = async (files) => {
    setUploading(true);
    const newResults = [];

    for (const file of files) {
      const fileType = getFileType(file);
      const folder = getCloudinaryFolder(file, file.name);
      
      try {
        let result;
        switch (fileType) {
          case 'image':
            result = await uploadImage(file, folder.replace('scispace/', ''));
            break;
          case 'video':
          case 'audio':
            result = await uploadVideo(file, folder.replace('scispace/', ''));
            break;
          default:
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        newResults.push({
          name: file.name,
          url: result.url,
          type: fileType,
          folder,
          success: true
        });
      } catch (error) {
        newResults.push({
          name: file.name,
          error: error.message,
          success: false
        });
      }
    }

    setResults(prev => [...prev, ...newResults]);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleUpload(files);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearResults = () => {
    setResults([]);
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
        ☁️ Cloudinary Uploader
      </h3>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#4CAF50' : '#666'}`,
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Uploading...</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Drop files here or click to select
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              Images, Videos, Audio
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>
              Results: {successCount} ✓ {failCount > 0 && `| ${failCount} ✗`}
            </span>
            <button
              onClick={clearResults}
              style={{
                background: 'none',
                border: '1px solid #666',
                color: '#999',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: result.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {result.success ? '✓' : '✗'} {result.name}
                </div>
                
                {result.success ? (
                  <div>
                    <div style={{ color: '#999', marginBottom: '4px' }}>
                      Category: {result.category}
                    </div>
                    <div
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        wordBreak: 'break-all',
                        cursor: 'pointer'
                      }}
                      onClick={() => copyToClipboard(result.url)}
                      title="Click to copy"
                    >
                      {result.url}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#f44336' }}>{result.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cloudinary Info */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(0, 150, 255, 0.1)', borderRadius: '8px', fontSize: '10px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0096ff' }}>ℹ️ Cloudinary Limits (Free Tier)</div>
        <div style={{ marginBottom: '4px' }}>• Max file size: <strong>10 MB</strong></div>
        <div style={{ marginBottom: '4px' }}>• Bandwidth: <strong>25 GB/month</strong></div>
        <div style={{ marginBottom: '4px' }}>• Storage: <strong>25 GB</strong></div>
        <div style={{ marginBottom: '8px' }}>• Transformations: <strong>25,000/month</strong></div>
        <div style={{ color: '#888', fontSize: '9px' }}>
          💡 Large files (videos, high-res images) may need compression or upgrade
        </div>
      </div>

      {/* Folder Structure */}
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(100, 100, 100, 0.1)', borderRadius: '8px', fontSize: '10px' }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>📁 Your Cloudinary Folders</div>
        <div style={{ marginBottom: '4px' }}>• <code>scispace/media</code> - Images, GIFs, photos</div>
        <div style={{ marginBottom: '4px' }}>• <code>scispace/music</code> - Audio & video files</div>
        <div style={{ color: '#888', fontSize: '9px', marginTop: '8px' }}>
          Files auto-sorted by extension
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '12px', fontSize: '10px', color: '#666' }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>How to use:</div>
        <div>1. Drag files from your folder here</div>
        <div>2. Files auto-upload to Cloudinary</div>
        <div>3. Click URL to copy</div>
        <div>4. Update your components with new URLs</div>
      </div>
    </div>
  );
};

export default CloudinaryUploader;