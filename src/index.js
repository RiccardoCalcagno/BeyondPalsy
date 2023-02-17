import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { Stream } from '@marcellejs/core';
import { fastSamplingButtons, ambiguousSamplesVisualization } from './components';
import { null_to_empty } from 'svelte/internal';






/*

---------------------------------------- BUSINESS LOGIC ----------------------------------------

*/

const nameOfPages = ['Set Up', 'Initial Input Set Definition', 'Sensitive Sampling'];



var $currentPageThatIAmIn = new Stream([], true);;


function whichTabIAmIn(){
  var navigationBar = document.getElementsByTagName("nav")[0];

  const links = Array.from(navigationBar.children).filter(child => child.tagName === 'A');

  const hrefActiveLink = links.find(link => link.classList.contains('active')).href;

  const parts = hrefActiveLink.split('#');
  var lastPart = parts[parts.length - 1];

  if(lastPart == undefined || lastPart.length == 0){
     return 0;
  }
  lastPart = lastPart.split("-")[0];

  for(let i=0; i<nameOfPages.length; i++){
      var initial = nameOfPages[i].split(" ")[0];
  
      if(initial.toLowerCase() == lastPart.toLowerCase()){
          return i;
      }
  }

  return 0;
}
function attachListenersOfTabs(){
  var navigationBar = document.getElementsByTagName("nav")[0];

  const links = Array.from(navigationBar.children).filter(child => child.tagName === 'A');

  
  links.forEach(link => {

    link.addEventListener('click', function(event) {

      setTimeout(function() {
        $currentPageThatIAmIn.set(whichTabIAmIn());
      }, 20);

    });
  });
  } 




const dash = marcelle.dashboard({
    title: 'Our Marcelle App!',
    author: 'DenisRiccardoSalima'
});








/*

---------------------------------------- SET UP PAGE ----------------------------------------

*/
const description = marcelle.text('<strong>Instructions</strong><br><br>'+
' type the name of each commands separated by the \'<strong>Enter</strong>\' key');

const labelInput = marcelle.textInput();
const submitLable = marcelle.button("SUBMIT LABLE");



// --------------- TODO to remove, it is only for debug purposes -----------------------------------
let initialLabels = ["Call Mom", "Hunger", "Navigate To", "I need to contact my terapist"];
let initialAmbiguities = new Map();
initialAmbiguities.set("Call Mom",["Hunger", "I need to contact my terapist"]);
initialAmbiguities.set("Navigate To",["Hunger", "I need to contact my terapist", "Call Mom"]);


const disambiguatorsSamplingButtons = fastSamplingButtons(initialLabels, initialAmbiguities);


submitLable.$click.subscribe(() => {
  let valueText = labelInput.$value.get();
  if(!valueText || valueText.length == 0){
    return;
  }
  disambiguatorsSamplingButtons.addNewLable(valueText);
  labelInput.$value.set("");
  });




/*

------------------------------ First Training Page ----------------------------

*/

const input = marcelle.webcam();

input.$active.subscribe((isActive) => {

  disambiguatorsSamplingButtons.setenableToSampleCam(isActive);
});


const featureExtractor = marcelle.mobileNet();


const captureCommand = marcelle.button('Click to record an instance');
captureCommand.title = 'Capture instances to the training set';

const clearTrainingSet = marcelle.button('CLEAR TRAINING SET');
clearTrainingSet.title = 'Clear training set command';




const $instances = disambiguatorsSamplingButtons.$lableSampled
    .filter(x => x != null && x.length>0)
    .map(async () => ({
        x: await featureExtractor.process(input.captureImage()),
        y: disambiguatorsSamplingButtons.$lableSampled.get(),
        thumbnail: input.captureThumbnail(),
    }))
    .awaitPromises();

    
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
  
$instances.subscribe(trainingSet.create);

const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);


const trainingButton = marcelle.button('START TRAINING');
trainingButton.$click.subscribe(() => {

  dash.page(nameOfPages[2]);
});


