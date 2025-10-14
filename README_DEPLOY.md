# Advanced Full-Stack Deployment Guide

1) Copy .env.example -> .env and fill DB_*, JWT_SECRET, VITE_API_URL, NEWSAPI_KEY/GNEWS_KEY, PUBLIC_API_KEY, REDIS_URL as needed.

2) Run DB migrations:
   mysql -u <user> -p <DB_NAME> < migrations/001_create_bookmarks_api_keys_and_fulltext.sql
   mysql -u <user> -p <DB_NAME> < migrations/002_create_user_views_and_activity.sql

   If ALTER TABLE FULLTEXT fails, remove that line and set USE_FULLTEXT=false in .env.

3) Install and build:
   cd backend && npm install
   cd .. && npm install
   npm run build

4) Start:
   cd backend && npm start
   (Or with docker-compose: docker-compose up --build -d)

5) Verify login/register redirect:
   - The LoginModal now calls onLogin(email,password). App.tsx handlers call handleCategorySelect('World') after auth. Register/login should redirect to the World category.

6) Test endpoints:
   - GET /api/search?q=term
   - GET /api/recommendations?userId=<id>
   - POST /api/external/sync (admin)
   - POST /api/analytics/view { articleId }

Notes:
- Review all new files and integrate carefully if you have existing customizations.
- Test in staging before production.
