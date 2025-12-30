$file = "android\app\build.gradle"
$lines = Get-Content $file
$index = -1
for($i=0; $i -lt $lines.Count; $i++) {
    if($lines[$i] -match "defaultConfig \{") {
        $index = $i
        break
    }
}

if ($index -ne -1) {
    $newLines = @()
    if ($index -gt 0) {
        $newLines += $lines[0..($index-1)]
    }
    $newLines += "    aaptOptions { cruncherEnabled = false }"
    $newLines += $lines[$index..($lines.Count-1)]
    $newLines | Set-Content $file
    Write-Host "Successfully modified build.gradle"
} else {
    Write-Host "Could not find defaultConfig {"
}
