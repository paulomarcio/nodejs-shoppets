var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function initialize(start, destination) {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var center = new google.maps.LatLng(start.lat, start.lng);
    var mapOptions = {
        zoom:7,
        center: center
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
    calcRoute(start, destination);
}

function calcRoute(start, destination) {
    var request = {
        origin: new google.maps.LatLng(start.lat, start.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
}

function getResults(lat, lng, tipo) {
    $('a.pagination').html('Pesquisando...');

    var url = ($('a.pagination').attr('href') == '#') ? '/search?lat=' + lat + '&lng=' + lng + '&type=' + tipo : $('a.pagination').attr('href');

    $.ajax({
        url: url,
        cache: false,
        type: 'GET',
        success: function (response) {
            var maxPage = response.results;
            var itemCount = response.data.petvet.items.length;
            var nextUrl = response.data.petvet.nextUrl;
            var pageMessage = 'Mais resultados';

            if(itemCount < maxPage) {
                $('a.pagination').remove();
            } else {
                $('a.pagination').html(pageMessage);
                $('a.pagination').attr('href', nextUrl);
            }            

            for (var i = 0; i < itemCount; i++) {
                var id = response.data.petvet.items[i].id;
                var imagem = response.data.petvet.items[i].image;
                var nome = response.data.petvet.items[i].name;
                var distancia = ((response.data.petvet.items[i].dist * 1) < 1000) ? (response.data.petvet.items[i].dist * 1).toPrecision(1) + ' m' : ((response.data.petvet.items[i].dist * 1) / 1000).toPrecision(1) + ' Km';
                var loc = response.data.petvet.items[i].loc;

                $('#resultados').append('<div class="row lista">' + "\n"
                    + '<div class="col grid_12 pets">' + "\n"
                        + '<div class="row gutters">' + "\n"
                            + '<div class="logo-pet col grid_3">' + "\n"
                                + '<img src="' + imagem + '" width="230" height="107">' + "\n"
                            + '</div>' + "\n"
                            + '<div class="col grid_6">' + "\n"
                                + '<h3>' + nome + '</h3>' + "\n"
                            + '<div class="avaliacao open">Distância: ' + distancia + '</div>' + "\n"
                        + '</div>' + "\n"
                        + '<a href="/busca/detalhe?id=' + id + '&lat=' + loc[0] + '&lng=' + loc[1] + '" class="entrar col grid_3"><span>+</span> Detalhes</a>' + "\n"
                        + '</div>' + "\n"
                    + '</div>' + "\n"
                + '</div>');
            }
        },
        error: function() {
            $('#resultados').html('<h2>Problemas na consulta</h2>');
            $('a.pagination').html('Pesquisa finalizada');
        }
    });
}

function getDetalhes(id, lat, lng) {
    var url = '/petvet?id=' + id + '&lat=' + lat + '&lng=' + lng;

    $('#detalhes').html('<p>Carregando...</p>');

    $.ajax({
        url: url,
        type: 'GET',
        cache: false,
        success: function(response) {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var distancia = ((response.dist * 1) < 1000) ? response.dist + ' m' : ((response.dist * 1) / 1000).toPrecision(1) + ' Km';                                        
                    var start = {
                        lat: position.coords.latitude, 
                        lng: position.coords.longitude
                    };
                    var destination = {
                        lat: response.loc[0], 
                        lng: response.loc[1]
                    };

                    $('#detalhes').html('<div class="logo-pet col grid_3"><img src="' + response.image + '" width="230" height="107"></div>' + "\n"
                    + '<div class="col grid_6">' + "\n"
                        + '<h3>' + response.name + '</h3>' + "\n"
                        + '<div class="avaliacao open">' + "\n"
                            + '<p><strong>Distância:</strong> ' + distancia + "\n"
                            + '<p><strong>Endereço:</strong> ' + response.address + '</p>' + "\n"
                            + '<p><strong>Telefone(s):</strong> ' + response.phones.join(', ') + '</p>' + "\n"
                            + '<p><strong>Email:</strong> <a href="mailto:' + response.email + '">' + response.email + '</a>' + "\n"
                        + '</div>' + "\n"
                    + '</div>' + "\n"
                    + '<a href="/busca" class="entrar back col grid_3"> voltar</a>');

                    initialize(start, destination);

                }, function (msg) {
                    var mensagem = typeof msg === 'string' ? msg : "Falhou";
                    var distancia = ((response.dist * 1) < 1000) ? response.dist + ' m' : ((response.dist * 1) / 1000).toPrecision(1) + ' Km';

                    $('#detalhes').html('<div class="logo-pet col grid_3"><img src="' + response.image + '" width="230" height="107"></div>' + "\n"
                    + '<div class="col grid_6">' + "\n"
                        + '<h3>' + response.name + '</h3>' + "\n"
                        + '<div class="avaliacao open">' + "\n"
                            + '<p><strong>Distância:</strong> ' + distancia + "\n"
                            + '<p><strong>Endereço:</strong> ' + response.address + '</p>' + "\n"
                            + '<p><strong>Telefone(s):</strong> ' + response.phones.join(', ') + '</p>' + "\n"
                            + '<p><strong>Email:</strong> <a href="mailto:' + response.email + '">' + response.email + '</a>' + "\n"
                        + '</div>' + "\n"
                    + '</div>' + "\n"
                    + '<a href="/busca" class="entrar back col grid_3"> voltar</a>');
                });
            }            
        }
    });
}

$(document).ready(function () {

    // Listagem de resultados
    if ( $('#resultados').length ) {
        if ($('#resultados').attr('data-action') === 'geobusca') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var tipo = $('#resultados').attr('data-type');

                    $('#resultados').attr('data-lat', lat);
                    $('#resultados').attr('data-lng', lng);

                    getResults(lat, lng, tipo);

                    $('a.pagination').click(function () {
                        getResults(lat, lng, tipo);
                        $(this).blur();
                        return false;
                    });

                }, function (msg) {
                    var mensagem = typeof msg === 'string' ? msg : "Falhou";
                    $('#resultados').html(mensagem);
                });
            } else {
                $('#resultados').html('<h2>Navegador não suporta Geo Localização</h2>');
            }
        } else {
            var tipo = $('#resultados').attr('data-tipo');
            var lat = $('#resultados').attr('data-lat');
            var lng = $('#resultados').attr('data-lng');

            getResults(lat, lng, tipo);

            $('a.pagination').click(function () {
                getResults(lat, lng, tipo);
                $(this).blur();
                return false;
            });
        }
    }

    // Detalhamento
    if ( $('#detalhes').length ) {
        var id = $('#detalhes').attr('data-id');
        var lat = $('#detalhes').attr('data-lat');
        var lng = $('#detalhes').attr('data-lng');

        getDetalhes(id, lat, lng);
    }

});