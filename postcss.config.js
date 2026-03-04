export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

**File:** `.gitignore`
**Location:** root of the repo
```
# Dependencies
node_modules
.pnp
.pnp.js

# Build
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor
.vscode
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db
