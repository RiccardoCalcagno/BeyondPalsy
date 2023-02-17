import * as marcelle from '@marcellejs/core';
import { Component, Stream } from '@marcellejs/core';
import  View  from './fast-sampling-buttons.view.svelte';


export class FastSamplingButtons extends Component {
    constructor(initialLables, addRemoveButton) {
        super();
        this.labels = initialLables;
        this.$lableSampled = new Stream([], true);
        this.$lablesToVisualize = new Stream([], true);
        this.addRemoveButton = addRemoveButton;
        
        this.removeLableFunc =
        (label) => {

            const index = this.labels.indexOf(label);
            if (index > -1) { // only splice array when item is found
                this.labels.splice(index, 1); // 2nd parameter means remove one item only
            }

            this.updateView();
        };

        this.handleClickToSample = (lable) => {
            this.$lableSampled.set(lable);
        };

        this.handleClickToVisualization = (label) => {
            this.$lablesToVisualize.set(label);
        }
    }

    setenableToSampleCam(isActive){

        var inputFieldPassing= document.getElementById("inputFieldPassing");
        if(inputFieldPassing == null || inputFieldPassing == undefined) return;

        if(inputFieldPassing!= null){
            inputFieldPassing.value = "2#"+isActive;

            this.updateValues();
        }
    }

    setVisibility(isVisible){
        var inputFieldPassing= document.getElementById("inputFieldPassing");
        if(inputFieldPassing == null || inputFieldPassing == undefined) return;

        inputFieldPassing.value = "3#"+isVisible;
        
        this.updateValues();
    }

    updateNewTab(tab){

        var inputFieldPassing= document.getElementById("inputFieldPassing");
        if(inputFieldPassing == null || inputFieldPassing == undefined) return;

        inputFieldPassing.value = "1#"+tab;
        
        this.updateValues();
    }

    updateAmbiguities(ambiguities_){

        var inputFieldPassing= document.getElementById("inputFieldPassing");
        if(inputFieldPassing == null || inputFieldPassing == undefined) return;

        inputFieldPassing.value = "4#"+JSON.stringify(ambiguities_);
        
        this.updateValues();
    }

    updateValues(){
        var updateLablesButton= document.getElementById("updateValuesFromInputField");
        if(updateLablesButton == null || updateLablesButton == undefined) return;

        if(updateLablesButton)
            updateLablesButton.click();
    }

    updateView(){
        var updateLablesButton= document.getElementById("updateLablesButton");
        if(updateLablesButton == null || updateLablesButton == undefined) return;

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
                labels: this.labels,
                handleClickToSample: this.handleClickToSample,
                handleClickToVisualization: this.handleClickToVisualization,
                addRemoveButton: this.addRemoveButton,
                removeLableFunc: this.removeLableFunc,
            }
        })

        this.updateView();
    }

    addNewLable(newLable){
        this.labels.push(newLable);

        this.updateView();
    }
}
