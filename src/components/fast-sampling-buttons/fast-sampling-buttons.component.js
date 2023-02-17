import * as marcelle from '@marcellejs/core';
import { Component, Stream } from '@marcellejs/core';
import  View  from './fast-sampling-buttons.view.svelte';


export class FastSamplingButtons extends Component {
    constructor(initialLables = [], initialAmbiguities = new Map()) {
        super();
        this.title = 'Fast Sampling Buttons';
        this.labels = initialLables;
        this.ambiguities = initialAmbiguities;
        this.$lableSampled = new Stream([], true);
        this.$lablesToVisualize = new Stream([], true);

        this.handleClickToSample = (lable) => {
            this.$lableSampled.set(lable);
        };

        this.handleClickToVisualization = (label) => {
            this.$lablesToVisualize.set(label);
        }
    }

    setenableToSampleCam(isActive){

        var inputFieldPassing= document.getElementById("inputFieldPassing");

        if(inputFieldPassing!= null){
            inputFieldPassing.value = "2#"+isActive;

            this.updateValues();
        }
    }

    updateNewTab(tab){

        var inputFieldPassing= document.getElementById("inputFieldPassing");
        inputFieldPassing.value = "1#"+tab;
        
        this.updateValues();
    }

    updateValues(){
        var updateLablesButton= document.getElementById("updateValuesFromInputField");
        if(updateLablesButton)
            updateLablesButton.click();
    }

    updateView(){
        var updateLablesButton= document.getElementById("updateLablesButton");
        if(updateLablesButton)
            updateLablesButton.click();
    }

    mount(target) {
        const t = target || document.querySelector(`#${this.id}`);
        if (!t) return;
        this.destroy();
        this.$$.app = new View({
            target: t,
            props: {
                title: this.title,
                labels: this.labels,
                handleClickToSample: this.handleClickToSample,
                handleClickToVisualization: this.handleClickToVisualization,
                ambiguities: this.ambiguities,
            }
        })

        this.updateView();
    }



    updateAmbiguities(ambiguities_){
        this.ambiguities = ambiguities_;

        this.updateView();
    }

    addNewLable(newLable){
        this.labels.push(newLable);

        this.updateView();
    }
}
