/**
 * App Component - Root Component
 * Sagrada Familia Parts Manager
 * 
 * Main application container that orchestrates the file upload workflow
 */

import { useState } from 'react';
import FileUploader from './components/FileUploader';
import type { UploadError, UploadProgress } from './types/upload';

function App() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleUploadComplete = (fileId: string) => {
    console.log('✅ Upload complete:', fileId);
    setUploadedFileId(fileId);
    setUploadProgress(0);
  };

  const handleUploadError = (error: UploadError) => {
    console.error('❌ Upload error:', error);
    alert(`Upload failed: ${error.message}`);
    setUploadProgress(0);
  };

  const handleProgress = (progress: UploadProgress) => {
    setUploadProgress(progress.percentage);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Sagrada Familia Parts Manager</h1>
        <p style={{ color: '#666' }}>
          Upload and manage .3dm files for the Sagrada Familia project
        </p>
      </header>

      <main>
        <FileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onProgress={handleProgress}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#4caf50',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>
              {uploadProgress.toFixed(0)}%
            </p>
          </div>
        )}

        {uploadedFileId && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            border: '1px solid #4caf50'
          }}>
            <h3 style={{ marginTop: 0 }}>✅ Upload Successful</h3>
            <p><strong>File ID:</strong> {uploadedFileId}</p>
            <button
              onClick={() => setUploadedFileId(null)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                border: '1px solid #4caf50',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Upload Another File
            </button>
          </div>
        )}
      </main>

      <footer style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid #e0e0e0',
        color: '#999',
        fontSize: '0.875rem'
      }}>
        <p>AI4Devs - Technical Master's Final Project</p>
      </footer>
    </div>
  );
}

export default App;
