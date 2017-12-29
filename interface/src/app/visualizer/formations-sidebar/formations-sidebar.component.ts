import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { defaultFormations } from '../../../../../src/lib/default-formations';

@Component({
	selector: 'app-formations-sidebar',
	templateUrl: './formations-sidebar.component.html',
	styleUrls: ['./formations-sidebar.component.scss']
})
export class FormationsSidebarComponent implements OnInit {

	formationNames = Object.keys(defaultFormations);
	formations = defaultFormations;

	private _selectedFormation = this.formationNames[0];
	@Input()
	get selectedFormation() {
		return this._selectedFormation;
	}
	set selectedFormation(value: string) {
		this._selectedFormation = value;
		this.selectedFormationChange.emit(value);
	}
	@Output()
	selectedFormationChange = new EventEmitter<string>();

	constructor() { }

	ngOnInit() {
		this.selectedFormation = this.formationNames[0];
	}

}
