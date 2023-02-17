import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { Stream } from '@marcellejs/core';
import { fastSamplingButtons, ambiguousSamplesVisualization } from './components';
import { null_to_empty } from 'svelte/internal';



/*

---------------------------------------- BUSINESS LOGIC ----------------------------------------

*/

const nameOfPages = ['Set Up', 'Sampling', 'Training'];




var $currentPageThatIAmIn = new Stream([], true);


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

let initialLabels = ["Call Mom", "I'm hungry", "Navigate to", "I need to contact my terapist"];

const disambiguatorsSamplingButtons = fastSamplingButtons(initialLabels, addRemoveButton);


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


let currentAmbiguitiesLabelLabel = {};


const ambiguousSamplesVis = ambiguousSamplesVisualization(addRemoveButton);




disambiguatorsSamplingButtons.$lablesToVisualize.subscribe(async (label)=> {

  if(label != null && label != undefined && label.length >0){

    const inputObject = await funzioneInput(label, currentAmbiguitiesLabelLabel[label]);

    console.log(inputObject);
    ambiguousSamplesVis.setNewSetOfAmbiguousSamplesOrNull(inputObject);
  }
});



const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });



const prog = marcelle.trainingProgress(classifier);

const plotTraining = marcelle.trainingPlot(classifier);





const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

$predictions.subscribe(console.log);






dash.page(nameOfPages[0]).sidebar(description/*, startTrainingButton*/);
dash.page(nameOfPages[0]).use([labelInput, submitLable]);
dash.page(nameOfPages[0]).use(disambiguatorsSamplingButtons);

dash.page(nameOfPages[1]).use(disambiguatorsSamplingButtons);
dash.page(nameOfPages[1]).use(trainingSetBrowser);
dash.page(nameOfPages[1]).use(clearTrainingSet);
dash.page(nameOfPages[1]).sidebar(input);

dash.page(nameOfPages[2]).use(prog);
dash.page(nameOfPages[2]).use(disambiguatorsSamplingButtons);
dash.page(nameOfPages[2]).use(ambiguousSamplesVis);
dash.page(nameOfPages[2]).sidebar(plotTraining);

dash.show();

attachListenersOfTabs();



$currentPageThatIAmIn.subscribe((tab) => {

  var components = document.getElementsByClassName("card");

  for(let i=0; i<components.length; i++){
    var possible = components.item(i);
    possible.setAttribute("class", "card");
    }

  disambiguatorsSamplingButtons.updateNewTab(tab);

  if(tab == 2){

    disambiguatorsSamplingButtons.setVisibility(false);
    ambiguousSamplesVis.setVisibility(false);

    if(trainingSet.$count.get() > 0){
      classifier.train(trainingSet);
    }
  }
});

$currentPageThatIAmIn.set(whichTabIAmIn());


prog.$progress.subscribe(async (progs) => 
  {
    if(progs.type == "success"){

      disambiguatorsSamplingButtons.setVisibility(true);
      ambiguousSamplesVis.setVisibility(true);

      currentAmbiguitiesLabelLabel = {};

      for(var i=0; i<disambiguatorsSamplingButtons.labels.length; i++){
        var element = disambiguatorsSamplingButtons.labels[i];

        currentAmbiguitiesLabelLabel[element] = await salima_function(element);
      }

      disambiguatorsSamplingButtons.updateAmbiguities(currentAmbiguitiesLabelLabel);
    }
  });




async function removeSampleById(id){

  await trainingSet.remove(id);

  if($currentPageThatIAmIn.get() == 2){

    disambiguatorsSamplingButtons.setVisibility(false);
    ambiguousSamplesVis.setVisibility(false);

    if(trainingSet.$count.get() > 0){
      classifier.train(trainingSet);
    }
  }
}


