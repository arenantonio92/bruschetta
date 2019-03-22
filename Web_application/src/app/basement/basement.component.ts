import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-basement',
  templateUrl: './basement.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class BasementComponent implements OnInit {

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
  private createNew = false;
  private name;
  private address;
  private email;
  private id;
  private surname;
  private telephone;
  private basements = [];
  private basementData;

  //Create new basement data
  private latitude = '';
  private longitude = '';
  
  ngOnInit() {
    return this.checkWallet()
      .then((result) => {
        return this.getBasement(this.currentUser);
      })
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
        this.name         = currentUserData['firstName'];
        this.id           = currentUserData['ownerId'];
        this.surname      = currentUserData['lastName'];
        this.address      = currentUserData['address'];
        this.email        = currentUserData['email'];
        this.telephone    = currentUserData['telephone'];
        return data;
      });
  }

  getBasement(data) {
    this.basements = [];
    return this.restService.getBasement(data)
      .then((basementData) => {
        for (var i in basementData){
          this.basements.push({
            basementId: basementData[i]['basementId'],
            latitude: basementData[i]['latitude'],
            longitude: basementData[i]['longitude']
          });
        this.basementData = basementData;
        }
      })
  }

  onCreateNew(){
    this.createNew = true;
  }

  createNewBasement(){
    //Generate random ID
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    const basementData = {
      $class: 'org.bn.evoo.newBasement',
      basementId: id,
      latitude: this.latitude,
      longitude: this.longitude
    }
    //Call REST API
    return this.restService.newBasement(basementData)
      .then((result) => {
        //Update table, refreshing the page
        return this.getBasement(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.createNew = false;
      });
  } 
}  