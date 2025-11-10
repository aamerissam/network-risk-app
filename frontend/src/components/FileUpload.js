import React from 'react';
import { Upload, X, FileCheck } from 'lucide-react';

const FileUpload = React.memo(({ uploadedFile, onFileSelect, onFileClear, isDisabled }) => {
  console.log('[FileUpload] Component rendered', { uploadedFile, isDisabled });
  
  // Track render count to debug infinite loops
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  
  if (renderCount.current > 10) {
    console.error('[FileUpload] TOO MANY RENDERS! Stopping logs to prevent browser crash');
    // Stop logging after 10 renders
  } else {
    console.log('[FileUpload] Render count:', renderCount.current);
  }

  const handleFileChange = (e) => {
    console.log('[FileUpload] handleFileChange called');
    console.log('[FileUpload] e.target:', e.target);
    console.log('[FileUpload] Files:', e.target.files);
    
    const file = e.target.files?.[0];
    console.log('[FileUpload] Selected file:', file);
    
    if (file) {
      console.log('[FileUpload] File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Veuillez sélectionner un fichier CSV (.csv)');
        e.target.value = '';
        return;
      }
      
      console.log('[FileUpload] Calling onFileSelect with:', file);
      onFileSelect(file);
      e.target.value = '';
    } else {
      console.log('[FileUpload] No file selected');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[FileUpload] File dropped:', e.dataTransfer.files);
    
    if (!isDisabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Veuillez sélectionner un fichier CSV (.csv)');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  };

  return (
    <div style={{
      ...glassStyle,
      padding: '24px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        width: '100%'
      }}>
        <Upload style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
        <label style={{
          color: 'rgba(255, 255, 255, 0.95)',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
          flex: 1
        }}>
          Upload Dataset CSV (Optionnel)
        </label>
      </div>

      {!uploadedFile ? (
        <label
          onClick={() => console.log('[FileUpload] Upload label clicked')}
          style={{
            border: '2px dashed rgba(139, 92, 246, 0.5)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            background: 'rgba(139, 92, 246, 0.05)',
            transition: 'all 0.3s ease',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            display: 'block',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isDisabled}
            onClick={() => console.log('[FileUpload] Input clicked')}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
              opacity: 0,
              pointerEvents: 'none'
            }}
          />
          <Upload style={{
            width: '48px',
            height: '48px',
            color: 'rgba(139, 92, 246, 0.6)',
            margin: '0 auto 16px'
          }} />
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Cliquez pour sélectionner ou glissez-déposez un fichier CSV
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            Si aucun fichier n'est sélectionné, le fichier test_api.csv sera utilisé
          </p>
        </label>
      ) : (
        <label
          onClick={() => console.log('[FileUpload] Change file label clicked')}
          style={{
            border: '2px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '16px',
            padding: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isDisabled}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
              opacity: 0,
              pointerEvents: 'none'
            }}
          />
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileCheck style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '4px',
              wordBreak: 'break-word',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {uploadedFile.name}
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13px',
              margin: 0
            }}>
              {uploadedFile.size >= 1024 * 1024
                ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(uploadedFile.size / 1024).toFixed(2)} KB`
              } • CSV File
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[FileUpload] Clear button clicked');
              onFileClear();
            }}
            disabled={isDisabled}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.8)',
              color: '#ffffff',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: isDisabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </label>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;

