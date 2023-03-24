const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your cloud name, API key, and API secret
cloudinary.config({
  cloud_name: "dql2fnfvb",
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Define a function to upload a video to Cloudinary
async function uploadVideo(buffer) {
    return new Promise((resolve, reject) => {
      // Create a read stream from the buffer
      const stream = cloudinary.uploader.upload_stream(  {  resource_type: "video", folder: "video_uploads", transformation: [{ height: "640", crop: "scale", quality: "50" }]},
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.write(buffer);
      stream.end();
    });
  }

// Define a function to retrieve a video from Cloudinary
async function getVideo(videoId) {
  try {
    const result = await cloudinary.api.resource(videoId, {
      resource_type: "video",
    });
    return result.secure_url;
  } catch (error) {
    console.error(error);
    return null;
  }
}

 async function uploadImg(buffer) {
    // Create a read stream from the buffer
  
    try {
      const result = await cloudinary.uploader.upload(buffer, {
        resource_type: "image",
      });
      return result.secure_url;
    } catch (error) {
      console.error(error);
      return null;
    }
  
}




// Export the functions for use in other modules
module.exports = {
  uploadVideo,
  getVideo,
 uploadImg
};