

function speak(pokedexText) {
  // DEXTER_STATE's 0 = stopped, 1 = playing, 2 = paused
  if(DEXTER_STATE === 2){
    responsiveVoice.resume();
    DEXTER_STATE = 1;
    //add code to change button state
    $('#dexter').html('&#9616;&#9616;').addClass('pause');
  }else if(responsiveVoice.isPlaying()){
    responsiveVoice.pause();
    DEXTER_STATE = 2;
    //add code to change button state
    $('#dexter').html('&#9658;').removeClass('pause');
  }else{
    responsiveVoice.speak(pokedexText, "UK English Male", {
      onend : function(){
        DEXTER_STATE = 0;
        $('#dexter').html('&#9658;').removeClass('pause');
      }
    });
    DEXTER_STATE = 1;
    $('#dexter').html('&#9616;&#9616;').addClass('pause');
  }
}

// Set the width of the side navigation to show 
function openNav() {
  $('#mySidenav').css('width', '25%');
}

// Set the width of the side navigation to 0 
function closeNav() {
  $('#mySidenav').css('width','0px');
}

function pokemonAutoComplete() {

  $.each(responsePokemonNames.results, function(index, value){
    var name = value.name;
    POKEMON_NAMES.push(name);
  });
  var options = {
    data        :   POKEMON_NAMES,
    theme       :   'square',
    adjustWidth : false,

    list        :   {
      match          : {
        enabled: true
      },
      onChooseEvent   :   function(){
        var pokemonName = $("#pokemonSearchBox").getSelectedItemData();
        changePokemon(pokemonName);
      }
    }
  }

  $('#pokemonSearchBox').easyAutocomplete(options);

}

function selectPokemon(pokemonID) {
  window.location = "./" + pokemonID;
}

function changePokemon(pokemonID) {
  console.log(pokemonID);
  if (pokemonID !== null) {
    pokemonID = pokemonID.toLowerCase();
    //make sure that pokemon name exists
    if(POKEMON_NAMES.indexOf(pokemonID) > -1){

      window.location = "./" + pokemonID;
    }
  };
};

function showSearch(){
  if ($( "#searchContainer" ).hasClass("hidden")) {
    $('#searchContainer').removeClass("hidden");
    $('#pokemonSearchBox').focus();
  }else {
    $('#searchContainer').addClass("hidden");
  }
}

function useList() {
  $('#pokedexList').focus();
}

function showSection(sectionName){
  sectionName = sectionName.trim();

  if ($( "#" + sectionName ).hasClass("hidden")) {
    $('#' + sectionName).parent().find('button').html('&#8211;');
    $('#' + sectionName).removeClass("hidden");
    $('#' + sectionName).addClass("expanded");
    $('#' + sectionName).focus();
  }else {
    $('#' + sectionName).parent().find('button').html('+');
    $('#' + sectionName).addClass("hidden");
  }
}


//Section: Abilities
function getAbilityDetail(i){
  var nthchild = i+1
  $( ".ability:nth-child(" + nthchild + ")" ).append( ": " + abilities[responsePokemon.abilities[i].ability.name] );

}

