<script>
import * as marcelle from '@marcellejs/core';
import { ViewContainer } from '@marcellejs/design-system';

export let handleClickToSample;
export let handleClickToVisualization;
export let labels;
export let addRemoveButton;
export let removeLableFunc;


let ambiguities = {};
let title;
let enableToSampleCam = false;
let isVisible = false;
let pageThatIAmIn;


function getImageUrlOfLable(label){

  let indexOfLabel = labels.findIndex((vaule, index, obj) => vaule == label) +1;

  if(indexOfLabel != undefined && indexOfLabel >-1){
    return "./images/"+indexOfLabel+".png";
  }else{
    return "";
  }

}

function isSamplingPage(){
  return pageThatIAmIn == 1;
}


const handleClick = (item) => {
    if(isSamplingPage()){
      if(enableToSampleCam){
        handleClickToSample(item);
      }
      else{
        alert("turn on the camera before")
      }
    }
    else
    {
      handleClickToVisualization(item);
    }
  };


function updateValuesFromInputField(){
  var inputFieldPassing= document.getElementById("inputFieldPassing");
   
  var parts = inputFieldPassing.value.split("#");

  switch (parts[0]) {
    case "1":
    pageThatIAmIn = +parts[1];
    updateView();
    break;

    case "2":
    enableToSampleCam = parts[1] != "false";
    break;

    case "3":
    isVisible = parts[1] != "false";
    setVisibility(isVisible);
    break;

    case "4":
    ambiguities = JSON.parse(parts[1]);
    updateView();
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
    if(possible.innerHTML.includes("IDENTIFIER_FOR_FAST_SAMPLING")){
      myCard = possible;
      console.log("FOUND CARD "+possible.innerHTML)
      break;
    }
  }

  if(myCard == null) return;

  if(!isVisible){
    myCard.setAttribute("class", "hiddenClass card");
  }
  else{
    myCard.setAttribute("class", "card");
  }
}





function updateView(){

   if(!labels || labels.length == 0){
    return;
   }


   switch (pageThatIAmIn) {
    case 0:
      title = "Set of Labels";
      break;
      case 1:
      title = "Capture your expression";
      break;
      case 2:
      title = "Visualize the ambiguities";
      break;
    default:
      break;
   }

    let containerTarget = document.querySelector(`#containerOfButtons`);

    containerTarget.innerHTML ="";
    
    labels.forEach(element => {

      let newButton = document.createElement("button");
      newButton.setAttribute("id", "button_"+element);
      newButton.setAttribute("class", "fastButton");


      if(pageThatIAmIn == 0){
        newButton.disabled = true;
      }
      else{
        newButton.disabled = false;
        newButton.onclick = function() {
        handleClick(element)
      };
      }
      
      newButton.innerHTML = "<img class='labelIdImg' src=\""+getImageUrlOfLable(element)+"\" />"+"<div class='textOfButton'>"+element+"</div>";

      if(pageThatIAmIn == 0){
        addRemoveButton(newButton, () => removeLableFunc(element));
      }

      containerTarget.appendChild(newButton);


      let listOfAmbiguicies = ambiguities[element];
      if(pageThatIAmIn>0 && listOfAmbiguicies != undefined && listOfAmbiguicies != null && listOfAmbiguicies.length>0){
        let listOfAmbiguices = document.createElement("div");
        listOfAmbiguices.setAttribute("id", "listOfAmbiguicies_"+element);
        listOfAmbiguices.setAttribute("class", "listOfAmbiguicies");

        let innerHTMLAmbiguices ="";
        listOfAmbiguicies.forEach(otherLabel => {
          innerHTMLAmbiguices+= "<img class='labelAmbiguityImg' src=\""+getImageUrlOfLable(otherLabel)+"\" />"
        });
        listOfAmbiguices.innerHTML = innerHTMLAmbiguices;

        newButton.appendChild(listOfAmbiguices);
      }

    });

    //window.getComputedStyle(containerTarget).display;
};




</script>


<ViewContainer {title}>
  <button class="hiddenClass" id="updateLablesButton" on:click={updateView}>IDENTIFIER_FOR_FAST_SAMPLING</button>

  <button class="hiddenClass" id="updateValuesFromInputField" on:click={updateValuesFromInputField}>Update Values</button>
  <input class="hiddenClass" id="inputFieldPassing" type="text"> 

  <div id="containerOfButtons"></div>

