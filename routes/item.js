var express = require('express');
var router = express.Router();
var PokedexLib = require('../pokedex');
var Pokedex = new PokedexLib();

/* GET home page. */
router.get('/', function(req, res, next) {
	renderContent('1', req, res); //default to master-ball
});

/* GET home page. */
router.get('/:id', function(req, res, next) {
	renderContent(req.params.id, req, res);
});


function renderContent(id, req, res){
	var content = { title : 'Pokemon API' }

	Pokedex.getJSON(Pokedex.getItem(id))
	.then(function(response){
		errorHandling(response, req, res);
		//get item info
		content.itemResponse = response;
		content.itemResponseString = JSON.stringify(response);
		content.pageName = response.name;
		return Pokedex.getJSON(Pokedex.getItem('?limit=999'));
		
	}).then(function(response){

			content.allItemNames = response;
			content.allItemNamesString = JSON.stringify(response);

			content.partials = {
				header 		: 	'partials/header',
				loading 	: 	'partials/loading'
			}

			if(response.type !== 'err'){
				res.render('item', content);
			}
		});
}

function errorHandling(response, req, res){
	if(response.type === 'err'){
		if(res.headersSent){
			//return next(response);
		}else{
			res.status(response.status);
			res.render('error', {err : response.err, message : response.message, response: response.err });
		}
	}
}

module.exports = router;
