import { Component } from '@marcellejs/core';
import View from './ambiguous-samples-visualization.view.svelte';

export class AmbiguousSamplesVisualization extends Component {
    constructor() {
        super();
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
            }
        });

        this.updateView();
    }

    updateValues(){
        var updateLablesButton= document.getElementById("2updateValuesFromInputField");
        if(updateLablesButton){
            updateLablesButton.click();
        }
    }
    
    updateView(){
        var updateLablesButton= document.getElementById("2updateView");
        if(updateLablesButton)
            updateLablesButton.click();
    }


    setNewSetOfAmbiguousSamplesOrNull(newSet){
        var inputFieldPassing= document.getElementById("2inputFieldPassing");
        inputFieldPassing.value = "1#"+JSON.stringify(newSet);
        
        this.updateValues();
    }
}
