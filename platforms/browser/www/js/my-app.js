// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var webview = $$('.webview');

// Add view
var mainView = myApp.addView('.view-main');


var createWebView = function (href) {
    //mainView.router.load({url: href, ignoreCache: true});
    var iframe = document.createElement('iframe');
    iframe.src = href;
    iframe.frameBorder = 0;
    iframe.onload = function (e) {
           console.log(e);
    }
    webview.toggleClass('open');
    $$('.webview .webview-content').empty().append(iframe);
}

$$('.close-webview').on('click', function () {
    webview.toggleClass('open');
})

var feedArticles = function (id, titre, contenu, groupes, last_groupe, fichier, liens, fr_titre_cours) {
    var div = "";
    if (!groupes.includes(last_groupe)) {
        div += "<div class='article-image' style='text-align:center;'><div" +
            " class='article-image__image'><img width='100%'" +
            " src='https://www.robert-schuman.eu/images/lettre/articles/" + fichier + "'></div><div" +
            " class='article-image__texte'><div>" + last_groupe + "</div></div></div>";
    }
    div += '<a class="article" id="' + id + '" data-id="' + id + '"><div class="article-titre">' + titre + '</div>';
    div += '<div class="article-contenu hidden">' + contenu;
    div += '<div class="article-btns"><button class="article-btn" data-href="' + liens[0].fr_lien + '">lire la' +
        ' suite</button>';
    if (liens.length > 1) {
        div += '<button class="article-btn" data-href="' + liens[1].fr_lien + '">autre lien</button>'
    }
    div += '</div></div></div></a>';
    return div;
}

var div_sommaire = $$('.sommaire-content');

var feedSommaire = function (groupe_nom, values) {
    var newTexte = [];
    for (var i = 0 ; i < values.length; i++) {
        newTexte.push('<a data-href="#' + values[i].id+ '">' + values[i].titre + '</a>');
    }
    div_sommaire.append('<div><span class="titre">' + groupe_nom + ' : </span><span>' + newTexte.join(' - ') + '</span></div>');
}

var feedLettre = function (data) {
    var articles = data.articles;
    var div_article = $$('.articles');
    var arts, div, groupe, art, key;
    var groupes = [];
    var sommaire = [];
    for (var prop in articles) {
        arts =  articles[prop];
        sommaire[prop] = [];
        for (var i = 0; i < arts.length; i++) {
            art = arts[i];
            groupe = prop;
            div = feedArticles(art.id, art.fr_titre, art.fr_texte, groupes, groupe, art.fichier, art.liens, art.fr_titre_cours);
            sommaire[groupe].push({ titre: art.fr_titre_cours, id: art.id});
            groupes.push(groupe);
            div_article.append(div);
        }
    }

    for (var article in sommaire) {
        feedSommaire(article, sommaire[article]);
    }

    /**
     * Actions sur les titres des articles
     */
    $$('.article').on('click', function(e) {
        e.preventDefault();
        // Afficher / Masquer les boutons
        var el = this.children[1];
        el.classList.toggle('hidden');
    })

    $$('.article-btn').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation()
        var href = this.dataset.href;
        createWebView(href);
    })

    $$('.sommaire-content span a').on('click', function () {
        div_sommaire.parent().removeClass('open');
        var href = this.dataset.href.substring(1);
        var el = document.getElementById(href);
        el.childNodes[1].classList.remove('hidden');
        el.scrollIntoView(true);
    });
}

/**
 * Récupération de la dernière lettre
 */
$$.get('http://localhost/schuman/last', null, function (data) {
    feedLettre(JSON.parse(data));
})

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

/**
 * Action sur le bouton du sommaire
 */
var sommaire = $$('.sommaire');
$$('.btn-sommaire').on('click', function () {
    sommaire.toggleClass('open');
});

/**
 * Popover
 */
var bandeau = $$('.bandeau');
$$('.open-lang').on('click', function () {
    var link = this;
    var top = bandeau.offset().top;

    console.log( $$(document).scrollTop());
    $$('.views').scrollTop(0, 0, 300, function() {
        console.log("sdfsdf");
    });
    myApp.popover('.popover-lang', link);
})


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})