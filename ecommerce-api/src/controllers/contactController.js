const ContactService = require('../services/contactService');

const ContactController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const contacts = await ContactService.getAll(filters);
            res.json(contacts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const contact = await ContactService.getById(req.params.id);
            if (!contact.length) return res.status(404).json({ message: 'Contact not found' });
            res.json(contact[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const insertId = await ContactService.create(req.body);
            res.status(201).json({ id: insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await ContactService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await ContactService.delete(req.params.id);
            res.json({ message: 'Contact deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ContactController;