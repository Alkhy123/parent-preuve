param(
  [string]$ProjectPath = "c:\projets\parent-preuve"
)

$ErrorActionPreference = "Stop"

Write-Host "Installation des Claude Skills Parent Preuve..." -ForegroundColor Cyan
Write-Host "Projet cible : $ProjectPath" -ForegroundColor Cyan

if (!(Test-Path $ProjectPath)) {
  throw "Le chemin du projet n'existe pas : $ProjectPath"
}

$SourceClaude = Join-Path $PSScriptRoot ".claude"
$TargetClaude = Join-Path $ProjectPath ".claude"
$TargetSkills = Join-Path $TargetClaude "skills"

if (!(Test-Path $SourceClaude)) {
  throw "Le dossier source .claude est introuvable. Lance le script depuis le dossier dézippé."
}

if (!(Test-Path $TargetClaude)) {
  New-Item -ItemType Directory -Path $TargetClaude | Out-Null
}

if (!(Test-Path $TargetSkills)) {
  New-Item -ItemType Directory -Path $TargetSkills | Out-Null
}

Copy-Item -Path (Join-Path $SourceClaude "skills\*") -Destination $TargetSkills -Recurse -Force

Write-Host "Skills copiées dans : $TargetSkills" -ForegroundColor Green

$AddonPath = Join-Path $PSScriptRoot "CLAUDE.addon.md"
$ClaudeMdPath = Join-Path $ProjectPath "CLAUDE.md"

if (Test-Path $AddonPath) {
  $Addon = Get-Content $AddonPath -Raw -Encoding UTF8

  if (!(Test-Path $ClaudeMdPath)) {
    Set-Content -Path $ClaudeMdPath -Value $Addon -Encoding UTF8
    Write-Host "CLAUDE.md créé." -ForegroundColor Green
  } else {
    $Existing = Get-Content $ClaudeMdPath -Raw -Encoding UTF8
    if ($Existing -notlike "*Parent Preuve — règles Claude recommandées*") {
      Add-Content -Path $ClaudeMdPath -Value "`n`n---`n`n$Addon" -Encoding UTF8
      Write-Host "CLAUDE.addon.md ajouté à la fin de CLAUDE.md." -ForegroundColor Green
    } else {
      Write-Host "CLAUDE.md contient déjà les règles recommandées. Aucun ajout." -ForegroundColor Yellow
    }
  }
}

Write-Host "Installation terminée." -ForegroundColor Green
Write-Host ""
Write-Host "Test dans Claude Code :" -ForegroundColor Cyan
Write-Host "/parent-preuve-context"
