import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-plantation',
  templateUrl: './plantation.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class PlantationComponent implements OnInit {

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
  private plantations = [];
  private plantationData;
  private createNew = false;

  //Create new plantation data
  private latitude = '';
  private longitude = '';
  
  ngOnInit() {
    return this.checkWallet()
      .then((result) => {
        return this.getPlantation(this.currentUser);
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

  getPlantation(data) {
    this.plantations = [];
    return this.restService.getPlantation(data)
      .then((plantationData) => {
        for (var i in plantationData){
          this.plantations.push({
            plantationId: plantationData[i]['plantationId'],
            latitude: plantationData[i]['latitude'],
            longitude: plantationData[i]['longitude']
          });
        this.plantationData = plantationData;
        }
      })
  }

  onCreateNew(){
    this.createNew = true;
  }
 
  createNewPlanatation(){
    //Generate random ID
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    const plantationData = {
      $class: 'org.bn.evoo.newPlantation',
      plantationId: id,
      latitude: this.latitude,
      longitude: this.longitude
    }
    //Call REST API
    return this.restService.newPlantation(plantationData)
      .then(() => {
        //Update table, refreshing the page
        return this.getPlantation(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.createNew = false;
      });
  }
}  