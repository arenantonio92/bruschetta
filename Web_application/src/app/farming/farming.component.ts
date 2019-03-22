import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-farming',
  templateUrl: './farming.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class FarmingComponent implements OnInit {

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
  private farmings = [];
  private farmingData = [];
  private plantationData;

  private plantationId = '';
  private year = '';
  
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

  getFarming(data) {
    return this.restService.getFarming(data)
      .then((farmingData) => {
        for (var i in farmingData){
          this.farmings.push({
            farmingProcId: farmingData[i]['farmingProcId'],
            year: farmingData[i]['year'],
            harvBegin: farmingData[i]['harvBegin'],
            harvEnd: farmingData[i]['harvEnd'],
            harvMethod: farmingData[i]['harvMethod']
          });
        }
      })
  }


  getPlantation(data) {
    this.farmings = [];
    this.farmingData = [];
    return this.restService.getPlantation(data)
      .then((plantationData) => {
        for (var i in plantationData){
          var resource = "org.bn.evoo.Plantation#"+plantationData[i]['plantationId'];
          this.farmingData.push(this.getFarming(resource));
        }
      this.plantationData = resource;
      });
  }

  onCreateNew(){
    this.createNew = true;
  }

  createNewFarming(){
    var id = Math.random().toString(36).substring(9);
    const farmingData = {
      $class: 'org.bn.evoo.newFarmingProcess',
      farmingProcId: id,
      plantation: "org.bn.evoo.Plantation#"+this.plantationId,
      year: this.year
    }
    return this.restService.newFarmingProcess(farmingData)
      .then(() => {
        return this.getPlantation(this.currentUser);
      })
      .then(() => {
        this.createNew = false;
      });
  } 
}  