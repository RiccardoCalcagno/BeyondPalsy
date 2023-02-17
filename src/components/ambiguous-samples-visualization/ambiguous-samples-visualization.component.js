import { Component } from '@marcellejs/core';
import View from './ambiguous-samples-visualization.view.svelte';

export class AmbiguousSamplesVisualization extends Component {
    constructor(addRemoveButton) {
        super();
        this.addRemoveButton = addRemoveButton;
        this.title = 'Visualization of major ambiguities';
    }

    mount(target) {
        const t = target || document.querySelector(`#${this.id}`);
        if (!t) return;
        this.destroy();
        this.$$.app = new View({
            target: t,
            props: {
                title: this.title,
                addRemoveButton: this.addRemoveButton,
            }
        });

        this.updateView();
    }

    setVisibility(isVisible){
        var inputFieldPassing= document.getElementById("2inputFieldPassing");

        if(inputFieldPassing == null || inputFieldPassing == undefined) return;
        inputFieldPassing.value = "2#"+isVisible;
        
        this.updateValues();
    }

    updateValues(){
        var updateLablesButton= document.getElementById("2updateValuesFromInputField");
        if(updateLablesButton == null || updateLablesButton == undefined) return;

        if(updateLablesButton){
            updateLablesButton.click();
        }
    }
    
    updateView(){
        var updateLablesButton= document.getElementById("2updateView");
        if(updateLablesButton == null || updateLablesButton == undefined) return;

        if(updateLablesButton)
            updateLablesButton.click();
    }


    setNewSetOfAmbiguousSamplesOrNull(newSet){
        var inputFieldPassing= document.getElementById("2inputFieldPassing");
        if(inputFieldPassing == null || inputFieldPassing == undefined) return;

        inputFieldPassing.value = "1#"+JSON.stringify(newSet);
        
        this.updateValues();
    }
}
