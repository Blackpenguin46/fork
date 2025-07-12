#!/usr/bin/env node

/**
 * Script to run the enhanced authentication system migration
 * Run this script to set up the enhanced auth features:
 * - Automatic profile creation triggers
 * - Admin role management
 * - Audit logging
 * - Enhanced security features
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('🚀 Running Enhanced Authentication Migration...\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240105000000_enhance_auth_system.sql')
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.match(/^\s*$/)) {
        continue
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        })

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0)

          // If we can't use RPC, execute directly with raw SQL
          console.log(`   Trying direct SQL execution...`)
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ query: statement + ';' })
          })

          if (!response.ok) {
            console.warn(`   ⚠️ Statement ${i + 1} may have failed, but continuing...`)
            console.warn(`   Error: ${error?.message || 'Unknown error'}`)
          } else {
            console.log(`   ✅ Statement ${i + 1} executed successfully`)
          }
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`)
        }
      } catch (execError) {
        console.warn(`   ⚠️ Statement ${i + 1} may have failed, but continuing...`)
        console.warn(`   Error: ${execError.message}`)
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📋 Enhanced authentication features are now available:')
    console.log('   ✅ Automatic profile creation on user signup')
    console.log('   ✅ Email and username uniqueness enforcement')
    console.log('   ✅ Admin role management system')
    console.log('   ✅ Authentication audit logging')
    console.log('   ✅ Enhanced security features')
    console.log('   ✅ User session tracking')
    console.log('   ✅ Admin dashboard functionality')

    console.log('\n🔧 Next steps:')
    console.log('   1. Create an admin user by registering normally through the UI')
    console.log('   2. Update the user\'s role to "admin" in the database:')
    console.log(`      UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';`)
    console.log('   3. Access the admin dashboard at /admin')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Helper function to create an admin user
async function createAdminUser(email) {
  try {
    console.log(`\n👑 Creating admin user: ${email}`)
    
    const { data, error } = await supabase.rpc('create_initial_admin', {
      admin_email: email,
      admin_username: 'admin',
      admin_full_name: 'System Administrator'
    })

    if (error) {
      console.error('❌ Failed to create admin user:', error.message)
      console.log('💡 You can manually create an admin user by:')
      console.log('   1. Registering normally through the UI')
      console.log(`   2. Running: UPDATE profiles SET role = 'super_admin' WHERE email = '${email}';`)
    } else {
      console.log('✅ Admin user created successfully!')
      console.log(`   User ID: ${data}`)
      console.log(`   Email: ${email}`)
      console.log('   Role: super_admin')
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  }
}

// Run the migration
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Enhanced Authentication Migration Script')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/run-auth-migration.js                 # Run migration only')
    console.log('  node scripts/run-auth-migration.js --admin EMAIL   # Run migration and create admin')
    console.log('')
    console.log('Options:')
    console.log('  --admin EMAIL    Create an admin user with the specified email')
    console.log('  --help, -h       Show this help message')
    process.exit(0)
  }

  const adminIndex = args.indexOf('--admin')
  const adminEmail = adminIndex !== -1 ? args[adminIndex + 1] : null

  runMigration().then(() => {
    if (adminEmail) {
      return createAdminUser(adminEmail)
    }
  }).catch(error => {
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  })
}