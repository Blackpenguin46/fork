#!/usr/bin/env node

/**
 * Supabase CLI Helper
 * Direct access to your Supabase backend data
 */

const { execSync } = require('child_process');

// Your Supabase configuration
const SUPABASE_URL = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const HEADERS = `-H "apikey: ${SERVICE_ROLE_KEY}" -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"`;

function executeQuery(endpoint, options = '') {
  const cmd = `curl -s ${HEADERS} "${SUPABASE_URL}/rest/v1/${endpoint}${options}" | jq .`;
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error('Error executing query:', error.message);
    return null;
  }
}

function showHelp() {
  console.log(`
🔥 Cybernex Academy Supabase CLI Helper

USAGE:
  node scripts/supabase-cli.js [command] [options]

COMMANDS:
  tables              List all available tables
  profiles           Show all user profiles  
  resources          Show all resources
  categories         Show all categories
  count [table]      Count rows in table
  search [term]      Search resources by title/description
  stats              Show database statistics
  
EXAMPLES:
  node scripts/supabase-cli.js profiles
  node scripts/supabase-cli.js count resources
  node scripts/supabase-cli.js search "cybersecurity"
  
DIRECT QUERIES:
  You can also run direct REST API queries:
  curl -s ${HEADERS} "${SUPABASE_URL}/rest/v1/[table]?select=*" | jq .
  `);
}

function listTables() {
  console.log('📊 Available Tables in your Supabase Database:\n');
  console.log('• profiles - User profiles and account information');
  console.log('• resources - Learning resources and content');
  console.log('• categories - Content categorization');
  console.log('• learning_paths - Structured learning journeys');
  console.log('• user_progress - User learning progress tracking');
  console.log('• user_bookmarks - User saved resources');
  console.log('• user_likes - User liked content');
  console.log('• subscriptions - User subscription data');
  console.log('• payment_history - Payment transaction records');
  console.log('• resource_views - Content analytics');
  console.log('• search_queries - Search analytics');
  console.log('• user_preferences - User settings');
  console.log('\nUse specific commands to view data from each table.');
}

function showStats() {
  console.log('📈 Database Statistics:\n');
  
  const tables = ['profiles', 'resources', 'categories', 'learning_paths', 'user_progress'];
  
  tables.forEach(table => {
    try {
      const result = executeQuery(`${table}?select=count`);
      if (result) {
        const count = JSON.parse(result)[0]?.count || 'N/A';
        console.log(`${table.padEnd(20)} ${count} records`);
      }
    } catch (e) {
      console.log(`${table.padEnd(20)} Error counting`);
    }
  });
}

function searchResources(term) {
  console.log(`🔍 Searching resources for: "${term}"\n`);
  const result = executeQuery(`resources?select=title,description,url,resource_type&or=(title.ilike.*${term}*,description.ilike.*${term}*)&limit=10`);
  if (result) {
    const resources = JSON.parse(result);
    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title}`);
      console.log(`   Type: ${resource.resource_type}`);
      console.log(`   URL: ${resource.url}`);
      console.log(`   Description: ${resource.description?.substring(0, 100)}...`);
      console.log('');
    });
  }
}

function countRows(table) {
  console.log(`📊 Counting rows in ${table}...\n`);
  const result = executeQuery(`${table}?select=count`);
  if (result) {
    const count = JSON.parse(result)[0]?.count || 0;
    console.log(`Total records in ${table}: ${count}`);
  }
}

// Main CLI logic
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'tables':
    listTables();
    break;
    
  case 'profiles':
    console.log('👥 User Profiles:\n');
    console.log(executeQuery('profiles?select=*'));
    break;
    
  case 'resources':
    console.log('📚 Resources:\n');
    console.log(executeQuery('resources?select=title,resource_type,difficulty_level,is_premium,is_featured&limit=20'));
    break;
    
  case 'categories':
    console.log('📂 Categories:\n');
    console.log(executeQuery('categories?select=name,slug,description,parent_category_id&order=sort_order'));
    break;
    
  case 'count':
    if (arg) {
      countRows(arg);
    } else {
      console.log('Please specify a table name. Usage: node scripts/supabase-cli.js count [table]');
    }
    break;
    
  case 'search':
    if (arg) {
      searchResources(arg);
    } else {
      console.log('Please specify a search term. Usage: node scripts/supabase-cli.js search [term]');
    }
    break;
    
  case 'stats':
    showStats();
    break;
    
  default:
    showHelp();
}