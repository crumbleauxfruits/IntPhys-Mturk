<?php
//echo iterator_count(new DirectoryIterator('results'));

$counter_name = "counter.txt";
// Check if a text file exists. If not create one and initialize it to zero.
if (!file_exists($counter_name)) {
  $f = fopen($counter_name, "w");
  fwrite($f,"0");
  fclose($f);
}
// Read the current value of our counter file
$f = fopen($counter_name,"r");
$counterVal = fread($f, filesize($counter_name));
fclose($f); 

$counterVal++;
$f = fopen($counter_name, "w");
fwrite($f, $counterVal);
fclose($f); 

echo $counterVal;
?>
