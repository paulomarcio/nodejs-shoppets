module.exports = {
  MAX_RESULTS: 5,
  MAX_DISTANCE: 1000*5,

  getPetVetByLocAndType: function(loc, type, p, cb) {
    var findParams = {
      'type': { '$in': [type, "PETVET"] },
      'loc': { 
        '$near': {
          '$geometry' : {
            'type': "Point",
            'coordinates': loc
          },
          '$maxDistance' : SearchService.MAX_DISTANCE
        }
      }
    };
    PetVet.find({ where:findParams, skip: (p-1)*SearchService.MAX_RESULTS, limit: SearchService.MAX_RESULTS }, function(err, petvets){
      if (err){
        cb(err, null);        
      } else {              
        cb(null, petvets);
      }            
    });
  }
};