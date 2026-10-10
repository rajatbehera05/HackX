import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWeightedScore, rankAndRecommendIdeas, SCORING_WEIGHTS } from '../services/ai/scoringService.js';
import { geminiProvider } from '../services/ai/geminiProvider.js';
import { memoryStore } from '../utils/memoryStore.js';
import app from '../server.js';
import http from 'node:http';

// ----------------------------------------------------
// 1. DETERMINISTIC SCORING ENGINE TESTS
// ----------------------------------------------------
test('Scoring Engine: Weights match specification exactly', () => {
  assert.equal(SCORING_WEIGHTS.feasibility, 0.25, 'Feasibility must be 25%');
  assert.equal(SCORING_WEIGHTS.innovation, 0.20, 'Innovation must be 20%');
  assert.equal(SCORING_WEIGHTS.impact, 0.20, 'Impact must be 20%');
  assert.equal(SCORING_WEIGHTS.demo, 0.15, 'Demo Potential must be 15%');
  assert.equal(SCORING_WEIGHTS.cost, 0.10, 'Cost must be 10%');
  assert.equal(SCORING_WEIGHTS.scalability, 0.10, 'Scalability must be 10%');

  const totalWeight = Object.values(SCORING_WEIGHTS).reduce((sum, w) => sum + w, 0);
  assert.equal(Math.round(totalWeight * 100) / 100, 1.0, 'Weights must sum to 100%');
});

test('Scoring Engine: Calculates score correctly on 10-100 scale', () => {
  const perfectIdea = {
    feasibility_score: 10,
    innovation_score: 10,
    impact_score: 10,
    demo_score: 10,
    cost_score: 10,
    scalability_score: 10,
  };
  assert.equal(calculateWeightedScore(perfectIdea), 100.0);

  const baselineIdea = {
    feasibility_score: 5,
    innovation_score: 5,
    impact_score: 5,
    demo_score: 5,
    cost_score: 5,
    scalability_score: 5,
  };
  assert.equal(calculateWeightedScore(baselineIdea), 50.0);

  // Mixed test
  const customIdea = {
    feasibility_score: 8, // 8 * 0.25 = 2.0
    innovation_score: 9, // 9 * 0.20 = 1.8
    impact_score: 7, // 7 * 0.20 = 1.4
    demo_score: 8, // 8 * 0.15 = 1.2
    cost_score: 9, // 9 * 0.10 = 0.9 (Lower cost = higher cost_score)
    scalability_score: 6, // 6 * 0.10 = 0.6
  };
  // sum = 2.0 + 1.8 + 1.4 + 1.2 + 0.9 + 0.6 = 7.9 -> 79.0
  assert.equal(calculateWeightedScore(customIdea), 79.0);
});

test('Scoring Engine: Ranks ideas deterministically and tags top pick', () => {
  const ideas = [
    { id: '1', title: 'Idea A', feasibilityScore: 6, innovationScore: 6, impactScore: 6, demoScore: 6, costScore: 6, scalabilityScore: 6 },
    { id: '2', title: 'Idea B (Winner)', feasibilityScore: 9, innovationScore: 9, impactScore: 9, demoScore: 9, costScore: 9, scalabilityScore: 9 },
    { id: '3', title: 'Idea C', feasibilityScore: 7, innovationScore: 7, impactScore: 7, demoScore: 7, costScore: 7, scalabilityScore: 7 },
  ];

  const ranked = rankAndRecommendIdeas(ideas);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].id, '2', 'Idea B must rank #1');
  assert.equal(ranked[0].is_recommended, true, 'Top ranked idea must be recommended');
  assert.equal(ranked[1].is_recommended, false);
  assert.equal(ranked[2].is_recommended, false);
});

// ----------------------------------------------------
// 2. GEMINI PROVIDER & JSON SALVAGING TESTS
// ----------------------------------------------------
test('Gemini Provider: Cleans markdown fenced JSON blocks', () => {
  const markdownFenced = '```json\n{"summary": "Test", "domain": "Healthcare"}\n```';
  const cleaned = geminiProvider.cleanJsonText(markdownFenced);
  assert.equal(cleaned, '{"summary": "Test", "domain": "Healthcare"}');

  const genericFence = '```\n{"key": "value"}\n```';
  assert.equal(geminiProvider.cleanJsonText(genericFence), '{"key": "value"}');
});

test('Gemini Provider: Fails informatively when GEMINI_API_KEY is missing', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    geminiProvider.apiKey = '';
    assert.equal(geminiProvider.isConfigured(), false);

    await assert.rejects(
      async () => {
        await geminiProvider.generateJson({ systemPrompt: 'test', userPrompt: 'test' });
      },
      /Gemini API key is not configured/
    );
  } finally {
    process.env.GEMINI_API_KEY = originalKey || '';
  }
});

