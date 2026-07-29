import "dotenv/config"

const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const cloudName = process.env.CLOUDINARY_CLOUD_NAME

if (!apiKey) {
  throw new Error("CLOUDINARY_API_KEY is not set")
}if (!apiSecret) {
  throw new Error("CLOUDINARY_API_SECRET is not set")
}
if (!cloudName) {
  throw new Error("CLOUDINARY_CLOUD_NAME is not set")
}

export const cloudinaryConfig = {
  apiKey,
  apiSecret,
  cloudName,
}
