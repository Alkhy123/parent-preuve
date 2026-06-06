param(
  [string]$ProjectPath = "c:\projets\parent-preuve"
)

$ErrorActionPreference = "Stop"

Write-Host "Installation des skills urgentes Parent Preuve..." -ForegroundColor Cyan
Write-Host "Projet cible : $ProjectPath" -ForegroundColor Cyan

if (!(Test-Path $ProjectPath)) {
  throw "Le chemin du projet n'existe pas : $ProjectPath"
}

$SourceSkills = Join-Path $PSScriptRoot ".claude\skills"
$TargetSkills = Join-Path $ProjectPath ".claude\skills"

if (!(Test-Path $SourceSkills)) {
  throw "Le dossier source .claude\skills est introuvable."
}

if (!(Test-Path $TargetSkills)) {
  New-Item -ItemType Directory -Path $TargetSkills -Force | Out-Null
}

Copy-Item -Path (Join-Path $SourceSkills "*") -Destination $TargetSkills -Recurse -Force

Write-Host "Skills copiées dans : $TargetSkills" -ForegroundColor Green
Write-Host "Installation terminée." -ForegroundColor Green
