import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Build Configuration', () => {
  const backendRoot = path.resolve(__dirname, '..');

  describe('package.json', () => {
    let packageJson: any;

    beforeAll(() => {
      const pkgPath = path.join(backendRoot, 'package.json');
      const content = fs.readFileSync(pkgPath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    it('should have correct package name', () => {
      expect(packageJson.name).toBe('riedu-eshop-backend');
    });

    it('should have medusa build script', () => {
      expect(packageJson.scripts.build).toBe('medusa build');
    });

    it('should have medusa start script', () => {
      expect(packageJson.scripts.start).toBe('medusa start');
    });

    it('should have medusa develop script', () => {
      expect(packageJson.scripts.dev).toBe('medusa develop');
    });

    it('should have test script using vitest', () => {
      expect(packageJson.scripts.test).toBe('vitest run');
    });

    it('should have test:coverage script', () => {
      expect(packageJson.scripts['test:coverage']).toBe('vitest run --coverage');
    });

    it('should have predeploy script with migration', () => {
      expect(packageJson.scripts.predeploy).toBe('medusa db:migrate');
    });
  });

  describe('Dependencies', () => {
    let packageJson: any;

    beforeAll(() => {
      const pkgPath = path.join(backendRoot, 'package.json');
      const content = fs.readFileSync(pkgPath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    it('should have @medusajs/medusa as dependency', () => {
      expect(packageJson.dependencies['@medusajs/medusa']).toBeDefined();
    });

    it('should have @medusajs/framework as dependency', () => {
      expect(packageJson.dependencies['@medusajs/framework']).toBeDefined();
    });

    it('should have @medusajs/admin-sdk as dependency', () => {
      expect(packageJson.dependencies['@medusajs/admin-sdk']).toBeDefined();
    });

    it('should have pg (PostgreSQL driver) as dependency', () => {
      expect(packageJson.dependencies.pg).toBeDefined();
    });

    it('should have @medusajs/cli as dev dependency', () => {
      expect(packageJson.devDependencies['@medusajs/cli']).toBeDefined();
    });

    it('should have vitest as dev dependency', () => {
      expect(packageJson.devDependencies.vitest).toBeDefined();
    });

    it('should have @vitest/coverage-v8 as dev dependency', () => {
      expect(packageJson.devDependencies['@vitest/coverage-v8']).toBeDefined();
    });

    it('should require Node.js >= 20', () => {
      expect(packageJson.engines.node).toBe('>=20.0.0');
    });
  });

  describe('tsconfig.json', () => {
    let tsconfig: any;

    beforeAll(() => {
      const tsPath = path.join(backendRoot, 'tsconfig.json');
      const content = fs.readFileSync(tsPath, 'utf-8');
      tsconfig = JSON.parse(content);
    });

    it('should target ES2021', () => {
      expect(tsconfig.compilerOptions.target).toBe('ES2021');
    });

    it('should have node16 moduleResolution for ESM support', () => {
      expect(tsconfig.compilerOptions.moduleResolution).toBe('node16');
    });

    it('should have esModuleInterop enabled', () => {
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
    });

    it('should exclude node_modules and dist', () => {
      expect(tsconfig.exclude).toContain('node_modules');
      expect(tsconfig.exclude).toContain('dist');
      expect(tsconfig.exclude).toContain('.medusa');
    });

    it('should include TypeScript files', () => {
      expect(tsconfig.include).toContain('**/*.ts');
    });
  });

  describe('Dockerfile', () => {
    let dockerfile: string;

    beforeAll(() => {
      const dockerPath = path.join(backendRoot, 'Dockerfile');
      dockerfile = fs.readFileSync(dockerPath, 'utf-8');
    });

    it('should exist', () => {
      expect(dockerfile).toBeTruthy();
    });

    it('should use multi-stage build', () => {
      const fromCount = (dockerfile.match(/^FROM/gm) || []).length;
      expect(fromCount).toBeGreaterThanOrEqual(2);
    });

    it('should use Node.js 24 base image', () => {
      expect(dockerfile).toContain('node:24');
    });

    it('should use Alpine-based images', () => {
      expect(dockerfile).toContain('alpine');
    });

    it('should install dependencies with npm', () => {
      expect(dockerfile).toMatch(/npm install|npm ci/);
    });

    it('should run medusa build', () => {
      expect(dockerfile).toMatch(/medusa build|npm run build/);
    });

    it('should set NODE_ENV=production', () => {
      expect(dockerfile).toContain('NODE_ENV=production');
    });

    it('should install production dependencies only in final stage', () => {
      expect(dockerfile).toMatch(/--omit=dev|--production/);
    });

    it('should expose port 9000', () => {
      expect(dockerfile).toContain('EXPOSE 9000');
    });

    it('should have a CMD to start the server', () => {
      expect(dockerfile).toContain('CMD');
    });

    it('should include build tools for native dependencies', () => {
      expect(dockerfile).toMatch(/apk add.*python|apk add.*make|apk add.*g\+\+/);
    });
  });

  describe('.env.template', () => {
    let envTemplate: string;

    beforeAll(() => {
      const envPath = path.join(backendRoot, '.env.template');
      envTemplate = fs.readFileSync(envPath, 'utf-8');
    });

    it('should exist', () => {
      expect(envTemplate).toBeTruthy();
    });

    it('should define DATABASE_URL', () => {
      expect(envTemplate).toContain('DATABASE_URL=');
    });

    it('should define REDIS_URL', () => {
      expect(envTemplate).toContain('REDIS_URL=');
    });

    it('should define JWT_SECRET', () => {
      expect(envTemplate).toContain('JWT_SECRET=');
    });

    it('should define COOKIE_SECRET', () => {
      expect(envTemplate).toContain('COOKIE_SECRET=');
    });

    it('should define STORE_CORS', () => {
      expect(envTemplate).toContain('STORE_CORS=');
    });

    it('should define ADMIN_CORS', () => {
      expect(envTemplate).toContain('ADMIN_CORS=');
    });

    it('should define AUTH_CORS', () => {
      expect(envTemplate).toContain('AUTH_CORS=');
    });

    it('should include riedu.kubexa.tech in STORE_CORS', () => {
      expect(envTemplate).toContain('riedu.kubexa.tech');
    });

    it('should include admin.riedu.kubexa.tech in ADMIN_CORS', () => {
      expect(envTemplate).toContain('admin.riedu.kubexa.tech');
    });
  });
});
