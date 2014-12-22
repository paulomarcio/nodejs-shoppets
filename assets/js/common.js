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
                var imagem = response.data.petvet.items[i].image;
                var nome = response.data.petvet.items[i].name;
                var distancia = ((response.data.petvet.items[i].dist * 1) < 1000) ? response.data.petvet.items[i].dist + ' m' : ((response.data.petvet.items[i].dist * 1) / 1000).toFixed(1) + ' Km';

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
                        + '<a href="#" class="entrar col grid_3"><span>+</span> Detalhes</a>' + "\n"
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

$(document).ready(function () {
    if ($('#resultados').is('*')) {
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
});