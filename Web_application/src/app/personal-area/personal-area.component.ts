import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-personal-area',
  templateUrl: './personal-area.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss']
})
export class PersonalAreaComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private restService: RestService) {
  }
  
  private authenticated = false;
  private loggedIn = false;
  private currentUser;
  private currentUserType;
  private farmer = false;
  private maker = false;
  private courier = false;
  private seller = false;
  private name;
  private address;
  private email;
  private id;
  private surname;
  private telephone;
  
  ngOnInit() {
    return this.checkWallet();
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
  
  getCurrentUser() {
    return this.restService.getCurrentUser()
      .then((currentUser) => {
        this.currentUser = currentUser;
        return this.getCurrentUserInfo(this.currentUser);
      });
  }
  
  getCurrentUserInfo(data) {
    return this.restService.getCurrentUserInfo(data)
      .then((currentUserData) => {
        this.currentUserType = currentUserData['ownerType'];
        if (this.currentUserType=="FARMER") {
          this.farmer = true;
        } else if (this.currentUserType=="MAKER") {
          this.maker = true;
        } else if (this.currentUserType=="COURIER") {
          this.courier = true;
        } else if (this.currentUserType=="SELLER") {
          this.seller = true;
        }
        this.name       = currentUserData['firstName'];
        this.id         = currentUserData['ownerId'];
        this.surname    = currentUserData['lastName'];
        this.address    = currentUserData['address'];
        this.email      = currentUserData['email'];
        this.telephone  = currentUserData['telephone'];
      });
  }
  
  }  