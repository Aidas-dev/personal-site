import { describe, it, expect, beforeAll } from 'vitest';

describe('Admin Panel Configuration', () => {
  describe('Medusa admin config', () => {
    let config: any;

    beforeAll(() => {
      const path = require('path');
      const mockModulePath = path.resolve(__dirname, '../node_modules/@medusajs/framework/utils/index.js');
      require.cache[mockModulePath] = {
        id: '@medusajs/framework/utils',
        filename: mockModulePath,
        loaded: true,
        exports: { defineConfig: (cfg: any) => cfg },
      };

      delete require.cache[require.resolve('../medusa-config.js')];
      config = require('../medusa-config.js');
    });

    it('should have admin section in config', () => {
      expect(config.admin).toBeDefined();
    });

    it('should serve admin at /app path', () => {
      expect(config.admin.path).toBe('/app');
    });

    it('should have backendUrl configured', () => {
      expect(config.admin.backendUrl).toBeDefined();
      expect(config.admin.backendUrl).toBeTruthy();
    });
  });

  describe('Admin Docker build', () => {
    let dockerfile: string;

    beforeAll(() => {
      const fs = require('fs');
      const path = require('path');
      const dockerPath = path.resolve(__dirname, '../Dockerfile');
      dockerfile = fs.readFileSync(dockerPath, 'utf-8');
    });

    it('should build admin during builder stage', () => {
      // medusa build includes admin panel by default
      expect(dockerfile).toMatch(/medusa build|npm run build/);
    });

    it('should copy .medusa directory which includes admin build', () => {
      expect(dockerfile).toContain('.medusa');
    });

    it('should start medusa server which serves admin', () => {
      expect(dockerfile).toContain('npm');
      expect(dockerfile).toContain('start');
    });
  });

  describe('Admin Kubernetes deployment', () => {
    it('should have admin deployment manifest', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-admin/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      expect(deployContent).toContain('kind: Deployment');
      expect(deployContent).toContain('medusa-admin');
    });

    it('should have admin service manifest', () => {
      const fs = require('fs');
      const path = require('path');
      const svcPath = path.resolve(__dirname, '../../kubernetes/medusa-admin/service.yaml');
      const svcContent = fs.readFileSync(svcPath, 'utf-8');
      expect(svcContent).toContain('kind: Service');
    });

    it('should have admin HTTPRoute for ingress', () => {
      const fs = require('fs');
      const path = require('path');
      const routePath = path.resolve(__dirname, '../../kubernetes/medusa-admin/httproute.yaml');
      const routeContent = fs.readFileSync(routePath, 'utf-8');
      expect(routeContent).toContain('kind: HTTPRoute');
    });

    it('should expose admin on port 7001', () => {
      const fs = require('fs');
      const path = require('path');
      const svcPath = path.resolve(__dirname, '../../kubernetes/medusa-admin/service.yaml');
      const svcContent = fs.readFileSync(svcPath, 'utf-8');
      expect(svcContent).toMatch(/port:\s*7001/);
    });

    it('should use correct container image', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-admin/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      expect(deployContent).toContain('ghcr.io');
      expect(deployContent).toContain('riedu-backend');
    });

    it('should have admin port 7001 configured in container', () => {
      const fs = require('fs');
      const path = require('path');
      const deployPath = path.resolve(__dirname, '../../kubernetes/medusa-admin/deployment.yaml');
      const deployContent = fs.readFileSync(deployPath, 'utf-8');
      expect(deployContent).toContain('7001');
    });
  });

  describe('Admin access at /app', () => {
    it('should have backend HTTPRoute that routes to /admin', () => {
      const fs = require('fs');
      const path = require('path');
      const routePath = path.resolve(__dirname, '../../kubernetes/medusa-backend/httproute.yaml');
      const routeContent = fs.readFileSync(routePath, 'utf-8');
      expect(routeContent).toContain('/admin');
    });

    it('should have admin HTTPRoute configured', () => {
      const fs = require('fs');
      const path = require('path');
      const routePath = path.resolve(__dirname, '../../kubernetes/medusa-admin/httproute.yaml');
      const routeContent = fs.readFileSync(routePath, 'utf-8');
      // Should reference admin.riedu.kubexa.tech or similar admin hostname
      expect(routeContent).toMatch(/hostname|admin/);
    });
  });

  describe('Admin environment variables', () => {
    it('should have ADMIN_CORS configured', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('ADMIN_CORS=');
    });

    it('should have admin URL in CORS settings', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../.env.template');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('localhost:7001');
    });
  });
});
