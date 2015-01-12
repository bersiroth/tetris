<?php 

//var_dump($_POST);

//$dsn = 'mysql:dbname=bernardcabcaron;host=mysql51-117.perso';
//$user = 'bernardcabcaron';
//$password = 'RK5SDGM3XuvR';

$dsn = 'mysql:dbname=tetris;host=localhost';
$user = 'root';
$password = '';

$query = "INSERT INTO  `tetris`.`score` (`id` ,`pseudo` ,`score` ,`level` ,`difficulte` ,`date`)
          VALUES (NULL ,'" . $_POST["pseudo"] . "',  '" . $_POST["score"] . "',  '1',  'facile',  now());";

try {
    $dbh = new PDO($dsn, $user, $password);
    $dbh->query($query);
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>