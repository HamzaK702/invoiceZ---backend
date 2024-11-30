import Client from "../../DB/models/clientModel.js";
import Invoice from "../../DB/models/invoiceModel.js";

const searchClientsByName = async (name, userId) => {
  try {
    const clients = await Client.find({
      name: { $regex: name, $options: "i" },
      userId: userId,
    }).limit(10);
    return clients;
  } catch (error) {
    throw new Error("Error fetching clients: " + error.message);
  }
};

const getClientById = async (clientId, userId) => {
  try {
    const client = await Client.findOne({ _id: clientId, userId });

    if (!client) {
      return null;
    }

    return client;
  } catch (error) {
    throw new Error("Error fetching client: " + error.message);
  }
};

const getAllClients = async (userId) => {
  try {
    const clients = await Client.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "clientId",
          as: "invoices",
        },
      },
      {
        $addFields: {
          invoiceCount: { $size: "$invoices" },
        },
      },
      {
        $project: {
          _id: 1, // Include the client's ID
          name: 1, // Include the client's name
          invoiceCount: 1 // Include the count of invoices
        },
      },
    ]);

    return clients;
  } catch (error) {
    throw new Error("Error fetching clients: " + error.message);
  }
};

const getInvoicesByClientId = async (clientId, userId) => {
  try {
    const invoices = await Invoice.find({ clientId, userId })
      .select('_id invoiceNumber status createdAt clientId')
      .populate({
        path: 'clientId',
        select: 'name',
      });

    return invoices.map(invoice => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientId.name,
      status: invoice.status,
      createdAt: invoice.createdAt
    }));
  } catch (error) {
    throw new Error("Error fetching invoices for client: " + error.message);
  }
};
export default {
  searchClientsByName,
  getClientById,
  getAllClients,
  getInvoicesByClientId,
};
