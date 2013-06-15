<?php
  header('Content-Type: text/cache-manifest');
  echo "CACHE MANIFEST\n";

  $dir = new RecursiveDirectoryIterator(".");
  foreach(new RecursiveIteratorIterator($dir) as $file) {
    if ($file->IsFile() &&
        $file != "./manifest.php" &&
		//!strstr($file,"tmp") &&
        substr($file->getFilename(), 0, 1) != ".")
    {
      echo $file . "\n";
    }
  }
?>