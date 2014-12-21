function getResults(lat, lng, tipo) {
    $('a.pagination').html('Pesquisando...');

    $.ajax({
        url: 'http://private-b5f28-shoppet.apiary-mock.com/search?lat=' + lat + '&lng=' + lng + '&type=' + tipo,
        cache: false,
        //dataType: 'json',
        type: 'GET',
        success: function(response) {                
            $('a.pagination').html('Mais resultados');
            $('a.pagination').attr('href', 'http://private-b5f28-shoppet.apiary-mock.com' + response.data.pet.nextUrl);

            for(var i = 0; i < response.data.pet.items.length; i++) {
                var imagem = response.data.pet.items[i].image;
                var nome = response.data.pet.items[i].name;
                var distancia = ((response.data.pet.items[i].dist*1) < 1000) ? response.data.pet.items[i].dist + ' m' : ((response.data.pet.items[i].dist*1)/1000).toFixed(1) + ' Km';

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
        }
    });
}

$(document).ready(function() {
  if($('#resultados').is('*')){    
    if($('#resultados').attr('data-action') == 'geobusca') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var tipo = $('#resultados').attr('data-action');

          $('#resultados').attr('data-lat', lat);
          $('#resultados').attr('data-lng', lng);

          getResults(lat, lng, tipo);

          $('a.pagination').click(function(){
            getResults(lat, lng, tipo);
            $(this).blur();
            return false;
          });

        }, function(msg){
          var mensagem = typeof msg == 'string' ? msg : "Falhou";
          $('#resultados').html(mensagem);
        });

        //console.log('geobusca');
      } else {
        $('#resultados').html('<h2>Navegador não suporta Geo Localização</h2>');
      }
    } else {
      var tipo = $('#resultados').attr('data-action');
      var lat = $('#resultados').attr('data-lat');
      var lng = $('#resultados').attr('data-lng');

      getResults(lat, lng, tipo);

      $('a.pagination').click(function(){
        getResults(lat, lng, tipo);
        $(this).blur();
        return false;
      });

      //console.log('busca');
    }
  }
});