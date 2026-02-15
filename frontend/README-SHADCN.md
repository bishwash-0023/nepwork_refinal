# shadcn/ui Setup Guide

## Quick Setup

Run the PowerShell script to automatically install all shadcn/ui components:

```powershell
cd frontend
.\setup-shadcn.ps1
```

Or if you get an execution policy error:

```powershell
cd frontend
powershell -ExecutionPolicy Bypass -File .\setup-shadcn.ps1
```

## What the Script Does

1. ✅ Checks for npm dependencies and installs if needed
2. ✅ Creates `jsconfig.json` with proper import aliases (`@/*`)
3. ✅ Initializes shadcn/ui configuration
4. ✅ Installs all required components:
   - button
   - card
   - input
   - label
   - badge
   - dialog
   - dropdown-menu
   - avatar
   - table
   - textarea
   - select
   - toast

## Manual Installation

If you prefer to install components manually:

```bash
# Initialize shadcn/ui (if not done)
npx shadcn-ui@latest init

# Install individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# ... etc
```

## API Configuration

The frontend is configured to connect to the PHP backend on **port 5135**.

- Default API URL: `http://localhost:5135`
- Configured in: `lib/api.js` and `next.config.js`
- Environment variable: `NEXT_PUBLIC_API_URL` (in `.env.local`)

## Troubleshooting

### Import Alias Error

If you see "No import alias found", make sure `jsconfig.json` exists with:

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

### Components Not Found

If components are not found after installation:

1. Check that `components.json` exists
2. Verify `jsconfig.json` has the correct paths
3. Restart your Next.js dev server

### Port Configuration

To change the backend port:

1. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT
   ```

2. Update `frontend/lib/api.js` default URL
3. Update `frontend/next.config.js` default URL

## Components Location

All shadcn/ui components will be installed in:
```
frontend/components/ui/
```

You can import them like:
```javascript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

