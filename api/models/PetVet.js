/**
* PetVet.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    type: {
      type: 'string',
      enum: ['PET', 'VET', 'PETVET']
    },
    name: {
      type: 'string'
    },
    loc: {
      type: 'array'
    },
    address: {
      type: 'string'
    },
    image: {
      type: 'string'
    },
    phones: {
      type: 'array'
    },
    email: {
      type: 'string'
    },
    website: {
      type: 'string'
    },
    foursquareRef: {
      type: 'string'
    }
  }
};

