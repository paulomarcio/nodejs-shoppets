/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Faker = require('faker');
Faker.locale = "pt_BR";

module.exports = {
  random: function (req, res) {
    var types = ['PET', 'VET', 'PETVET'];
    
    var data = {
      type: types[Math.floor(Math.random() * types.length)], 
      name: Faker.company.companyName(),
      loc: [parseFloat(Faker.address.longitude()), parseFloat(Faker.address.latitude())],
      address: Faker.address.streetAddress(),
      image: Faker.image.imageUrl(),
      phones: Faker.phone.phoneNumber(),
      email: Faker.internet.email(),
      website: Faker.internet.domainName(),
      foursquareRef: ''
    };

    PetVet.create(data).exec(function (err, petvet) {
      if(petvet){
        res.status(200).json(petvet.toJSON());
      }else{
        res.status(400).json({message:"Erro ao criar PetVet aleatorio!", err: err, data: data});
      }
    });    
  },
};
