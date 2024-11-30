import itemsService from "../services/itemsService.js";

const createItemController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;
    const itemData = req.body;

    const newItem = await itemsService.createItem(invoiceId, userId, itemData);
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItemsController = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user._id;

    const items = await itemsService.getItems(invoiceId, userId);
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItemByIdController = async (req, res) => {
  try {
    const { invoiceId, itemId } = req.params;
    const userId = req.user._id;

    const item = await itemsService.getItemById(invoiceId, itemId, userId);
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItemController = async (req, res) => {
  try {
    const { invoiceId, itemId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const updatedItem = await itemsService.updateItem(
      invoiceId,
      itemId,
      userId,
      updateData
    );
    res.status(200).json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItemController = async (req, res) => {
  try {
    const { invoiceId, itemId } = req.params;
    const userId = req.user._id;

    await itemsService.deleteItem(invoiceId, itemId, userId);
    res
      .status(200)
      .json({ success: true, message: "Item deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createItemController,
  getItemsController,
  getItemByIdController,
  updateItemController,
  deleteItemController,
};
