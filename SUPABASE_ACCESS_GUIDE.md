# 🔥 Complete Supabase CLI Access Guide

## Your Supabase Setup ✅

- **Project ID**: `vxxpwaloyrtwvpmatzpc`
- **Project URL**: `https://vxxpwaloyrtwvpmatzpc.supabase.co`
- **Dashboard**: [Web Interface](https://supabase.com/dashboard/project/vxxpwaloyrtwvpmatzpc)
- **CLI**: Linked and ready to use

---

## 1. Official Supabase CLI Commands

### Basic Commands
```bash
# Show project status
npx supabase status

# List all projects
npx supabase projects list

# Generate types
npx supabase gen types typescript --project-id vxxpwaloyrtwvpmatzpc

# Database commands (requires Docker)
npx supabase start          # Start local development
npx supabase db reset       # Reset local database
npx supabase db diff        # Show schema differences
```

### Migration Commands
```bash
# Create new migration
npx supabase migration new your_migration_name

# Apply migrations to remote
npx supabase db push

# Pull schema from remote
npx supabase db pull
```

---

## 2. Custom CLI Tools (Created for You)

### Quick Access via npm scripts:
```bash
npm run supabase          # Show help
npm run db:profiles       # Show user profiles
npm run db:resources      # Show resources
npm run db:categories     # Show categories
npm run db:stats          # Database statistics
npm run db:tables         # List all tables
```

### Direct script usage:
```bash
# Basic CLI
node scripts/supabase-cli.js [command]

# Advanced Admin Tool
node scripts/supabase-admin.js [command]
```

### Available Commands:

#### Basic CLI (`supabase-cli.js`)
- `tables` - List all database tables
- `profiles` - Show user profiles
- `resources` - Show learning resources
- `categories` - Show content categories
- `count [table]` - Count rows in table
- `search [term]` - Search resources
- `stats` - Database statistics

#### Advanced Admin (`supabase-admin.js`)
- `analytics` - Detailed analytics dashboard
- `export [table]` - Export table to JSON
- `export-csv [table]` - Export table to CSV
- `backup` - Create full database backup
- `activity` - Show recent activity
- `raw [table]` - Show raw table data
- `schema` - Database schema info

---

## 3. Direct REST API Access

### Base URL and Headers
```bash
URL="https://vxxpwaloyrtwvpmatzpc.supabase.co/rest/v1"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg"
HEADERS="-H 'apikey: $KEY' -H 'Authorization: Bearer $KEY'"
```

### Common Queries
```bash
# Get all resources
curl -s $HEADERS "$URL/resources?select=*" | jq .

# Get featured resources
curl -s $HEADERS "$URL/resources?select=*&is_featured=eq.true" | jq .

# Get resources by type
curl -s $HEADERS "$URL/resources?select=*&resource_type=eq.course" | jq .

# Search resources
curl -s $HEADERS "$URL/resources?select=*&title=ilike.*cybersecurity*" | jq .

# Get categories with hierarchy
curl -s $HEADERS "$URL/categories?select=*&order=sort_order" | jq .

# Count records
curl -s $HEADERS "$URL/resources?select=count" | jq .

# Get user profiles
curl -s $HEADERS "$URL/profiles?select=*" | jq .
```

### CRUD Operations
```bash
# Create new resource
curl -X POST $HEADERS \
  -H "Content-Type: application/json" \
  -d '{"title":"New Resource","resource_type":"article"}' \
  "$URL/resources"

# Update resource
curl -X PATCH $HEADERS \
  -H "Content-Type: application/json" \
  -d '{"is_featured":true}' \
  "$URL/resources?id=eq.RESOURCE_ID"

# Delete resource
curl -X DELETE $HEADERS "$URL/resources?id=eq.RESOURCE_ID"
```

---

## 4. Database Tables Overview

### Core Tables
- **`profiles`** - User accounts and settings
- **`resources`** - Learning content (639 records)
- **`categories`** - Content organization (32 records)
- **`learning_paths`** - Structured learning journeys
- **`user_progress`** - Learning progress tracking
- **`user_bookmarks`** - Saved content
- **`user_likes`** - User liked content

### Analytics Tables
- **`resource_views`** - Content view tracking
- **`search_queries`** - Search analytics
- **`user_preferences`** - User settings

### Subscription Tables
- **`subscriptions`** - User subscription data
- **`payment_history`** - Payment records

---

## 5. Current Database Stats

- **Total Resources**: 639
- **Categories**: 32 (5 top-level, 27 sub-categories)
- **Resource Types**: community, tool, documentation, article, course, cheatsheet, podcast, video
- **Difficulty Levels**: beginner (566), intermediate (13), advanced (18), expert (42)
- **Premium Content**: 4 resources
- **Featured Content**: 18 resources

---

## 6. Quick Examples

### View popular resources:
```bash
npm run supabase search "TryHackMe"
```

### Get analytics:
```bash
node scripts/supabase-admin.js analytics
```

### Export data:
```bash
node scripts/supabase-admin.js export resources > resources_backup.json
```

### Search and filter:
```bash
curl -s $HEADERS "$URL/resources?select=title,url&resource_type=eq.course&difficulty_level=eq.beginner&limit=10" | jq .
```

---

## 7. Web Dashboard Access

For visual database management:
**https://supabase.com/dashboard/project/vxxpwaloyrtwvpmatzpc**

Features:
- Table editor
- SQL editor  
- Real-time subscriptions
- Authentication management
- Storage management
- Edge functions
- API documentation

---

**You now have complete CLI access to your Supabase backend! 🚀**