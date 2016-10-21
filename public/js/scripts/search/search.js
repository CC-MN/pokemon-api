(function() {

 'use strict';

	var PoketDex = function(array, element){
		/*	
			Set the object
		*/
		console.log(this);
		this.pokemonArray = array;
		this.pokemonElement = element;
	}

	/*	
		Prototype Methods
	*/
	PoketDex.prototype = {
		getID  : function(array){
			var _self = this;
			var names = [];
			for(var i = 0; i < array.length; i++){
				var id = Utilities.getIDFromPokemonURL(array[i].url);
				var pokemonName = array[i].name;
				var object = {
					id 					: 	id,
					pokemonName : 	pokemonName
				}
				names.push(pokemonName);
				_self.listPokemon(object);
			}

			this.pokemonNames = names;
		},
		listPokemon : function(object){
			var imageUrl = '/images/dex/pokemon-large/' + object.id + '.png';
			// imageUrl = ( imageExists(imageUrl) ) ? imageUrl : '/images/dex/default.png';
		
			var html 		= 		'<a href="' + object.id + '"><div class="pokemon">';
			html				+=		'<div class="pokemonImage"><img src="' + imageUrl + '" /></div>'
			html 				+= 		'<div class="pokemonId">#' + object.id + '</div>';
			html 				+= 		'<div class="pokemonName">' + object.pokemonName.replace(/\-/g, ' ') + '</div>';
			html 				+=		'</div></a>';

			document.querySelector(this.pokemonElement).innerHTML += html;
		}
	}

	function init(){
		/*
			Run on page load
		*/
		var me = self.PoketDex;
		me.getID(me.pokemonArray);
		
	}

	// set Event Listener to run once DOM has loaded
	if(typeof Document){
		document.addEventListener("DOMContentLoaded", init);
	}

	// Make sure to export PoketDex on self when in a browser
	if (typeof self !== "undefined") {
		self.PoketDex = PoketDex;
	}

	// Expose PoketDex as a CJS module (ES5)
	if (typeof module === "object" && module.exports) {
		module.exports = PoketDex;
	}

	return PoketDex;

}());