import { Component, OnInit } from '@angular/core';
//import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['../../assets/styles/form.component.scss', '../../assets/styles/assets.component.scss']
})
export class ProductComponent implements OnInit {

  constructor(private restService: RestService) {}

  // Parameters
  private temp_min_farming  = 15;
  private temp_max_farming  = 45;
  private temp_min_transp   = 5;
  private temp_max_transp   = 15;


  private productId = '';
  private onSearching = false;
  private query = false;
  private noData = false;

  private batchInfo = {
    batchId: '',
    farming: '',
    ownership: '',
    creationDate: '',
    weight: ''
  };

  private productInfo = {
    productId: '',
    batch: '',
    basement: '',
    creationDate: ''
  }

  private farmSens = [];
  private transpSens = [];
  private productionSens = [];
  private conservationSens = [];

  // {none, farming, transportation} 
  private farming = false;
  private transportation = false;
  private production = false;
  private conservation = false;
  private shipmentId;
  private finalTimestamp = '';

  ngOnInit() {
  }

  onProductQuery(){
    this.onSearching = true;
    return this.restService.getProductInfo(this.productId)
      .then((productData) => {
        if(productData['length'] > 0){
          // Batch exists
          // Set batch informations
          this.productInfo['productId']       = productData[0]['productId'];
          this.productInfo['batch']           = productData[0]['batch'];
          this.productInfo['basement']        = productData[0]['basement'];
          this.productInfo['creationDate']    = productData[0]['creationDate'];

          this.onSearching = false;
          this.query = true;
          return this.onBatchQuery(this.productInfo['batch'].split('#')[1]);
        } else {
          // No results
          this.onSearching = false;
          this.noData = true;
        }
      })
  }

  onBatchQuery(data){
    this.onSearching = true;
    return this.restService.getBatchInfo(data)
      .then((batchData) => {
        if(batchData['length'] > 0){
          // Batch exists
          // Set batch informations
          this.batchInfo['batchId']       = batchData[0]['batchId'];
          this.batchInfo['farming']       = batchData[0]['farming'];
          this.batchInfo['ownership']     = batchData[0]['ownership'];
          this.batchInfo['creationDate']  = batchData[0]['creationDate'];
          this.batchInfo['weight']        = batchData[0]['weight'];

          this.onSearching = false;
          this.query = true;
        } else {
          // No results
          this.onSearching = false;
          this.noData = true;
        }
      })
  }

  onFarmingData(){
    this.farming = !this.farming;
    return this.restService.getOFP_OHP(this.batchInfo['farming'])
      .then((sensingData) => {
        this.farmSens = [];
        for (var i in sensingData){
          if ((sensingData[i]['measureType']=="TEMPERATURE")&&((sensingData[i]['value']>this.temp_max_farming))||(sensingData[i]['value']<this.temp_min_farming)) {
            // Put an alarm
            this.farmSens.push({
              measureType       : sensingData[i]['measureType'],
              value             : sensingData[i]['value'],
              sensingTimestamp  : sensingData[i]['sensingTimestamp'],
              alarm             : "ALARM"
            });
          } else {
            this.farmSens.push({
              measureType       : sensingData[i]['measureType'],
              value             : sensingData[i]['value'],
              sensingTimestamp  : sensingData[i]['sensingTimestamp'],
              alarm             : ""
            });
          }
        }
      })
  }

  onTransportationData(){
    this.transportation = !this.transportation;
    return this.restService.getProductShip("resource:org.bn.evoo.Product#"+this.productId)
      .then((shipmentData) => {
        var shipmentId = shipmentData[0]['shipmentId'];
        this.finalTimestamp = shipmentData[0]['begin']
        //alert(shipmentId);
        return this.restService.getOOTP_Product("resource:org.bn.evoo.ProductShipment#"+shipmentId)
          .then((sensingData) => {
            this.transpSens = [];
            for (var i in sensingData){
              if ((sensingData[i]['measureType']=="TEMPERATURE")&&((sensingData[i]['value']>this.temp_max_transp))||(sensingData[i]['value']<this.temp_min_transp)) {
                // Put an alarm
                this.transpSens.push({
                  measureType       : sensingData[i]['measureType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : "ALARM"
                });
              } else {
                this.transpSens.push({
                  measureType       : sensingData[i]['measureType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : ""
                });
              }
            }
          })
      })
  }

  onProductionData(){
    this.production = !this.production;
    return this.restService.getProdProc(this.productInfo['batch'])
      .then((productionData) => {
        var processId = productionData[0]['productionProcessId'];
        //alert(shipmentId);
        return this.restService.getOOPP("resource:org.bn.evoo.ProductionProcess#"+processId)
          .then((sensingData) => {
            this.productionSens = [];
            for (var i in sensingData){
              if ((sensingData[i]['measureType']=="TEMPERATURE")&&((sensingData[i]['value']>this.temp_max_transp))||(sensingData[i]['value']<this.temp_min_transp)) {
                // Put an alarm
                this.productionSens.push({
                  measureType       : sensingData[i]['measureType'],
                  processType       : sensingData[i]['processType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : "ALARM"
                });
              } else {
                this.productionSens.push({
                  measureType       : sensingData[i]['measureType'],
                  processType       : sensingData[i]['processType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : ""
                });
              }
            }
          })
      })
  }

  onConservationData(){
    this.conservation = !this.conservation;
    this.transportation = !this.transportation;
    return this.onTransportationData()
      .then(() => {
        var params = {
          basement: this.productInfo['basement'],
          initialTime: this.batchInfo['creationDate'],
          finalTime: this.finalTimestamp
        };
        return this.restService.getOOCP(params)
          .then((sensingData) => {
            this.conservationSens = [];
            for (var i in sensingData){
              if ((sensingData[i]['measureType']=="TEMPERATURE")&&((sensingData[i]['value']>this.temp_max_farming))||(sensingData[i]['value']<this.temp_min_farming)) {
                // Put an alarm
                this.conservationSens.push({
                  measureType       : sensingData[i]['measureType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : "ALARM"
                });
              } else {
                this.conservationSens.push({
                  measureType       : sensingData[i]['measureType'],
                  value             : sensingData[i]['value'],
                  sensingTimestamp  : sensingData[i]['sensingTimestamp'],
                  alarm             : ""
                });
              }
            }
          })
      })
  }

}
