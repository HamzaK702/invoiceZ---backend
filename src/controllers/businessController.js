import businessService from "../services/businessService.js";

const searchBusinessesController = async (req, res) => {
  const { name } = req.query;
  const userId = req.user._id;
  if (!name) {
    return res
      .status(400)
      .json({ message: "Name query parameter is required." });
  }

  try {
    const businesses = await businessService.searchBusinessesByName(
      name,
      userId
    );
    res.status(200).json({ success: true, businesses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;
    const business = await businessService.getBusinessById(businessId, userId);

    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }
    res.status(200).json({ success: true, business });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  searchBusinessesController,
  getBusinessById,
};
