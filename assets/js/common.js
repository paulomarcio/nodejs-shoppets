var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371;
    var dLat = (lat2-lat1) * (Math.PI/180);
    var dLon = (lon2-lon1) * (Math.PI/180);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}

function initialize(start, destination) {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var center = new google.maps.LatLng(start.lat, start.lng);
    var mapOptions = {
        zoom: 5,
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
        } else {
            console.log(status);
        }
    });
}

function geoCodeByAddress(endereco) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode( { 'address': endereco}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var location = results[0].geometry.location;

            getResults(location.lat(), location.lng());

        } else {
            alert('Não pudemos encontrar sua localização pelo seguinte motivo: ' + status);
        }
    });
}

function getResults(lat, lng) {
    $('a.pagination').html('Pesquisando...');

    var tipo = $('#resultados').attr('data-type');
    var url = ($('a.pagination').attr('href') == '#') ? '/search?lat=' + lat + '&lng=' + lng + '&type=' + tipo : $('a.pagination').attr('href');

    $.ajax({
        url: url,
        cache: false,
        type: 'GET',
        success: function (response) {
            var maxPage = response.results;
            var origem = (response.data.petvet) ? response.data.petvet : ((response.data.pet) ? response.data.pet : response.data.vet);
            var itemCount = origem.items.length;
            var nextUrl = origem.nextUrl;
            var pageMessage = 'Mais resultados';

            if(itemCount < maxPage) {
                $('a.pagination').remove();
            } else {
                $('a.pagination').html(pageMessage);
                $('a.pagination').attr('href', nextUrl);
            }            

            for (var i = 0; i < itemCount; i++) {
                var id = origem.items[i].id;
                var imagem = (origem.items[i].image == undefined) ? '/images/badge_pets.png' : origem.items[i].image;
                var nome = origem.items[i].name;
                var distancia = ((origem.items[i].dist * 1) < 1) ? ((origem.items[i].dist * 1).toFixed(3)*1000) + ' m' : (origem.items[i].dist * 1).toFixed(1) + ' Km';
                var loc = origem.items[i].loc;

                $('#resultados').append('<div class="row lista">' + "\n"
                    + '<div class="col grid_12 pets">' + "\n"
                        + '<div class="row gutters">' + "\n"
                            + '<div class="logo-pet col grid_3">' + "\n"
                                + '<img src="' + imagem + '">' + "\n"
                            + '</div>' + "\n"
                            + '<div class="col grid_6">' + "\n"
                                + '<h3>' + nome + '</h3>' + "\n"
                                + '<h2>Distância: ' + distancia + '</h2>' + "\n"
                            + '</div>' + "\n"
                            + '<a href="/busca/detalhe?id=' + id + '&lat=' + loc[1] + '&lng=' + loc[0] + '&mylat=' + lat + '&mylng=' + lng + '" class="entrar col grid_3"><span>+</span> Detalhes</a>' + "\n"
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
    var mylat = $('#detalhes').attr('data-client-lat');
    var mylng = $('#detalhes').attr('data-client-lng');

    $('#detalhes').html('<p>Carregando...</p>');

    if(lat !== undefined && lng !== undefined) {
        $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            success: function(response) {

                var imagem = (response.image == undefined) ? '/images/badge_pets.png' : response.image;
                var email = (response.email == undefined) ? '' : response.email;
                var start = {
                    lat: mylat, 
                    lng: mylng
                };
                var destination = {
                    lat: response.loc[1], 
                    lng: response.loc[0]
                };
                var distancia = getDistanceFromLatLonInKm(start.lat, start.lng, destination.lat, destination.lng);
                distancia = (distancia < 1) ? ((distancia * 1).toFixed(3)*1000) + ' m' : (distancia * 1).toFixed(1) + ' Km';

                //console.log(start);
                //console.log(destination);

                $('#detalhes').html('<div class="logo-pet col grid_3"><img src="' + imagem+ '"></div>' + "\n"
                + '<div class="col grid_6">' + "\n"
                    + '<h3>' + response.name + '</h3>' + "\n"
                    + '<div class="avaliacao open">' + "\n"
                        + '<p><strong>Endereço:</strong> ' + response.address + '</p>' + "\n"
                        + '<p><strong>Distância:</strong> ' + distancia + '</p>' + "\n"
                        + '<p><strong>Telefone(s):</strong> ' + response.phones.join(', ') + '</p>' + "\n"
                        //+ '<p><strong>Email:</strong> <a href="mailto:' + email + '">' + email + '</a>' + "\n"
                    + '</div>' + "\n"
                + '</div>' + "\n"
                + '<a href="javascript:void(0);" class="entrar back col grid_3"> voltar</a>');

                $('title:first').text(response.name);

                initialize(start, destination);
            }
        });
    } else {
        location.redirect('/');
    }
}

$(document).ready(function () {

    // Listagem de resultados
    if ( $('#resultados').length ) {
        if ($('#resultados').attr('data-action') === 'geobusca') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;

                    $('#resultados').attr('data-lat', lat);
                    $('#resultados').attr('data-lng', lng);

                    getResults(lat, lng);

                    $('a.pagination').click(function () {
                        getResults(lat, lng);
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
            var endereco = $('#resultados').attr('data-endereco');

            geoCodeByAddress(endereco);

            $('a.pagination').click(function () {
                geoCodeByAddress(endereco);
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

    $(document).delegate('a.back', 'click', function(){
        window.history.back();
        $(this).blur();
        return false;
    });

    $('#busca-cep').mask('99999-999');

});