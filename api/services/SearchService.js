module.exports = {
  MAX_RESULTS: 5,
  MAX_DISTANCE: 1000*5,

  getPetVetByLocAndType: function(loc, type, p, cb) {

    var tipo = (type == 'PETVET') ? ['PET','VET','PETVET'] : [type];

    PetVet.native(function(err, collection) {
      if(err) cb(true, null);
      else{
        collection.aggregate(
          [ 
            {
              '$geoNear': {
                near :  loc,
                spherical : true,
                distanceField: "dist",
                query: {'type': {'$in': tipo}},
                distanceMultiplier: 6371,
                maxDistance: SearchService.MAX_DISTANCE
              }
            },
            {
              '$project': {
                _id: false,
                id: '$_id',
                dist: 1,
                type: 1,
                name: 1,
                loc: 1,
                address: 1,
                image: 1,
                phones: 1,
                email: 1,
                website: 1                
              }
            },
            {'$skip': (p-1)*SearchService.MAX_RESULTS},
            {'$limit': SearchService.MAX_RESULTS}
          ],          
          function(err, result){
            if (err) cb(err, null);            
            else{
              cb(null, result);    
            }          
          }
        );                
      }
    });    
  }
};