const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxxpwaloyrtwvpmatzpc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHB3YWxveXJ0d3ZwbWF0enBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDE2MDQ2NCwiZXhwIjoyMDU1NzM2NDY0fQ.fGkdJtl-URtl4CXBdqph8TSGYU6ArSdvJB9e27j9rRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFullSchema() {
  try {
    console.log('=== CYBERNEX ACADEMY DATABASE SCHEMA ===\n');
    
    const existingTables = [
      'profiles',
      'categories', 
      'learning_paths',
      'subscriptions',
      'user_progress',
      'resources',
      'tags'
    ];

    for (const tableName of existingTables) {
      try {
        console.log(`\n🔷 ${tableName.toUpperCase()} TABLE:`);
        console.log('=' .repeat(50));
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error && data !== null) {
          if (data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log(`Columns (${columns.length}):`, columns.join(', '));
            
            // Show sample data structure
            console.log('\nSample record structure:');
            const sample = data[0];
            for (const [key, value] of Object.entries(sample)) {
              const type = typeof value;
              const displayValue = value === null ? 'NULL' : 
                                 type === 'string' ? `"${value.length > 50 ? value.substring(0, 50) + '...' : value}"` : 
                                 String(value);
              console.log(`  ${key}: ${displayValue} (${type})`);
            }
          } else {
            console.log('Table exists but is empty');
          }
        } else {
          console.log(`Error accessing table: ${error?.message || 'Unknown error'}`);
        }
      } catch (e) {
        console.log(`❌ ${tableName} table check failed:`, e.message);
      }
    }

    // Let's also check what policies exist on these tables
    console.log('\n\n🔐 CHECKING RLS POLICIES...');
    console.log('=' .repeat(50));
    
    try {
      const { data: policies, error } = await supabase
        .rpc('get_policies'); // This might not work, but let's try
      
      if (!error && policies) {
        console.log('Found policies:', policies);
      } else {
        console.log('Could not retrieve policies (this is normal)');
      }
    } catch (e) {
      console.log('RLS policy check not available via client');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

getFullSchema();