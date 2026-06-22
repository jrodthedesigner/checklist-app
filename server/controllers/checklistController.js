const Checklist = require('../models/Checklist');

// GET /api/checklists
exports.getChecklists = async (req, res, next) => {
  try {
    const checklists = await Checklist.find().sort({ createdAt: -1 });
    res.json(checklists);
  } catch (err) {
    next(err);
  }
};

// POST /api/checklists
exports.createChecklist = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;
    const checklist = await Checklist.create({ title, description, color });
    res.status(201).json(checklist);
  } catch (err) {
    next(err);
  }
};

// GET /api/checklists/:id
exports.getChecklist = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};

// PUT /api/checklists/:id
exports.updateChecklist = async (req, res, next) => {
  try {
    const { title, description, color, items } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (color !== undefined) update.color = color;
    if (items !== undefined) update.items = items;

    const checklist = await Checklist.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/checklists/:id
exports.deleteChecklist = async (req, res, next) => {
  try {
    const checklist = await Checklist.findByIdAndDelete(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });
    res.json({ message: 'Checklist deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/checklists/:id/items
exports.addItem = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    const { text, priority, dueDate } = req.body;
    const order = checklist.items.length;
    checklist.items.push({ text, priority, dueDate, order });
    await checklist.save();
    res.status(201).json(checklist);
  } catch (err) {
    next(err);
  }
};

// PUT /api/checklists/:id/items/:itemId
exports.updateItem = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    const item = checklist.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { text, completed, priority, dueDate, order } = req.body;
    if (text !== undefined) item.text = text;
    if (completed !== undefined) item.completed = completed;
    if (priority !== undefined) item.priority = priority;
    if (dueDate !== undefined) item.dueDate = dueDate;
    if (order !== undefined) item.order = order;

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/checklists/:id/items/:itemId
exports.deleteItem = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    const item = checklist.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    checklist.items.pull(req.params.itemId);
    await checklist.save();
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/checklists/:id/items/:itemId/toggle
exports.toggleItem = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });

    const item = checklist.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.completed = !item.completed;
    await checklist.save();
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};
