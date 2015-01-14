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



try {
    $dbh = new PDO($dsn, $user, $password);
    $query = "INSERT INTO  `score` (`id` ,`pseudo` ,`score` ,`ligne` ,`level` ,`difficulte` ,`date`)
          VALUES (NULL ," . $dbh->quote($_POST["pseudo"]) . ",
                        " . $dbh->quote($_POST["score"]) . ",  
                        " . $dbh->quote($_POST["ligne"]) . ", 
                        " . $dbh->quote($_POST["level"]) . ",  
                        " . $dbh->quote($_POST["difficulte"]) . ",  now());";
    $dbh->query($query);
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>