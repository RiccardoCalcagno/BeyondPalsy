import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { Stream } from '@marcellejs/core';
import { fastSamplingButtons, ambiguousSamplesVisualization } from './components';
import { null_to_empty } from 'svelte/internal';



/*

---------------------------------------- BUSINESS LOGIC ----------------------------------------

*/

const nameOfPages = ['Set Up', 'Initial Input Set Definition', 'Sensitive Sampling', 'Debugging'];




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




disambiguatorsSamplingButtons.$lablesToVisualize.subscribe(async (label)=> {

  if(label != null && label != undefined && label.length >0){

    //const inputObject = getSetOfAmbiguousSamplesOrNull_mook(label);


    const inputObject = await funzioneInput(label, ["Navigate To", "I need to contact my terapist"]);

    console.log(inputObject);
    ambiguousSamplesVis.setNewSetOfAmbiguousSamplesOrNull(inputObject);
  }
});



const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });



const prog = marcelle.trainingProgress(classifier);

const plotTraining = marcelle.trainingPlot(classifier);





prog.$progress.subscribe(progs => 
  {
    if(progs.type == "success"){

      //TODO Update ambiguities
      //disambiguatorsSamplingButtons.
    }
  });


const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

$predictions.subscribe(console.log);

const predViz = marcelle.confidencePlot($predictions);


const salima_button = marcelle.button('Salima button');
salima_button.$click.subscribe(async () => {

  console.log('Launching Salima function');
  let primary_labels = ['Hunger', 'Call Mom', 'Navigate To', 'I need to contact my terapist'];
  let most_confused_L = await salima_function(primary_labels[0]);
  let most_confused_M = await salima_function(primary_labels[1]);
  let most_confused_N = await salima_function(primary_labels[2]);
  let most_confused_O = await salima_function(primary_labels[3]);
  console.log("The two most confused labels with [" + primary_labels[0] + "] are:");
  console.log(most_confused_L);
  console.log("The two most confused labels with [" + primary_labels[1] + "] are:");
  console.log(most_confused_M);
  console.log("The two most confused labels with [" + primary_labels[2] + "] are:");
  console.log(most_confused_N);
  console.log("The two most confused labels with [" + primary_labels[3] + "] are:");
  console.log(most_confused_O)

  console.log('Finish Salima function');
  // It's a DUMMY return
  return most_confused_L;
});

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
    .map((img) => img.y);

  console.log('classes_misunderstood_as_primary_label_over_threshold');
  console.log(classes_misunderstood_as_primary_label_over_threshold);

  return classes_misunderstood_as_primary_label_over_threshold;
}

// Button that prints the predictions
const denis_button = marcelle.button('Denis button');
denis_button.$click.subscribe(async () => {
  let primary_label = 'Hunger';
  let other_label_a = 'Call Mom';
  let other_label_b = 'Navigate To';

  console.log('Launching Denis function');


  var trialArrey = [other_label_a, other_label_b];
  let four_ids = await riccardo_edit_denis_function(primary_label, trialArrey);
  //let four_ids = await denis_function(primary_label, other_label_a, other_label_b);
  console.log('Finish Denis function');
  console.log(four_ids);
  return four_ids;
});




async function riccardo_edit_denis_function(primary_label, arrayOfAmbiguicies) {

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
  console.log('Array of the instances of the primary label: [' + primary_label + ']');
  console.log(arr_instances_primary_label);


  let arr_id_pred = await Promise.all(arr_instances_primary_label.map(async (inst) => {
    let pred = await classifier.predict(inst['x']);
    return {'id': inst['id'].toString(), 'pred': pred};
  }));

  console.log('Array of the predictions of the instances of the primary label: [' + primary_label + ']');
  console.log(arr_id_pred);



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
      console.log(index + ' -> Confidence of label '+ambig+': ' + conf);
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

    console.log('Max confidence of label '+arrayOfAmbiguicies[i]+': ' + max_confidence_ambiguicies[i]);
    console.log('Index of max confidence of label '+arrayOfAmbiguicies[i]+': ' + idx_max_confidence_ambiguicies[i]);
    console.log('Id of max confidence of label '+arrayOfAmbiguicies[i]+': ' + ID_max_confidence_ambiguicies[i]);
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
      },
      validSampleClosestToTheWrongClass:
      {
        name: ele2['y'],
        thumbnail: ele2['thumbnail'],
      }
    }

    inputObject.arrayOfAmbiguity.push(ambuigucyObj);
  }

  return inputObject;
}



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

dash.page(nameOfPages[3]).use([denis_button]);
dash.page(nameOfPages[3]).use([salima_button]);

dash.show();

attachListenersOfTabs();

$currentPageThatIAmIn.subscribe((tab) => {
  disambiguatorsSamplingButtons.updateNewTab(tab);

  if(tab == 2){

    classifier.train(trainingSet);

  }
});

$currentPageThatIAmIn.set(whichTabIAmIn());






async function funzioneInput(primary_label, arrayOfAmbiguicies) {

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
      },
      validSampleClosestToTheWrongClass:
      {
        name: ele2['y'],
        thumbnail: ele2['thumbnail'],
      }
    }

    inputObject.arrayOfAmbiguity.push(ambuigucyObj);
  }

  return inputObject;
}