//Section Evolution Chain
function evolutionChain(id, data){
  console.log('evolutionChain');
  console.log(data);
  
  if(!data.chain.evolves_to){
    $('#evolutionChainContent').html('No evolution available');
    return;
  }

  var evolutionChain = data.chain.evolves_to;

  var evolutionMap = [];
  //this will contain a sprite toggle to show shinys
  $('#evolutionChainContent').html('<div class="half"><div class="onethird">Shiny:</div><div class="twothirds"><label id="shinyToggleSwitch" class="switch"><input type="checkbox" id="shinyToggleMode" name="shinyToggleMode" value="0" onchange="toggleShinyModels()"><div class="slider"></div></label></div></div>');
  $('#evolutionChainContent').append('<div class="half">&nbsp;</div>');
  $('#evolutionChainContent').append('<div class="row"></div>');

  //builds a column for first pokemon in the chain
  $('#evolutionChainContent .row').append('<div class="column"></div>');

  $('#evolutionChainContent .row .column').append('<div class="pokemon"></div>');
  $('#evolutionChainContent .row .column .pokemon').append('<a href="/pokemon/' + getIDFromSpeciesURL(data.chain.species.url) + '"><img class="model" src="/images/dex/pokemon/' + getIDFromSpeciesURL(data.chain.species.url) + '.png" /></a>');
  $('#evolutionChainContent .row .column .pokemon').append('<div class="evolutionName">' + data.chain.species.name + '</div>');
  //if a baby pokemon that requires a trigger item, include that
  if (data.baby_trigger_item) {
    $('.evolutionName').append('<div class="babyTriggerItem">(Hatch by breeding parents holding ' + data.baby_trigger_item.name + ')</div>');
  };

  $.each(evolutionChain, function(i, v){

    var evolutionInformation = v;
    console.log(evolutionInformation);
    buildEvolutionContent('chain-1', evolutionInformation);
    //check to see if they have a third form
    if(v.evolves_to.length === 0){
      return true; //skip iteration
    }

    $.each(v.evolves_to, function(i2, v2){

      var evolutionInformation = v2;
      console.log(evolutionInformation);
      buildEvolutionContent('chain-2', evolutionInformation);

    });

  });

  $('#evolutionChainContent').append('<div class="clearfloat"></div>');
  
  
  //add mega evolutions if present
  $('#evolutionChainContent').append('<div class="row hidden" id="megaEvolution">');
  $('#megaEvolution').append('<div class="tab leftAlign">Mega Evolution</div>')
  $('#megaEvolution').append('<div id="megaEvolutionContainer"></div>')
  if (responsePokemonSpecies.forms_switchable == true) {
    for (var i = 0; i < responsePokemonSpecies.varieties.length; i++) {
      if (responsePokemonSpecies.varieties[i].pokemon.name.indexOf('mega') > 0) {
        var megaName = responsePokemonSpecies.varieties[i].pokemon.name.replace(responsePokemon.name, '');
        console.log(megaName);
        $('#megaEvolution').removeClass('hidden');
        var html = '';
        html += '<div class="pokemon">';
        html += '<a href="/pokemon/' + getIDFromPokemonURL(responsePokemonSpecies.varieties[i].pokemon.url) + '"><img src="/images/dex/pokemon/' + responsePokemonSpecies.id + megaName + '.png" /></a>';
        html += '<div class="evolutionName">' + responsePokemonSpecies.varieties[i].pokemon.name + '</div>';
        html += '</div>';

        $('#megaEvolutionContainer').append(html);

      };
    };
  }

  

  //count how many columns we have to dynamically set the width
  var columnAmount = $('#evolutionChainContent .column').length;
  $('#evolutionChainContent .column').css({
    'width' : (columnAmount === 1) ? '100%' : (85 / parseInt(columnAmount))+'%'
  });
  return;
}

function toggleShinyModels(){
  if (document.getElementById('shinyToggleMode').checked) {
    $("#evolutionChainContent").find(".pokemon").each(function () {
      var img = $(this).find("img");
      img.prop("src", img.prop("src").replace("pokemon/", "pokemon/shiny/"));
    });    
  } else {
    $("#evolutionChainContent").find(".pokemon").each(function () {
    var img = $(this).find("img");
    img.prop("src", img.prop("src").replace("pokemon/shiny/", "pokemon/"));
  });
  }
  
}


