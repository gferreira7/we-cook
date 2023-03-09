const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your cloud name, API key, and API secret
cloudinary.config({
  cloud_name: "diwm3fp0o",
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Define a function to upload a video to Cloudinary
async function uploadVideo(buffer) {
    return new Promise((resolve, reject) => {
      // Create a read stream from the buffer
      const stream = cloudinary.uploader.upload_stream(  {  resource_type: "video", folder: "video_uploads",},
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
/* not working well
async function uploadImg() {
    // Create a read stream from the buffer
    try {
       cloudinary.uploader.upload("https://img.freepik.com/free-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_2829-19744.jpg?w=900&t=st=1678319503~exp=1678320103~hmac=94dced47df428e3c12eb42c6e0d999758e774f117cf4a8ba3b503acc62ae9832").
    then(result=> {
      return result
    });
  }catch (error) {
    console.error(error);
    return null;
  }
}

*/


// Export the functions for use in other modules
module.exports = {
  uploadVideo,
  getVideo,
 // uploadImg
};