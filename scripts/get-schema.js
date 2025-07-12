const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Checking available tables...\n');
    
    const tables = [
      'profiles',
      'users',
      'posts',
      'comments',
      'categories',
      'learning_paths',
      'courses',
      'lessons',
      'progress',
      'achievements',
      'bookmarks',
      'subscriptions',
      'payments',
      'meetings',
      'notifications',
      'user_achievements',
      'user_progress',
      'resources',
      'tags',
      'content'
    ];

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error && data !== null) {
          console.log(`✅ ${tableName} table exists`);
          if (data.length > 0) {
            console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          }
        } else if (error?.code === '42P01') {
          console.log(`❌ ${tableName} table does not exist`);
        } else {
          console.log(`⚠️  ${tableName} table exists but has access issues:`, error?.message || 'Unknown error');
        }
      } catch (e) {
        console.log(`❌ ${tableName} table check failed:`, e.message);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();