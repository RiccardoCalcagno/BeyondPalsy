import * as marcelle from '@marcellejs/core';
import { Component } from '@marcellejs/core';
import  View  from './fast-sampling-buttons.view.svelte';


export class FastSamplingButtons extends Component {
    constructor(lablesClicked, initialLables = [], initialAmbiguities = new Map()) {
        super();
        this.title = 'Fast Sampling Buttons';
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
        })
    }
}