</ViewContainer>



<style global>


  .labelIdImg, .labelAmbiguityImg{
    width: 1.2em;
    margin: 0.3em 0.3em 0 0;
    display: inline-block;
    align-self:flex-start;
  }

  .textOfButton{
    display: inline-block;
    padding: 0 0 0.2em 0;
    align-self:flex-start;
    translate: 2.4em -0.6em;
  }

  .labelIdImg{
    translate: 0.8em 0.5em;
  }

  .listOfAmbiguicies{
    align-self: flex-end;
    translate: 3em -0.5em;
  }  

  .labelAmbiguityImg{

  }


  .hiddenClass{
    display: none;
  }

  #containerOfButtons{
    flex-wrap: wrap;
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }

  .fastButton{
    display: flex;
    flex-direction: column;
    
    min-width: 10em;
    margin: 0.5em 1em 0.5em 1em !important;
    padding: 0 3.5em 0 0 !important;

          --tw-border-opacity: 1;
    --tw-bg-opacity: 1;
    --tw-text-opacity: 1;
    background-color: rgb(255 255 255/var(--tw-bg-opacity));
    border-color: rgb(209 213 219/var(--tw-border-opacity));
    border-style: solid;
    border-width: 1px;
    color: rgb(107 114 128/var(--tw-text-opacity));
    transition: all .15s ease;

    border-radius: 0.25rem;
    cursor: pointer;
    font-size: .75rem;
    font-weight: 600;
    line-height: 1rem;
    outline: 2px solid transparent;
    outline-offset: 2px;
    padding: 0.5rem 1rem;
    transition: all .15s ease;


    box-sizing: border-box;


    box-sizing: border-box;
    -moz-tab-size: 4;
    tab-size: 4;
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';


        --tw-border-spacing-x: 0;
    --tw-border-spacing-y: 0;
    --tw-translate-x: 0;
    --tw-translate-y: 0;
    --tw-rotate: 0;
    --tw-skew-x: 0;
    --tw-skew-y: 0;
    --tw-scale-x: 1;
    --tw-scale-y: 1;
    --tw-pan-x: ;
    --tw-pan-y: ;
    --tw-pinch-zoom: ;
    --tw-scroll-snap-strictness: proximity;
    --tw-ordinal: ;
    --tw-slashed-zero: ;
    --tw-numeric-figure: ;
    --tw-numeric-spacing: ;
    --tw-numeric-fraction: ;
    --tw-ring-inset: ;
    --tw-ring-offset-width: 0px;
    --tw-ring-offset-color: #fff;
    --tw-ring-color: rgba(14,165,233,.5);
    --tw-ring-offset-shadow: 0 0 #0000;
    --tw-ring-shadow: 0 0 #0000;
    --tw-shadow: 0 0 #0000;
    --tw-shadow-colored: 0 0 #0000;
    --tw-blur: ;
    --tw-brightness: ;
    --tw-contrast: ;
    --tw-grayscale: ;
    --tw-hue-rotate: ;
    --tw-invert: ;
    --tw-saturate: ;
    --tw-sepia: ;
    --tw-drop-shadow: ;
    --tw-backdrop-blur: ;
    --tw-backdrop-brightness: ;
    --tw-backdrop-contrast: ;
    --tw-backdrop-grayscale: ;
    --tw-backdrop-hue-rotate: ;
    --tw-backdrop-invert: ;
    --tw-backdrop-opacity: ;
    --tw-backdrop-saturate: ;
    --tw-backdrop-sepia: ;}

  .fastButton:hover{
      --tw-border-opacity: 1;
    --tw-bg-opacity: 1;
    --tw-text-opacity: 1;
    background-color: rgb(240 249 255/var(--tw-bg-opacity));
    border-color: rgb(14 165 233/var(--tw-border-opacity));
    color: rgb(14 165 233/var(--tw-text-opacity));}


  .fastButton:active{
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    --tw-ring-color: rgb(56 189 248/var(--tw-ring-opacity));
    --tw-ring-opacity: 0.5;
    }
</style>
