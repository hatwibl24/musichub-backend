import React, { useState } from 'react';

const FileUpload = ({ 
    type, // 'song', 'photo', or 'cover'
    onUploadComplete,
    onError 
}) => {
    const [file, setFile] = useState(null);
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (type === 'song') {
            setFile(selectedFile);
        } else {
            handleImageFile(selectedFile);
        }
    };

    const handleCoverChange = (e) => {
        const selectedFile = e.target.files[0];
        handleImageFile(selectedFile, true);
    };

    const handleImageFile = (file, isCover = false) => {
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                onError('Please select an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                onError('File size should be less than 5MB');
                return;
            }

            if (isCover) {
                setCover(file);
            } else {
                setFile(file);
            }
        }
    };

    const handleUpload = async () => {
        try {
            setLoading(true);
            const formData = new FormData();

            if (type === 'song') {
                if (!file) {
                    throw new Error('Please select a song file');
                }
                formData.append('song', file);
                if (cover) {
                    formData.append('cover', cover);
                }
            } else {
                if (!file) {
                    throw new Error('Please select a file');
                }
                formData.append(type === 'photo' ? 'photo' : 'cover', file);
            }

            const endpoint = getUploadEndpoint();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onUploadComplete(data);
            
            // Clear form
            setFile(null);
            setCover(null);
            setProgress(0);
        } catch (error) {
            onError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getUploadEndpoint = () => {
        switch (type) {
            case 'song':
                return '/api/upload/song';
            case 'photo':
                return '/api/upload/profile-photo';
            case 'cover':
                return '/api/upload/album-cover';
            default:
                return '/api/upload/file';
        }
    };

    return (
        <div className="upload-container">
            <div className="file-input">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept={type === 'song' ? 'audio/*' : 'image/*'}
                    disabled={loading}
                />
                {type === 'song' && (
                    <input
                        type="file"
                        onChange={handleCoverChange}
                        accept="image/*"
                        disabled={loading}
                        placeholder="Upload cover (optional)"
                    />
                )}
            </div>

            {(file || cover) && (
                <div className="preview">
                    {file && <p>Selected file: {file.name}</p>}
                    {cover && <p>Selected cover: {cover.name}</p>}
                </div>
            )}

            {loading && (
                <div className="progress-bar">
                    <div 
                        className="progress" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            <button 
                onClick={handleUpload} 
                disabled={loading || !file}
                className="upload-button"
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default FileUpload; 