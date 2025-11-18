/**
 * Seed Sample Admin Activities
 * This script creates sample activity records for testing the dashboard
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const sampleActivities = [
  {
    action_type: 'car_added',
    action_title: 'New car added',
    action_details: '2024 Tata Nexon EV Max',
    entity_type: 'car',
    metadata: { source: 'manual' }
  },
  {
    action_type: 'car_import',
    action_title: 'Cars imported from CSV',
    action_details: 'Bulk import completed successfully',
    entity_type: 'car',
    metadata: { count: 50, source: 'csv' }
  },
  {
    action_type: 'lead_assigned',
    action_title: 'Lead assigned',
    action_details: 'Rajesh Kumar - Swift inquiry',
    entity_type: 'lead',
    metadata: { priority: 'high' }
  },
  {
    action_type: 'content_published',
    action_title: 'Article published',
    action_details: 'Electric Vehicle Sales Surge in India',
    entity_type: 'content',
    metadata: { category: 'news' }
  },
  {
    action_type: 'car_updated',
    action_title: 'Price updated',
    action_details: 'Hyundai Creta variants - pricing revised',
    entity_type: 'car',
    metadata: { count: 12 }
  },
  {
    action_type: 'dealer_registered',
    action_title: 'New dealer registered',
    action_details: 'Prime Motors, Chennai',
    entity_type: 'dealer',
    metadata: { location: 'Chennai' }
  }
];

async function seedActivities() {
  try {
    console.log('🌱 Seeding sample admin activities...');

    // First, check if table exists
    const { error: tableError } = await supabase
      .from('admin_activities')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table admin_activities does not exist. Please run the migration first:');
      console.log('   Execute the SQL in: supabase/migrations/20251118_create_admin_activities_table.sql');
      return;
    }

    // Insert sample activities with staggered timestamps
    const now = new Date();
    const activitiesWithTimestamps = sampleActivities.map((activity, index) => ({
      ...activity,
      created_at: new Date(now.getTime() - (index * 2 * 60 * 60 * 1000)).toISOString() // 2 hours apart
    }));

    const { data, error } = await supabase
      .from('admin_activities')
      .insert(activitiesWithTimestamps)
      .select();

    if (error) {
      console.error('❌ Error seeding activities:', error);
      return;
    }

    console.log(`✅ Successfully seeded ${data.length} sample activities!`);
    console.log('📊 Activities created:');
    data.forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.action_title} - ${activity.action_details}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedActivities();