function addRemoveButton(nodeHTML, functionAtRemoval = undefined) {

  let buttonToAdd = document.createElement("button");
  buttonToAdd.setAttribute("style", "display:block;padding:0; width:1.5em; height:1.5em; overflow: hidden; position: absolute;border: #AAA solid 0.08em;border-radius: 0.2em; translate: -50% -50%;");
  buttonToAdd.onclick = async function() {
    var id= nodeHTML.getAttribute("id");
    if(id!= null && id!= undefined && id.includes("zzz#"))
    {
      await removeSampleById(id.split("#")[1]);
    }
    else{
      functionAtRemoval();
    }
  }

  buttonToAdd.innerHTML = "<img src=\"images/trash.png\" style=\"display:block; width:1.5em; height:1.5em;margin:0; padding:0;position: absolute; top: 50%;left: 50%; transform: translate(-50%, -50%); object-fit: cover;\" />";

  nodeHTML.appendChild(buttonToAdd);
}




async function salima_function(primary_label) {
  const THRESHOLD = 0.05;
  console.log('Data store')
  console.log(store);
  const batchMLP = marcelle.batchPrediction('mlp', store);
  // await batchMLP.clear();
  const confusionMatrix = marcelle.confusionMatrix(batchMLP);
  await batchMLP.predict(
    classifier,
    trainingSet);
  let conf = confusionMatrix.$confusion.get();
  conf.sort((a, b) => (a.v < b.v) ? 1 : -1);
  console.log('Confusion matrix sorted');
  console.log(conf);

  let n_imgs_classified_as_primary_label = conf.
    filter((img) => img.x == primary_label)
    .reduce((acc, img) => acc + img.v, 0);
  console.log('n_imgs_classified_as_primary_label: ' + n_imgs_classified_as_primary_label);

  let classes_misunderstood_as_primary_label_over_threshold = conf
    .filter((img) => img.x == primary_label && img.y != primary_label)
    .filter((img) => img.v > THRESHOLD*n_imgs_classified_as_primary_label)
    .sort((img1, img2) => img2.v - img1.v)
    .map((img) => img.y)

  if(classes_misunderstood_as_primary_label_over_threshold.length > 4){
    classes_misunderstood_as_primary_label_over_threshold = classes_misunderstood_as_primary_label_over_threshold.slice(0, 4);
  }

  console.log('classes_misunderstood_as_primary_label_over_threshold');
  console.log(classes_misunderstood_as_primary_label_over_threshold);

  return classes_misunderstood_as_primary_label_over_threshold;
}
  

