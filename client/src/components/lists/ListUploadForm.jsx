import React, { useState } from 'react';
import listService from '../../services/listService';
import './ListUploadForm.css'; // We'll create this CSS file

const ListUploadForm = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setError('');
    setSuccessMessage('');
    const file = event.target.files[0];
    if (file) {
      // Client-side validation for file type (optional, as backend also validates)
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a CSV, XLSX, or XLS file.');
        setSelectedFile(null);
        event.target.value = null; // Reset file input
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('listFile', selectedFile); // 'listFile' must match backend Multer field name

    try {
      const response = await listService.uploadList(formData);
      setSuccessMessage(response.msg || 'File uploaded and tasks distributed successfully!');
      setSelectedFile(null); // Clear the file input after successful upload
      event.target.reset(); // Reset the form to clear the file input visually
      if (onUploadSuccess) {
        onUploadSuccess(response); // Callback for parent component
      }
    } catch (err) {
      const errorMessage = err.msg || err.message || 'File upload failed. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-upload-form-card">
      <h3>Upload Task List (CSV, XLSX, XLS)</h3>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        <div className="form-group">
          <label htmlFor="listFileInput">Select File:</label>
          <input 
            type="file" 
            id="listFileInput"
            onChange={handleFileChange} 
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required 
            disabled={loading}
          />
          {selectedFile && <p className="file-info">Selected: {selectedFile.name}</p>}
        </div>

        <button type="submit" className="upload-button" disabled={loading || !selectedFile}>
          {loading ? 'Uploading & Processing...' : 'Upload and Distribute'}
        </button>
      </form>
    </div>
  );
};

export default ListUploadForm; 