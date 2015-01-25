/**
 * BuscaController
 *
 * @description :: Server-side logic for managing buscas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function (req, res, next) {

        if (req.param('endereco') && req.param('numero') && req.param('cidade') && req.param('uf')) {
            var geocoder = require('geocoder');
            var endereco = req.param('endereco') + ',' + req.param('numero') + ',' + req.param('cidade') + ',' + req.param('uf');
            var tipo = req.param('tipo');

            res.view({
                endereco: endereco,
                tipo: tipo,
                acao: 'busca'
            });
        } else {
            res.view({
                endereco: 0,
                tipo: 'petvet',
                acao: 'geobusca'
            });
        }
    },
    endereco: function (req, res, next) {

        var cep = require('cep');

        if (req.param('cep')) {
            cep.request.data.from(req.param('cep'), function (err, endereco) {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                }

                res.view({
                    endereco: endereco
                });
            });
        } else {
            res.view({
                endereco: {
                    logradouro: '',
                    bairro: '',
                    localidade: '',
                    uf: ''
                }
            });
        }
    },
    detalhe: function (req, res, next) {
        var id = req.param('id');
        var lat = req.param('lat');
        var lng = req.param('lng');
        var mylat = req.param('mylat');
        var mylng = req.param('mylng');

        res.view({
            id: id,
            lat: lat,
            lng: lng,
            mylat: mylat,
            mylng: mylng
        });
    }
};