async function funzioneInput(primary_label, arrayOfAmbiguicies) {

  if(arrayOfAmbiguicies == null || arrayOfAmbiguicies== undefined){
    arrayOfAmbiguicies = [];
  }
  const numOfAmbig = arrayOfAmbiguicies.length;
  
  // Stream of items of the dataset: they DON't contain images,
  // they contain, among important things:
  //  - x -> tensor of length 1024, can be used to predict
  //         confidences
  //  - id -> id of the image, can be used to get the image
  //          from the data storage
  let $instances_primary_label = trainingSet.items()
    .query({y: primary_label });

  // Converting the stream to an array
  let arr_instances_primary_label = await $instances_primary_label.toArray();


  let arr_id_pred = await Promise.all(arr_instances_primary_label.map(async (inst) => {
    let pred = await classifier.predict(inst['x']);
    return {'id': inst['id'].toString(), 'pred': pred};
  }));




  let max_confidence_goodOne = -1;
  let idx_max_confidence_goodOne = -1;

  let max_confidence_ambiguicies = [];
  let idx_max_confidence_ambiguicies = [];
  arrayOfAmbiguicies.forEach(ambig => {
    max_confidence_ambiguicies.push(-1);
    idx_max_confidence_ambiguicies.push(-1);
  });
  
  for (let index = 0; index < arr_id_pred.length; index++) {

    let id_pred = arr_id_pred[index];
    let pred = id_pred['pred'];

    let conf_lab_confidence_ambiguicies = [];
    arrayOfAmbiguicies.forEach(ambig => {
      const conf= pred['confidences'][ambig];  
      conf_lab_confidence_ambiguicies.push(conf);
    });
    for(var i=0; i<numOfAmbig; i++){
      if (conf_lab_confidence_ambiguicies[i] > max_confidence_ambiguicies[i]) {
        max_confidence_ambiguicies[i] = conf_lab_confidence_ambiguicies[i];
        idx_max_confidence_ambiguicies[i] = index;
      }
    }

    let conf_lab_confidence_goodOne = pred['confidences'][primary_label];  
    if (conf_lab_confidence_goodOne > max_confidence_goodOne) {
      max_confidence_goodOne = conf_lab_confidence_goodOne;
      idx_max_confidence_goodOne = index;
    }
  }


  var ID_max_confidence_good_one = arr_id_pred[idx_max_confidence_goodOne]['id'];

  var ID_max_confidence_ambiguicies = [];
  for(var i=0; i<numOfAmbig; i++){
    ID_max_confidence_ambiguicies[i] = arr_id_pred[idx_max_confidence_ambiguicies[i]]['id'];

    //console.log('Max confidence of label '+arrayOfAmbiguicies[i]+': ' + max_confidence_ambiguicies[i]);
    //console.log('Index of max confidence of label '+arrayOfAmbiguicies[i]+': ' + idx_max_confidence_ambiguicies[i]);
    //console.log('Id of max confidence of label '+arrayOfAmbiguicies[i]+': ' + ID_max_confidence_ambiguicies[i]);
  }

  // ----- WORKING ON THE DINAMIC AMBIGUOUS LABELS -----
  // Get the ID of the image in A with the highest confidence twoards the primary label

  let ID_max_confidence_label_i_twoards_primary_label = [];

  for(let i=0; i<numOfAmbig; i++){

    let $instances_secondary_label = trainingSet.items()
    .query({y: arrayOfAmbiguicies[i] });

    // Converting the stream to an array
    let arr_instances_secondary_label = await $instances_secondary_label.toArray();

    let arr_id_pred = await Promise.all(arr_instances_secondary_label.map(async (inst) => {
      let pred = await classifier.predict(inst['x']);
      return {'id': inst['id'].toString(), 'pred': pred};
    }));

    let max_confidence_label_i_twoards_primary_label = -1;
    let idx_max_confidence_label_i_twoards_primary_label = -1;

    for (let index = 0; index < arr_id_pred.length; index++) {
      let id_pred = arr_id_pred[index];
      let pred = id_pred['pred'];
      let conf_lab = pred['confidences'][primary_label];

      if (conf_lab > max_confidence_label_i_twoards_primary_label) {
        max_confidence_label_i_twoards_primary_label = conf_lab;
        idx_max_confidence_label_i_twoards_primary_label = index;
      }
    }

    ID_max_confidence_label_i_twoards_primary_label[i] = arr_id_pred[idx_max_confidence_label_i_twoards_primary_label]['id'];
  }

  let arr_thumbnails_primary_label = await trainingSet.items()
  .query({id: ID_max_confidence_good_one }).toArray(); 
  let instance_primary_label_goodOne =  arr_thumbnails_primary_label[0];
  

  const inputObject = 
  {
    thumbnail_BestConfident_Valid: instance_primary_label_goodOne['thumbnail'],
    name_BestConfident_Valid: instance_primary_label_goodOne['y'],

    arrayOfAmbiguity: []
  };

  for(let i=0; i<numOfAmbig; i++){

    let arr1 = await trainingSet.items()
    .query({id: ID_max_confidence_label_i_twoards_primary_label[i]  }).toArray(); 
    let ele1 =  arr1[0];
    let arr2 = await trainingSet.items()
    .query({id: ID_max_confidence_ambiguicies[i]  }).toArray(); 
    let ele2 =  arr2[0];

    var ambuigucyObj = 
    {
      closestSampleInsideWrongClass:
      {
        name: ele1['y'],
        thumbnail: ele1['thumbnail'],
        id: ele1['id']
      },
      validSampleClosestToTheWrongClass:
      {
        name: ele2['y'],
        thumbnail: ele2['thumbnail'],
        id: ele2['id']
      }
    }

    inputObject.arrayOfAmbiguity.push(ambuigucyObj);
  }

  return inputObject;
}