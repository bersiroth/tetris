$(document).ready(function () {
    $('body').on(click, '#menuPrincipaleNouvellePartie', function(){
        loadTemplate('nouvellePartie', 'menu');
    });
    $('body').on(click, '#menuPrincipaleChargerPartie', function(){
        loadTemplate('chargerPartie', 'menu');
    });
    $('body').on(click, '#menuPrincipaleScore', function(){
        loadTemplate('score', 'menu', getScore, '#menuScore');
    });
    $('body').on(click, '#menuPrincipaleOption', function(){
        loadTemplate('option', 'menu');
    });
    $('body').on(click, '#menuPrincipaleMaj', function(){
        loadTemplate('maj', 'menu');
    });
    $('body').on(click, '#menuNouvellePartieSolo', function(){
        loadTemplate('partieSolo', 'menu');
    });
    $('body').on(click, '#menuNouvellePartieEnLigne', function(){
        loadTemplate('partieMulti', 'menu');
    });
    $('body').on(click, '.choixDifficulte', function(){
        $('.difficulteActive').removeClass('difficulteActive');
        $(this).addClass('difficulteActive');;
    });
    $('body').on(click, '.level', function(){
        $('.levelActive').removeClass('levelActive');
        $(this).addClass('levelActive');;
    });
    $('body').on(click, '.zoneDrop', function(){
        $('.zoneDropActive').removeClass('zoneDropActive');
        $(this).addClass('zoneDropActive');;
    });
    $('body').on(click, '#lancerJeu', function(){
        zoneDrop = $('.zoneDropActive').text().toLowerCase() === 'oui' ? true : false;
        tetrisSolo($('.difficulteActive').attr('id'), parseInt($('.levelActive').text()), zoneDrop);
    });
    $('body').on(click, '#retourMenuPrincipale', function(){
        loadTemplate('principale', 'menu');
    });
    $('body').on(click, '#retourMenuNouvellePartie', function(){
        loadTemplate('nouvellePartie', 'menu');
    });
});