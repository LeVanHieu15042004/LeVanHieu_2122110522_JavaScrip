const PostService = require('../services/postService');

const PostController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status,
            topic_id: req.query.topic_id
        };
        try {
            const posts = await PostService.getAll(filters);
            res.json(posts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const post = await PostService.getById(req.params.id);
            if (!post.length) return res.status(404).json({ message: 'Post not found' });
            res.json(post[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await PostService.create(req.body);
            res.status(201).json({ id: result[0].insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await PostService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await PostService.delete(req.params.id);
            res.json({ message: 'Post deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = PostController;