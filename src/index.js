import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { Stream } from '@marcellejs/core';
import { fastSamplingButtons } from './components';


const nameOfPages = ['Set Up', 'Initial Input Set Definition', 'Sensitive Sampling', 'Debugging'];


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


let $lablesClicked = new Stream([], true);



// --------------- TODO to remove, it is only for debug purposes -----------------------------------
let initialLabels = ["Call Mom", "Hunger", "Navigate To", "I need to contact my terapist"];
let initialAmbiguities = new Map();
initialAmbiguities.set("Call Mom",["Hunger", "I need to contact my terapist"]);
initialAmbiguities.set("Navigate To",["Hunger", "I need to contact my terapist", "Call Mom"]);


const disambiguatorsSamplingButtons = fastSamplingButtons($lablesClicked, initialLabels, initialAmbiguities);


submitLable.$click.subscribe(() => {
  let valueText = labelInput.$value.get();
  if(!valueText || valueText.length == 0){
    return;
  }
  disambiguatorsSamplingButtons.addNewLable(valueText);
  labelInput.$value.set("");
  });


/*
const startTrainingButton = marcelle.button("START ASSOCIATIONS");

startTrainingButton.$click.subscribe(() => {

  disambiguatorsSamplingButtons.enableToShareClicks = true;
});
*/
disambiguatorsSamplingButtons.enableToShareClicks = true;


/*

------------------------------ First Training Page ----------------------------

*/

const input = marcelle.webcam();


const featureExtractor = marcelle.mobileNet();


const captureCommand = marcelle.button('Click to record an instance');
captureCommand.title = 'Capture instances to the training set';

const clearTrainingSet = marcelle.button('CLEAR TRAINING SET');
clearTrainingSet.title = 'Clear training set command';




