import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../services/rest.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './style.css', '../assets/styles/form.component.scss']
})
export class AppComponent implements OnInit {

  private authenticated = false;
  private loggedIn = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private restService: RestService) {
  }

  private currentUser;

  private signUpInProgress = false;

  @ViewChild('signupForm') signupForm;

  private signUp = {
    id: '',
    firstName: '',
    surname: '',
    email: '',
    telephone: '',
    address: '',
    type: ''
  };


  ngOnInit() {
    this.route
      .queryParams
      .subscribe((queryParams) => {
        const loggedIn = queryParams['loggedIn'];
        if (loggedIn) {
          this.authenticated = true;
          return this.router.navigate(['/'])
            .then(() => {
              return this.checkWallet();
            });
        }
      });
  }

  checkWallet() {
    return this.restService.checkWallet()
      .then((results) => {
        if (results['length'] > 0) {
          this.loggedIn = true;
          return this.getCurrentUser();
        }
      });
  }

  onEmptySetup(){
    this.signUp.id = Math.random().toString(36).substring(7);
    return this.onSignUp();
  }

  onSignUp() {
    this.signUpInProgress = true;
    return this.restService.signUp(this.signUp)
      .then(() => {
        return this.getCurrentUser();
      })
      .then(() => {
        this.loggedIn = true;
        this.signUpInProgress = false;
      });
  }

  getCurrentUser() {
    return this.restService.getCurrentUser()
      .then((currentUser) => {
        this.currentUser = currentUser;
      });
  }

  setupFarmer(){
    this.signUp = {
      id: '00000',
      firstName: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@me.com',
      telephone: '3334455667',
      address: 'Via da qui 1',
      type: 'FARMER'
    };
    //alert("farmer");
    return this.onSignUp()
      .then(() => {
        return this.setupDemo();
      });
  }

  setupMaker(){
    this.signUp = {
      id: '11111',
      firstName: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@me.com',
      telephone: '3334455667',
      address: 'Via da qui 1',
      type: 'MAKER'
    };
    //alert("maker");
    return this.onSignUp()
      .then(() => {
        return this.setupDemo();
      });
  }

  setupCourier(){
    this.signUp = {
      id: '22222',
      firstName: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@me.com',
      telephone: '3334455667',
      address: 'Via da qui 1',
      type: 'COURIER'
    };
    //alert("courier");
    return this.onSignUp()
      .then(() => {
        return this.setupDemo();
      });
  }

  setupSeller(){
    this.signUp = {
      id: '33333',
      firstName: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@me.com',
      telephone: '3334455667',
      address: 'Via da qui 1',
      type: 'SELLER'
    };
    //alert("seller");
    return this.onSignUp()
      .then(() => {
        return this.setupDemo();
      });
  }

  setupDemo(){
    //Create data to POST
    const setupData = {
      $class: 'org.bn.evoo.setupDemo'
    }
    //Call REST API
    return this.restService.setupDemo(setupData);
  }

}
