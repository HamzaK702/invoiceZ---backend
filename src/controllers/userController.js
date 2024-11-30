import userService from "../services/userService.js";

const getUserProfileController = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { name } = req.body;
    const profilePhoto = req.file;

    const updatedUser = await userService.updateUserProfile(req.user._id, {
      name,
      profilePhoto,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getUserProfileController,
  updateProfileController,
};
