# Environment Validation Script (PowerShell)
#
# Validates all required environment variables before deployment
#
# Usage:
#   .\scripts\validate-env.ps1
#   .\scripts\validate-env.ps1 -GenerateSecrets
#   .\scripts\validate-env.ps1 -Strict

param(
    [switch]$GenerateSecrets,
    [switch]$Strict
)

# Colors
function Write-ColoredLine {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Load environment variables from .env files
function Load-EnvFile {
    $envFiles = @(".env.local", ".env")

    foreach ($file in $envFiles) {
        $envPath = Join-Path $PWD $file
        if (Test-Path $envPath) {
            Write-ColoredLine "Loading $file..." "Cyan"
            $content = Get-Content $envPath

            foreach ($line in $content) {
                if ($line -match '^([^#][^=]+)=(.*)$') {
                    $key = $Matches[1].Trim()
                    $value = $Matches[2].Trim()
                    $currentValue = [Environment]::GetEnvironmentVariable($key, "Process")
                    if (-not $currentValue) {
                        [Environment]::SetEnvironmentVariable($key, $value, "Process")
                    }
                }
            }

            return $true
        }
    }

    Write-ColoredLine "No .env.local or .env file found" "Yellow"
    return $false
}

# Required environment variables
$requiredVars = @(
    @{ Name = "DATABASE_URL"; MinLength = 10 },
    @{ Name = "NEXTAUTH_SECRET"; MinLength = 32 },
    @{ Name = "JWT_SECRET"; MinLength = 16 },
    @{ Name = "CSRF_SECRET"; MinLength = 32 },
    @{ Name = "RESEND_API_KEY"; StartsWith = "re_" },
    @{ Name = "EMAIL_FROM"; Pattern = "^[^\s@]+@[^\s@]+\.[^\s@]+$" },
    @{ Name = "PAYSTACK_SECRET_KEY"; StartsWith = "sk_" },
    @{ Name = "CLOUDINARY_CLOUD_NAME"; MinLength = 1 },
    @{ Name = "CLOUDINARY_API_KEY"; MinLength = 1 },
    @{ Name = "CLOUDINARY_API_SECRET"; MinLength = 1 },
    @{ Name = "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"; MinLength = 1 },
    @{ Name = "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"; MinLength = 1 },
    @{ Name = "NEXT_PUBLIC_APP_URL"; Pattern = "^https?://.+" }
)

# Optional but recommended variables
$recommendedVars = @(
    "CRON_SECRET",
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY_V3",
    "RECAPTCHA_SECRET_KEY_V3"
)

# Validate environment variables
function Test-Environment {
    Write-ColoredLine "`n$('=' * 60)" "Cyan"
    Write-ColoredLine "Environment Variable Validation" "Cyan"
    Write-ColoredLine "$('=' * 60)`n" "Cyan"

    $errors = @()
    $warnings = @()
    $checked = 0

    # Check required variables
    Write-ColoredLine "Checking required variables..." "Blue"
    foreach ($varConfig in $requiredVars) {
        $checked++
        $value = [Environment]::GetEnvironmentVariable($varConfig.Name, "Process")

        if ([string]::IsNullOrWhiteSpace($value)) {
            $errors += "❌ Missing: $($varConfig.Name)"
            continue
        }

        # Check minimum length
        if ($varConfig.MinLength -and $value.Length -lt $varConfig.MinLength) {
            $errors += "❌ $($varConfig.Name): Too short ($($value.Length) chars, need $($varConfig.MinLength))"
            continue
        }

        # Check starts with
        if ($varConfig.StartsWith -and -not $value.StartsWith($varConfig.StartsWith)) {
            $errors += "❌ $($varConfig.Name): Must start with '$($varConfig.StartsWith)'"
            continue
        }

        # Check pattern
        if ($varConfig.Pattern -and $value -notmatch $varConfig.Pattern) {
            $errors += "❌ $($varConfig.Name): Invalid format"
            continue
        }

        Write-ColoredLine "  ✓ $($varConfig.Name)" "Green"
    }

    # Check recommended variables
    Write-ColoredLine "`nChecking recommended variables..." "Blue"
    foreach ($varName in $recommendedVars) {
        $checked++
        $value = [Environment]::GetEnvironmentVariable($varName, "Process")

        if ([string]::IsNullOrWhiteSpace($value)) {
            $warnings += "⚠️  Missing (optional): $varName"
        } else {
            Write-ColoredLine "  ✓ $varName" "Green"
        }
    }

    # Print summary
    Write-ColoredLine "`n$('=' * 60)" "Cyan"
    Write-ColoredLine "Summary" "Cyan"
    Write-ColoredLine "$('=' * 60)" "Cyan"
    Write-Host "Checked: $checked variables"

    if ($errors.Count -gt 0) {
        Write-ColoredLine "Errors: $($errors.Count)" "Red"
    } else {
        Write-ColoredLine "Errors: 0" "Green"
    }

    if ($warnings.Count -gt 0) {
        Write-ColoredLine "Warnings: $($warnings.Count)" "Yellow"
    } else {
        Write-ColoredLine "Warnings: 0" "Green"
    }

    if ($errors.Count -gt 0) {
        Write-ColoredLine "`n❌ ERRORS:" "Red"
        foreach ($err in $errors) {
            Write-ColoredLine $err "Red"
        }
    }

    if ($warnings.Count -gt 0) {
        Write-ColoredLine "`n⚠️  WARNINGS:" "Yellow"
        foreach ($warn in $warnings) {
            Write-ColoredLine $warn "Yellow"
        }
    }

    Write-ColoredLine "`n$('=' * 60)`n" "Cyan"

    if ($errors.Count -eq 0) {
        Write-ColoredLine "✅ All required environment variables are configured!" "Green"
        return $true
    } else {
        Write-ColoredLine "❌ Please fix the errors above before deploying." "Red"
        return $false
    }
}

# Generate missing secrets
function New-Secrets {
    Write-ColoredLine "`n$('=' * 60)" "Cyan"
    Write-ColoredLine "Generate Missing Secrets" "Cyan"
    Write-ColoredLine "$('=' * 60)`n" "Cyan"

    $secretVars = @(
        @{ Name = "NEXTAUTH_SECRET"; Length = 32 },
        @{ Name = "JWT_SECRET"; Length = 32 },
        @{ Name = "CSRF_SECRET"; Length = 32 },
        @{ Name = "CRON_SECRET"; Length = 32 }
    )

    $missing = $secretVars | Where-Object {
        $value = [Environment]::GetEnvironmentVariable($_.Name, "Process")
        [string]::IsNullOrWhiteSpace($value)
    }

    if ($missing.Count -eq 0) {
        Write-ColoredLine "All secrets are already configured." "Green"
        return
    }

    Write-ColoredLine "Copy these to your .env.local file:`n" "Yellow"

    foreach ($varConfig in $missing) {
        $length = $varConfig.Length
        $bytes = New-Object byte[] $length
        $rng = [Security.Cryptography.RNGCryptoServiceProvider]::Create()
        $rng.GetBytes($bytes)
        $secret = [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
        Write-ColoredLine "$($varConfig.Name)=$secret" "Cyan"
    }

    Write-ColoredLine "`n$('=' * 60)`n" "Cyan"
}

# Main execution
Load-EnvFile

if ($GenerateSecrets) {
    New-Secrets
} else {
    $valid = Test-Environment

    if ($Strict -and -not $valid) {
        exit 1
    }
}
