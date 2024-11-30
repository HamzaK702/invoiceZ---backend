import Business from "../../DB/models/businessModel.js";

const searchBusinessesByName = async (name,userId) => {
  try {
    const businesses = await Business.find({
      name: { $regex: name, $options: "i" },
      userId: userId
    });
    return businesses;
  } catch (error) {
    throw new Error("Error searching businesses: " + error.message);
  }
};

const getBusinessById = async (businessId, userId) => {
  try {
    const business = await Business.findOne({ _id: businessId, userId });
    return business;
  } catch (error) {
    throw new Error("Error fetching business: " + error.message);
  }
};

export default {
  searchBusinessesByName,
  getBusinessById,
};