const $instances = disambiguatorsSamplingButtons.$lablesClicked
    .map(async () => ({
        x: await featureExtractor.process(input.captureImage()),
        y: disambiguatorsSamplingButtons.$lablesClicked.get(),
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

// Button that prints the predictions
const printDataset = marcelle.button('Print data-set');
printDataset.$click.subscribe(async () => {
  let primary_label = 'Hunger';
  let other_label_a = 'Call Mom';
  let other_label_b = 'Navigate To';

  console.log('Launching Denis function');
  let four_ids = await denis_function(primary_label, other_label_a, other_label_b);
  console.log('Finish Denis function');
  console.log(four_ids);
  return four_ids;
});



async function denis_function(primary_label, other_label_a, other_label_b) {





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

  let max_confidence_label_a = -1;
  let max_confidence_label_b = -1;
  let idx_max_confidence_label_a = -1;
  let idx_max_confidence_label_b = -1;

  for (let index = 0; index < arr_id_pred.length; index++) {
    let id_pred = arr_id_pred[index];
    let pred = id_pred['pred'];
    let conf_lab_a = pred['confidences'][other_label_a];
    let conf_lab_b = pred['confidences'][other_label_b];
    console.log(index + ' -> Confidence of label a: ' + conf_lab_a);
    console.log(index + ' -> Confidence of label b: ' + conf_lab_b);
    if (conf_lab_a > max_confidence_label_a) {
      max_confidence_label_a = conf_lab_a;
      idx_max_confidence_label_a = index;
    }
    if (conf_lab_b > max_confidence_label_b) {
      max_confidence_label_b = conf_lab_b;
      idx_max_confidence_label_b = index;
    }
  }

  let ID_max_confidence_label_a = arr_id_pred[idx_max_confidence_label_a]['id'];
  let ID_max_confidence_label_b = arr_id_pred[idx_max_confidence_label_b]['id'];

  console.log('Max confidence of label a: ' + max_confidence_label_a);
  console.log('Index of max confidence of label a: ' + idx_max_confidence_label_a);
  console.log('Id of max confidence of label a: ' + ID_max_confidence_label_a);

  console.log('Max confidence of label b: ' + max_confidence_label_b);
  console.log('Index of max confidence of label b: ' + idx_max_confidence_label_b);
  console.log('Id of max confidence of label b: ' + ID_max_confidence_label_b);

  // ----- WORKING ON THE SECONDARY LABEL A -----
  // Get the ID of the image in A with the highest confidence twoards the primary label

  let $instances_secondary_label_a = trainingSet.items()
    .query({y: other_label_a });

  // Converting the stream to an array
  let arr_instances_secondary_label_a = await $instances_secondary_label_a.toArray();
  console.log('Array of the instances of the secondary label a: [' + other_label_a + ']');
  console.log(arr_instances_secondary_label_a);

  let arr_id_pred_a = await Promise.all(arr_instances_secondary_label_a.map(async (inst) => {
    let pred = await classifier.predict(inst['x']);
    return {'id': inst['id'].toString(), 'pred': pred};
  }));

  console.log('Array of the predictions of the instances of the secondary label a:');
  console.log(arr_id_pred_a);

  let max_confidence_label_a_twoards_primary_label = -1;
  let idx_max_confidence_label_a_twoards_primary_label = -1;

  for (let index = 0; index < arr_id_pred_a.length; index++) {
    let id_pred = arr_id_pred_a[index];
    let pred = id_pred['pred'];
    let conf_lab_a = pred['confidences'][primary_label];
    console.log(index + ' -> Confidence of label a twoards primary label: ' + conf_lab_a);
    if (conf_lab_a > max_confidence_label_a_twoards_primary_label) {
      max_confidence_label_a_twoards_primary_label = conf_lab_a;
      idx_max_confidence_label_a_twoards_primary_label = index;
    }
  }

  let ID_max_confidence_label_a_twoards_primary_label = arr_id_pred_a[idx_max_confidence_label_a_twoards_primary_label]['id'];

  console.log('Max confidence of label a twoards primary label: ' + max_confidence_label_a_twoards_primary_label);
  console.log('Index of max confidence of label a twoards primary label: ' + idx_max_confidence_label_a_twoards_primary_label);
  console.log('Id of max confidence of label a twoards primary label: ' + arr_id_pred_a[idx_max_confidence_label_a_twoards_primary_label]['id']);

  // ----- WORKING ON THE SECONDARY LABEL B -----
  // Get the ID of the image in B with the highest confidence twoards the primary label

  let $instances_secondary_label_b = trainingSet.items()
    .query({y: other_label_b });

  // Converting the stream to an array
  let arr_instances_secondary_label_b = await $instances_secondary_label_b.toArray();
  console.log('Array of the instances of the secondary label b: [' + other_label_b + ']');
  console.log(arr_instances_secondary_label_b);

  let arr_id_pred_b = await Promise.all(arr_instances_secondary_label_b.map(async (inst) => {
    let pred = await classifier.predict(inst['x']);
    return {'id': inst['id'].toString(), 'pred': pred};
  }));

  console.log('Array of the predictions of the instances of the secondary label b:');
  console.log(arr_id_pred_b);

  let max_confidence_label_b_twoards_primary_label = -1;
  let idx_max_confidence_label_b_twoards_primary_label = -1;

  for (let index = 0; index < arr_id_pred_b.length; index++) {
    let id_pred = arr_id_pred_b[index];
    let pred = id_pred['pred'];
    let conf_lab_b = pred['confidences'][primary_label];
    console.log(index + ' -> Confidence of label b twoards primary label: ' + conf_lab_b);
    if (conf_lab_b > max_confidence_label_b_twoards_primary_label) {
      max_confidence_label_b_twoards_primary_label = conf_lab_b;
      idx_max_confidence_label_b_twoards_primary_label = index;
    }
  }

  let ID_max_confidence_label_b_twoards_primary_label = arr_id_pred_b[idx_max_confidence_label_b_twoards_primary_label]['id'];
  
  console.log('Max confidence of label b twoards primary label: ' + max_confidence_label_b_twoards_primary_label);
  console.log('Index of max confidence of label b twoards primary label: ' + idx_max_confidence_label_b_twoards_primary_label);
  console.log('Id of max confidence of label b twoards primary label: ' + arr_id_pred_b[idx_max_confidence_label_b_twoards_primary_label]['id']);


// Returns:
//  - ID of the image in the primary label closest to the secondary label A
//  - ID of the image in the primary label closest to the secondary label B
//  - ID of the image in the secondary label A closest to the primary label
//  - ID of the image in the secondary label B closest to the primary label

  return [ID_max_confidence_label_a, 
          ID_max_confidence_label_b, 
          ID_max_confidence_label_a_twoards_primary_label, 
          ID_max_confidence_label_b_twoards_primary_label];
}


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

  const inputObject = 
  {
    id_good_one: ID_max_confidence_good_one,
    // in order of the class that is mismatched the most
    arrayOfAmbiguity: []
  };

  for(let i=0; i<numOfAmbig; i++){
      var ambuigucyObj = 
      {
        ID_max_confidence_label_twoards_primary_label: ID_max_confidence_label_i_twoards_primary_label[i],
        ID_max_confidence_in_correct_class_closest_to_ambiguicies: ID_max_confidence_ambiguicies[i]
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
dash.page(nameOfPages[1]).sidebar(input, trainingButton);
dash.page(nameOfPages[1]).use(plotTraining);

dash.page(nameOfPages[3]).use([printDataset]);

dash.show();




