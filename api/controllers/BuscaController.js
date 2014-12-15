/**
 * BuscaController
 *
 * @description :: Server-side logic for managing buscas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res, next) {
		var geocoder = require('geocoder');
		var endereco = req.param('endereco') + ',' + req.param('numero') + ',' + req.param('cidade') + ',' + req.param('uf');

		geocoder.geocode(endereco, function(err, result) {
			if (err) return next(err);

			if(result.results.length) {
				var latlong = [result.results[0].geometry.location.lat, result.results[0].geometry.location.lng];

				Client.find({'loc': {'$near': {'$geometry': {type: 'Point', coordinates: latlong, '$maxDistance': 1}}}}, function(err, clients){
					if (err) return next(err);

					res.view({
						clients: clients
					});
				});
			} else {
				Client.find(function(err, clients){
					if (err) return next(err);

					res.view({
						clients: clients
					});
				});
			}

			//res.json(result);
		});
	},

	endereco: function(req, res, next){
		var http = require('http');
		var cep = req.param('cep');
		var url = 'http://cep.republicavirtual.com.br/web_cep.php?cep=' + cep + '&formato=json';

		var options = {
			hostname: 'cep.republicavirtual.com.br',
			port: 80,
			path: '/web_cep.php?cep=' + cep + '&formato=json',
			method: 'GET'
		};

		http.request(options, function(response){
			var responseData = '';

			response.setEncoding('utf8');

			response.on('data', function(chunk){
		    	responseData += chunk;
		    });

			response.once('error', function(err){
				// Some error handling here, e.g.:
				res.serverError(err);
			});

			response.on('end', function(){
				var correio = JSON.parse(responseData);

				res.view({
					correio: correio
				});
			});

		}).end();
	}
};