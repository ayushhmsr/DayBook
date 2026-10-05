import Entry from "../models/entry.model.js";

export async function listEntries(req, res) {
  try {
    const userId = req.user.id;
    const { templateId, date } = req.query;

    const query = { user: userId };
    if (templateId) query.templateId = templateId;
    if (date) query.date = date;

    const entries = await Entry.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formatted = entries.map((e) => ({
      id: e._id.toString(),
      templateId: e.templateId,
      date: e.date,
      values: e.values || {},
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return res.status(200).json({
      message: "Entries fetched successfully",
      entries: formatted,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Failed to fetch entries" });
  }
}

export async function createEntry(req, res) {
  try {
    const userId = req.user.id;
    const { templateId, date, values } = req.body;

    if (!templateId || !date) {
      return res.status(400).json({ message: "templateId and date are required" });
    }

    const entry = await Entry.create({
      user: userId,
      templateId,
      date,
      values: values || {},
    });

    return res.status(201).json({
      message: "Entry created successfully",
      entry: {
        id: entry._id.toString(),
        templateId: entry.templateId,
        date: entry.date,
        values: entry.values,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating entry:", error);
    return res.status(500).json({ message: "Failed to create entry" });
  }
}

export async function deleteEntry(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Entry.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }

    return res.status(200).json({ message: "Entry deleted successfully", id });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return res.status(500).json({ message: "Failed to delete entry" });
  }
}

export async function bulkCreateEntries(req, res) {
  try {
    const userId = req.user.id;
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "An array of entries is required" });
    }

    const docs = entries.map((e) => ({
      user: userId,
      templateId: e.templateId,
      date: e.date,
      values: e.values || {},
      createdAt: e.createdAt || new Date(),
    }));

    const created = await Entry.insertMany(docs);

    return res.status(201).json({
      message: `${created.length} entries created successfully`,
      count: created.length,
    });
  } catch (error) {
    console.error("Error bulk creating entries:", error);
    return res.status(500).json({ message: "Failed to create entries in bulk" });
  }
}
