import request from 'supertest';
import app from '../src/app.js';

describe('🌐 API Infrastructure Integration Suite', () => {
  test('GET /health - should return operational HTTP 200 verification status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.headers['access-control-allow-origin']).toBeDefined(); // Confirms native CORS execution
  });

  test('GET /unknown-route - should intercept missing resources with standard JSON 404 payload', async () => {
    const response = await request(app).get('/api/v1/invalid-destination-path');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
  });
});