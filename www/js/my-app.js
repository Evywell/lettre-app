// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var webview = $$('.webview');

// Add view
var mainView = myApp.addView('.view-main');


var scrollToTop = function () {
    var application = document.querySelector('.application');
    application.scrollTop = 0;
}

// Lettre courante
var currentLetter = null;

var launchWebView = function (href) {
    var ref = cordova.InAppBrowser.open(encodeURI(href), "_blank", 'location=yes');
    ref.addEventListener('loadstart', function (e) {
        console.log(e);
    });
    ref.show();
}

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

var setSelectedLettre = function (idLettre) {
    $$('.calendar-popover .lettre').each(function () {
        if(this.dataset.lettreid == idLettre) {
            this.classList.add('disabled');
        } else {
            this.classList.remove('disabled');
        }
    });
}

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

var div_agenda = $$('.agenda .agenda-dates');

var feedAgenda = function (agenda) {
    var div;
    var date;
    for (var i = 0; i < agenda.length; i++) {
        date = agenda[i];
        div = '<div class="agenda-date"><div class="agenda-date__date">' + date.fr_date_rdv + '</div><div' +
            ' class="agenda-date__lieu">' + date.fr_lieu + '</div><div class="agenda-date__content">' + date.fr_texte + '</div></div>';
        div_agenda.append(div);
    }
}

var dateLoaded = [];
var divCalendarDate = $$('#calendar-head-date');
var divLettresCalendar = $$('.lettres');
var listeMois = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

var parseMois = function (mois) {
    if (mois.toString().length == 1) {
        mois = "0" + mois;
    }
    return mois
}

// Calendrier ajout event sur les boutons
var calendarPreviousMonth = function (e) {
    e.preventDefault();
    var currentDate = new Date(divLettresCalendar.dataset('date').date);
    currentDate.setMonth(currentDate.getMonth() - 1);
    var mois = parseMois(currentDate.getMonth() + 1);
    var annee = currentDate.getFullYear();
    $$.get('https://www.robert-schuman.eu/applilettre/lettre/infos/' + mois + '/' + annee, function (data){
        feedCalendar(JSON.parse(data), currentDate);
    });
}

var calendarNextMonth = function (e) {
    e.preventDefault();
    var currentDate = new Date(divLettresCalendar.dataset('date').date);
    currentDate.setMonth(currentDate.getMonth() + 1);
    if (currentDate > new Date()) {
        return;
    }
    var mois = parseMois(currentDate.getMonth() + 1);
    var annee = currentDate.getFullYear();
    $$.get('https://www.robert-schuman.eu/applilettre/lettre/infos/' + mois + '/' + annee, function (data){
        feedCalendar(JSON.parse(data), currentDate);
    });
}

$$('#calendar-previous').on('click', calendarPreviousMonth);
$$('#calendar-next').on('click', calendarNextMonth);

var feedCalendar = function (lettres, d) {
    divCalendarDate.text(listeMois[d.getMonth()] + " " + d.getFullYear());
    if(d.length < 1) {
        return;
    }
    var mois = (d.getMonth() + 1).toString();
    mois = parseMois(mois);
    divLettresCalendar.attr('data-date', d.getFullYear() + '-' + mois + '-01');
    var div = '<div class="row">';
    for (var i in lettres) {
        var lettre = lettres[i];
        div += '<div class="col-50 lettre" data-lettreid="' + lettre.id_lettre + '"><a data-id="' + lettre.numero + '" class="switch-lettre lettre' +
            ' ' + ((lettre.id_lettre == currentLetter) ? 'disabled' : '') + '"><div' +
            ' class="lettre-content"><div' +
            ' class="number">n°' + lettre.numero + '</div><div class="date">' + lettre.date_publication + '</div></div></a></div>';
    }
    div += '</div>';
    divLettresCalendar.html(div);
    dateLoaded.push({date: d.getMonth() + "-" + d.getFullYear(), html: div});
    // Evènement changer de lettre en cours
    $$('.switch-lettre').on('click', function (e) {
        e.preventDefault();
        var id = this.dataset.id;
        $$.get('https://www.robert-schuman.eu/applilettre/lettre/' + id, function (data) {
            feedLettre(JSON.parse(data));
            setSelectedLettre(id);
        });
    })
}

var feedAuteurs = function (data) {
    return data.map(function (d) {
        return d.prenom + " " + d.nom;
    }).join(', ');
}

var feedLettre = function (data) {
    currentLetter = data.id;
    var articles = data.articles;
    var div_article = $$('.articles');
    var div_date = $$('.bandeau-content__left');
    div_date.text(data.date_publication);
    // Clear les divs
    div_article.empty();
    div_sommaire.empty();
    div_agenda.empty();

    $$('.bottom').html(data.footer.fr_footer);

    // Titre et Auteurs
    $$('.lettre-head .lettre-titre').text(data.lettre_titre);
    var auteurs = feedAuteurs(data.auteurs);
    $$('.lettre-head .lettre-soustitre').text("Auteur" + (data.auteurs.length > 1 ? 's' : '') + " : " + auteurs);
    feedAgenda(data.agenda);
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
        launchWebView(href);
        //createWebView(href);
    })

    $$('.sommaire-content span a').on('click', function () {
        div_sommaire.parent().removeClass('open');
        var href = this.dataset.href.substring(1);
        var el = document.getElementById(href);
        el.childNodes[1].classList.remove('hidden');
        el.scrollIntoView(true);
    });
}
// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    /**
     * Récupération de la dernière lettre
     */
    $$.get('https://www.robert-schuman.eu/applilettre/last/', null, function (data) {
        feedLettre(JSON.parse(data));

        /**
         * Récuparation des lettres du mois pour le calendrier
         */
        var d = new Date();
        var month = (d.getMonth() + 1).toString();
        var year = d.getFullYear();
        month = parseMois(month);
        $$.get('https://www.robert-schuman.eu/applilettre/lettre/infos/' + month + '/' + year, null, function (data) {
            feedCalendar(JSON.parse(data), d);
        })
    })
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
    scrollToTop();
    myApp.popover('.popover-lang', link);
})

$$('.open-calendar').on('click', function () {
    var link = this;
    scrollToTop();
    myApp.popover('.popover-calendar', link);
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