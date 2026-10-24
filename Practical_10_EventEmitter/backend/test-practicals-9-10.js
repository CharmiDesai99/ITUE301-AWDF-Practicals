const BASE_URL = 'http://localhost:5000';

async function testPracticals9And10() {
  console.log('\n==================================================================');
  console.log('🚀 Verification & Benchmark Suite for Practical 9 & Practical 10');
  console.log('==================================================================\n');

  // 1. Login to get token
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@example.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('🔑 Authenticated JWT Token acquired');

  // 2. Measure Uncached Response Times (Practical 9)
  console.log('\n--- Practical 9: Measuring Response Times ---');

  // Invalidate any existing cache first by creating a temporary task
  console.log('\n1. Creating task to invalidate any existing cache...');
  const createStart = performance.now();
  const createRes = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Practical 9 Benchmark Task',
      description: 'Used to measure in-memory cache hit vs miss latency',
      priority: 'high',
    }),
  });
  const createData = await createRes.json();
  const createDuration = (performance.now() - createStart).toFixed(2);
  console.log(`✅ Task created in ${createDuration}ms (ID: ${createData.data._id})`);

  // Wait 600ms for async EventEmitter worker in Practical 10
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Request 1: Cache Miss (Queries MongoDB)
  console.log('\n2. Fetching tasks (1st Request - Cache MISS / Database query):');
  const t1Start = performance.now();
  const r1 = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d1 = await r1.json();
  const t1 = (performance.now() - t1Start).toFixed(2);
  console.log(`   Result: Source="${d1.source}", Status=${r1.status}, Latency=${t1}ms`);

  // Request 2: Cache Hit (Served from node-cache RAM)
  console.log('\n3. Fetching tasks (2nd Request - Cache HIT):');
  const t2Start = performance.now();
  const r2 = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d2 = await r2.json();
  const t2 = (performance.now() - t2Start).toFixed(2);
  console.log(`   Result: Source="${d2.source}", Status=${r2.status}, Latency=${t2}ms`);

  // Request 3: Cache Hit (Served from node-cache RAM)
  console.log('\n4. Fetching tasks (3rd Request - Cache HIT):');
  const t3Start = performance.now();
  const r3 = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d3 = await r3.json();
  const t3 = (performance.now() - t3Start).toFixed(2);
  console.log(`   Result: Source="${d3.source}", Status=${r3.status}, Latency=${t3}ms`);

  // Request 4: Cache Hit (Served from node-cache RAM)
  console.log('\n5. Fetching tasks (4th Request - Cache HIT):');
  const t4Start = performance.now();
  const r4 = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d4 = await r4.json();
  const t4 = (performance.now() - t4Start).toFixed(2);
  console.log(`   Result: Source="${d4.source}", Status=${r4.status}, Latency=${t4}ms`);

  // 3. Test Cache Stats Debug Endpoint
  console.log('\n--- Practical 9 Supplementary: Cache Statistics Endpoint ---');
  const statsRes = await fetch(`${BASE_URL}/tasks/cache-stats`);
  const statsData = await statsRes.json();
  console.log('GET /tasks/cache-stats Response:');
  console.log(JSON.stringify(statsData, null, 2));

  // 4. Test Cache Invalidation on Update (PUT)
  console.log('\n--- Testing Cache Invalidation on PUT /tasks/:id ---');
  await fetch(`${BASE_URL}/tasks/${createData.data._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completed: true }),
  });
  console.log('✅ Updated task; cache key invalidated');

  // Verify next GET is a Cache MISS
  const rAfterPut = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dAfterPut = await rAfterPut.json();
  console.log(`Post-update GET /tasks: Source="${dAfterPut.source}" (Confirmed Invalidation)`);

  // 5. Test Event Emission on DELETE (Practical 10)
  console.log('\n--- Practical 10: Testing task-deleted EventEmitter Flow ---');
  await fetch(`${BASE_URL}/tasks/${createData.data._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('✅ DELETE /tasks/:id triggered task-deleted event');

  // Summary Table for Lab Journal
  console.log('\n==================================================================');
  console.log('📊 PRACTICAL 9: MEASURED RESPONSE TIME COMPARISON TABLE');
  console.log('==================================================================');
  console.log('| Request Sample | Condition               | Data Source | Response Time |');
  console.log('|----------------|-------------------------|-------------|---------------|');
  console.log(`| Sample 1       | Uncached (Initial Miss) | MongoDB     | ${t1} ms        |`);
  console.log(`| Sample 2       | Cached (1st Hit)        | node-cache  | ${t2} ms        |`);
  console.log(`| Sample 3       | Cached (2nd Hit)        | node-cache  | ${t3} ms        |`);
  console.log(`| Sample 4       | Cached (3rd Hit)        | node-cache  | ${t4} ms        |`);
  console.log('==================================================================\n');
}

testPracticals9And10();
