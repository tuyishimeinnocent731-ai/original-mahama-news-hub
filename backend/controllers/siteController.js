const pool = require('../config/db');
const { NAV_LINKS } = require('../../constants'); // We'll borrow this from frontend for default structure
const { v4: uuidv4 } = require('uuid');

// In a real app, this would be in a shared lib or config
const addIds = (links, parentId = 'nav') => {
    return links.map((link, index) => {
        const id = `${parentId}-${link.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
        const newLink = { ...link, id };
        if (link.sublinks) {
            newLink.sublinks = addIds(link.sublinks, id);
        }
        return newLink;
    });
};


const getNavLinks = async (req, res) => {
    try {
        // This is a simplified implementation. A real one would reconstruct the hierarchy.
        // For now, we rely on the frontend constants as the source of truth if DB is empty.
        const [links] = await pool.query('SELECT * FROM nav_links');
        if (links.length === 0) {
            return res.json(addIds(NAV_LINKS));
        }

        const linkMap = {};
        links.forEach(link => linkMap[link.id] = { ...link, sublinks: [] });
        const topLevelLinks = [];
        links.forEach(link => {
            if (link.parent_id && linkMap[link.parent_id]) {
                linkMap[link.parent_id].sublinks.push(linkMap[link.id]);
            } else {
                topLevelLinks.push(linkMap[link.id]);
            }
        });
        res.json(topLevelLinks);
    } catch (error) {
        console.error(error);
        res.json(addIds(NAV_LINKS));
    }
};

const updateNavLinks = async (req, res) => {
    const links = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM nav_links');
        
        const flattenedLinks = [];
        const flattenAndPrepare = (linksToFlatten, parentId = null) => {
            linksToFlatten.forEach((link, index) => {
                const { sublinks, ...dbLink } = link;
                flattenedLinks.push([dbLink.id, dbLink.name, dbLink.href, parentId, index]);
                if (sublinks && sublinks.length > 0) {
                    flattenAndPrepare(sublinks, dbLink.id);
                }
            });
        }
        flattenAndPrepare(links);
        
        if (flattenedLinks.length > 0) {
            await connection.query(
                'INSERT INTO nav_links (id, name, href, parent_id, sort_order) VALUES ?',
                [flattenedLinks]
            );
        }

        await connection.commit();
        res.json({ message: 'Navigation updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Failed to update navigation' });
    } finally {
        connection.release();
    }
};

const getSiteSettings = async (req, res) => {
    try {
        const [settingsRows] = await pool.query("SELECT * FROM site_settings");
        const settings = settingsRows.reduce((acc, row) => {
            if (row.setting_value === 'true' || row.setting_value === 'false') {
                acc[row.setting_key] = row.setting_value === 'true';
            } else {
                acc[row.setting_key] = row.setting_value;
            }
            return acc;
        }, {});
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching site settings"})
    }
};

const updateSiteSettings = async (req, res) => {
    const newSettings = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const [key, value] of Object.entries(newSettings)) {
            await connection.query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value.toString(), value.toString()]
            );
        }
        await connection.commit();
        res.json({ message: 'Site settings updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Failed to update site settings' });
    } finally {
        connection.release();
    }
};


module.exports = { getNavLinks, updateNavLinks, getSiteSettings, updateSiteSettings };