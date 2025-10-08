// This function takes a flat user object from the database (joined with user_settings)
// and transforms it into the nested structure the frontend expects.
const formatUserFromDb = (dbUser) => {
    if (!dbUser) return null;

    const {
        id, name, email, avatar, bio, socials, subscription, two_factor_enabled, role,
        searchHistory, savedArticles, userAds, paymentHistory,
        ...settingsFields
    } = dbUser;

    const formattedUser = {
        id, name, email, avatar, bio, socials, subscription, two_factor_enabled, role,
        searchHistory: searchHistory || [],
        savedArticles: savedArticles || [],
        userAds: userAds || [],
        paymentHistory: paymentHistory || [],
        integrations: {}, // Assuming integrations are not yet in the main query
        settings: {
            theme: {
                name: settingsFields.theme_name,
                accent: settingsFields.theme_accent,
            },
            font: {
                family: settingsFields.font_family,
                weight: settingsFields.font_weight,
            },
            layout: {
                homepage: settingsFields.homepage_layout,
                density: settingsFields.content_density,
                infiniteScroll: !!settingsFields.infinite_scroll,
            },
            ui: {
                cardStyle: settingsFields.card_style,
                borderRadius: settingsFields.border_radius,
            },
            reading: {
                autoPlayAudio: !!settingsFields.auto_play_audio,
                defaultSummaryView: !!settingsFields.default_summary_view,
                lineHeight: settingsFields.line_height,
                letterSpacing: settingsFields.letter_spacing,
                justifyText: !!settingsFields.justify_text,
            },
            notifications: {
                breakingNews: !!settingsFields.notifications_breaking_news,
                weeklyDigest: !!settingsFields.notifications_weekly_digest,
                specialOffers: !!settingsFields.notifications_special_offers,
            },
            fontSize: settingsFields.font_size,
            highContrast: !!settingsFields.high_contrast,
            reduceMotion: !!settingsFields.reduce_motion,
            dyslexiaFont: !!settingsFields.dyslexia_font,
            dataSharing: !!settingsFields.data_sharing,
            adPersonalization: !!settingsFields.ad_personalization,
        }
    };
    return formattedUser;
}

// Re-usable query to get all user data
formatUserFromDb.userQuery = `
    SELECT u.*, us.*,
           (SELECT JSON_ARRAYAGG(sh.query) FROM (SELECT query FROM search_history WHERE user_id = u.id ORDER BY created_at DESC LIMIT 5) sh) as searchHistory,
           (SELECT JSON_ARRAYAGG(sa.article_id) FROM saved_articles sa WHERE sa.user_id = u.id) as savedArticles,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ad.id, 'headline', ad.headline, 'image', ad.image, 'url', ad.url)) FROM ads ad WHERE ad.user_id = u.id) as userAds,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ph.id, 'date', ph.date, 'plan', ph.plan, 'amount', ph.amount, 'method', ph.method, 'status', ph.status)) FROM payment_history ph WHERE ph.user_id = u.id ORDER BY ph.date DESC) as paymentHistory
    FROM users u
    LEFT JOIN user_settings us ON u.id = us.user_id
    WHERE u.id = ?
`;


module.exports = { formatUserFromDb };
