import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.page.html',
	styleUrls: ['./landing.page.scss'],
	standalone: true,
	imports: [ CommonModule, FormsModule, RouterModule, IonContent, IonButton]
})
export class LandingPage implements OnInit {

	constructor() { }

	ngOnInit() {
	}

}
