# shadcn/ui Setup Instructions

## Quick Setup with PowerShell Script

### Step 1: Navigate to Frontend Directory

```powershell
cd frontend
```

### Step 2: Run the Setup Script

```powershell
.\setup-shadcn.ps1
```

If you get an execution policy error, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-shadcn.ps1
```

## What Gets Installed

The script automatically installs these shadcn/ui components:

- ✅ **button** - Button component
- ✅ **card** - Card container
- ✅ **input** - Input field
- ✅ **label** - Form label
- ✅ **badge** - Badge/status indicator
- ✅ **dialog** - Modal dialogs
- ✅ **dropdown-menu** - Dropdown menus
- ✅ **avatar** - User avatars
- ✅ **table** - Data tables
- ✅ **textarea** - Text area input
- ✅ **select** - Select dropdown
- ✅ **toast** - Toast notifications (already using sonner)

## Prerequisites

The script checks and installs:

1. ✅ npm dependencies (runs `npm install` if needed)
2. ✅ `jsconfig.json` with import aliases (`@/*`)
3. ✅ `components.json` for shadcn/ui configuration

## Manual Installation (Alternative)

If you prefer to install manually:

```bash
# 1. Initialize shadcn/ui
npx shadcn-ui@latest init

# 2. Install components one by one
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add table
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
```

## API Configuration (Port 5135)

The frontend is configured to connect to the PHP backend on **port 5135**.

### Files Updated:
- ✅ `frontend/lib/api.js` - Default API URL
- ✅ `frontend/next.config.js` - API rewrite destination
- ✅ `frontend/.env.example` - Environment variable template

### To Start Backend on Port 5135:

```bash
cd backend
php -S localhost:5135 -t .
```

### To Update API URL:

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5135
```

## Troubleshooting

### Error: "No import alias found"

✅ **Fixed!** The script automatically creates `jsconfig.json` with the correct import alias.

### Error: "Component already exists"

This is normal if you've already installed some components. The script will skip existing components.

### Components Not Working

1. Make sure `jsconfig.json` exists with:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Port Configuration Issues

If the frontend can't connect to the backend:

1. Verify backend is running:
   ```bash
   curl http://localhost:5135/api/jobs
   ```

2. Check `.env.local` has the correct URL

3. Verify CORS is configured in `backend/.env`:
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

## File Structure After Setup

```
frontend/
├── components/
│   └── ui/
│       ├── button.js
│       ├── card.js
│       ├── input.js
│       ├── label.js
│       ├── badge.js
│       ├── dialog.js
│       ├── dropdown-menu.js
│       ├── avatar.js
│       ├── table.js
│       ├── textarea.js
│       └── select.js
├── components.json
├── jsconfig.json
└── setup-shadcn.ps1
```

## Usage Example

After installation, use components like this:

```javascript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
```

## Next Steps

1. ✅ Run the setup script
2. ✅ Start backend: `cd backend && php -S localhost:5135 -t .`
3. ✅ Start frontend: `cd frontend && npm run dev`
4. ✅ Test the connection at http://localhost:3000

---

**Note:** The script is idempotent - you can run it multiple times safely. It will skip components that already exist.

