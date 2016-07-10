// GLOBAL VARIABLES
var URL_PARAMS = {};
var POKEDEXTEXT = null;
var POKEMONMAX = 720;
var POKEMONMIN = 1;
var DEXTER_STATE = 0;
// var pokedexList = {"1":"Bulbasaur", "2":"Ivysaur", "3":"Venusaur", "4":"Charmander"};

$(document).ready(function(){
	getQS(URL_PARAMS);

	// for (var i = 0; i < pokedexList.length; i++) {
	// 	Things[i]
	// };

	//builds pokdex list in select input
	$.each(pokedexList, function(key, value) {
		$('#pokedexList')
		.append($("<option></option>")
			.attr("value",key)
			.text(value));
		// console.log("logging: " + key + value)
	});

	$( "#pokemonSearchBox" ).autocomplete({
      source: pokedexNames
    });


	//get dexter text
	$.each(responsePokemonSpecies.flavor_text_entries, function(index, value){
		var v = value;
		if(v.language.name === 'en'){
			POKEDEXTEXT = v.flavor_text;
			return false; //break out of .each loop
		}
	});

	// binding dexter click event
	$('#dexter').click(function(){
		if(POKEDEXTEXT){
			speak(POKEDEXTEXT);
		}
	});

	$("#pokedexList").val(responsePokemon.id);
	var pokemonNavPrevious = (parseInt(responsePokemon.id) === POKEMONMIN) ? POKEMONMAX : parseInt(responsePokemon.id) - 1;
	var pokemonNavNext = (parseInt(responsePokemon.id) === POKEMONMAX) ? POKEMONMIN : parseInt(responsePokemon.id) + 1;
	//set pokemonNav images and links
	$("#pokemonNavPreviousImage").attr("src", "/images/dex/pokemon-large/" + pokemonNavPrevious + ".png");
	$("#pokemonNavNextImage").attr("src", "/images/dex/pokemon-large/" + pokemonNavNext + ".png");
	$("#pokemonNavPreviousLink").attr("href", "./" + pokemonNavPrevious);
	$("#pokemonNavNextLink").attr("href", "./" + pokemonNavNext);

});

$(window).on('beforeunload', function(){
	if(responsiveVoice.isPlaying()){
		responsiveVoice.cancel();
	}
});
