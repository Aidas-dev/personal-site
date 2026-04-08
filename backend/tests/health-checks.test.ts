import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Health Check Endpoints', () => {
  describe('/health endpoint configuration', () => {
    it('should have /health endpoint defined in server.ts', () => {
      const fs = require('fs');
      const path = require('path');
      const serverPath = path.resolve(__dirname, '../src/server.ts');
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain('/health');
    });

    it('should respond with status ok', () => {
      const fs = require('fs');
      const path = require('path');
      const serverPath = path.resolve(__dirname, '../src/server.ts');
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain("status: 'ok'");
    });

    it('should include service identification', () => {
      const fs = require('fs');
      const path = require('path');
      const serverPath = path.resolve(__dirname, '../src/server.ts');
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain('service:');
    });
  });

  describe('Database health check configuration', () => {
    it('should have DATABASE_URL in config', () => {
      const mockModulePath = require('path').resolve(__dirname, '../node_modules/@medusajs/framework/utils/index.js');
      require.cache[mockModulePath] = {
        id: '@medusajs/framework/utils',
        filename: mockModulePath,
        loaded: true,
        exports: { defineConfig: (cfg: any) => cfg },
      };

      delete require.cache[require.resolve('../medusa-config.js')];
      const config = require('../medusa-config.js');

      expect(config.projectConfig.databaseUrl).toBeDefined();
      expect(config.projectConfig.databaseUrl).toMatch(/^postgres/);
    });

    it('should use CloudNativePG service URL pattern in env template', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      // Should use Kubernetes service DNS pattern
      expect(envContent).toMatch(/postgres.*riedu-eshop\.svc\.cluster\.local|medusa-postgres/);
    });

    it('should have PostgreSQL port 5432 in env template', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain(':5432');
    });
  });

  describe('Cache (DragonflyDB) health check configuration', () => {
    it('should have REDIS_URL in config', () => {
      const mockModulePath = require('path').resolve(__dirname, '../node_modules/@medusajs/framework/utils/index.js');
      require.cache[mockModulePath] = {
        id: '@medusajs/framework/utils',
        filename: mockModulePath,
        loaded: true,
        exports: { defineConfig: (cfg: any) => cfg },
      };

      delete require.cache[require.resolve('../medusa-config.js')];
      const config = require('../medusa-config.js');

      expect(config.projectConfig.redisUrl).toBeDefined();
      expect(config.projectConfig.redisUrl).toMatch(/^redis:\/\//);
    });

    it('should use DragonflyDB service URL pattern in env template', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('dragonfly');
    });

    it('should have Redis port 6379 in env template', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain(':6379');
    });
  });

  describe('Kubernetes deployment health checks', () => {
    it('should have livenessProbe configured in deployment manifest', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-backend/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      expect(deployContent).toContain('livenessProbe');
      expect(deployContent).toContain('/health');
    });

    it('should have readinessProbe configured in deployment manifest', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-backend/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      expect(deployContent).toContain('readinessProbe');
      expect(deployContent).toContain('/health');
    });

    it('should have reasonable initialDelaySeconds for liveness', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-backend/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      // Should give the app time to start
      expect(deployContent).toMatch(/initialDelaySeconds:\s*(30|[4-9]\d|\d{3,})/);
    });
  });

  describe('Dockerfile health check', () => {
    it('should have HEALTHCHECK instruction', () => {
      const fs = require('fs');
      const path = require('path');
      const dockerPath = path.resolve(__dirname, '../Dockerfile');
      const dockerContent = fs.readFileSync(dockerPath, 'utf-8');
      expect(dockerContent).toContain('HEALTHCHECK');
    });

    it('should check /health endpoint', () => {
      const fs = require('fs');
      const path = require('path');
      const dockerPath = path.resolve(__dirname, '../Dockerfile');
      const dockerContent = fs.readFileSync(dockerPath, 'utf-8');
      expect(dockerContent).toContain('/health');
    });

    it('should use wget or curl for health check', () => {
      const fs = require('fs');
      const path = require('path');
      const dockerPath = path.resolve(__dirname, '../Dockerfile');
      const dockerContent = fs.readFileSync(dockerPath, 'utf-8');
      expect(dockerContent).toMatch(/wget|curl/);
    });

    it('should have start-period for slow-starting containers', () => {
      const fs = require('fs');
      const path = require('path');
      const dockerPath = path.resolve(__dirname, '../Dockerfile');
      const dockerContent = fs.readFileSync(dockerPath, 'utf-8');
      expect(dockerContent).toContain('--start-period');
    });
  });
});
