#!/usr/bin/env node

/**
 * Advanced Supabase Admin Tool
 * Complete database management and analytics
 */

const { execSync } = require('child_process');

const SUPABASE_URL = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const HEADERS = `-H "apikey: ${SERVICE_ROLE_KEY}" -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"`;

function executeQuery(endpoint, options = '') {
  const cmd = `curl -s ${HEADERS} "${SUPABASE_URL}/rest/v1/${endpoint}${options}"`;
  try {
    const result = execSync(cmd, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error executing query:', error.message);
    return null;
  }
}

function insertData(table, data) {
  const cmd = `curl -s -X POST ${HEADERS} -H "Content-Type: application/json" -d '${JSON.stringify(data)}' "${SUPABASE_URL}/rest/v1/${table}"`;
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error('Error inserting data:', error.message);
    return null;
  }
}

function updateData(table, id, data) {
  const cmd = `curl -s -X PATCH ${HEADERS} -H "Content-Type: application/json" -d '${JSON.stringify(data)}' "${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}"`;
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error('Error updating data:', error.message);
    return null;
  }
}

function deleteData(table, id) {
  const cmd = `curl -s -X DELETE ${HEADERS} "${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}"`;
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error('Error deleting data:', error.message);
    return null;
  }
}

function showAnalytics() {
  console.log('📊 Cybernex Academy Analytics Dashboard\n');
  
  // Resource analytics
  const resources = executeQuery('resources', '?select=resource_type,difficulty_level,is_premium,is_featured');
  if (resources) {
    console.log('📚 Resource Breakdown:');
    const types = {};
    const difficulty = {};
    let premium = 0, featured = 0;
    
    resources.forEach(r => {
      types[r.resource_type] = (types[r.resource_type] || 0) + 1;
      difficulty[r.difficulty_level] = (difficulty[r.difficulty_level] || 0) + 1;
      if (r.is_premium) premium++;
      if (r.is_featured) featured++;
    });
    
    console.log('   By Type:');
    Object.entries(types).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });
    
    console.log('   By Difficulty:');
    Object.entries(difficulty).forEach(([level, count]) => {
      console.log(`     ${level}: ${count}`);
    });
    
    console.log(`   Premium: ${premium}, Featured: ${featured}`);
    console.log('');
  }
  
  // Category analytics  
  const categories = executeQuery('categories', '?select=name,parent_category_id');
  if (categories) {
    const topLevel = categories.filter(c => !c.parent_category_id).length;
    const subCategories = categories.filter(c => c.parent_category_id).length;
    console.log(`📂 Categories: ${topLevel} top-level, ${subCategories} sub-categories\n`);
  }
}

function exportData(table, format = 'json') {
  console.log(`📤 Exporting ${table} data...\n`);
  const data = executeQuery(table, '?select=*');
  
  if (data) {
    if (format === 'csv') {
      // Convert to CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        console.log(headers.join(','));
        data.forEach(row => {
          console.log(headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','));
        });
      }
    } else {
      // JSON format
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

function backupDatabase() {
  console.log('💾 Creating database backup...\n');
  
  const tables = ['categories', 'resources', 'learning_paths', 'profiles'];
  const backup = {
    timestamp: new Date().toISOString(),
    data: {}
  };
  
  tables.forEach(table => {
    console.log(`Backing up ${table}...`);
    backup.data[table] = executeQuery(table, '?select=*');
  });
  
  const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
  require('fs').writeFileSync(filename, JSON.stringify(backup, null, 2));
  console.log(`✅ Backup saved to ${filename}`);
}

function showRecentActivity() {
  console.log('🕒 Recent Activity:\n');
  
  // Recent resources
  const recentResources = executeQuery('resources', '?select=title,created_at,resource_type&order=created_at.desc&limit=5');
  if (recentResources) {
    console.log('📚 Recently Added Resources:');
    recentResources.forEach(r => {
      console.log(`   ${r.title} (${r.resource_type}) - ${new Date(r.created_at).toLocaleDateString()}`);
    });
    console.log('');
  }
  
  // View analytics (if available)
  const views = executeQuery('resource_views', '?select=resource_id,viewed_at&order=viewed_at.desc&limit=5');
  if (views && views.length > 0) {
    console.log('👀 Recent Views:');
    views.forEach(v => {
      console.log(`   Resource ${v.resource_id} - ${new Date(v.viewed_at).toLocaleDateString()}`);
    });
    console.log('');
  }
}

function showHelp() {
  console.log(`
🔥 Cybernex Academy Advanced Supabase Admin Tool

COMMANDS:
  analytics          Show detailed analytics dashboard
  export [table]     Export table data to JSON
  export-csv [table] Export table data to CSV
  backup            Create full database backup  
  activity          Show recent activity
  raw [table]       Show raw table data
  schema            Show database schema info
  
CRUD OPERATIONS:
  create [table]    Create new record (interactive)
  update [table] [id] Update record (interactive)  
  delete [table] [id] Delete record
  
EXAMPLES:
  node scripts/supabase-admin.js analytics
  node scripts/supabase-admin.js export resources
  node scripts/supabase-admin.js backup
  node scripts/supabase-admin.js activity
  `);
}

// Main CLI logic
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'analytics':
    showAnalytics();
    break;
    
  case 'export':
    if (arg1) {
      exportData(arg1, 'json');
    } else {
      console.log('Please specify a table name.');
    }
    break;
    
  case 'export-csv':
    if (arg1) {
      exportData(arg1, 'csv');
    } else {
      console.log('Please specify a table name.');
    }
    break;
    
  case 'backup':
    backupDatabase();
    break;
    
  case 'activity':
    showRecentActivity();
    break;
    
  case 'raw':
    if (arg1) {
      const data = executeQuery(arg1, '?select=*&limit=10');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Please specify a table name.');
    }
    break;
    
  case 'schema':
    console.log('📋 Database Schema Information:\n');
    console.log('Main Tables:');
    console.log('• profiles (User accounts and settings)');
    console.log('• resources (Learning content and materials)'); 
    console.log('• categories (Content organization)');
    console.log('• learning_paths (Structured learning journeys)');
    console.log('• user_progress (Learning progress tracking)');
    console.log('• user_bookmarks (Saved content)');
    console.log('• subscriptions (Payment and subscription data)');
    console.log('• resource_views (Analytics and metrics)');
    break;
    
  default:
    showHelp();
}