function buildEvolutionContent(className, evolutionInformation){

  //check to see if it is level, item or location
  var evolutionDetail = evolutionInformation.evolution_details[0];

  //checks if evolution is gender based and sets appropriate gender requirement
  if (evolutionDetail.gender != null) {
    if (evolutionDetail.gender == 1) {
      var evolutionGender = "Gender: Female";
    } else if (evolutionDetail.gender == 2) {
      var evolutionGender = "Gender: Male"
    }
  }

  //checks if evolution is based on stats and provides information on conditions
  if (evolutionDetail.relative_physical_stats != null) {
    if (evolutionDetail.relative_physical_stats > 0) {
      var evolutionStats = 'With Attack > Defense'
    } else if (evolutionDetail.relative_physical_stats < 0) {
      var evolutionStats = 'With Defense > Attack'
    } else {
      var evolutionStats = 'When Attack = Defense'
    }
  }

  //dump out pokemon data here
  var content = {
    // evolutionType : evolutionType,
    evolutionName : evolutionInformation.species.name,
    evolutionTrigger : evolutionDetail.trigger.name,
    evolutionItem : (evolutionDetail.item) ? evolutionDetail.item.name : null,
    evolutionLevel : (evolutionDetail.min_level != null) ? 'Level: ' + evolutionDetail.min_level : null,
    evolutionLocation : (evolutionDetail.location) ? 'at ' + evolutionDetail.location.name : null,
    evolutionTime : (evolutionDetail.time_of_day !== '') ? 'during ' + evolutionDetail.time_of_day : null,
    evolutionHeldItem : (evolutionDetail.held_item != null) ? 'while holding ' + evolutionDetail.held_item.name : null,
    evolutionAttack : (evolutionDetail.known_move != null) ? 'knows ' + evolutionDetail.known_move.name : null,
    evolutionAttackType : (evolutionDetail.known_move_type != null) ? 'knows a ' + evolutionDetail.known_move_type.name + '-type move' : null,
    evolutionWeather : (evolutionDetail.needs_overworld_rain == true) ? 'in the rain' : null,
    evolutionConsoleState : (evolutionDetail.turn_upside_down == true) ? 'turn 3DS upside-down' : null,
    evolutionStats : evolutionStats,
    evolutionBeauty : (evolutionDetail.min_beauty) ? 'Min Beauty: ' + evolutionDetail.min_beauty : null,
    evolutionHappiness : (evolutionDetail.min_happiness) ? 'Min Happiness: ' + evolutionDetail.min_happiness : null,
    evolutionAffection : (evolutionDetail.min_affection) ? 'Min Affection: ' + evolutionDetail.min_affection : null,
    evolutionPartySpecies : (evolutionDetail.party_species != null) ? 'with ' + evolutionDetail.party_species.name + ' in party' : null,
    evolutionPartySpeciesType : (evolutionDetail.party_type != null) ? 'with a ' + evolutionDetail.party_type.name + '-type in party' : null,
    evolutionTradeSpecies : (evolutionDetail.trade_species != null) ? 'trade for a ' + evolutionDetail.trade_species.name : null,
    evolutionGender : evolutionGender
  }

  var evolutionURL = evolutionInformation.species.url;

  //builds baby trigger info, but that shouldnt sit here
  // if (evolutionInformation.is_baby == true && evolutionInformation.baby_trigger_item != null) {
  //   evolutionTrigger = 'Triggered by breeding parents holding' + evolutionInformation.baby_trigger_item.name;
  // }

  if($('#evolutionChainContent').find('.' + className).length === 0){
    $('#evolutionChainContent').append('<div class="column '+ className +'"></div>');
  }

  var html = '<div class="pokemon">';
  html += '<a href="/pokemon/' + getIDFromSpeciesURL(evolutionURL) + '"><img class="model" src="/images/dex/pokemon/' + getIDFromSpeciesURL(evolutionURL) + '.png" /></a>';

  // $('#evolutionChainContent .' + className).append('<div class="evolutionDetail">' + content.evolutionType + ' </div>');

  //loop through content object
  $.each(content, function(k, v){
    if(!content[k]){
      return true; //skip iteration
    }
    if(k === 'evolutionItem'){
      html += '<div class="' + k + '"><a href="/item/' + v + '">' + v + ' <img src="/images/dex/item/' + v + '.png"></a></div>'
    }else{
      html += '<div class="' + k + '">' + v + '</div>';
    }
  });

  html += '</div>';
  $('#evolutionChainContent .' + className).append(html);

}

