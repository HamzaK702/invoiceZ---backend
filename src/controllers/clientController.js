import clientService from "../services/clientService.js";

const searchClientsController = async (req, res) => {
  try {
    const { name } = req.query;
    const userId = req.user._id;

    if (!name) {
      return res
        .status(400)
        .json({
          message: "Please provide at least 1 character for the search.",
        });
    }
    
    const clients = await clientService.searchClientsByName(name, userId);
    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientByIdController = async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user._id;

    const client = await clientService.getClientById(clientId, userId);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    res.status(200).json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllClientsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const clients = await clientService.getAllClients(userId);
    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoicesByClientIdController = async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user._id;
    const invoices = await clientService.getInvoicesByClientId(clientId, userId);

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found for this client." });
    }

    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  searchClientsController,
  getClientByIdController,
  getAllClientsController,
  getInvoicesByClientIdController,
};
