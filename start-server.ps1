param([int]$Port = 8765)
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$listener=New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback,$Port)
$listener.Start()
try { while ($true) {
$client=$listener.AcceptTcpClient()
try {
$stream=$client.GetStream(); $reader=New-Object IO.StreamReader($stream)
$line=$reader.ReadLine(); if(!$line){continue}; $request=$line.Split(' ')
while($reader.ReadLine()){}
$relative=[uri]::UnescapeDataString(($request[1] -split '\?')[0]).TrimStart('/')
if(!$relative){$relative='index.html'}
$path=[IO.Path]::GetFullPath((Join-Path $root $relative)); $status='200 OK'; $bytes=@()
if(!$path.StartsWith($root+'\') -or !(Test-Path -LiteralPath $path -PathType Leaf)){$status='404 Not Found'}else{$bytes=[IO.File]::ReadAllBytes($path)}
$types=@{'.html'='text/html; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.json'='application/json';'.png'='image/png';'.mp4'='video/mp4'}
$type=$types[[IO.Path]::GetExtension($path)]; if(!$type){$type='application/octet-stream'}
$header=[Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n")
$stream.Write($header,0,$header.Length)
if($request[0] -ne 'HEAD' -and $bytes.Length){$stream.Write($bytes,0,$bytes.Length)}
}catch{}finally{$client.Close()}
}}finally{$listener.Stop()}
