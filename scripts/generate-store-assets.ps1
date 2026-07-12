$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$captures = Join-Path $root 'capturas'
$output = Join-Path $captures 'store-assets'
$iconMaster = Join-Path $output 'icon-master.png'
$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source

New-Item -ItemType Directory -Path $output -Force | Out-Null

if (-not (Test-Path -LiteralPath $iconMaster)) {
  throw "Arquivo ausente: $iconMaster"
}

$screenshots = @(
  @{ Source = 'Captura de tela 2026-07-12 170344.png'; Target = 'screenshot-01-explore-menu.png' },
  @{ Source = 'Captura de tela 2026-07-12 170351.png'; Target = 'screenshot-02-explore-overview.png' },
  @{ Source = 'Captura de tela 2026-07-12 170413.png'; Target = 'screenshot-03-booking-options.png' },
  @{ Source = 'Captura de tela 2026-07-12 170436.png'; Target = 'screenshot-04-latam-partner.png' },
  @{ Source = 'Captura de tela 2026-07-12 170444.png'; Target = 'screenshot-05-avios-money.png' }
)

foreach ($item in $screenshots) {
  $source = Join-Path $captures $item.Source
  $target = Join-Path $output $item.Target
  & $ffmpeg -hide_banner -loglevel error -y -i $source `
    -vf "scale=1280:800:force_original_aspect_ratio=decrease:flags=lanczos,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=0x0B132B,format=rgb24" `
    -frames:v 1 $target
  if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar $target" }
}

$iconTargets = @(
  @{ Size = 16; Path = 'icon16.png' },
  @{ Size = 32; Path = 'icon32.png' },
  @{ Size = 48; Path = 'icon48.png' },
  @{ Size = 64; Path = 'icon64.png' },
  @{ Size = 128; Path = 'icon128.png' },
  @{ Size = 256; Path = 'icon256.png' },
  @{ Size = 256; Path = 'icon.png' }
)

foreach ($icon in $iconTargets) {
  $target = Join-Path $root $icon.Path
  & $ffmpeg -hide_banner -loglevel error -y -i $iconMaster `
    -vf "scale=$($icon.Size):$($icon.Size):flags=lanczos" -frames:v 1 $target
  if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar $target" }
}

$storeIcon = Join-Path $output 'store-icon-128.png'
Copy-Item -LiteralPath (Join-Path $root 'icon128.png') -Destination $storeIcon -Force

$fontBold = 'C\:/Windows/Fonts/segoeuib.ttf'
$fontRegular = 'C\:/Windows/Fonts/segoeui.ttf'

$smallPromo = Join-Path $output 'promo-small-440x280.png'
$smallFilter = "[1:v]scale=122:122:flags=lanczos[icon];" +
  "[0:v][icon]overlay=34:79," +
  "drawbox=x=184:y=57:w=5:h=166:color=0x20C4F4:t=fill," +
  "drawtext=fontfile='$fontBold':text='Supermilhas':fontcolor=white:fontsize=34:x=213:y=78," +
  "drawtext=fontfile='$fontRegular':text='Milhas e Avios':fontcolor=0xB9C7D9:fontsize=18:x=214:y=132," +
  "drawtext=fontfile='$fontRegular':text='em reais':fontcolor=0x35D07F:fontsize=20:x=214:y=160[out]"
& $ffmpeg -hide_banner -loglevel error -y -f lavfi -i 'color=c=0x0B132B:s=440x280:d=1' -i $iconMaster `
  -filter_complex $smallFilter -map '[out]' -frames:v 1 $smallPromo
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o bloco promocional pequeno.' }

$marquee = Join-Path $output 'promo-marquee-1400x560.png'
$marqueeFilter = "[1:v]scale=300:300:flags=lanczos[icon];" +
  "[0:v][icon]overlay=108:130," +
  "drawbox=x=478:y=112:w=8:h=336:color=0x20C4F4:t=fill," +
  "drawtext=fontfile='$fontBold':text='Supermilhas':fontcolor=white:fontsize=82:x=548:y=142," +
  "drawtext=fontfile='$fontRegular':text='Entenda o custo real das suas milhas':fontcolor=0xB9C7D9:fontsize=34:x=552:y=260," +
  "drawtext=fontfile='$fontRegular':text='Compare. Decida. Viaje.':fontcolor=0x35D07F:fontsize=38:x=552:y=330[out]"
& $ffmpeg -hide_banner -loglevel error -y -f lavfi -i 'color=c=0x0B132B:s=1400x560:d=1' -i $iconMaster `
  -filter_complex $marqueeFilter -map '[out]' -frames:v 1 $marquee
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o bloco promocional de letreiro.' }

Write-Output "Assets gerados em $output"
