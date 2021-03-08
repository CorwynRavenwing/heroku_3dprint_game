<!DOCTYPE html>
<html>
<head>
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="css/main.css">
<script type="text/javascript" src="public/static/jquery/jquery.js"></script>
<script type="text/javascript" src="js/3dprint.js"></script>
<title>3d Print Game</title>
</head>
<body>
<div class="outer">
	<div class="leftbar">
		<div class="data">
			Money: <div id="data_money">0</div>
		</div>
		<div class="data">
			Filament: <div id="data_filament">0</div>
		</div>
		<div class="data">
			Plastic: <div id="data_plastic">0</div>
		</div>
		<div class="data">
			Electric: <div id="data_electric">0</div>
		</div>
	</div>
	<div class="main">
<?php
$Blocks = 10;
for($x = 0; $x < $Blocks; $x++) {
	?>
	<div class="block" id="block_<?=$x?>">
		(block <?=$x?>)
	</div>
	<?php
} # next Blocks
?>
	</div>
</div>
</body>
</html>