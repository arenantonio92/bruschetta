import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-production-process',
  templateUrl: './production-process.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class ProductionProcessComponent implements OnInit {
  
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
    private productionProcesses = [];
    private productionData;
    private createNew = false;

    //newProductionProcess data
    private batchId = '';
    private begin = new Date();

    ngOnInit() {
      return this.checkWallet()
        .then((result) => {
          return this.getProductionProcess(this.currentUser);
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
          this.name       = currentUserData['firstName'];
          this.id         = currentUserData['ownerId'];
          this.surname    = currentUserData['lastName'];
          this.address    = currentUserData['address'];
          this.email      = currentUserData['email'];
          this.telephone  = currentUserData['telephone'];
        });
    }
    
    getProductionProcess(data) {
      this.productionProcesses = [];
      return this.restService.getProductionProcess(data)
        .then((productionData) => {
          for (var i in productionData){
            this.productionProcesses.push({
              productionProcessId: productionData[i]['productionProcessId'],
              batch: productionData[i]['batch'].split('#')[1],
              begin: productionData[i]['begin'],
              end: productionData[i]['end']
            });
          this.productionData = "Ciao";
          }
        })
    }


  onCreateNew(){
    this.createNew = true;
  }

  createNewProductionProcess(){
    var id = Math.random().toString(36).substring(4);
    const prodProcData = {
      $class: 'org.bn.evoo.newProductionProcess',
      productionProcessId: id,
      batch: "org.bn.evoo.Batch#"+this.batchId,
      begin: this.begin
    }
    return this.restService.newProductionProcess(prodProcData)
      .then(() => {
        return this.getProductionProcess(this.currentUser);
      })
      .then(() => {
        this.createNew = false;
      });
  } 
}  
