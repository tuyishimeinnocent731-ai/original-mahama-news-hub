const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Define NAV_LINKS locally to decouple from frontend
const NAV_LINKS = [
    { name: "World", href: "#", sublinks: [
        { name: "Africa", href: "#" },
        { name: "Americas", href: "#" },
        { name: "Asia", href: "#" },
        { name: "Europe", href: "#" },
    ]},
    { name: "Politics", href: "#" },
    { name: "Business", href: "#", sublinks: [
        { name: "Markets", href: "#" },
        { name: "Companies", href: "#" },
    ]},
    { name: "Economy", href: "#" },
    { name: "Technology", href: "#", sublinks: [
        { name: "AI", href: "#" },
        { name: "Gadgets", href: "#" },
        { name: "Innovation", href: "#" },
    ]},
    { name: "Sport", href: "#", sublinks: [
        { name: "Football", href: "#" },
        { name: "Basketball", href: "#" },
        { name: "Tennis", href: "#" },
    ]},
    { name: "Entertainment", href: "#", sublinks: [
        { name: "Movies", href: "#" },
        { name: "Music", href: "#" },
        { name: "Gaming", href: "#" },
    ]},
    { name: "Video", href: "#" },
    { name: "Films & TV", href: "#" },
    { name: "Arts", href: "#" },
    { name: "History", href: "#" },
];


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

// --- Page Content Controllers ---
const getPage = async (req, res, next) => {
    try {
        const [pages] = await pool.query('SELECT slug, title, content, updated_at FROM pages WHERE slug = ?', [req.params.slug]);
        if (pages.length > 0) {
            res.json(pages[0]);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        next(error);
    }
};

const updatePage = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        await pool.query('UPDATE pages SET title = ?, content = ?, last_updated_by = ? WHERE slug = ?', [title, content, req.user.id, req.params.slug]);
        res.json({ message: 'Page updated successfully' });
    } catch (error) {
        next(error);
    }
};

// --- Contact Message Controllers ---
const submitContactMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }
        await pool.query('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
        res.status(201).json({ message: 'Thank you for your message. We will get back to you shortly.' });
    } catch (error) {
        next(error);
    }
};

const getContactMessages = async (req, res, next) => {
    try {
        const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

const updateContactMessage = async (req, res, next) => {
    try {
        const { is_read } = req.body;
        await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read, req.params.id]);
        res.json({ message: 'Message updated' });
    } catch (error) {
        next(error);
    }
};

const deleteContactMessage = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        next(error);
    }
};

// --- Job Posting Controllers ---
const getJobPostings = async (req, res, next) => {
    try {
        const [jobs] = await pool.query('SELECT * FROM job_postings WHERE is_active = TRUE ORDER BY created_at DESC');
        res.json(jobs);
    } catch (error) {
        next(error);
    }
};

const submitJobApplication = async (req, res, next) => {
    const { id: jobId } = req.params;
    const { name, email, cover_letter } = req.body;
    const resume_path = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    const user_id = req.user ? req.user.id : null;

    if (!name || !email || !resume_path) {
        return res.status(400).json({ message: 'Name, email, and resume are required.' });
    }

    try {
        const newApplication = { job_id: jobId, user_id, name, email, resume_path, cover_letter };
        await pool.query('INSERT INTO job_applications SET ?', newApplication);
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        next(error);
    }
};

// --- Admin Job Controllers ---
const createJobPosting = async (req, res, next) => {
    try {
        const { title, location, type, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO job_postings (title, location, type, description) VALUES (?, ?, ?, ?)',
            [title, location, type, description]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        next(error);
    }
};

const updateJobPosting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, location, type, description, is_active } = req.body;
        await pool.query(
            'UPDATE job_postings SET title = ?, location = ?, type = ?, description = ?, is_active = ? WHERE id = ?',
            [title, location, type, description, is_active, id]
        );
        res.json({ message: 'Job posting updated.' });
    } catch (error) {
        next(error);
    }
};

const deleteJobPosting = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM job_postings WHERE id = ?', [req.params.id]);
        res.json({ message: 'Job posting deleted.' });
    } catch (error) {
        next(error);
    }
};

const getJobApplications = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [applications] = await pool.query('SELECT * FROM job_applications WHERE job_id = ? ORDER BY applied_at DESC', [id]);
        res.json(applications);
    } catch (error) {
        next(error);
    }
};


module.exports = { 
    getNavLinks, 
    updateNavLinks, 
    getSiteSettings, 
    updateSiteSettings,
    getPage,
    updatePage,
    submitContactMessage,
    getContactMessages,
    updateContactMessage,
    deleteContactMessage,
    getJobPostings,
    submitJobApplication,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    getJobApplications,
};