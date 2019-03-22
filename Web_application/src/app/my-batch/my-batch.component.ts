import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-my-batch',
  templateUrl: './my-batch.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class MyBatchComponent implements OnInit {
  
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
    private batches = [];
    private name;
    private address;
    private email;
    private id;
    private surname;
    private telephone;
    private batchData;
    private createNew = false;
    private changeOwn = false;

    private farmId = '';
    private weight = '';
    private movingBatch = '';
    private newOwnerId = '';
    
    ngOnInit() {
      return this.checkWallet()
        .then((result) => {
          return this.getMyBatch(this.currentUser);
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

    getMyBatch(data) {
      this.batches = [];
      return this.restService.getMyBatch(data)
        .then((batchData) => {
          for (var i in batchData){
            this.batches.push({
              batchId         : batchData[i]['batchId'],
              farming         : batchData[i]['farming'].split('#')[1],
              weight          : batchData[i]['weight'],
              creationDate    : batchData[i]['creationDate']
            });
          this.batchData = batchData;
          }
        })
    }

    onCreateNew(){
      this.createNew = true;
    }

    createNewBatch(){
      //Generate random ID
      var id = Math.random().toString(36).substring(4);
      //Create data to POST
      var creation = new Date();
      const batchData = {
        $class: 'org.bn.evoo.newBatch',
        batchId: id,
        creationDate: creation,
        farming: "org.bn.evoo.FarmingProcess#"+this.farmId,
        weight: this.weight
      }
      //Call REST API
      return this.restService.newBatch(batchData)
        .then(() => {
          //Update table, refreshing the page
          return this.getMyBatch(this.currentUser);
        })
        .then(() => {
          //Hide form
          this.createNew = false;
        });
    } 

    onChangeOwnership(data){
      this.changeOwn = true;
      this.movingBatch = data;
    }

    changeOwnership(){
      const data = {
        newOwner: "resource:org.bn.evoo.Owner#"+this.newOwnerId,
        batch: this.movingBatch
      }
      //Call REST API
      return this.restService.changeBatchOwnership(data)
      .then(() => {
        //Update table, refreshing the page
        return this.getMyBatch(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.changeOwn = false;
      });
    }
}  
