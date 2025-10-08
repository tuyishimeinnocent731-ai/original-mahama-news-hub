const pool = require('../config/db');

const getDashboardStats = async (req, res, next) => {
    try {
        const [userStats] = await pool.query(`
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN subscription = 'free' THEN 1 ELSE 0 END) as free,
                SUM(CASE WHEN subscription = 'standard' THEN 1 ELSE 0 END) as standard,
                SUM(CASE WHEN subscription = 'premium' THEN 1 ELSE 0 END) as premium,
                SUM(CASE WHEN subscription = 'pro' THEN 1 ELSE 0 END) as pro
            FROM users
        `);

        const [articleStats] = await pool.query('SELECT COUNT(*) as totalArticles FROM articles');
        const [viewStats] = await pool.query('SELECT COUNT(*) as totalViews FROM article_views');
        const [adStats] = await pool.query('SELECT COUNT(*) as totalAds FROM ads');

        const [categoryDistribution] = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM articles 
            GROUP BY category 
            ORDER BY count DESC
        `);

        res.json({
            users: {
                total: userStats[0].totalUsers,
                subscriptions: {
                    free: userStats[0].free || 0,
                    standard: userStats[0].standard || 0,
                    premium: userStats[0].premium || 0,
                    pro: userStats[0].pro || 0,
                }
            },
            articles: {
                total: articleStats[0].totalArticles,
                totalViews: viewStats[0].totalViews || 0,
            },
            ads: {
                total: adStats[0].totalAds
            },
            content: {
                categoryDistribution
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
