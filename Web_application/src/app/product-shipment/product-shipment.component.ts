import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-product-shipment',
  templateUrl: './product-shipment.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class ProductShipmentComponent implements OnInit {

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
  private shipments = [];
  private shipmentData;
  private createNew = false;
  private productId = '';
  private productIds = [];
  
  ngOnInit() {
    return this.checkWallet()
      .then((result) => {
        return this.getProductShipment(this.currentUser);
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

  getProductShipment(data) {
    this.shipments = [];
    return this.restService.getProductShipment(data)
      .then((shipmentData) => {
        for (var i in shipmentData){
          this.shipments.push({
            shipmentId: shipmentData[i]['shipmentId'],
            products: shipmentData[i]['products'],
            begin: shipmentData[i]['begin'],
            end: shipmentData[i]['end']
          });
        this.shipmentData = shipmentData;
        }
      })
  }

  //Add a new product to the shipment
  onAddInput(){ 
    if(this.productId!=''){
      this.productIds.push(this.productId);
      this.productId = '';
    }else{
      alert("Type something...");
    }
  }

  onCreateNew(){
    this.createNew = true;
  }
  
  createNewProductShipment(){
    //alert(this.productIds);
    //Generate random ID
    //alert(this.productIds);
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    var creation = new Date();
    var products = [];
    for(var i in this.productIds){
      products.push("org.bn.evoo.Product#"+this.productIds[i]);
    }
    const shipmentData = {
      $class: 'org.bn.evoo.newProductShipment',
      shipmentId: id,
      products: products,
      begin: creation
    }
    //alert(shipmentData.products);
    //Call REST API
    return this.restService.newProductShipment(shipmentData)
      .then((result) => {
        //Update table, refreshing the page
        alert(console.log(result));
        return this.getProductShipment(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.createNew = false;
      });
  }
  
}  
