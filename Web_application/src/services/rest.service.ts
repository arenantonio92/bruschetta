import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class RestService {

  constructor(private httpClient: HttpClient) {
  }

  checkWallet() {
    return this.httpClient.get('http://localhost:3000/api/wallet', {withCredentials: true}).toPromise();
  }

  signUp(data) {

    const collector = {
      $class: 'org.bn.evoo.Owner',
      ownerId: data.id,
      firstName: data.firstName,
      lastName: data.surname,
      email: data.email,
      telephone: data.telephone,
      address: data.address,
      ownerType : data.type
    };

    return this.httpClient.post('http://localhost:3001/api/org.bn.evoo.Owner', collector).toPromise()
      .then(() => {
        const identity = {
          participant: 'org.bn.evoo.Owner#' + data.id,
          userID: data.id,
          options: {}
        };

        return this.httpClient.post('http://localhost:3001/api/system/identities/issue', identity, {responseType: 'blob'}).toPromise();
      })
      .then((cardData) => {
      console.log('CARD-DATA', cardData);
        const file = new File([cardData], 'myCard.card', {type: 'application/octet-stream', lastModified: Date.now()});

        const formData = new FormData();
        formData.append('card', file);

        const headers = new HttpHeaders();
        headers.set('Content-Type', 'multipart/form-data');
        return this.httpClient.post('http://localhost:3000/api/wallet/import', formData, {
          withCredentials: true,
          headers
        }).toPromise();
      });
  }

/*
================================================================================================================================AUTHENTICATION
*/

  getCurrentUser() {
    return this.httpClient.get('http://localhost:3000/api/system/ping', {withCredentials: true}).toPromise()
      .then((data) => {
        return data['participant'];
      });
  }

  getCurrentUserInfo(data) {
    // Setup parameter
    var Id = data.split('#')[1];
    var condition = "{\"ownerId\":\""+Id+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Owner', {params, withCredentials: true}).toPromise()
      .then((data) => {
        var participant = data[0];
        return participant;
      });
  }

/*
================================================================================================================================RETRIEVE ASSETS
*/

  getBasement(data) {
    // Setup parameter
    var condition = "{\"maker\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Basement', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getProductionProcess(data) {
    // Setup parameter
    var condition = "{\"maker\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.ProductionProcess', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getMyBatch(data) {
    // Setup parameter
    var condition = "{\"ownership\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Batch', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getMyProduct(data) {
    // Setup parameter
    var condition = "{\"ownership\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Product', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getPlantation(data) {
    // Setup parameter
    var condition = "{\"farmer\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Plantation', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getFarming(data) {
    // Setup parameter
    var condition = "{\"plantation\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.FarmingProcess', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getBatchShipment(data) {
    // Setup parameter
    var condition = "{\"courier\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.BatchShipment', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getProductShipment(data) {
    // Setup parameter
    var condition = "{\"courier\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.ProductShipment', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getShops(data) {
    // Setup parameter
    var condition = "{\"seller\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Shop', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOrders(data) {
    // Setup parameter
    var condition = "{\"shop\":\"resource:"+data+"\"}";
    var query = "{\"where\":"+condition+"}";
    let params = new HttpParams().set('filter', query);
    return this.httpClient.get('http://localhost:3000/api/org.bn.evoo.Order', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

/*
================================================================================================================================QUERIES
*/

  getBatchInfo(data){
    // Setup parameter
    let params  = new HttpParams().set('batchId', data);
    return this.httpClient.get('http://localhost:3000/api/queries/BatchInformations', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getProductInfo(data){
    // Setup parameter
    let params  = new HttpParams().set('productId', data);
    return this.httpClient.get('http://localhost:3000/api/queries/ProductInformations', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOFP_OHP(data){
    // Setup parameter
    let params  = new HttpParams().set('farming', data);
    return this.httpClient.get('http://localhost:3000/api/queries/OFP_OHP', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOOCP(data){
    // Setup parameter
    let params  = new HttpParams().append('basement', data['basement']).append('initialTime', data['initialTime']).append('finalTime', data['finalTime']);
    return this.httpClient.get('http://localhost:3000/api/queries/OOCP', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getProdProc(data){
    // Setup parameter
    let params  = new HttpParams().set('batch', data);
    return this.httpClient.get('http://localhost:3000/api/queries/getProductionProcess', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOOPP(data){
    // Setup parameter
    let params  = new HttpParams().set('process', data);
    return this.httpClient.get('http://localhost:3000/api/queries/OOPP', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getBatchShip(data){
    // Setup parameter
    let params  = new HttpParams().set('batch', data);
    return this.httpClient.get('http://localhost:3000/api/queries/getBatchShipment', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOOTP_Batch(data){
    // Setup parameter
    let params  = new HttpParams().set('shipment', data);
    return this.httpClient.get('http://localhost:3000/api/queries/OOTP_Batch', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getProductShip(data){
    // Setup parameter
    let params  = new HttpParams().set('product', data);
    return this.httpClient.get('http://localhost:3000/api/queries/getProductShipment', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

  getOOTP_Product(data){
    // Setup parameter
    let params  = new HttpParams().set('shipment', data);
    return this.httpClient.get('http://localhost:3000/api/queries/OOTP_Product', {params, withCredentials: true}).toPromise()
      .then((data) => {
        return data;
      })
  }

/*
================================================================================================================================ADD ASSETS
*/

  newBasement(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newBasement', data, {withCredentials: true}).toPromise()
  }

  newBatch(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newBatch', data, {withCredentials: true}).toPromise()
  }

  newFarmingProcess(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newFarmingProcess', data, {withCredentials: true}).toPromise()
  }

  newPlantation(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newPlantation', data, {withCredentials: true}).toPromise()
  }

  newProduct(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newProduct', data, {withCredentials: true}).toPromise()
  }

  newProductionProcess(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newProductionProcess', data, {withCredentials: true}).toPromise()
  }

  newProductShipment (data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newProductShipment ', data, {withCredentials: true}).toPromise()
  }

  newBatchShipment(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newBatchShipment', data, {withCredentials: true}).toPromise()
  }

  changeBatchOwnership(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.changeBatchOwnership', data, {withCredentials: true}).toPromise()
  }

  changeProductOwnership(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.changeProductOwnership', data, {withCredentials: true}).toPromise()
  }

  startHarvestingProcess(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.startHarvestingProcess', data, {withCredentials: true}).toPromise()
  }

  endHarvestingProcess(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.endHarvestingProcess', data, {withCredentials: true}).toPromise()
  }

  newShop(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newShop', data, {withCredentials: true}).toPromise()
  }

  newOrder(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.newOrder', data, {withCredentials: true}).toPromise()
  }

  setupDemo(data){
    return this.httpClient.post('http://localhost:3000/api/org.bn.evoo.setupDemo', data, {withCredentials: true}).toPromise()
  }
}
