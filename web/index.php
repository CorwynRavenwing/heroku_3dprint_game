<html>
<head>
<link rel="stylesheet" href="css/main.css">
<title>3d Print Game</title>
</head>
<body>
<div class="outer">
	<div class="leftbar">
		<div class="data">
			Money: <p id="data_money">0</p>
		</div>
	</div>
	<div class="main">
<?php
$Blocks = 20;
for($x = 0; $x < $Blocks; $x++) {
	?>
	<div class="block" id="block_<?=$x?>}">
		(block <?=$x?>)
	</div>
	<?php
} # next Blocks
?>
	</div>
</div>
</body>
</html>