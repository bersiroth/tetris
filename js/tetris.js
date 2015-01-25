$(document).ready(function () {
    
    // SPEC
    //
    // Score : 
    // Taille grille :
    // Vitesse : Au niveau 0 on peut faire 5-6 déplacements latéraux avant que la pièce tombe d'un rang, au niveau 9 on ne peut plus faire que 1-2 mouvements latéraux
    // Couleur : 47FFFF = cyan (S), 0000FF = blue(O), FFFF00 = yellow(J), 00FF00 = green(T), 8601FF = violet(L), FF7F00 = orange(Z), FF0000 = red (I)
    // Generation piece aleatoire : The I and O spawn in the middle columns
    // Emplacement de depart : The I and O spawn in the middle columns
    //                         The rest spawn in the left-middle columns
    //                         The tetrominoes spawn horizontally and with their flat side pointed down
    // 
    // TODO 
    //
    // Musique  OK
    // Ajout d'un tableau des scores (fonction popup pour demande le pseudo + enregistrement en base) AJAX ? OK
    // Ajout bouton pour musique (on/off) son jeu (on/off) choix musique OK
    // Gestion de l'aleatoire des pieces (nouvelle piece != 4 derniere piece) OK
    // calculer si la vitesse est bien egal au spec OK
    // Enregistrer en base le level le device et le nombre de ligne OK
    // Ajouter le device dans la table score OK
    // The tetrominoes spawn horizontally and with their flat side pointed down. OK
    // fonction pause (touche dans le tableau KEY) OK
    // Affichage de la zone de drop OK
    // Un menu avant la partie avec le choix du level de départ et de la difficulté OK
    // Score en raport a la difficulté OK
    // 
    // 2 case en hauteur pour aparition de la piece et non pris en compte dans la grille (faire un contour de lespace de jeu)
    // animation suppresion ligne
    // Ajouter un bouton pour relancer le jeu
    // Changement de couleur entre les level
    // Mode tactile avec touche ou appuyer
    // Mode multijoueur local ccoperation
    // Mode multijoueur local competition
    // Mode multijoueur online competition
    // Mode multijoueur online competition
    // Commencer au level 1 et non 0
    // Menu d'option (taille de la grille, difficulte, couleur)    
    // Recoder la prise en charge du tactile 
    // Recoder la grille sans 0 pour ne pas faire de -1 a chaque fois                 
    // Recoder la fonction getNbLineForUp
    // Menage dans les variables
    //
    // BUG
    // 
    // verification de la longueur du pseudo 3 carac min 
    // 

    // exemple :
    // 
    // 2 6 4 0
    // ^ ^ ^ ^
    // 0 0 0 0 | 8
    // 0 1 1 0 | 4
    // 1 1 0 0 | 2
    // 0 0 0 0 | 1

    function setDevice(){
        var deviceList = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'android'];
        for(var x in deviceList) {
            if (eval('/' + deviceList[x] + '/i').test(navigator.userAgent.toLowerCase()) === true) {
                return deviceList[x];
            }
        }
        return 'pc';
    }

    // Ordre des blocks haut, droite, bas , gauche
    var I = {color: '#FF0000', blocks: ['4444', '00F0', '2222', '0F00'], direction : 0};
    var J = {color: '#FFFF00', blocks: ['4460', '2E00', 'C440', '0E80'], direction : 0};
    var O = {color: '#0000FF', blocks: ['0660', '0660', '0660', '0660'], direction : 0};
    var L = {color: '#8601FF', blocks: ['6440', '8E00', '44C0', '0E20'], direction : 0};
    var S = {color: '#47FFFF', blocks: ['2640', 'C600', '4C80', '0C60'], direction : 0};
    var T = {color: '#00FF00', blocks: ['4640', '4E00', '4C40', '0E40'], direction : 0};
    var Z = {color: '#FF7F00', blocks: ['4620', '6C00', '8C40', '06C0'], direction : 0};

    document.addEventListener('keydown', keydown, false);
    document.addEventListener('keyup', keyup, false);
    
    var KEY = {ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40};
    var sounds = {musique: 0, chute: 0, gameOver: 0, rotation: 0, deplacement: 0, ligne: 0, levelUp: 0};
    var canvas = document.getElementById("canvas");
    var canvasNext = document.getElementById("next-piece-canvas");
    var ctx = canvas.getContext("2d");
    var ctxNext = canvasNext.getContext("2d");
    ctx.lineWidth = 1;
    ctxNext.lineWidth = 1;
    var pieceList = [I, J, O, L, S, T, Z];                  // la liste de pieces
    var largeurEcran;                                       // en px
    var hauteurEcran;                                       // en px
    var hauteurBlock;
    var longueurPiece = 4;                                  // en nombre de block
    var grid = "";                                          // un tableau a deux dimension representant la grille de jeu
    var largeurGrid = 10-1;                                 // en nombre de case
    var hauteurGrid = 22-1;                                 // en nombre de case
    var speed = false;
    var multiplicateurVitesse = 30  ;
    var x, y;
    var piece = '';
    var nextPiece;
    var score = 0;
    var line = 0;
    var level = 0;
    var pause = false;
    var popupUp = false;
    var musique = false;
    var sound = false;
    var defaultMusique = 'A';
    var levelUp = false;
    var historiquePiece = [0];
    var difficulte = 'facile';
    var device = setDevice();
    var zoneDrop = true;
    var bonus = 1;

    // Lance le jeu
    function startGame(){
        piece = '';
        line = 0;
        score = 0;
        initBonus();
        initSound();
        initCanvas();
        majScore(0);
        initGrid();
        newPiece();
    } 

    function initMenu(){
        initCanvas();
        $("#popupMenu").removeClass('popupOff'); 
        $("#popupMenu").addClass('menuOn');
    }

    // Ouvre une popup pour demander le pseudo a la fin de la partie
    function popup() {
        if (!popupUp) {
            $("#popup").removeClass('popupOff'); 
            $("#popup").addClass('popupOn');  
            popupUp = true;
        } else {
            $("#popup").removeClass('popupOn');
            $("#popup").addClass('popupOff'); 
            popupUp = false;
        }
    }

    // Initialise le canvas en fonction de la taille de l'ecran 
    function initCanvas() {
        var winHeight = (window.outerHeight == 'undefined') ? screen.height : window.outerHeight;
        var winWidth = (window.outerWidth == 'undefined') ? screen.width : window.outerWidth;
        if (winHeight < winWidth) {
            var height = winHeight * 0.7;
            hauteurBlock = Math.floor(height / (hauteurGrid+1));
            var nbBlockNext = 6;
        } else {
            var width = winWidth * 0.5;
            hauteurBlock = Math.floor(width / (largeurGrid+1));
            var nbBlockNext = 4;
        }
        
        var width = hauteurBlock * (largeurGrid + 1);
        canvas.width = width; 
        largeurEcran = width;    
        $("#canvas").css('width', width + 'px');

        var height = hauteurBlock * (hauteurGrid + 1);
        canvas.height = height;   
        hauteurEcran = height;
        $("#canvas").css('height', height + 'px');
        
        canvasNext.width    = hauteurBlock * nbBlockNext; 
        canvasNext.height   = hauteurBlock * nbBlockNext; 
    }
    
    // Initialise les sons et les musiques du jeu
    function initSound() {
        for (var name in sounds){
            sounds[name] =  new Audio();
            var src = (name == 'musique') ? name + defaultMusique : name;
            sounds[name].src = 'media/son/' + src + '.mp3';
            sounds[name].volume = 0.5;
        }
        sounds['musique'].loop = true;
    }

    // Joue ou stop les sons
    function playPauseSound(name, controle, type){
        if (eval(type) == true || controle == 'pause') {
            (controle == 'play') ? sounds[name].play() : sounds[name].pause();
        }
    }

    // Initialise la grille de jeu
    function initGrid() {
        grid = new Array();
        for (var a = 0; a <= largeurGrid; a++) {
            grid[a] = new Array();
            for (var b = 0; b <= hauteurGrid; b++) {
                grid[a][b] = '';
                var hauteur = (difficulte == 'moyen') ? 2 : 4;
                if (b > (hauteurGrid/hauteur) && (Math.random() * 9) > 4 && difficulte != 'facile') {
                    grid[a][b] = 'grey';
                }
            }
        }
    }
    
    function setGridGameOver(){
        var gridGameOver = ['XXRRRRXVVVXJXXXJXBBBXX',
                            'XXRXXXXVXVXJJXJJXBXXXX',
                            'XXRXRRXVVVXJXJXJXBBBXX',
                            'XXRXXRXVXVXJXXXJXBXXXX',
                            'XXRRRRXVXVXJXXXJXBBBXX',
                            'XXOOOOXCXXXCXLLLXRRRXX',
                            'XXOXXOXCXXXCXLXXXRXRXX',
                            'XXOXXOXXCXCXXLLLXRRRXX',
                            'XXOXXOXXCXCXXLXXXRRXXX',
                            'XXOOOOXXXCXXXLLLXRXRXX'];
        var i = 0;
        var timer = 20;
        var interval = setInterval(function(){
            var a = 0;
            var interval2 = setInterval(function(){
                var t =  i - 1; 
                switch(gridGameOver[t].substr((21-a),1)) {
                    case 'X':
                        grid[t][a] = 'grey';
                        break;
                    case 'R':
                        grid[t][a] = '#FF0000';
                        break;
                    case 'V':
                        grid[t][a] = '#00FF00';
                        break;
                    case 'J':
                        grid[t][a] = '#FFFF00';
                        break;
                    case 'B':
                        grid[t][a] = '#0000FF';
                        break;
                    case 'O':
                        grid[t][a] = '#FF7F00';
                        break;
                    case 'C':
                        grid[t][a] = '#47FFFF';
                        break;
                    case 'L':
                        grid[t][a] = '#8601FF';
                        break;
                }
                clearGrid();
                if(a == (grid[t].length - 1)){
                    if (t == (grid.length - 1)){
                        popup();
                    }
                    clearInterval(interval2);
                }
                a += 1;
            }, timer);
            if(i == (grid.length - 1)){
                clearInterval(interval);
            }
            i += 1;
        }, timer * (grid[0].length + 2));
    }
    

    // Selectionne aleatoirement une piece
    function getRandomPiece(){
        var random;
        var i = 0;
        do{
            i++;
            random = Math.floor(Math.random() * pieceList.length);
            if (i >= 4){
                break;
            }
        }while(jQuery.inArray( random, historiquePiece ) != -1)  
        historiquePiece.push(random);
        if (historiquePiece.length == 5){
            historiquePiece.splice(0, 1);
        }
        pieceList[random].direction = 0;
        return pieceList[random];
    }

    // Transforme un nombre decimale en binaire
    function decToBin(dec,length){
        var str = Number(dec).toString(2);
        var pad = "";
        for(var z=0; z < length; z++){
            pad = pad + "0";
        }
        return pad.substring(0, pad.length - str.length) + str;
    }

    // Converti des coordonne en case de la grille
    function getCase(x,y) {
        return {x: Math.round(x/hauteurBlock),y: Math.round(y/hauteurBlock)};
    }

    // Dessine une piece si toutes les cases sont libre
    function drawPiece(ctx, x, y, piece, type) {
        if( typeof(type) == 'undefined' ){
            type = 'piece';
        }
        if(type == 'piece' && zoneDrop == true){
            dropZone(x, y, piece);
        }
        var color = (type == 'dropZone') ? '#333333' : piece.color;
        if(isEmptyPiece(x, y, piece)) {
            eachBlocksFromPiece(x, y, piece, function(x,y){
                if (isEmptyBlock(x,y)) {
                    drawBlock(ctx, x, y, color);
                }
            });
            return true;
        } else {
            return false;
        }
    }

    // Dessine un block
    function drawBlock(ctx, x, y, color, redraw) {
        if (isEmptyBlock(x, y) || redraw == true) {
            ctx.fillStyle=color;
            ctx.fillRect(x, y, hauteurBlock, hauteurBlock);
            ctx.strokeRect(x, y, hauteurBlock, hauteurBlock);
            return true;
        } else {
            return false;
        }
    }

    // Test si une case est libre
    function isEmptyBlock(x,y){
        var gridCase = getCase(x,y);
        if (gridCase.x > largeurGrid || gridCase.y > hauteurGrid || gridCase.x < 0) {
            return false;
        } else {
            return (grid[gridCase.x][gridCase.y] != '') ? false : true;
        }
    }

    // Test les cases sont libre pour une piece
    function isEmptyPiece(x, y, piece, direction){
        var result = true;
        if( typeof(direction) == 'undefined' ){
            direction = piece.direction;
        }
        eachBlocksFromPiece(x, y, piece, function(x,y){
            if (!isEmptyBlock(x,y)) {
                result = false;
            }
        }, direction);
        return result;
    }

    // Boucle sur les blocks d'une piece et retour un tableau avec les coordonnees des blocks d'une piece
    function eachBlocksFromPiece(x, y, piece, fn, direction){
        if( typeof(direction) == 'undefined' ){
            direction = piece.direction;
        }
        var bin, nbBlock = 0;
        for (var a=0; a < piece.blocks[direction].length; a++){
            bin = decToBin( parseInt( piece.blocks[direction][a], 16 ),longueurPiece);
            for (var e=0; e < bin.length; e++){
                if ( bin[e] != '0' ) {
                    nbBlock++;
                    fn(x + (a * hauteurBlock), y + (e * hauteurBlock));
                    if (nbBlock == longueurPiece){
                        return;
                    }
                }
            }
        }
    }

    // efface toutes les cases de la grille qui sont libre
    function clearGrid(){
        ctx.clearRect(-1, -1, largeurEcran + 2, hauteurEcran + 2);
        for (var a = 0; a < grid.length; a++) {
            for (var b = 0; b < grid[a].length; b++) {
                if (grid[a][b] != '') {
                    drawBlock(ctx, a * hauteurBlock, b * hauteurBlock, grid[a][b], true);
                }
            }
        }
    }

    function dropZone(x, y, piece){
        var dropPiece = piece;
        y += hauteurBlock;
        while(isEmptyPiece(x, y, piece)){
            y += hauteurBlock;
        }
        y -= hauteurBlock;
        drawPiece(ctx, x, y, dropPiece, 'dropZone');
    }

    // Creation d'un nouvelle piece
    function newPiece() {
        var localMultiplicateurVitesse = Math.floor((level >= 10) ? multiplicateurVitesse - ((level-9) * 5) : multiplicateurVitesse);
        if (level >= 14) localMultiplicateurVitesse = 5
        var vitesse = (level <= 5) ? 4 : 2;
        var timer = (localMultiplicateurVitesse)  - (level * vitesse );
        if (timer < 3) timer = 3;
        getScore();
        if (piece == ''){
            piece = getRandomPiece();
            piece.direction = 0;
            nextPiece = getRandomPiece();
            nextPiece.direction = 0;
            drawPiece(ctxNext, 0 , 0 , nextPiece, 'nextPiece');
        } else {
            piece = nextPiece;
            piece.direction = 0;
            nextPiece = getRandomPiece();
            nextPiece.direction = 0;
            ctxNext.clearRect(-1, -1, canvasNext.width + 2, canvasNext.height + 2);
            drawPiece(ctxNext, 0 , 0 , nextPiece, 'nextPiece');
        }
        var i = 0;
        var gridCase;
        x = (((largeurGrid+1)/2)-2) * hauteurBlock, y = 0 ;
        deleteLine();
        var down = setInterval(function () {
            if(pause == false) {
                if (i == 0 || i%localMultiplicateurVitesse == 0 || speed == true) {
                    if (i != 0) {
                        y += hauteurBlock;
                    }
                    if (isEmptyPiece(x,y,piece)) {
                        clearGrid();
                        drawPiece(ctx,x,y,piece);
                    } else {
                        eachBlocksFromPiece(x, y-hauteurBlock, piece, function(x,y){
                            gridCase = getCase(x,y);
                            grid[gridCase.x][gridCase.y] = piece.color;
                        });
                        clearInterval(down);
                        if (i != 0) {
                            playPauseSound('chute', 'play', 'sound');
                            newPiece();
                        } else {
                            drawPiece(ctx,x,y,piece);
                            playPauseSound('musique', 'pause', 'musique');
                            playPauseSound('gameOver', 'play', 'musique');
                            setGridGameOver();
                        }
                    } 
                    i++;
                    speed = false;
                } else {
                    i++;
                }
            }
        }, timer);
    }

    // efface toutes les cases de la grille qui sont libre
    function changeDirection(piece) {
        var direction;
        direction = (piece.direction + 1 == 4) ? 0 : piece.direction + 1;
        if(isEmptyPiece(x, y, piece, direction)) {
            piece.direction = direction;
            clearGrid();
            drawPiece(ctx,x,y,piece);
        }
    }

    // efface toutes les cases de la grille qui sont libre
    function deleteLine(){
        var lineDelete,a,b,f,z,c,nbLine=0;
        for (a = hauteurGrid ; a > 0 ; a-- ){
            lineDelete = true;
            for (b = 0 ; b <= largeurGrid ; b++ ){
                if (grid[b][a] == '') {
                    lineDelete = false;
                    break;
                }
            }
            if (lineDelete == true) {
                line++;
                nbLine++;
                for (f = 0 ; f <= largeurGrid ; f++){
                    grid[f][a] = '';
                }
                for (z = 0; z < grid.length; z++) {
                    for (c = hauteurGrid; c > 0; c--) {
                        if (c < a) {
                            grid[z][c+1] = grid[z][c];
                        }
                    }
                }
                a++;
            }
        }
        switch(nbLine) {
            case 0:
                break;
            case 1:
                majScore(40*(level+1));
                break;
            case 2:
                majScore(100*(level+1));
                break;
            case 3:
                majScore(300*(level+1));
                break;
            case 4:
                majScore(1200*(level+1));
                break;
        }
        if (nbLine > 0 && levelUp == false) {
            playPauseSound('ligne', 'play', 'sound');
        }
        if (levelUp == true) {
            playPauseSound('levelUp', 'play', 'sound');
            levelUp = false;
        }

    }

    // Gestion des touches du clavier
    function keydown(ev) {
        switch (ev.keyCode) {
            case KEY.LEFT:
                if (isEmptyPiece(x - hauteurBlock,y,piece)) {
                    x -= hauteurBlock;
                    clearGrid();
                    drawPiece(ctx,x,y,piece);
                    playPauseSound('deplacement', 'play', 'sound');
                }
                break;
            case KEY.RIGHT:
                if (isEmptyPiece(x + hauteurBlock,y,piece)) {
                    x += hauteurBlock;
                    clearGrid();
                    drawPiece(ctx,x,y,piece);
                    playPauseSound('deplacement', 'play', 'sound');
                }
                break;
            case KEY.DOWN:
                speed = true;
                break;
            case 80:
                setPause();
                break;
        }
    }
    
    // Gestion des touches du clavier
    function keyup(ev) {
        switch (ev.keyCode) {
            case KEY.UP:
                changeDirection(piece);
                playPauseSound('rotation', 'play', 'sound');
                break;
        }
    }
    
    // return le nombre de ligne necessaire pour changer de level
    function getNbLineForUp() {
        return ((level + 1) * 10) + level;
    }

    function initBonus(){
        if (difficulte == 'moyen') {
            bonus = 1.20;
        } else if (difficulte == 'difficile') {
            bonus = 1.50;
        } else {
            bonus = 1;
        }
        if (zoneDrop == false) bonus = bonus + 0.20;
    }

    // mise a jour du score
    function majScore(newScore){
        newScore = newScore * bonus;
        score = score + newScore;
        var nbLine4Up = getNbLineForUp();
        if (line >= nbLine4Up) {
            level++;
            nbLine4Up = getNbLineForUp();
            levelUp = true;
        }
        $("#score-jeu").html(
                "<div id='score'>Score :  " + score + "</div>" +
                "<div>Ligne :  " + line + "</div>"  +
                "<div>Level :  " + level + "</div>" +
                "<div>Next :  " + (nbLine4Up - line) + "</div>"
        );

    }

    var testB=0;
    var testD=0;
    var debutDoigt;
    var finDoigt;
    var debutDoigtY;
    var finDoigtY;
    var dateDebut;
    var testDate = false;
    var lastEnd;

    document.getElementById("canvas").addEventListener('touchstart', function(event) {
                                            event.preventDefault(); 
                                            debutDoigt = event.changedTouches[0].clientX;
                                            debutDoigtY = event.changedTouches[0].clientY;
                                            dateDebut = new Date().getTime();
                                        }, false); 
    document.getElementById("canvas").addEventListener('touchmove',tactile,false); 
    document.getElementById("canvas").addEventListener('touchend', function(event) { 
                                            event.preventDefault(); 
//                                            console.log('current : ' + new Date().getTime());
//                                            console.log('end : ' + lastEnd);
//                                            console.log('diff : ' + (new Date().getTime() - lastEnd));
//                                            console.log('--------------');
                                            if ((new Date().getTime() - lastEnd) < 200) {
                                                changeDirection(piece);
                                            }
                                            lastEnd = new Date().getTime();
                                        }, false); 

    // efface toutes les cases de la grille qui sont libre
    function tactile(event) { 
        event.preventDefault(); 
        var newD, bouge1, bouge2;
        finDoigt = event.changedTouches[0].clientX;
        newD = Math.floor((finDoigt - debutDoigt) / (hauteurBlock));
        finDoigtY = event.changedTouches[0].clientY;

        console.log('debug : debutDoigt ' + debutDoigt + ' finDoigt : ' + finDoigt + ' debutDoigtY ' + debutDoigtY+ ' finDoigtY ' + finDoigtY);

        if (testDate != dateDebut) {
            testDate = dateDebut;
            testB = 0;
            testD = 0;
        }

        if ((finDoigt - debutDoigt) > (finDoigtY - debutDoigtY)) {
            bouge1 = newD - testB;
            testB = testB + bouge1;
            if (bouge1 > 0) {
                for (i = 0; i < bouge1; i++) {
                    if (isEmptyPiece(x + hauteurBlock, y, piece)) {
                        x += hauteurBlock;
                        clearGrid();
                        drawPiece(ctx, x, y, piece);
                    }
                }
                debutDoigtY = finDoigtY;
                debutDoigt = finDoigt;
            }
        } else if ((debutDoigt - finDoigt) > (finDoigtY - debutDoigtY)) {
            bouge2 = newD - testD;
            testD = testD + bouge2;
            if (bouge2 < 0) {
                for (i = bouge2; i < 0; i++) {
                    if (isEmptyPiece(x - hauteurBlock, y, piece)) {
                        x -= hauteurBlock;
                        clearGrid();
                        drawPiece(ctx, x, y, piece);
                    }
                }
                debutDoigtY = finDoigtY;
                debutDoigt = finDoigt;
            }
        } else {
            if (debutDoigtY < finDoigtY) {
                    speed = true;
            }
        }
    }
    
    var titre = $("#titre").html();
    function setPause() {
        if (pause){
            pause = false;
            $("#titre").html(titre);
            playPauseSound('musique', 'play', 'musique');
        } else {
            pause = true ;
            $("#titre").html(titre + ' (PAUSE)');
            playPauseSound('musique', 'pause', 'musique');
        }
    }
    
    $(window).on('blur',function(){
        if(!pause) setPause();
    }).on('focus',function(){
        if(pause) setPause();
    });
//    window.addEventListener('resize', function(){
//        startGame();
//        console.log('test');
//    }, false);
    
    // recuperation de maniere asynchrone des meilleures score enregistre en base
    function getScore() {
        $.ajax({
            type: "POST",
            url: "ajax/getScore.php"
        }).done(function( data ) {
            $("#scores table").html('<thead> <tr> <th> pseudo </th>'
                                               + '<th> score </th>'
                                               + '<th> ligne </th>'
                                               + '<th> level </th>'
                                               + '<th> device </th> <tr> </thead>');
            var dates = JSON.parse(data);
            for (var a=0; a < dates.length; a++) {
                $("#scores table").append('<tr>  <td>' + dates[a].pseudo + '</td>'
                                              + '<td>' + dates[a].score + '</td>'
                                              + '<td>' + dates[a].ligne + '</td>'
                                              + '<td>' + dates[a].level + '</td>'
                                              + '<td>' + dates[a].device + '</td>'
                                              + '</tr>');
            }
        });
    }
    
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    
    // validation du pseudo et enregistrement asynchrone du score dans la base
    document.getElementById("valider").addEventListener('click', function(){
        var token = '1989-05-12' + Math.floor(Math.random() * 100000);
        setCookie('token', token, 10);
        $.ajax({
            type: "POST",
            url: "ajax/score.php",
            data: { pseudo      : $("#pseudo").val(), 
                    score       : score, 
                    ligne       : line, 
                    level       : level, 
                    difficulte  : difficulte, 
                    device      : device, 
                    token       : token }
        }).done(function( msg ) {
//            alert( "Data Saved: " + msg );
        });
        popup();
        initMenu();
    }, false);
    
    document.getElementById("musiqueButton").addEventListener('click', function(){
        if (musique == false) {
            musique = true;
            $("#musiqueButton").html('ON');
            playPauseSound('musique', 'play', 'musique');
        } else {
            $("#musiqueButton").html('OFF');
            musique = false;
            playPauseSound('musique', 'pause', 'musique');
        }
    }, false);
    
    document.getElementById("pause").addEventListener('click', function(){
        setPause();
    }, false);
    
    document.getElementById("soundButton").addEventListener('click', function(){
        if (sound == false) {
            sound = true;
            $("#soundButton").html('ON');
        } else {
            $("#soundButton").html('OFF');
            sound = false;
        }
    }, false);
    
    $(".choixMusique").on('click', function(){
        sounds['musique'].src = 'media/son/' + this.id + '.mp3';
        playPauseSound('musique', 'play', 'musique');
    });
    
    initMenu();

    $("#go").on('click', function(){
        $("#popupMenu").removeClass('menuOn'); 
        $("#popupMenu").addClass('popupOff');
        difficulte = $('input[name="choixDifficulte"]:checked').val();
        level = parseInt($('input[name="choixLevel"]:checked').val());
        zoneDrop = ($('input[name="choixDrop"]:checked').val() == 1) ? true : false;
        startGame();
    });
});