clearTrainingSet.$click.subscribe(() => 
{
    //classifier.clear();
    trainingSet.clear();
    //predViz.dispose();
}
);

/*

------------------------------ Parallel Training Page ----------------------------

*/




const ambiguousSamplesVis = ambiguousSamplesVisualization();


function getSetOfAmbiguousSamplesOrNull_mook(referenfeClass){

  // CLASS A = referenfeClass
  const _thumbnail_BestConfident_inA = "images/"+1+".png";
  const _name_BestConfident_inA = "Name as Example";
  // CLASS B : 1° most mismatched (based on confusion matrix)
  const _thumbnail_Closest_toA_inB = "images/"+2+".png";
  const _name_Closest_toA_inB = "Name as Example";
  const _thumbnail_Closest_toB_inA = "images/"+3+".png";
  const _name_Closest_toB_inA = "Name as Example";
  // CLASS C : 2° most mismatched (based on confusion matrix)
  const _thumbnail_Closest_toA_inC = "images/"+4+".png";
  const _name_Closest_toA_inC = "Name as Example";
  const _thumbnail_Closest_toC_inA = "images/"+5+".png";
  const _name_Closest_toC_inA = "Name as Example";

  const inputObject = 
  {
    thumbnail_BestConfident_Valid: _thumbnail_BestConfident_inA,
    name_BestConfident_Valid: _name_BestConfident_inA,
    // in order of the class that is mismatched the most
    arrayOfAmbiguity: 
    [
      // FIRST AMBIGUITY CLASS - B
      {
        closestSampleInsideWrongClass:
        {
          name: _name_Closest_toA_inB,
          thumbnail: _thumbnail_Closest_toA_inB,
        },
        validSampleClosestToTheWrongClass:
        {
          name: _name_Closest_toB_inA,
          thumbnail: _thumbnail_Closest_toB_inA,
        }
      },
      // FIRST AMBIGUITY CLASS - C
      {
        closestSampleInsideWrongClass:
        {
          name: _name_Closest_toA_inC,
          thumbnail: _thumbnail_Closest_toA_inC,
        },
        validSampleClosestToTheWrongClass:
        {
          name: _name_Closest_toC_inA,
          thumbnail: _thumbnail_Closest_toC_inA,
        }
      }
    ]
  };

  return inputObject;
}


disambiguatorsSamplingButtons.$lablesToVisualize.subscribe((label)=> {

  if(label != null && label != undefined && label.length >0){
    const inputObject = getSetOfAmbiguousSamplesOrNull_mook(label);
    ambiguousSamplesVis.setNewSetOfAmbiguousSamplesOrNull(inputObject);
  }
});



/*




const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });




trainingButton.$click.subscribe(() => {
    classifier.train(trainingSet);
  });


const plotTraining = marcelle.trainingPlot(classifier);





const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

$predictions.subscribe(console.log);

const predViz = marcelle.confidencePlot($predictions);


*/




dash.page(nameOfPages[0]).sidebar(description/*, startTrainingButton*/);
dash.page(nameOfPages[0]).use([labelInput, submitLable]);
dash.page(nameOfPages[0]).use(disambiguatorsSamplingButtons);


dash.page(nameOfPages[1]).use(disambiguatorsSamplingButtons);
dash.page(nameOfPages[1]).use(trainingSetBrowser);
dash.page(nameOfPages[1]).use(clearTrainingSet);
dash.page(nameOfPages[1]).sidebar(input, trainingButton);


dash.page(nameOfPages[2]).use(disambiguatorsSamplingButtons);
dash.page(nameOfPages[2]).use(ambiguousSamplesVis);


dash.show();

attachListenersOfTabs();

$currentPageThatIAmIn.subscribe((tab) => {
  disambiguatorsSamplingButtons.updateNewTab(tab);
});

$currentPageThatIAmIn.set(whichTabIAmIn());
