import { uploadFileToCloudinary } from "../fileUpload/cloudinary.js";
import User from "../../DB/models/userModel.js";

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};


 const updateUserProfile = async (userId, { name, profilePhoto }) => {
    let profilePhotoUrl;
  
    if (profilePhoto) {
      profilePhotoUrl = await uploadFileToCloudinary(profilePhoto.buffer, 'profile_photos');
    }
  
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (profilePhotoUrl) updatedFields.profilePhoto = profilePhotoUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );
  
    return updatedUser;
  };

  export default {
    getUserProfile,
    updateUserProfile
  }