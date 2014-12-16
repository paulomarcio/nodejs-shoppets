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
			if (err) {
				console.log(err);
				res.redirect('/');
			};

			if(result.results.length) {
				res.view({
					lat: result.results[0].geometry.location.lat,
					lng: result.results[0].geometry.location.lng
				});
			} else {
				console.log('Não foi encontrado resultados para o endereço informado!');
				res.redirect('/');
			}
		});
	},

	endereco: function(req, res, next){

		var cep = require('cep');

		if(req.param('cep')) {
			cep.request.data.from(req.param('cep'), function(err, endereco){

				//res.json(endereco);

				if (err) {
					console.log(err);
					res.redirect('/');
				}

				res.view({
					endereco: endereco
				});
			});
		} else {
			res.redirect('/');
		}		

		// Código utilizando SOAP com Webservice dos Correios
		/*var soap = require('soap');
		var url = 'https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl';		
		var args = {cep: req.param('cep')};

		soap.createClient(url, function(err, atendeCliente) {
			if (err) return next(err);

			//res.json(atendeCliente.describe());

			atendeCliente.AtendeClienteService.AtendeClientePort.consultaCEP(args, function(err, correio) {
				if (err) return next(err);

				res.view({
					correio: correio
				});
			});
		});*/
	}
};