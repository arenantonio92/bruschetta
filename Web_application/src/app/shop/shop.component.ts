import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class ShopComponent implements OnInit {

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
  private shops = [];
  private shopData;

  //Create new basement data
  private latitude = '';
  private longitude = '';
  private shopName = '';
  
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

  getShops(data) {
    this.shops = [];
    return this.restService.getShops(data)
      .then((shopData) => {
        for (var i in shopData){
          this.shops.push({
            shopId: shopData[i]['shopId'],
            name: shopData[i]['name'],
            latitude: shopData[i]['latitude'],
            longitude: shopData[i]['longitude']
          });
        this.shopData = shopData;
        }
      })
  }

  onCreateNew(){
    this.createNew = true;
  }

  createNewShop(){
    //Generate random ID
    var id = Math.random().toString(36).substring(4);
    //Create data to POST
    const shopData = {
      $class: 'org.bn.evoo.newShop',
      shopId: id,
      name: this.shopName,
      latitude: this.latitude,
      longitude: this.longitude
    }
    //Call REST API
    return this.restService.newShop(shopData)
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
