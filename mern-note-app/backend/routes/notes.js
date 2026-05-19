const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch notes', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = new Note({ title, content, user: req.user.id });
    const saved = await note.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Unable to create note', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Unable to update note', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Unable to delete note', error: error.message });
  }
});

module.exports = router;
