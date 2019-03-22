import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-batch-shipment',
  templateUrl: './batch-shipment.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class BatchShipmentComponent implements OnInit {

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
  private createNew = false;
  private seller = false;
  private name;
  private address;
  private email;
  private id;
  private surname;
  private telephone;
  private shipments = [];
  private shipmentData;
  private batchId = '';
  private batchIds = [];
  
  ngOnInit() {
    return this.checkWallet()
      .then((result) => {
        return this.getBatchShipment(this.currentUser);
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

  getBatchShipment(data) {
    this.shipments = [];
    return this.restService.getBatchShipment(data)
      .then((shipmentData) => {
        for (var i in shipmentData){
          this.shipments.push({
            shipmentId: shipmentData[i]['shipmentId'],
            batches: shipmentData[i]['batches'],
            begin: shipmentData[i]['begin'],
            end: shipmentData[i]['end']
          });
        this.shipmentData = shipmentData;
        }
      })
  }

  //Add a new batch to the shipment
  onAddInput(){ 
    if(this.batchId!=''){
      this.batchIds.push(this.batchId);
      this.batchId = '';
    }else{
      alert("Type something...");
    }
  }

  onCreateNew(){
    this.createNew = true;
  }
  
  createNewBatchShipment(){
    //alert(this.batchIds);
    //Generate random ID
    alert(this.batchIds);
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    var creation = new Date();
    var batches = [];
    for(var i in this.batchIds){
      batches.push("org.bn.evoo.Batch#"+this.batchIds[i]);
    }
    const shipmentData = {
      $class: 'org.bn.evoo.newBatchShipment',
      shipmentId: id,
      batches: batches,
      begin: creation
    }
    alert(shipmentData.batches);
    //Call REST API
    return this.restService.newBatchShipment(shipmentData)
      .then((result) => {
        alert(result);
        //Update table, refreshing the page
        return this.getBatchShipment(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.createNew = false;
      });
  }
}  