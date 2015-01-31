/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Faker = require('faker');
Faker.locale = "pt_BR";

function generateRandomPoint(center, radius) {
    var x0 = center.lng;
    var y0 = center.lat;
    // Convert Radius from meters to degrees.
    var rd = radius / 111300;

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    var xp = x / Math.cos(y0);

    // Resulting point.
    return {'lat': y + y0, 'lng': xp + x0};
}

module.exports = {
    random: function (req, res) {
        var types = ['PET', 'VET', 'PETVET'];

        var point = generateRandomPoint({lat: -22.8635555, lng: -43.4464647}, 1000 * 20);

        var data = {
            type: types[Math.floor(Math.random() * types.length)],
            name: Faker.company.companyName(),
            loc: [point.lng, point.lat],
            address: Faker.address.streetAddress(),
            image: Faker.image.imageUrl(),
            phones: Faker.phone.phoneNumber(),
            email: Faker.internet.email(),
            website: Faker.internet.domainName(),
            foursquareRef: ''
        };

        PetVet.create(data).exec(function (err, petvet) {
            if (petvet) {
                res.status(200).json(petvet.toJSON());
            } else {
                res.status(400).json({message: "Erro ao criar PetVet aleatorio!", err: err, data: data});
            }
        });
    },
    maps: function (req, res) {
        PetVet.find({}, function (err, petvets) {
            if (err) {
                res.status(500).json({err: "erro procurando!"});
            } else {
                res.view("search/maps", {data: petvets, layout: null});
            }
        });
    },
    index: function (req, res) {
        var lat = req.param("lat"),
        lng = req.param("lng"),
        type = req.param("type"),
        p = req.param("p") || 1;

        p = parseInt(p);

        var ret = {},
        status = 200;

        if (lat === undefined || lng === undefined) {
            status = 400;
            ret.err = "Location invalid";
            res.status(status).json(ret);
        } else {
            lat = parseFloat(lat);
            lng = parseFloat(lng);
            
            if (type !== undefined) {
                type = type.toUpperCase();
                
                if (PetVet.attributes.type.enum.indexOf(type) === -1) {
                    status = 400;
                    ret.err = "Type invalid";
                    res.status(status).json(ret);
                } else {
                    SearchService.getPetVetByLocAndType([lng, lat], type, p, function (err, petvets) {
                        if (err) {
                            status = 400;
                            ret.err = "Error searching";
                            res.status(status).json(ret);
                        } else {
                            ret.results = SearchService.MAX_RESULTS;
                            ret.data = {};
                            ret.data[type.toLowerCase()] = {
                                nextUrl: "/search?lat=" + lat + "&lng=" + lng + "&type=" + type + "&p=" + (p + 1),
                                items: petvets
                            };
                            res.status(status).json(ret);
                        }
                    });
                }
            } /*else {
                SearchService.getPetVetByLocAndType([lng, lat], "PETVET", p, function (err, petvets) {
                    if (err) {
                        status = 400;
                        ret.err = "Error searching";
                        res.status(status).json(ret);
                    } else {
                        ret.data = {
                            petvet: {
                                nextUrl: "/search?lat=" + lat + "&lng=" + lng + "&type=PETVET&p=" + (p + 1),
                                items: petvets
                            }
                        };

                        SearchService.getPetVetByLocAndType([lng, lat], "VET", p, function (err, petvets) {
                            if (err) {
                                status = 400;
                                ret.err = "Error searching";
                                res.status(status).json(ret);
                            } else {
                                ret.results = SearchService.MAX_RESULTS;
                                ret.data.vet = {
                                    nextUrl: "/search?lat=" + lat + "&lng=" + lng + "&type=VET&p=" + (p + 1),
                                    items: petvets
                                };
                                res.status(status).json(ret);
                            }
                        });
                    }
                });
            }*/
        }
    }
};