//Section: Damage Chart
function damageChartSetStats(DAMAGE_TO_TYPE,responsePokemon){
  // console.log("damage_to_type object:");
  console.log(DAMAGE_TO_TYPE);
  // console.log("responsePokemon object:");
  // console.log(responsePokemon);
  if (responsePokemon.types.length < 2) {
    //calculate a single type effectiveness
    var damageObjectType1 = DAMAGE_TO_TYPE[responsePokemon.types[0].type.name];
    for(key in damageObjectType1){
      //converts decimal values to symbols
      if (damageObjectType1[key] == 0.25) {
        damageObjectType1[key] = "¼"
      }else if (damageObjectType1[key] == 0.5) {
        damageObjectType1[key] = "½"
      };
      //
      $("td." + key + ".damageValueCell").html(damageObjectType1[key]);
      //removes any existing damageRate classes from last select
      $("td." + key + ".damageValueCell").removeClass("damageRate0");
      $("td." + key + ".damageValueCell").removeClass("damageRate¼");
      $("td." + key + ".damageValueCell").removeClass("damageRate½");
      $("td." + key + ".damageValueCell").removeClass("damageRate1");
      $("td." + key + ".damageValueCell").removeClass("damageRate2");
      $("td." + key + ".damageValueCell").removeClass("damageRate4");
      //adds appropriate damageRate class
      $("td." + key + ".damageValueCell").addClass("damageRate" + damageObjectType1[key]);
    }
  }else {
    // calculate for both
    var damageObjectType1 = DAMAGE_TO_TYPE[responsePokemon.types[0].type.name];
    var damageObjectType2 = DAMAGE_TO_TYPE[responsePokemon.types[1].type.name];
    for(key in damageObjectType2){
      var combinedTypeDamage = damageObjectType2[key] * damageObjectType1[key];
      if (combinedTypeDamage == 0.25) {
        combinedTypeDamage = "¼"
      }else if (combinedTypeDamage == 0.5) {
        combinedTypeDamage = "½"
      };
      $("td." + key + ".damageValueCell").html(combinedTypeDamage);
      //removes any existing damageRate classes from last select
      $("td." + key + ".damageValueCell").removeClass("damageRate0");
      $("td." + key + ".damageValueCell").removeClass("damageRate¼");
      $("td." + key + ".damageValueCell").removeClass("damageRate½");
      $("td." + key + ".damageValueCell").removeClass("damageRate1");
      $("td." + key + ".damageValueCell").removeClass("damageRate2");
      $("td." + key + ".damageValueCell").removeClass("damageRate4");
      //adds appropriate damageRate class
      $("td." + key + ".damageValueCell").addClass("damageRate" + combinedTypeDamage);
    }
  }
}

function changeAbility(){
  if (document.getElementById('abilityHiddenToggle').checked) {
    damageChartModifiers($("#abilitySelect").val(),false);
    damageChartModifiers($("#abilityHiddenModifierName").html(),true);
  }else{
    damageChartModifiers($("#abilitySelect").val(),false); 
  }
}

function damageChartModifiers(modifier,isHidden){
  //reset stats before modifying
  if (isHidden == true) {
    console.log("we wont reset the damage stats when applying a hidden ability as they should stack");
  } else{
    console.log("resetting damage stats as these abilities shouldn't stack");
    damageChartSetStats(DAMAGE_TO_TYPE,responsePokemon);
  };
  if (modifier == "dry-skin") {
    //fire does 25% more water does 0
    var newFireValue = $("td.fire.damageValueCell").html() * 1.25;
    newFireValue = convertDamageValueForChart(newFireValue.toFixed(2),"fire");
    $("td.water.damageValueCell").html("0");
    $("td.water.damageValueCell").addClass("damageRate0");
  }
  else if (modifier == "filter" || modifier == "solid-rock") {
    //Filter reduces super effective damage by ¼.
    var damageObjectType1 = DAMAGE_TO_TYPE[responsePokemon.types[0].type.name];
    var damageObjectType2 = DAMAGE_TO_TYPE[responsePokemon.types[1].type.name];
    for (key in damageObjectType2) {
      var combinedTypeDamage = damageObjectType2[key] * damageObjectType1[key];
      console.log ("combined dmg: " + combinedTypeDamage);
      if (combinedTypeDamage >= 2) {
        combinedTypeDamage = combinedTypeDamage * 0.75;
        combinedTypeDamage = combinedTypeDamage.toFixed(2);
        console.log("before converting: " + combinedTypeDamage);
        convertDamageValueForChart(combinedTypeDamage,key);
      }
    };
  } else if (modifier == "flash-fire") {
    //Makes pokemon immune to fire type moves
    $("td.fire.damageValueCell").html("0");
    $("td.fire.damageValueCell").addClass("damageRate0");
  } else if (modifier == "heatproof") {
    //Halves the damage done by Fire type attacks.
    console.log($("td.fire.damageValueCell").html());
    if ($("td.fire.damageValueCell").html() == "½") {
      $("td.fire.damageValueCell").html(0.5)
    }else if ($("td.fire.damageValueCell").html() == "¼") {
      $("td.fire.damageValueCell").html(0.25)
    };
    var newFireValue = $("td.fire.damageValueCell").html() / 2;
    newFireValue = newFireValue.toFixed(2);
    convertDamageValueForChart(newFireValue,"fire");
  } else if (modifier == "levitate") {
    //Makes pokemon immune to ground type moves
    $("td.ground.damageValueCell").html("0");
    $("td.ground.damageValueCell").addClass("damageRate0");
  } else if (modifier == "sap-sipper") {
    //Makes pokemon immune to grass type moves
    $("td.grass.damageValueCell").html("0");
    $("td.grass.damageValueCell").addClass("damageRate0");
  } else if (modifier == "thick-fat") {
    //Halves damage from fire and ice attacks
    var newFireValue = $("td.fire.damageValueCell").html() / 2;
    newFireValue = convertDamageValueForChart(newFireValue.toFixed(2),"fire");
    var newIceValue = $("td.ice.damageValueCell").html() / 2;
    newIceValue = convertDamageValueForChart(newIceValue.toFixed(2),"ice");
  } else if (modifier == "volt-absorb") {
    //Makes pokemone immune to electric attacks
    $("td.electric.damageValueCell").html("0");
    $("td.electric.damageValueCell").addClass("damageRate0");
  } else if (modifier == "water-absorb") {
    //Makes pokemone immune to water attacks
    $("td.water.damageValueCell").html("0");
    $("td.water.damageValueCell").addClass("damageRate0");
  } else if (modifier == "wonder-guard") {
    //
  };
};

