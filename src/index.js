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

const labels = [];

submitLable.$click.subscribe(() => {
  let valueText = labelInput.$value.get();
  if(!valueText || valueText.length == 0){
    return;
  }
  labels.push(valueText);
  labelInput.$value.set("");
  });


/*

------------------------------ First Training Page ----------------------------

*/

const input = marcelle.webcam();


const featureExtractor = marcelle.mobileNet();


const captureCommand = marcelle.button('Click to record an instance');
captureCommand.title = 'Capture instances to the training set';

const clearTrainingSet = marcelle.button('CLEAR TRAINING SET');
clearTrainingSet.title = 'Clear training set command';




const $instances = captureCommand.$click
    .sample(input.$images)
    .map(async (img) => ({
        x: await featureExtractor.process(img),
        y: "EXAMPLE then We will have lables from different buttons",
        thumbnail: input.$thumbnails.get(),
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


dash.page(nameOfPages[1]).use(captureCommand);
dash.page(nameOfPages[1]).use(trainingSetBrowser);
dash.page(nameOfPages[1]).use(clearTrainingSet);
dash.page(nameOfPages[1]).sidebar(input, trainingButton);

dash.show();




