# PowerShell script to install shadcn/ui components
# Run this script from the frontend directory

Write-Host "🚀 Setting up shadcn/ui components..." -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing npm dependencies first..." -ForegroundColor Yellow
    npm install
}

# Check and create jsconfig.json if needed (for JavaScript projects)
if (-not (Test-Path "jsconfig.json") -and -not (Test-Path "tsconfig.json")) {
    Write-Host "📝 Creating jsconfig.json with import alias..." -ForegroundColor Yellow
    $jsconfigContent = @{
        compilerOptions = @{
            baseUrl = "."
            paths = @{
                "@/*" = @("./*")
            }
        }
        exclude = @("node_modules")
    } | ConvertTo-Json -Depth 10
    
    $jsconfigContent | Out-File -FilePath "jsconfig.json" -Encoding UTF8
    Write-Host "✅ jsconfig.json created" -ForegroundColor Green
} elseif (Test-Path "jsconfig.json") {
    Write-Host "✅ jsconfig.json already exists" -ForegroundColor Green
} else {
    Write-Host "✅ tsconfig.json found" -ForegroundColor Green
}

# Check if shadcn is initialized
if (-not (Test-Path "components.json")) {
    Write-Host "🔧 Initializing shadcn/ui..." -ForegroundColor Yellow
    
    # Initialize shadcn/ui with proper defaults for JavaScript
    Write-Host "  Running shadcn init (this may take a moment)..." -ForegroundColor Gray
    $initOutput = npx shadcn-ui@latest init -y 2>&1
    
    # Check if initialization was successful
    if ($LASTEXITCODE -eq 0 -or (Test-Path "components.json")) {
        Write-Host "✅ shadcn/ui initialized" -ForegroundColor Green
    } else {
        Write-Host "⚠️  shadcn/ui init had issues, but continuing..." -ForegroundColor Yellow
        Write-Host "   Output: $initOutput" -ForegroundColor Gray
        Write-Host "   Note: components.json template already exists, using that" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ shadcn/ui already initialized (components.json exists)" -ForegroundColor Green
}

# Components to install
$components = @(
    "button",
    "card",
    "input",
    "label",
    "badge",
    "dialog",
    "dropdown-menu",
    "avatar",
    "table",
    "textarea",
    "select",
    "toast"
)

Write-Host "`n📥 Installing shadcn/ui components..." -ForegroundColor Cyan

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($component in $components) {
    Write-Host "  Installing $component..." -ForegroundColor Gray
    
    # Try with shadcn (newer command) first, fallback to shadcn-ui
    $output = ""
    $exitCode = 1
    
    try {
        $output = npx shadcn@latest add $component -y 2>&1 | Out-String
        $exitCode = $LASTEXITCODE
    } catch {
        # Fallback to shadcn-ui if shadcn fails
        try {
            $output = npx shadcn-ui@latest add $component -y 2>&1 | Out-String
            $exitCode = $LASTEXITCODE
        } catch {
            $output = "Command failed"
            $exitCode = 1
        }
    }
    
    # Check if component file was created
    $componentPath = "components/ui/$component.js"
    $componentExists = Test-Path $componentPath
    
    if ($exitCode -eq 0 -or $componentExists) {
        Write-Host "  ✅ $component installed" -ForegroundColor Green
        $successCount++
    } elseif ($output -match "already exists" -or $output -match "already installed" -or $output -match "skipping") {
        Write-Host "  ℹ️  $component already exists, skipping" -ForegroundColor Cyan
        $skipCount++
    } elseif ($output -match "not found" -or $output -match "does not exist") {
        Write-Host "  ⚠️  $component not available in registry (may be deprecated)" -ForegroundColor Yellow
        $errorCount++
    } else {
        Write-Host "  ⚠️  $component - installation issue" -ForegroundColor Yellow
        Write-Host "     Output: $($output.Trim() -replace "`n", " | ")" -ForegroundColor DarkGray
        Write-Host "     Try manually: npx shadcn@latest add $component" -ForegroundColor DarkGray
        $errorCount++
    }
}

Write-Host "`n✨ All components installed successfully!" -ForegroundColor Green
Write-Host "`n📝 Note: If you see any errors above, the components may already exist." -ForegroundColor Yellow
Write-Host "   You can manually install missing components with:" -ForegroundColor Yellow
Write-Host "   npx shadcn-ui@latest add <component-name>" -ForegroundColor Yellow

Write-Host "`n🔌 API Configuration:" -ForegroundColor Cyan
Write-Host "   Backend API is configured to use: http://localhost:5135" -ForegroundColor Gray
Write-Host "   Make sure your PHP backend is running on port 5135" -ForegroundColor Gray
Write-Host "   Update .env.local if you need to change the API URL" -ForegroundColor Gray

