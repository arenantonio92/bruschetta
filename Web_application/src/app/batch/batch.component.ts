import { Component, OnInit } from '@angular/core';
//import { ActivatedRoute, Router } from '@angular/router';

import { RestService } from '../../services/rest.service';

@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['../../assets/styles/form.component.scss', '../../assets/styles/assets.component.scss']
})
export class BatchComponent implements OnInit {

  constructor(private restService: RestService) {}

  // Parameters
  private temp_min_farming  = 15;
  private temp_max_farming  = 45;
  private temp_min_transp   = 5;
  private temp_max_transp   = 15;


  private batchId = '';
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

  private farmSens = [];
  private transpSens = [];

  // {none, farming, transportation} 
  private farming = false;
  private transportation = false;
  private shipmentId;

  ngOnInit() {
  }

  onBatchQuery(){
    this.onSearching = true;
    return this.restService.getBatchInfo(this.batchId)
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
    return this.restService.getBatchShip("resource:org.bn.evoo.Batch#"+this.batchId)
      .then((shipmentData) => {
        var shipmentId = shipmentData[0]['shipmentId'];
        //alert(shipmentId);
        return this.restService.getOOTP_Batch("resource:org.bn.evoo.BatchShipment#"+shipmentId)
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

}
