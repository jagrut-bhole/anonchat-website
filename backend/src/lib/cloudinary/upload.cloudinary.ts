import { cloudinaryConfig} from "./config.cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true
});

console.log(cloudinary.config());