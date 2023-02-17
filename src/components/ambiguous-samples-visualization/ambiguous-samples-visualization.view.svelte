<script>
import { ViewContainer } from '@marcellejs/design-system';
export let title;
export let addRemoveButton;

let isVisible = false;
let setOfAmbiguousSamples = null;


function updateValuesFromInputField(){
  var inputFieldPassing= document.getElementById("2inputFieldPassing");
   
  var parts = inputFieldPassing.value.split("#");
  switch (parts[0]) {
    case "1":

      setOfAmbiguousSamples = JSON.parse(parts[1]);

      console.log("arrived set: "+JSON.stringify(setOfAmbiguousSamples));
      updateView();
    break;
    case "2":
    isVisible = parts[1] != "false";
    setVisibility(isVisible);
    break;
  
    default:
      break;
  }
}


function setVisibility(isVisible){
  var components = document.getElementsByClassName("card");

  var myCard = null;
  for(let i=0; i<components.length; i++){
    var possible = components.item(i);
    if(possible.innerHTML.includes("IDENTIFIER_FOR_AMBIGUOUS_SAMPLES")){
      myCard = possible;
      break;
    }
  }

  if(myCard== null) return;

  if(!isVisible){
    myCard.setAttribute("class", "hiddenClass card");
  }
  else{
    myCard.setAttribute("class", "card");
  }
}


function setHtmlOfPanelFromInputSet(inputSet)
{

if(inputSet == null || inputSet == undefined 
|| inputSet.name_BestConfident_Valid== null || inputSet.name_BestConfident_Valid == undefined){
  return;
}

var mainNode = document.getElementById("mainContainer");

  var outputText = `
  <div class="SubjectClassDesc">
      <img class="thumbnail_BestConfident_Valid thumbnail" src='`+inputSet.thumbnail_BestConfident_Valid+`'>
      <p class="name_BestConfident_Valid name"><i>Best sample of </i>`+inputSet.name_BestConfident_Valid+`</p>
  `;

  if(inputSet.arrayOfAmbiguity != null && inputSet.arrayOfAmbiguity!= undefined)
  {
    inputSet.arrayOfAmbiguity.forEach( ambiguity => {
    outputText = appendNewAmbiguityToTest(outputText, ambiguity);
    });
  }


  outputText += `</div></div>`;

  mainNode.innerHTML = outputText;

  var containersOFThumbnalis = mainNode.getElementsByClassName("containerOFThumbnalis");

  for(let i=0; i<containersOFThumbnalis.length; i++){
    var cont = containersOFThumbnalis[i];
    addRemoveButton(cont);
  }
}

function appendNewAmbiguityToTest(startingText, objOfAmbiguity){

  var nameOfAmbiguity = "";

  const closestSampleInsideWrongClass = objOfAmbiguity.closestSampleInsideWrongClass;
  if(closestSampleInsideWrongClass != undefined && closestSampleInsideWrongClass!= null){
    nameOfAmbiguity = closestSampleInsideWrongClass.name;
  }

  const validSampleClosestToTheWrongClass = objOfAmbiguity.validSampleClosestToTheWrongClass;


  if(nameOfAmbiguity == "")
  {
    return startingText;
  }

  startingText += `
  <div class="elementOfarrayOfAmbiguity">
        <div><p class="invalidClassName"><strong><i>Ambiguity with label: </i>`+nameOfAmbiguity+`</strong></p></div>
        <div class="containerOfExamples">`;


  if(closestSampleInsideWrongClass != undefined && closestSampleInsideWrongClass!= null){
    startingText += `
      <div class="closestSampleInsideWrongClass">
            <div class="sampleContainer">
              <div class="containerOFThumbnalis" style="padding: 0.5em 2em;" id="zzz#`+closestSampleInsideWrongClass.id+`">
                <img class="thumbnail" src='`+closestSampleInsideWrongClass.thumbnail+`'>
              </div>
              <p class="name"><i>Some samples of  </i>"`+nameOfAmbiguity+`"<i>  are too similar!</i></p>
            </div>
          </div>          `;
  }
  if(validSampleClosestToTheWrongClass != undefined && validSampleClosestToTheWrongClass!= null){
    startingText += `
    <div class="validSampleClosestToTheWrongClass">
            <div class="sampleContainer">
              <div class="containerOFThumbnalis" style="padding: 0.5em 2em;"  id="zzz#`+validSampleClosestToTheWrongClass.id+`">
                <img class="thumbnail" src='`+validSampleClosestToTheWrongClass.thumbnail+`'>
              </div>
              <p class="name"><i>Some recognized samples are too similar to </i>"`+nameOfAmbiguity+`"<i>!</i></p>
            </div>
          </div>        
          `;
  }
    startingText += `</div></div>`;

    return startingText;
}



function updateView(){
  setHtmlOfPanelFromInputSet(setOfAmbiguousSamples);
}


</script>

<ViewContainer {title}>
  <button class="hiddenClass" id="2updateView" on:click={updateView}>IDENTIFIER_FOR_AMBIGUOUS_SAMPLES</button>

  <button class="hiddenClass" id="2updateValuesFromInputField" on:click={updateValuesFromInputField}>Update Values</button>
  <input class="hiddenClass" id="2inputFieldPassing" type="text"> 



  <div id="mainContainer">

  </div>


</ViewContainer>

<style global>

  .SubjectClassDesc{
    border-radius: 8em 8em 1em 1em;
    background-color: #D7FFBE;
    padding: 0 0 1em 0;
  }

  .thumbnail_BestConfident_Valid{

    padding: 0.8em 0 0 0;
  }

  .name_BestConfident_Valid{
    padding: 0 0 0.8em 0 !important;
  }

  .invalidClassName{
    margin: 0% 0 0.7em 0;
    text-align: center;
  }
  
  .elementOfarrayOfAmbiguity{
    padding: 0.7em 0;
    border: #FF8D8B dashed 0.1em;
    border-left-style: none;
    border-radius: 0em 3em 3em 0em;
    margin: 1em 7% 1em 0;
  }

  .containerOfExamples{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }

  .closestSampleInsideWrongClass{
    border-radius: 0em 3em 3em 0em;
    background-color: #FF8D8B;

    flex-grow: 1;
  }

  .validSampleClosestToTheWrongClass{

    flex-grow: 3;
    max-width: 50%;
    margin: auto;
  }

  .sampleContainer{
    margin: 0.5em 0;
    display: flex;
    align-items:center;
    flex-direction: row;
  }



  .hiddenClass{
    display: none;
  }

  .thumbnail{
    display: block;
    width: 7em;
    margin: auto;
  }
  .name{
    text-align: center;
    margin: 0.5em auto;
    width: 60%;
    padding: 0 1em 0 0;
  }

  .p{
    display: block;
  }

</style>
