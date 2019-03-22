import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class OrderComponent implements OnInit {

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
  private orders = [];
  private orderData;
  private quantity = '';
  private shop = '';
  private shopData;
  
  ngOnInit() {
    return this.checkWallet()
      .then((result) => {
        return this.getShops(this.currentUser);
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

  getOrders(data) {
    return this.restService.getOrders(data)
      .then((orderData) => {
        for (var i in orderData){
          this.orders.push({
            orderId: orderData[i]['orderId'],
            quantity: orderData[i]['quantity'],
            date: orderData[i]['date'],
            shop: orderData[i]['shop'].split('#')[1]
          });
        }
      })
  }


  getShops(data) {
    this.orders = [];
    this.orderData = [];
    return this.restService.getShops(data)
      .then((shopData) => {
        for (var i in shopData){
          var resource = "org.bn.evoo.Shop#"+shopData[i]['shopId'];
          this.orderData.push(this.getOrders(resource));
        }
      this.shopData = resource;
      });
  }

  onCreateNew(){
    this.createNew = true;
  }

  createNewOrder(){
    //Generate random ID
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    var creation = new Date();
    const orderData = {
      $class: 'org.bn.evoo.newOrder',
      orderId: id,
      quantity: this.quantity,
      date: creation,
      shop: "org.bn.evoo.Shop#"+this.shop
    }
    //Call REST API
    return this.restService.newOrder(orderData)
      .then((result) => {
        //Update table, refreshing the page
        return this.getShops(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.createNew = false;
      });
  }
}  