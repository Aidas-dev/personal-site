# Frontend Architecture Decision

## Shared Components Between Frontends

There are two frontend projects in this repository:

| Project | Location | Target |
|---------|----------|--------|
| Main | `/frontend/` | Cloudflare Pages |
| Cloudflare | `/cloudflare/frontend/` | Cloudflare Workers |

### Decision: Regular Files (Not Symlinks)

**Why:** GitHub Actions + symlinks don't work reliably together:

1. **Git symlink issues**: Even with `core.symlinks=true`, GitHub Actions runners don't create actual symlinks on disk
2. **Checkout v6**: Uses `includeIf` directives that fail with symlinks (use v5 or bare git clone instead)
3. **Node resolution**: Vite can't resolve imports through symlinked directories
4. **Complex workarounds**: Manual symlink creation in CI, absolute paths, etc. all introduce fragility

**Solution:** Keep regular copies of shared components in both frontends. When updating shared components:

1. Copy from `/frontend/src/components/` to `/cloudflare/frontend/src/components/`
2. Or use PNPM workspaces to properly share code

### How to Sync Components

```bash
# Copy shared components to cloudflare
cp -r frontend/src/components/ui cloudflare/frontend/src/components/
cp -r frontend/src/components/layout cloudflare/frontend/src/components/
cp -r frontend/src/components/dashboard cloudflare/frontend/src/components/
cp -r frontend/src/components/hero cloudflare/frontend/src/components/
cp -r frontend/src/components/three cloudflare/frontend/src/components/
```

### Future Improvements

- Use PNPM workspaces to properly share code between projects
- Create a shared UI package