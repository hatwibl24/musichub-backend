const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadFile = async (file, folder) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${folder}/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    try {
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

const deleteFile = async (fileUrl) => {
    const key = fileUrl.split('.com/')[1];
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('S3 delete error:', error);
        throw error;
    }
};

module.exports = {
    uploadFile,
    deleteFile
}; 