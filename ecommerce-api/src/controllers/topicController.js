const TopicService = require('../services/topicService');

const TopicController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const topics = await TopicService.getAll(filters);
            res.json(topics);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const topic = await TopicService.getById(req.params.id);
            if (!topic.length) return res.status(404).json({ message: 'Topic not found' });
            res.json(topic[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await TopicService.create(req.body);
            res.status(201).json({ id: result[0].insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await TopicService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await TopicService.delete(req.params.id);
            res.json({ message: 'Topic deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = TopicController;