const RP = require('request-promise');
const DITTO = require('memory-cache');
const BASE_URL = 'http://pokeapi.co/api/v2/';	
const CACHE_TIME = 1000000 * 7; // 1 week

function Pokedex(){};

Pokedex.prototype = {

	getPokemon : function(name){
		name = (name.indexOf('?') > -1) ? name : name + '/'; 
		var url = BASE_URL + 'pokemon/' + name;
		return url;
	},
	getSpecies : function(name){
		var url = BASE_URL + 'pokemon-species/' + name + '/';
		return url;
	},
	getEvolutionChain : function(name){
		var url = name; //this returns us the whole URL
		return url;
	},
	getItem : function(name){
		// name = (name.indexOf('?') > -1) ? name : name + '/';
		var url = BASE_URL + 'item/' + name;
		return url;
	},
	getMachine : function(name){
		var url = BASE_URL + 'machine/' + name + '/';
		return url;
	},
	getBerry : function(name){
		var url = BASE_URL + 'berry/' + name + '/';
		return url;
	},
	getMove : function(name){
		var url = BASE_URL + 'move/' + name + '/';
		return url;
	},
	getLocation : function(name){
		var url = BASE_URL + 'location/' + name + '/';
		return url;
	},
	getJSON : function(URL){
		const cacheResult = DITTO.get(URL);

		if(cacheResult !== null){
			console.log('cached for [' + URL + ']');
			return Promise.resolve(cacheResult); //allows us to use .then
		}
		var options = {
			url : URL,
			json : true
		}
		return RP.get(options)
		.then(function(response){
			//put response in cache
			console.log('no cache for [' + URL + ']');
			DITTO.put(URL, response, CACHE_TIME);
			console.log(DITTO.keys());
			return response;
		})
		.catch(function(err){
			//console.log(err);
			//throw err;
			var error = {
				err : err, 
				status : 500,
				type : 'err',
				message : 'PokeAPI Issue'
			}
			return error;
		});
	}

}

module.exports = Pokedex;