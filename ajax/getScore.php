<?php 

if ($_SERVER['HTTP_REFERER'] == 'http://bernard-caron.fr/') {
    $dsn = 'mysql:dbname=bernardcabcaron;host=mysql51-117.perso';
    $user = 'bernardcabcaron';
    $password = 'RK5SDGM3XuvR';
} else {
    $dsn = 'mysql:dbname=bernardcabcaron;host=localhost';
    $user = 'bernardcabcaron';
    $password = 'RK5SDGM3XuvR';
}

$query = "select * FROM `score` order by score desc limit 0,10;";

try {
    $dbh = new PDO($dsn, $user, $password);
    $res = $dbh->query($query);
    echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>