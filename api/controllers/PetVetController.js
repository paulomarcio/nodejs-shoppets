/**
 * PetVetController
 *
 * @description :: Server-side logic for managing petvets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    var id = req.param('id'),
        lat = req.param("lat"), 
        lng = req.param("lng");
    if(id == undefined) {
      res.status(400).json({err:"id not specified"});  
    }else{
      if(lat === undefined || lng === undefined){
        PetVet.findOne(id).exec(function(err, petvet){
          if(err){
            res.status(400).json({err:"invalid id"});
          }else{
            if(!petvet) res.status(400).json({err:"not found"});
            else {
              delete petvet.foursquareRef;
              delete petvet.createdAt;
              delete petvet.updatedAt;
              res.status(200).json(petvet);
            }
          }
        });
      }else{
        lat = parseFloat(lat);
        lng = parseFloat(lng);          
        PetVet.native(function(err, collection) {
          if(err) res.status(400).json({err:"error getting model"});
          else{
            collection.aggregate(
              [ 
                {
                  '$geoNear': {
                    near :  [lng, lat],
                    spherical : true,
                    distanceField: "dist",
                    query: {'_id': require('mongodb').ObjectID(id)},
                    distanceMultiplier: 6371
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
                }
              ],          
              function(err, result){
                if (err) res.status(400).json({err:"error searching"});
                else{
                  if(result.length == 0) {
                    res.status(400).json({err:"not found"});
                  }else{
                    res.status(200).json(result[0]);
                  }                  
                }          
              }
            );                
          }
        }); 
      }
    }    
  }
};

