import { files, BUCKETS } from './appwrite-config';  // Import the necessary functions from appwrite-config.js

// The file you want to upload (it can be a local file, like a profile picture)
const fileInput = document.querySelector('#fileInput');  // Assuming you're using an <input type="file" />

// Upload file to the bucket
const uploadFile = async (file) => {
    try {
        const response = await files.upload(BUCKETS.PROFILE_PHOTOS, file);
        console.log('File uploaded successfully:', response);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

// Trigger upload when a file is selected
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
});
