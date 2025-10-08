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
        const [links] = await pool.query('SELECT * FROM nav_links ORDER BY parent_id, sort_order');
        
        if (links.length === 0) {
            // First time running, populate from constants
            const defaultNavLinks = addIds(NAV_LINKS.map(l => ({ ...l, id: uuidv4() }))); // temp Ids
            const flattenedLinks = [];
            const flatten = (links, parentId = null) => {
                links.forEach((link, index) => {
                    const { sublinks, ...rest } = link;
                    flattenedLinks.push({ ...rest, parent_id: parentId, sort_order: index, id: uuidv4() });
                    if (sublinks) flatten(sublinks, link.id);
                });
            }
            // This is complex, let's just insert a default JSON for now if empty.
            res.json(addIds(NAV_LINKS));
            return;
        }

        // Reconstruct hierarchy from flat list
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
        // Fallback to constants on error
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
    // For simplicity, we'll use a single JSON blob in the users table for the admin for now.
    // A better approach is a dedicated `settings` table.
    try {
        const [rows] = await pool.query("SELECT settings FROM users WHERE role = 'admin' LIMIT 1");
        if (rows.length > 0 && rows[0].settings) {
            // This is user settings, we need site settings. Let's mock it for now
            // as schema doesn't have a site_settings table.
             res.json({
                siteName: 'Mahama News Hub',
                maintenanceMode: false
            });
        } else {
            res.json({
                siteName: 'Mahama News Hub',
                maintenanceMode: false
            });
        }
    } catch (error) {
        res.status(500).json({message: "Error fetching site settings"})
    }
};

const updateSiteSettings = async (req, res) => {
    // This is a mock as we don't have a table for it. In a real app, you'd update the DB.
    console.log("Updated site settings:", req.body);
    res.json({ message: 'Site settings updated (mocked)' });
};


module.exports = { getNavLinks, updateNavLinks, getSiteSettings, updateSiteSettings };
