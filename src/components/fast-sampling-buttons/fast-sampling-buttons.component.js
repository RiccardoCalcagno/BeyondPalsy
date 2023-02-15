import * as marcelle from '@marcellejs/core';
import { Component } from '@marcellejs/core';
import  View  from './fast-sampling-buttons.view.svelte';


export class FastSamplingButtons extends Component {
    constructor(lablesClicked, initialLables = [], initialAmbiguities = new Map()) {
        super();
        this.title = 'Fast Sampling Buttons';
        this.labels = initialLables;
        this.enableToShareClicks = false;
        this.ambiguities = initialAmbiguities;

        this.handleClickExtern = (lable) => {
            this.$lablesClicked.set(lable);
        };

        this.$lablesClicked = lablesClicked;
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
                enableToShareClicks: this.enableToShareClicks,
                handleClickExtern: this.handleClickExtern,
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
