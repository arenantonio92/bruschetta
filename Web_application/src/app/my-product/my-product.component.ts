import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-my-product',
  templateUrl: './my-product.component.html',
  styleUrls: ['../../assets/styles/assets.component.scss', '../../assets/styles/form.component.scss']
})
export class MyProductComponent implements OnInit {
  
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
    private products = [];
    private name;
    private address;
    private email;
    private id;
    private surname;
    private telephone;
    private productData;
    private createNew = false;
    private changeOwn = false;

    private batchId = '';
    private basementId = '';
    private movingProduct = '';
    private newOwnerId = '';
    
    ngOnInit() {
      return this.checkWallet()
        .then((result) => {
          return this.getMyProduct(this.currentUser);
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

    getMyProduct(data) {
      this.products = [];
      return this.restService.getMyProduct(data)
        .then((productData) => {
          for (var i in productData){
            this.products.push({
              productId: productData[i]['productId'],
              batch: productData[i]['batch'].split('#')[1],
              basement: productData[i]['basement'].split('#')[1],
              creationDate: productData[i]['creationDate']
            });
          this.productData = productData;
          }
        })
    }

    onCreateNew(){
      this.createNew = true;
    }

    createNewProduct(){
      //Generate random ID
      var id = Math.random().toString(36).substring(4);
      var creation = new Date();
      //Create data to POST
      const productData = {
        $class: 'org.bn.evoo.newProduct',
        productId: id,
        batch: "org.bn.evoo.Batch#"+this.batchId,
        basement: "org.bn.evoo.Basement#"+this.basementId,
        creationDate: creation
      }
      //Call REST API
      return this.restService.newProduct(productData)
        .then(() => {
          //Update table, refreshing the page
          return this.getMyProduct(this.currentUser);
        })
        .then(() => {
          //Hide form
          this.createNew = false;
        });
    } 
    
    onChangeOwnership(data){
      this.changeOwn = true;
      this.movingProduct = data;
    }

    changeOwnership(){
      const data = {
        newOwner: "resource:org.bn.evoo.Owner#"+this.newOwnerId,
        product: this.movingProduct
      }
      //Call REST API
      return this.restService.changeProductOwnership(data)
      .then(() => {
        //Update table, refreshing the page
        return this.getMyProduct(this.currentUser);
      })
      .then(() => {
        //Hide form
        this.changeOwn = false;
      });
    }
}  
