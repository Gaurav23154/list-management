import React, { useState } from 'react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError('Please select a file');
      setFile(null);
      return;
    }

    // Check file type
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      setFile(null);
      return;
    }

    // Check file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to upload files');
      }

      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setSuccess(`File uploaded successfully! ${response.data.data.contactsProcessed} contacts processed.`);
        setFile(null);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to upload file'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Contacts</h1>
      
      <div className="upload-box">
        <div className="upload-instructions">
          <h2>Instructions</h2>
          <p>Upload a CSV file with the following columns:</p>
          <ul>
            <li>name (required)</li>
            <li>email (required)</li>
            <li>phone (required)</li>
            <li>notes (optional)</li>
          </ul>
          
          <div className="file-requirements">
            <h3>File requirements:</h3>
            <ul>
              <li>Must be a CSV file</li>
              <li>Maximum size: 5MB</li>
              <li>Must include required columns</li>
              <li>Email must be in valid format (e.g., user@example.com)</li>
              <li>Phone numbers must be 10-15 digits</li>
              <li>Phone numbers can include spaces, dashes, or parentheses</li>
              <li>Example formats: 1234567890, (123) 456-7890, +1-123-456-7890</li>
            </ul>
          </div>
        </div>

        <div className="upload-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="file-input-container">
            <input
              type="file"
              id="file-input"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-input" className="file-input-label">
              {file ? file.name : 'Choose CSV file'}
            </label>
          </div>

          {file && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload; 