function abilityHiddenToggle(){
  if (document.getElementById('abilityHiddenToggle').checked) {
    //calc dmg
    console.log("hidden ability on");
    console.log($("#abilityHiddenToggle").val());
    damageChartModifiers($("#abilityHiddenModifierName").html(),true);
  }else{
    //reset stats & calc dmg with select value
    console.log("hidden ability off");
    console.log($("#abilityHiddenToggle").val());
    damageChartModifiers($("#abilitySelect").val(),false)
  }
};


//Section: Moves
function getMoveList(){

  var tArray = [];
  $.each(responsePokemon.moves, function(index, value){
    var move = value.move.name;
    var learntLevel = value.version_group_details[0].level_learned_at;
    var learntMethod = value.version_group_details[0].move_learn_method.name;
    var item = {
      moveName : move,
      learntLevel : learntLevel,
      learntMethod : learntMethod
    }
    tArray.push(item);
  });

  tArray.sort(function(a,b){ return a.learntLevel - b.learntLevel });
  return tArray;
}
//Section: Moves
function buildMoveList(moves){

  $.each(POKEMON_MOVES, function(i,v){
    var moveName = v.moveName;
    if(MOVE_OBJECT[moveName]){
      $('#movesContent #name').append('<div class="move-name filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + ' ' + MOVE_OBJECT[moveName]['type'] + '">' + moveName + '</div>');
      $('#movesContent #power').append('<div class="power-number filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['power'] + '</div>');
      $('#movesContent #pp').append('<div class="pp-number filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['pp'] + '</div>');
      $('#movesContent #type').append('<div class="' + MOVE_OBJECT[moveName]['type'] + ' filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['type'] + '</div>');
      $('#movesContent #accuracy').append('<div class="accuracy-number filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['accuracy'] + '</div>');
      $('#movesContent #category').append('<div class="category-type filterable ' + MOVE_OBJECT[moveName]['category'] + ' filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['category'] + '</div>');
      $('#movesContent #contest').append('<div class="contest-type filterable ' + MOVE_OBJECT[moveName]['contest'] + ' filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + MOVE_OBJECT[moveName]['contest'] + '</div>');
      if (v.learntMethod == "tutor") {
        $('#movesContent #learntLevel').append('<div class="learntLevel filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">Tutor</div>');
      } else if (v.learntMethod == "machine") {
        $('#movesContent #learntLevel').append('<div class="learntLevel filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">TM</div>');
      } else if (v.learntMethod == "egg") {
        $('#movesContent #learntLevel').append('<div class="learntLevel filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">Egg</div>');
      } else {
        $('#movesContent #learntLevel').append('<div class="learntLevel filterable filter_method_' + v.learntMethod +' filter_type_' + MOVE_OBJECT[moveName]['type'] + ' filter_category_' + MOVE_OBJECT[moveName]['category'] + ' filter_contest_' + MOVE_OBJECT[moveName]['contest'] + '">' + v.learntLevel + '</div>');
      };
    }

  });
}

function toggleMovesMode(){
  if(document.getElementById('movesToggleMode').checked){
    console.log("contest mode");
    $('#movesToggleType').prop('checked', false);
    toggleMovesTypes();
    $('.contestMoves').removeClass('hidden');
    $('.battleMoves').addClass('hidden');

    $("#movesToggleTypeContainer").addClass("hidden");
    $("#movesToggleTypeContainer").removeClass("half");
    $("#type").addClass("toggle_hide");
  }else{
    console.log("battle mode");
    $('.contestMoves').addClass('hidden');
    $('.battleMoves').removeClass('hidden');

    $("#movesToggleTypeContainer").removeClass("hidden");
    $("#movesToggleTypeContainer").addClass("half");
    $("#type").removeClass("toggle_hide");
  }
}

function toggleMovesTypes(){
  if(document.getElementById('movesToggleType').checked){
    console.log("show category");
    $('#category').removeClass("toggle_hide");
    $('#type').addClass("toggle_hide");
  }else{
    console.log("show types");
    $('#type').removeClass("toggle_hide");
    $('#category').addClass("toggle_hide");
  }
}

function resetMovesFilter() {
  $("#movesTypeList").val("");
  $("#movesCategoryList").val("");
  $("#movesContestList").val("");
  $("#movesMethodList").val("");
  filterMoves();
}

function filterMoves (moves_filter) {
  if (moves_filter == null) {
    // reset filters
    $('.filterable').removeClass("hidden");
  } else{
    console.log("filtering to: " + moves_filter);
    $('.filterable').addClass("hidden");
    $('.' + moves_filter).removeClass("hidden");
  }
}

//Section: Breeding
//Area: Eggs
function calculateEggSteps(cycles,steps){
  var breedingStepsToHatch = cycles * steps;
  var maxSteps = BREEDING_CYCLES * BREEDING_STEPS_PER_CYCLE;
  var stepsWidth = breedingStepsToHatch / maxSteps * 100;
  console.log("width: "+ stepsWidth);
  $("#totalSteps").width(stepsWidth + "%");
  if (document.getElementById('flamebody').checked && $( "#opower" ).val() > 0) {
    $("#totalSteps").html(Math.round(breedingStepsToHatch));
    $("#totalSteps").removeClass();
    $("#totalSteps").addClass("stepsFlameBodyOPower");
  } else if (document.getElementById('flamebody').checked) {
    $("#totalSteps").html(Math.round(breedingStepsToHatch));
    $("#totalSteps").removeClass();
    $("#totalSteps").addClass("stepsFlameBody");
  } else if ($( "#opower" ).val() > 0) {
    $("#totalSteps").html(Math.round(breedingStepsToHatch));
    $("#totalSteps").removeClass();
    $("#totalSteps").addClass("stepsOPower");
  } else {
    $("#totalSteps").html(Math.round(breedingStepsToHatch));
    $("#totalSteps").removeClass();
  }
  
}

function flameBody(cycles){
 if(document.getElementById('flamebody').checked) {
   BREEDING_MOD_CYCLES = cycles / 2;
   calculateEggSteps(BREEDING_MOD_CYCLES,BREEDING_MOD_STEPS);
 }else {
  BREEDING_MOD_CYCLES = BREEDING_CYCLES;
  calculateEggSteps(BREEDING_MOD_CYCLES,BREEDING_MOD_STEPS);
}
}

function opower(steps,opowerLevel){
  if(opowerLevel == 0){
    BREEDING_MOD_STEPS = steps;
  }else if (opowerLevel == 1) {
    BREEDING_MOD_STEPS = steps / 1.25;
  }else if (opowerLevel == 2) {
    BREEDING_MOD_STEPS = steps / 1.5;
  } else {
    BREEDING_MOD_STEPS = steps / 2;
  }
  console.log("opower level: " + opowerLevel);
  console.log("steps per cycle: " + BREEDING_MOD_STEPS);
  calculateEggSteps(BREEDING_MOD_CYCLES,BREEDING_MOD_STEPS);
}

//Section: Locations
//Area: Encounters

function encounterLocation(id, data){
  console.log('encounterLocation');
  console.log(data);

  if(!data.length){
    $('#locationContent').html('No available encounters');
    return;
  }

  //get all the encounters details and store in a single array
  var encounters = [];
  $.each(data, function(index, value){
    var item = value;
    var locationName = item.location_area.name;
    locationName = locationName.replace(/\-/g, ' ');
    locationName = locationName.replace('/(area)/ig', '').trim();
    $.each(item.version_details, function(i, v){
      $.each(v.encounter_details, function(encounterIndex, encounterValue){
        var levels = (encounterValue.min_level === encounterValue.max_level) ? encounterValue.min_level : encounterValue.min_level + '-' + encounterValue.max_level;
        var encounterDetail = {
          locationName : locationName,
          encounterChance : encounterValue.chance,
          levels : levels,
          method : encounterValue.method.name,
          version : v.version.name
        }
        encounters.push(encounterDetail);
      });
    });
  });

  encounters = encounters.sort(function(a,b){
    var textA = a.version.toUpperCase();
    var textB = b.version.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });

  var html = '<div class="row">';
  html += '<div class="locationName header column">Location</div>';
  html += '<div class="locationChance header column">Chance</div>';
  html += '<div class="locationLevel header column">Level</div>';
  html += '<div class="locationMethod header column">Method</div>';
  html += '<div class="locationVersion header column">Version</div>';
  html += '<div class="clearfloat"></div>';
  html += '</div>';

  //display info
  $.each(encounters, function(i,v){
    if (VERSION_GEN1.indexOf(v.version) > -1 ){
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_1 hidden">';
      // console.log("dont need this: " + v.version + " " + v.locationName);
    } else if (VERSION_GEN2.indexOf(v.version) > -1) {
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_2 hidden">';
    } else if (VERSION_GEN3.indexOf(v.version) > -1) {
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_3 hidden">';
    } else if (VERSION_GEN4.indexOf(v.version) > -1) {
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_4 hidden">';
    } else if (VERSION_GEN5.indexOf(v.version) > -1) {
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_5 hidden">';
    } else {
      html += '<div class="row shown filterable filter_gameVersion_' + v .version + ' filter_gameGeneration_6">';
    }
    // html += '<div class="row filter_gameVersion_' + v .version + '">';
    html += '<div class="locationName column">'+ v.locationName + '</div>';
    html += '<div class="locationChance column">' + v.encounterChance + '%</div>';
    html += '<div class="locationLevel column">' + v.levels + '</div>';
    html += '<div class="locationMethod column">' + v.method + '</div>';
    html += '<div class="locationVersion column">' + v.version + '</div>';
    html += '<div class="clearfloat"></div>';
    html += '</div>';
  });

var gameGenerationContainer = '<div id="gameGenerationContainer">';
gameGenerationContainer += '<select id="gameGenerationSelect" onchange="filterGameGeneration(this.value)">'
gameGenerationContainer += '<option value="1">Generation 1</option>'
gameGenerationContainer += '<option value="2">Generation 2</option>'
gameGenerationContainer += '<option value="3">Generation 3</option>'
gameGenerationContainer += '<option value="4">Generation 4</option>'
gameGenerationContainer += '<option value="5">Generation 5</option>'
gameGenerationContainer += '<option value="6" selected>Generation 6</option>'
gameGenerationContainer += '</select>'
gameGenerationContainer += '</div>'

var gameGeneration6 = '<div class="gameRow">';
gameGeneration6 += '<div class="half gameFilter selected" id="versionx">X</div>'
gameGeneration6 += '<div class="half gameFilter selected" id="versiony">Y</div>'
gameGeneration6 += '</div>'
  // gameGeneration6 += '<div class="gameRow">'
  // gameGeneration6 += '<div class="half selected" id="versionruby">Omega Ruby</div>'
  // gameGeneration6 += '<div class="half selected" id="versionsapphire">Alpha Sapphire</div></div>'
  // gameGeneration6 += '</div>'

  $('#locationContent').html(html);
  $('#locationContent').prepend(gameGenerationContainer);
  $('#gameGenerationContainer').append(gameGeneration6);

  //binding functions to game versions
  $('#versionx').click(function(){
    filterGameVersion("x");
  });
  $('#versiony').click(function(){
    filterGameVersion("y");
  });
    // $('#versionruby').click(function(){
    //   filterGameVersion("omega-ruby");
    // });
    // $('#versionsapphire').click(function(){
    //   filterGameVersion("alpha-sapphire");
    // });
return;
}

function filterGameVersion(gameVersion){
  if ($( ".filter_gameVersion_" + gameVersion ).hasClass("hidden")) {
    console.log("showing game version row" + gameVersion);
    $("#version" + gameVersion).addClass("selected");
    $(".filter_gameVersion_" + gameVersion).removeClass("hidden");
  }else{
    console.log("hiding game version row" + gameVersion);
    $("#version" + gameVersion).removeClass("selected");
    console.log("#version" + gameVersion);
    $(".filter_gameVersion_" + gameVersion).addClass("hidden");
  };
}

function filterGameGeneration(gameGeneration){
  $('#locationContent .filterable').removeClass("shown");
  $('#locationContent .filterable').addClass("hidden");
  $('.gameRow').addClass('hidden');
  $('.gameFilter').addClass('selected');
  $('.filter_gameGeneration_' + gameGeneration).removeClass('hidden');
  $('.filter_gameGeneration_' + gameGeneration).addClass('shown');
  if (gameGeneration == 6) {
    $('.gameRow').removeClass('hidden');
  }
};


/*
  Stats and Charts
  //Section: Stats
  //Area: Chart
  */

  function buildChart(barChartData) {
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myBar = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
      // Elements options apply to all of the options unless overridden in a dataset
      // In this case, we are setting the border of each bar to be 2px wide and green
      responsive: false,
      defaultFontFamily: "Lucida Grande",
      defaultFontSize: 14,
      legend: {
        display: false
      },
      title: {
        display: false
      }
    }
  });
  };


/*
  AJAX Request Functions
  */

  function requestID(param){
    param = param.trim();
    var id = null;

    switch(param) {
      case 'evolutionChainContent':
      id = responsePokemonSpecies.evolution_chain.url
      break;
      case 'locationContent':
      id = 'http://pokeapi.co' + responsePokemon.location_area_encounters;
      break;
    }
    return id;

  }

  function requestInfo(type, url){
    console.log(url);
    $('#' + type).html('<img src="/images/loader.gif" />');
    var parameters = { 
      url : url
    };
    $.get( '/request',parameters, function(data) {
      console.log('results');
      determineAjaxEvent(type, data);
    });
  }

  function determineAjaxEvent(type, data){

    switch(type) {
      case 'evolutionChainContent':
      evolutionChain(type, data);
      break;
      case 'locationContent':
      encounterLocation(type, data);
      break;
    }
  }


/*
  Utility Functions
  */
  function getQS(object){
  /*
  Query string values get returned back to the object
  Use object.key|object[key] //returns value
  */
  var pl     = /\+/g;  // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
  var query  = window.location.search.substring(1);
  var match;

  while (match = search.exec(query)){
    object[decode(match[1])] = decode(match[2]);
  }
}

function getIDFromSpeciesURL(url){
  var id = url.replace(/(.*)pokemon\-species\/(.*)\//, '$2');
  return id;
}
function getIDFromPokemonURL(url){
  var id = url.replace(/(.*)pokemon\/(.*)\//, '$2');
  return id;
}

function convertDamageValueForChart(value,type){
  //remember to ensure that the value passed is fixed with .toFixed(2)
  var decimalValue = String(value);
  decimalValue = decimalValue.split(".");
  var roundedDecimal = 25 * Math.round(decimalValue[1] / 25);
  if (roundedDecimal == 25) {
    roundedDecimal = "¼";
  } else if (roundedDecimal == 50) {
    roundedDecimal = "½";
  } else if (roundedDecimal == 75) {
    roundedDecimal = "¾";
  }
  var integer = parseInt(decimalValue[0]);
  if (integer >= 1 && decimalValue[1] != 0) {
    var convertedValue = decimalValue[0] + "<br>" + roundedDecimal;
  } else if (integer >= 1) {
    var convertedValue = integer;
  } else {
    var convertedValue = roundedDecimal;
  }
  if (convertedValue == "¼" || convertedValue == "½" || convertedValue == "¾" ) {
    $("td." + type + ".damageValueCell").addClass("damageRate½");
  } else if (integer >= 1) {
    $("td." + type + ".damageValueCell").addClass("damageRate1");
  } else {
    $("td." + type + ".damageValueCell").addClass("damageRate0");
  }
  $("td." + type + ".damageValueCell").html(convertedValue);
}
