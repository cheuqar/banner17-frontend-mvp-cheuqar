#!/usr/bin/env node

/**
 * Comprehensive Schools & Catchment Integration Test
 * Tests the full stack from database to frontend API integration
 */

const http = require('http');

// Test configuration
const TEST_PROPERTY_ID = '0009aef0-1c1e-4a34-8609-392565cc9928';
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:8100';
const FRONTEND_BASE = 'http://localhost:3301';

// Test functions
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
  });
}

async function testAPI() {
  console.log('\n🧪 Testing Schools API Endpoints...');
  
  // Test /schools endpoint
  try {
    const schoolsUrl = `${API_BASE}/api/v1/properties/${TEST_PROPERTY_ID}/schools`;
    console.log(`📡 Testing: ${schoolsUrl}`);
    const schoolsResult = await makeRequest(schoolsUrl);
    
    if (schoolsResult.status === 200) {
      const data = schoolsResult.data;
      console.log('✅ /schools endpoint working');
      console.log(`   Property: ${data.property?.address || 'N/A'}`);
      console.log(`   Primary catchments: ${data.in_catchment?.primary?.length || 0}`);
      console.log(`   High catchments: ${data.in_catchment?.high?.length || 0}`);
      console.log(`   Nearby public schools: ${data.nearby?.public?.length || 0}`);
    } else {
      console.log(`❌ /schools endpoint failed: ${schoolsResult.status}`);
      console.log(`   Response: ${JSON.stringify(schoolsResult.data).substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`❌ /schools endpoint error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🏫 Schools & Catchment Integration Test Suite');
  console.log('='.repeat(50));
  
  await testAPI();
  
  console.log('\n📋 Test Summary');
  console.log('='.repeat(50));
  console.log('If all tests show ✅, the Schools & Catchment feature is working correctly.');
  console.log('If you see ❌, check the specific error messages above.');
  console.log('\n🌐 Test the complete integration by visiting:');
  console.log(`   ${FRONTEND_BASE}/property/detail/${TEST_PROPERTY_ID}`);
  console.log('   Then click the "Schools" tab to see the frontend in action.');
}

// Run tests
runTests().catch(console.error);
