const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllAds = async (req, res) => {
    try {
        const [ads] = await pool.query('SELECT * FROM ads ORDER BY created_at DESC');
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createAd = async (req, res) => {
    const { headline, url } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    if (!headline || !url || !image) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newAd = {
            id: `ad-${uuidv4()}`,
            headline,
            url,
            image,
        };
        await pool.query('INSERT INTO ads SET ?', newAd);
        res.status(201).json(newAd);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAd = async (req, res) => {
    const { id } = req.params;
    const { headline, url } = req.body;
    
    try {
        const [ads] = await pool.query('SELECT * FROM ads WHERE id = ?', [id]);
        if (ads.length === 0) return res.status(404).json({ message: 'Ad not found' });

        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || ads[0].image;

        const updatedAd = { headline, url, image };
        await pool.query('UPDATE ads SET ? WHERE id = ?', [updatedAd, id]);
        res.json({ id, ...updatedAd });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAd = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM ads WHERE id = ?', [id]);
        res.json({ message: 'Ad deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllAds, createAd, updateAd, deleteAd };