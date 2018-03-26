import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { formations } from '../../../../../src/custom/formations';
import { sequences } from '../../../../../src/custom/sequences';

export enum VISUALIZER_TYPE {
	FORMATION = 'Formation',
	SEQUENCE = 'Sequence'
}

@Component({
	selector: 'app-visualizer-sidebar',
	templateUrl: './visualizer-sidebar.component.html',
	styleUrls: ['./visualizer-sidebar.component.scss']
})
export class VisualizerSidebarComponent implements OnInit {

	VISUALIZER_TYPE = VISUALIZER_TYPE;
	formationNames = Object.keys(formations);
	sequenceNames = Object.keys(sequences);

	// Whether 'formation' or 'sequence'
	private _type = VISUALIZER_TYPE.FORMATION;
	@Input()
	get type() {
		return this._type;
	}
	set type(value: VISUALIZER_TYPE) {
		this._type = value;
		this.typeChange.emit(value);

		switch (this.type) {
			case VISUALIZER_TYPE.FORMATION:
				this.name = this.formationNames[0];
				break;
			case VISUALIZER_TYPE.SEQUENCE:
				this.name = this.sequenceNames[0];
				break;
		}
	}
	@Output()
	typeChange = new EventEmitter<VISUALIZER_TYPE>();

	// Name of formation or sequence
	private _name = this.formationNames[0];
	@Input()
	get name() {
		return this._name;
	}
	set name(value: string) {
		this._name = value;
		this.nameChange.emit(value);
	}
	@Output()
	nameChange = new EventEmitter<string>();

	constructor(private route: ActivatedRoute) { }

	ngOnInit() {
		setTimeout(() => {
			// See if there's URL parameters
			const params = this.route.snapshot.queryParams;
			// Update selected thing if it's valid
			if (params.type && params.name) {
				switch (params.type) {
					case VISUALIZER_TYPE.FORMATION:
						if (formations[params.name]) {
							this.type = VISUALIZER_TYPE.FORMATION;
							this.name = params.name;
							return;
						}
						break;
					case VISUALIZER_TYPE.SEQUENCE:
						if (sequences[params.name]) {
							this.type = VISUALIZER_TYPE.SEQUENCE;
							this.name = params.name;
							return;
						}
						break;
				}
			}
			this.type = VISUALIZER_TYPE.FORMATION;
			this.name = this.formationNames[0];
		});
	}

}
