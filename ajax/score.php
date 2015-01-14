<?php 

require_once '../config.php';

if (DEV == false) { 
    session_start();
    if (!isset($_COOKIE['token']) || !isset($_POST['token']) || $_COOKIE['token'] != $_POST['token'] || $_SERVER['HTTP_REFERER'] != REFERER) {
        die('Erreur connexion'); 
    }
}

$dsn = 'mysql:dbname=' . DBNAME . ';host=' . HOST;
$user = USER;
$password = PASSWORD;

$query = "INSERT INTO  `score` (`id` ,`pseudo` ,`score` ,`ligne` ,`level` ,`difficulte` ,`date`)
          VALUES (NULL ,'" . mysql_real_escape_string($_POST["pseudo"]) . "',
                        '" . mysql_real_escape_string($_POST["score"]) . "',  
                        '" . mysql_real_escape_string($_POST["ligne"]) . "', 
                        '" . mysql_real_escape_string($_POST["level"]) . "',  
                        '" . mysql_real_escape_string($_POST["difficulte"]) . "',  now());";

try {
    $dbh = new PDO($dsn, $user, $password);
    $dbh->query($query);
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>