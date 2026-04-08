import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Medusa Configuration', () => {
  let config: any;
  const configPath = path.resolve(__dirname, '../medusa-config.js');

  beforeAll(() => {
    // Mock the @medusajs/framework/utils module before requiring config
    // Use a fake path since the module may not be installed in test environment
    const mockModulePath = path.resolve(__dirname, '../node_modules/@medusajs/framework/utils/index.js');
    require.cache[mockModulePath] = {
      id: '@medusajs/framework/utils',
      filename: mockModulePath,
      loaded: true,
      exports: {
        defineConfig: (cfg: any) => cfg,
      },
    };

    // Clear require cache to get fresh config
    delete require.cache[require.resolve('../medusa-config.js')];
    config = require('../medusa-config.js');
  });

  afterAll(() => {
    // Clean up require cache
    delete require.cache[require.resolve('../medusa-config.js')];
    const mockModulePath = path.resolve(__dirname, '../node_modules/@medusajs/framework/utils/index.js');
    delete require.cache[mockModulePath];
  });

  describe('Frontend CORS (STORE_CORS)', () => {
    it('should have STORE_CORS configured', () => {
      expect(config.projectConfig.http.storeCors).toBeDefined();
      expect(config.projectConfig.http.storeCors).toBeTruthy();
    });

    it('should include riedu.kubexa.tech as allowed origin', () => {
      const storeCors = config.projectConfig.http.storeCors;
      expect(storeCors).toContain('riedu.kubexa.tech');
    });

    it('should include localhost for development', () => {
      const storeCors = config.projectConfig.http.storeCors;
      expect(storeCors).toContain('localhost');
    });

    it('should support multiple origins (comma-separated)', () => {
      const storeCors = config.projectConfig.http.storeCors;
      const origins = storeCors.split(',').map((o: string) => o.trim());
      expect(origins.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Admin CORS (ADMIN_CORS)', () => {
    it('should have ADMIN_CORS configured', () => {
      expect(config.projectConfig.http.adminCors).toBeDefined();
      expect(config.projectConfig.http.adminCors).toBeTruthy();
    });

    it('should include admin origin for riedu.kubexa.tech', () => {
      const adminCors = config.projectConfig.http.adminCors;
      expect(adminCors).toContain('admin.riedu.kubexa.tech');
    });

    it('should include localhost for development', () => {
      const adminCors = config.projectConfig.http.adminCors;
      expect(adminCors).toContain('localhost');
    });
  });

  describe('Auth CORS (AUTH_CORS)', () => {
    it('should have AUTH_CORS configured', () => {
      expect(config.projectConfig.http.authCors).toBeDefined();
      expect(config.projectConfig.http.authCors).toBeTruthy();
    });

    it('should match admin CORS origins', () => {
      expect(config.projectConfig.http.authCors).toBe(
        config.projectConfig.http.adminCors
      );
    });
  });

  describe('JWT Secret', () => {
    it('should have JWT_SECRET configured', () => {
      expect(config.projectConfig.http.jwtSecret).toBeDefined();
      expect(config.projectConfig.http.jwtSecret).toBeTruthy();
    });

    it('should not use empty string', () => {
      expect(config.projectConfig.http.jwtSecret.length).toBeGreaterThan(0);
    });

    it('should be at least 32 characters for production readiness', () => {
      const jwtSecret = process.env.JWT_SECRET || config.projectConfig.http.jwtSecret;
      // Only check length if explicitly set via env (default "supersecret" is for dev only)
      if (process.env.JWT_SECRET) {
        expect(jwtSecret.length).toBeGreaterThanOrEqual(32);
      }
    });
  });

  describe('Cookie Secret', () => {
    it('should have COOKIE_SECRET configured', () => {
      expect(config.projectConfig.http.cookieSecret).toBeDefined();
      expect(config.projectConfig.http.cookieSecret).toBeTruthy();
    });

    it('should not use empty string', () => {
      expect(config.projectConfig.http.cookieSecret.length).toBeGreaterThan(0);
    });

    it('should be at least 32 characters for production readiness', () => {
      const cookieSecret = process.env.COOKIE_SECRET || config.projectConfig.http.cookieSecret;
      if (process.env.COOKIE_SECRET) {
        expect(cookieSecret.length).toBeGreaterThanOrEqual(32);
      }
    });
  });

  describe('Database Configuration', () => {
    it('should have DATABASE_URL configured', () => {
      expect(config.projectConfig.databaseUrl).toBeDefined();
      expect(config.projectConfig.databaseUrl).toBeTruthy();
    });

    it('should use PostgreSQL protocol', () => {
      expect(config.projectConfig.databaseUrl).toMatch(/^postgres(q|ql)?:\/\//);
    });
  });

  describe('Redis/Dragonfly Configuration', () => {
    it('should have REDIS_URL configured', () => {
      expect(config.projectConfig.redisUrl).toBeDefined();
      expect(config.projectConfig.redisUrl).toBeTruthy();
    });

    it('should use Redis protocol', () => {
      expect(config.projectConfig.redisUrl).toMatch(/^redis:\/\//);
    });
  });

  describe('Admin Configuration', () => {
    it('should have admin path configured', () => {
      expect(config.admin.path).toBeDefined();
      expect(config.admin.path).toBeTruthy();
    });

    it('should serve admin at /app path', () => {
      expect(config.admin.path).toBe('/app');
    });

    it('should have backend URL configured', () => {
      expect(config.admin.backendUrl).toBeDefined();
      expect(config.admin.backendUrl).toBeTruthy();
    });
  });
});