// ----------------------------------------------------
// 3. MEMORY STORE & MULTI-TENANT ISOLATION TESTS
// ----------------------------------------------------
test('Memory Store: Isolates projects by user and enforces ownership', () => {
  const projUserA = memoryStore.createProject({
    userId: 'user-a',
    problemStatement: 'Problem for User A healthcare project',
  });

  const projUserB = memoryStore.createProject({
    userId: 'user-b',
    problemStatement: 'Problem for User B fintech project',
  });

  // User A should only list User A's projects
  const listA = memoryStore.getProjects('user-a');
  assert.ok(listA.some((p) => p.id === projUserA.id));
  assert.ok(!listA.some((p) => p.id === projUserB.id));

  // User A can access own project
  const retrievedA = memoryStore.getProject(projUserA.id, 'user-a');
  assert.equal(retrievedA.id, projUserA.id);

  // User A CANNOT access User B's project (throws 403)
  assert.throws(() => {
    memoryStore.getProject(projUserB.id, 'user-a');
  }, /Forbidden/);

  // User A CANNOT delete User B's project
  assert.throws(() => {
    memoryStore.deleteProject(projUserB.id, 'user-a');
  }, /Forbidden/);

  // Cleanup
  memoryStore.deleteProject(projUserA.id, 'user-a');
  memoryStore.deleteProject(projUserB.id, 'user-b');
});

test('Memory Store: Normalizes analysis attributes for frontend contract', () => {
  const project = memoryStore.createProject({
    userId: 'user-test',
    problemStatement: 'Test statement for analysis normalization',
  });

  const saved = memoryStore.saveAnalysis(project.id, {
    summary: 'Normalized summary',
    domain: 'Healthcare',
    simpleExplanation: 'Simple explanation',
    targetUsers: ['Doctors', 'Nurses'],
    functionalRequirements: ['Real-time sync', 'Offline support'],
    technicalRequirements: ['SQLite', 'WebRTC'],
    constraints: ['Low bandwidth'],
    challenges: ['Packet loss'],
    difficulty: 'Hard',
    difficultyReason: 'High domain complexity',
    keywords: ['telehealth', 'webrtc'],
  });

  // Check both snake_case and camelCase exist
  assert.equal(saved.simple_explanation, 'Simple explanation');
  assert.equal(saved.simpleExplanation, 'Simple explanation');
  assert.deepEqual(saved.functional_requirements, ['Real-time sync', 'Offline support']);
  assert.deepEqual(saved.target_users, ['Doctors', 'Nurses']);

  // Check project retrieval includes analysis
  const full = memoryStore.getProject(project.id, 'user-test');
  assert.ok(full.analysis);
  assert.equal(full.analysis.domain, 'Healthcare');

  memoryStore.deleteProject(project.id, 'user-test');
});

// ----------------------------------------------------
// 4. HTTP API & AUTHENTICATION END-TO-END TESTS
// ----------------------------------------------------
test('HTTP API: Health endpoint returns explicit status', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok('storageMode' in data);
  }  finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('HTTP API: Protected routes enforce 401 Unauthorized without token', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // 1. GET /api/projects without token
    const resGet = await fetch(`http://localhost:${port}/api/projects`);
    assert.equal(resGet.status, 401, 'Unauthenticated GET /api/projects must be 401');

    // 2. POST /api/projects without token
    const resPost = await fetch(`http://localhost:${port}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemStatement: 'Test without token' }),
    });
    assert.equal(resPost.status, 401, 'Unauthenticated POST /api/projects must be 401');

    // 3. POST /api/ai/projects/:id/analyze without token
    const resAi = await fetch(`http://localhost:${port}/api/ai/projects/some-id/analyze`, {
      method: 'POST',
    });
    assert.equal(resAi.status, 401, 'Unauthenticated AI route must be 401');
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('HTTP API: Authenticated requests succeed and isolate user data', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const tokenA = 'Bearer dev-token-alice';
    const tokenB = 'Bearer dev-token-bob';

    // Alice creates a project
    const createRes = await fetch(`http://localhost:${port}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokenA,
      },
      body: JSON.stringify({
        title: 'Alice TeleHealth Plan',
        problemStatement: 'Low-bandwidth teleconsultations for rural healthcare clinics',
        teamSize: '3',
        developmentTime: '24 hours',
      }),
    });

    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    const aliceProjectId = created.project.id;
    assert.ok(aliceProjectId);

    // Alice can fetch it
    const getAliceRes = await fetch(`http://localhost:${port}/api/projects/${aliceProjectId}`, {
      headers: { Authorization: tokenA },
    });
    assert.equal(getAliceRes.status, 200);

    // Bob CANNOT access Alice's project (403 Forbidden)
    const getBobRes = await fetch(`http://localhost:${port}/api/projects/${aliceProjectId}`, {
      headers: { Authorization: tokenB },
    });
    assert.equal(getBobRes.status, 403, 'Cross-user access must be 403 Forbidden');

    // Nonexistent project returns 404
    const notFoundRes = await fetch(`http://localhost:${port}/api/projects/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: tokenA },
    });
    assert.equal(notFoundRes.status, 404);

    // Alice can update her project
    const updateRes = await fetch(`http://localhost:${port}/api/projects/${aliceProjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokenA,
      },
      body: JSON.stringify({
        title: 'Alice Updated TeleHealth Plan',
        budget: '$150 student credits',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.project.title, 'Alice Updated TeleHealth Plan');
    assert.equal(updated.project.budget, '$150 student credits');

    // Bob CANNOT update Alice's project (403 Forbidden)
    const bobUpdateRes = await fetch(`http://localhost:${port}/api/projects/${aliceProjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokenB,
      },
      body: JSON.stringify({ title: 'Hacked by Bob' }),
    });
    assert.equal(bobUpdateRes.status, 403, 'Cross-user project update must be forbidden');

    // Alice can delete her project
    const delRes = await fetch(`http://localhost:${port}/api/projects/${aliceProjectId}`, {
      method: 'DELETE',
      headers: { Authorization: tokenA },
    });
    assert.equal(delRes.status, 200);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});
