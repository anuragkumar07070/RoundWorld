const { cloudinary } = require("../cloudConfig");

class CloudinaryHelper {
    // Upload image
    static async uploadImage(filePath, options = {}) {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: options.folder || 'RoundWorld',
                allowed_formats: ['jpg', 'png', 'jpeg'],
                transformation: options.transformation || [
                    { width: 1200, height: 800, crop: 'limit' }
                ],
                ...options
            });
            
            return {
                url: result.secure_url,
                filename: result.public_id,
                width: result.width,
                height: result.height
            };
        } catch (err) {
            throw new Error(`Image upload failed: ${err.message}`);
        }
    }
    
    // Delete image
    static async deleteImage(filename) {
        if (!filename || filename === 'default') return;
        
        try {
            await cloudinary.uploader.destroy(filename);
            return true;
        } catch (err) {
            console.error(`Failed to delete image: ${filename}`, err);
            return false;
        }
    }
    
    // Get optimized URL
    static getOptimizedUrl(publicId, options = {}) {
        return cloudinary.url(publicId, {
            width: options.width || 800,
            height: options.height || 600,
            crop: 'fill',
            quality: 'auto',
            ...options
        });
    }
}

module.exports = CloudinaryHelper;