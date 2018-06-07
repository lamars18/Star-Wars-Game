//Global variables
$(document).ready(function() {

//audio clips to be referenced later
//FYI: The "let" statement allows you to declare variables that are limited in scope to the block, statement, or expression on which it is used. 
// "LET" is unlike the var keyword, which defines a variable globally, or locally to an entire function regardless of block scope.
let audio = new Audio('assets/audio/Super Star Wars- Return of the Jedi - Boss Attack.mp3');
let force = new Audio('assets/audio/20_Game Over.mp3');
let blaster = new Audio('assets/audio/blaster-firing.mp3');
let jediKnow = new Audio('assets/audio/jedi-know.mp3');
let lightsaber = new Audio('assets/audio/lightsaber_02.mp3');
let chewroar = new Audio('assets/audio/chewy_roar.mp3');


//Array of Playable Characters
//Defined as "let" given they will only apply where they are referenced. 
let characters = {
    'chewbacca': {
        name: 'chewbacca',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/chewbacca.jpeg",
        enemyAttackBack: 15
        
    }, 
    'dark vadar': {
        name: 'dark vadar',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/dark vadar.jpeg",
        enemyAttackBack: 5
    }, 
    'r2d2': {
        name: 'r2d2',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/r2d2.jpeg",
        enemyAttackBack: 20
    }, 
    'stormtrooper': {
        name: 'stormtrooper',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/storm trooper.jpeg",
        enemyAttackBack: 20
        
    }
   
 
};

//Variables for ...Selected Character, Current Defender ...
//Available Opponents array, indexing the character that is selected...
//indexing the attack results, number of turns to fight opponent, and number of losses 
var currSelectedCharacter;
var currDefender;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;

//Function that displays all playable characters at the start of the game
//Displays their name, image, and health 
var renderOne = function(character, renderArea, makeChar) {
    //character: obj (with relevant variables), renderArea: class/id, makeChar: string
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    //places all object information in the div
    charDiv.append(charName).append(charImage).append(charHealth);
    //appends the object info from the div to the renderArea 
    $(renderArea).append(charDiv);
    //Capitalizes the first letter in characters name
    $('.character').css('textTransform', 'capitalize');
    // conditional render
    //Declares in a character is the enemy place them in html enemy class
    if (makeChar == 'enemy') {
      $(charDiv).addClass('enemy');
      //Declares in a character is the defender place them in html target-enemy class
    } else if (makeChar == 'defender') {
      currDefender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  // Create function to render game message to DOM
  //Shows messages in the html class and add messages accordingly
  var renderMessage = function(message) {
    var gameMesageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMesageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender == '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //render player character
    if (areaRender == '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
    }
    //render combatants
    if (areaRender == '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one enemy to defender area
      $(document).on('click', '.enemy', function() {
        //select an combatant to fight
        name = ($(this).data('name'));
        //if defernder area is empty
        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render defender
    if (areaRender == '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add enemy to defender area
        if (combatants[i].name == charObj) {
          $('#defender').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    //re-render defender when attacked
    if (areaRender == 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your selected opponent")
      renderOne(charObj, '#defender', 'defender');
      lightsaber.play();
    }
    //re-render player character when attacked
    if (areaRender == 'enemyDamage') {
      $('#selected-character').empty();
      renderOne(charObj, '#selected-character', '');
    }
    //render defeated enemy
    if (areaRender == 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defated " + charObj.name + ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
      blaster.play();
    }
  };
  //this is to render all characters for user to choose 
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
    //if no player char has been selected
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currSelectedCharacter, '#selected-character');
      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
  $("#attack-button").on("click", function() {
    //if defernder area has enemy
    if ($('#defender').children().length !== 0) {
      //defender state change
      var attackMessage = "You attacked " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
      //combat
      currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currDefender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currDefender, 'playerDamage');
        //player state change
        var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
        renderCharacters(currSelectedCharacter, 'enemyDamage');
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          force.play();
          $("#attack-button").unbind("click");
        }
      } else {
        renderCharacters(currDefender, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
          jediKnow.play();
          // The following line will play the imperial march:
          setTimeout(function() {
          audio.play();
          }, 2000);

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
      rtwoo.play();
    }
  });

//Restarts the game - renders a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});