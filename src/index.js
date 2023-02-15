import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { Stream } from '@marcellejs/core';
import { fastSamplingButtons } from './components';


const nameOfPages = ['Set Up', 'Initial Input Set Definition', 'Sensitive Sampling'];


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

dash.show();




