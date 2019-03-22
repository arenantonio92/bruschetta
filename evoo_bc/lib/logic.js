/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newPlantation
 * @param {org.bn.evoo.newPlantation} newPlantation
 * @transaction
 */
async function newPlantation(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'FARMER'){
        throw new Error('Current participant is not a farmer.');
    } else {
        var plantation              = factory.newResource(NS, 'Plantation', tx.plantationId);
        plantation.farmer           = factory.newRelationship(NS, 'Owner', currentParticipant.ownerId);
        plantation.latitude         = tx.latitude;
        plantation.longitude        = tx.longitude;

        return getAssetRegistry('org.bn.evoo.Plantation')
            .then(function (registry) {
                // add asset to registry
                return registry.add(plantation);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newShop
 * @param {org.bn.evoo.newShop} newShop
 * @transaction
 */
async function newShop(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'SELLER'){
        throw new Error('Current participant is not a seller.');
    } else {
        var shop                    = factory.newResource(NS, 'Shop', tx.shopId);
        shop.seller                 = factory.newRelationship(NS, 'Owner', currentParticipant.ownerId);
        shop.latitude               = tx.latitude;
        shop.longitude              = tx.longitude;
        shop.name                   = tx.name;

        return getAssetRegistry('org.bn.evoo.Shop')
            .then(function (registry) {
                // add asset to registry
                return registry.add(shop);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newOrder
 * @param {org.bn.evoo.newOrder} newOrder
 * @transaction
 */
async function newOrder(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'SELLER'){
        throw new Error('Current participant is not a seller.');
    } else if (tx.shop.seller.ownerId !== currentParticipant.ownerId) {
        throw new Error('Current seller is not the shop owner.');
    } else {
        var order                       = factory.newResource(NS, 'Order', tx.orderId);
        order.shop                      = tx.shop;
        order.quantity                  = tx.quantity;
        //order.date                      = new Date();
        order.date                      = new Date('1900-01-01T00:00:00Z');

        return getAssetRegistry('org.bn.evoo.Order')
            .then(function (registry) {
                // add asset to registry
                return registry.add(order);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newFarmingProcess
 * @param {org.bn.evoo.newFarmingProcess} newFarmingProcess
 * @transaction
 */
async function newFarmingProcess(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'FARMER'){
        throw new Error('Current participant is not a farmer.');
    } else if (tx.plantation.farmer.ownerId !== currentParticipant.ownerId) {
        throw new Error('Current farmer is not the plantation owner.');
    } else {
        var farmingProcess              = factory.newResource(NS, 'FarmingProcess', tx.farmingProcId);
        farmingProcess.plantation       = tx.plantation;
        farmingProcess.year             = tx.year;
        farmingProcess.harvBegin        = new Date('1900-01-01T00:00:00Z');
        farmingProcess.harvEnd          = new Date('1900-01-01T00:00:00Z');
        farmingProcess.harvMethod       = 'UNDEFINED';

        return getAssetRegistry('org.bn.evoo.FarmingProcess')
            .then(function (registry) {
                // add asset to registry
                return registry.add(farmingProcess);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * startHarvestingProcess
 * @param {org.bn.evoo.startHarvestingProcess} startHarvestingProcess
 * @transaction
 */
async function startHarvestingProcess(tx) {
    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant  = getCurrentParticipant();
    var defaultDate = new Date('1900-01-01T00:00:00Z');

    if (tx.farming.plantation.farmer.ownerId !== currentParticipant.ownerId) {
        throw new Error('Current farmer is not the plantation owner.');
    } else if (tx.farming.harvBegin.getTime() !== defaultDate.getTime()) {
        throw new Error('Request cannot be satisfied: harvesting begin already set.');
    } else if (tx.harvMethod === 'UNDEFINED'){
        throw new Error('An harvesting method must be specified: BY_HAND or MACHINE');
    } else {
        // Update the asset with the new value.
        tx.farming.harvBegin        = tx.begin;
        tx.farming.harvMethod       = tx.harvMethod;

        // Get the asset registry for the asset.
        const assetRegistry = await getAssetRegistry('org.bn.evoo.FarmingProcess');
        // Update the asset in the asset registry.
        await assetRegistry.update(tx.farming);
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * endHarvestingProcess
 * @param {org.bn.evoo.endHarvestingProcess} endHarvestingProcess
 * @transaction
 */
async function endHarvestingProcess(tx) {
    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();
    var defaultDate = new Date('1900-01-01T00:00:00Z');

    if (tx.farming.plantation.farmer.ownerId !== currentParticipant.ownerId) {
        throw new Error('Current farmer is not the plantation owner.');
    } else if (tx.farming.harvBegin.getTime() === defaultDate.getTime()) {
        throw new Error('Request cannot be satisfied: harvesting begin not set.');
    } else if (tx.farming.harvEnd.getTime() !== defaultDate.getTime()) {
        throw new Error('Request cannot be satisfied: harvesting end already set.');
    } else {
        // Update the asset with the new value.
        tx.farming.harvEnd          = tx.end;

        // Get the asset registry for the asset.
        const assetRegistry = await getAssetRegistry('org.bn.evoo.FarmingProcess');
        // Update the asset in the asset registry.
        await assetRegistry.update(tx.farming);
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newBatch
 * @param {org.bn.evoo.newBatch} newBatch
 * @transaction
 */
async function newBatch(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.farming.plantation.farmer.ownerId !== currentParticipant.ownerId) {
        throw new Error('Current farmer is not the plantation owner.');
    } else {
        var batch               = factory.newResource(NS, 'Batch', tx.batchId);
        batch.farming           = tx.farming;
        batch.ownership         = currentParticipant;
        batch.creationDate      = tx.creationDate;
        batch.weight            = tx.weight;

        return getAssetRegistry('org.bn.evoo.Batch')
            .then(function (registry) {
                // add asset to registry
                return registry.add(batch);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newProductionProcess
 * @param {org.bn.evoo.newProductionProcess} newProductionProcess
 * @transaction
 */
async function newProductionProcess(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'MAKER'){
        throw new Error('Current participant is not a maker.');
    } else if (tx.batch.ownership.ownerId !== currentParticipant.ownerId) {
        throw new Error('Operation not permitted: specified batch is not on your ownership.');
    } else {
        var productionProcess   = factory.newResource(NS, 'ProductionProcess', tx.productionProcessId);
        productionProcess.maker = currentParticipant;
        productionProcess.batch = tx.batch;
        productionProcess.begin = tx.begin;
        productionProcess.end   = new Date('1900-01-01T00:00:00Z');

        return getAssetRegistry('org.bn.evoo.ProductionProcess')
            .then(function (registry) {
                // add asset to registry
                return registry.add(productionProcess);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newBatchShipment
 * @param {org.bn.evoo.newBatchShipment} newBatchShipment
 * @transaction
 */
async function newBatchShipment(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';
    var i;

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'COURIER'){
        throw new Error('Current participant is not a courier.');
    } else {
        var flag = 0;
        for (i = 0; i < tx.batches.length; i++) {
            if (tx.batches[i].ownership.ownerId !== currentParticipant.ownerId){
                flag = 1;
                break;
            }
        }
        if (flag === 0){
            var shipment            = factory.newResource(NS, 'BatchShipment', tx.shipmentId);
            shipment.courier        = currentParticipant;
            shipment.batches        = tx.batches;
            shipment.begin          = tx.begin;
            shipment.end            = new Date('1900-01-01T00:00:00Z');

            return getAssetRegistry('org.bn.evoo.BatchShipment')
                .then(function (registry) {
                    // add asset to registry
                    return registry.add(shipment);
                });
        } else {
            throw new Error('Not all the batches are on your ownership.');
        }
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newProductShipment
 * @param {org.bn.evoo.newProductShipment} newProductShipment
 * @transaction
 */
async function newProductShipment(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';
    var i;

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'COURIER'){
        throw new Error('Current participant is not a courier.');
    } else {
        var flag = 0;
        for (i = 0; i < tx.products.length; i++) {
            if (tx.products[i].ownership.ownerId !== currentParticipant.ownerId){
                flag = 1;
                break;
            }
        }
        if (flag === 0){
            var shipment            = factory.newResource(NS, 'ProductShipment', tx.shipmentId);
            shipment.courier        = currentParticipant;
            shipment.products       = tx.products;
            shipment.begin          = tx.begin;
            shipment.end            = new Date('1900-01-01T00:00:00Z');
            shipment.order          = tx.order;

            return getAssetRegistry('org.bn.evoo.ProductShipment')
                .then(function (registry) {
                    // add asset to registry
                    return registry.add(shipment);
                });
        } else {
            throw new Error('Not all the products are on your ownership.');
        }
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newBasement
 * @param {org.bn.evoo.newBasement} newBasement
 * @transaction
 */
async function newBasement(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'MAKER'){
        throw new Error('Current participant is not a maker.');
    } else {
        var basement            = factory.newResource(NS, 'Basement', tx.basementId);
        basement.maker          = currentParticipant;
        basement.latitude       = tx.latitude;
        basement.longitude      = tx.longitude;

        return getAssetRegistry('org.bn.evoo.Basement')
            .then(function (registry) {
                // add asset to registry
                return registry.add(basement);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newProduct
 * @param {org.bn.evoo.newProduct} newProduct
 * @transaction
 */
async function newProduct(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (currentParticipant.ownerType !== 'MAKER'){
        throw new Error('Current participant is not a maker.');
    } else if (tx.batch.ownership.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted: specified batch is not on your ownership.');
    } else {
        var product             = factory.newResource(NS, 'Product', tx.productId);
        product.batch           = tx.batch;
        product.creationDate    = tx.creationDate;
        product.basement        = tx.basement;
        product.ownership       = currentParticipant;

        return getAssetRegistry('org.bn.evoo.Product')
            .then(function (registry) {
                // add asset to registry
                return registry.add(product);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newProductionProcessSensing
 * @param {org.bn.evoo.newProductionProcessSensing} newProductionProcessSensing
 * @transaction
 */
async function newProductionProcessSensing(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.process.maker.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted.');
    } else {
        var sensing                 = factory.newResource(NS, 'ProductionProcessSensing', tx.sensingId);
        sensing.process             = tx.process;
        sensing.measureType         = tx.measureType;
        sensing.processType         = tx.processType;
        sensing.value               = tx.value;
        sensing.sensorIdentifier    = tx.sensorIdentifier;
        sensing.sensingTimestamp    = tx.sensingTimestamp;

        return getAssetRegistry('org.bn.evoo.ProductionProcessSensing')
            .then(function (registry) {
                // add asset to registry
                return registry.add(sensing);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newFarmingProcessSensing
 * @param {org.bn.evoo.newFarmingProcessSensing} newFarmingProcessSensing
 * @transaction
 */
async function newFarmingProcessSensing(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.farming.plantation.farmer.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted.');
    } else {
        var sensing                 = factory.newResource(NS, 'FarmingProcessSensing', tx.sensingId);
        sensing.farming             = tx.farming;
        sensing.measureType         = tx.measureType;
        sensing.value               = tx.value;
        sensing.sensorIdentifier    = tx.sensorIdentifier;
        sensing.sensingTimestamp    = tx.sensingTimestamp;

        return getAssetRegistry('org.bn.evoo.FarmingProcessSensing')
            .then(function (registry) {
                // add asset to registry
                return registry.add(sensing);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newBatchShipmentSensing
 * @param {org.bn.evoo.newBatchShipmentSensing} newBatchShipmentSensing
 * @transaction
 */
async function newBatchShipmentSensing(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.shipment.courier.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted.');
    } else {
        var sensing                 = factory.newResource(NS, 'BatchShipmentSensing', tx.sensingId);
        sensing.shipment            = tx.shipment;
        sensing.measureType         = tx.measureType;
        sensing.value               = tx.value;
        sensing.sensorIdentifier    = tx.sensorIdentifier;
        sensing.sensingTimestamp    = tx.sensingTimestamp;

        return getAssetRegistry('org.bn.evoo.BatchShipmentSensing')
            .then(function (registry) {
                // add asset to registry
                return registry.add(sensing);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newProductShipmentSensing
 * @param {org.bn.evoo.newProductShipmentSensing} newProductShipmentSensing
 * @transaction
 */
async function newProductShipmentSensing(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.shipment.courier.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted.');
    } else {
        var sensing                 = factory.newResource(NS, 'ProductShipmentSensing', tx.sensingId);
        sensing.shipment            = tx.shipment;
        sensing.measureType         = tx.measureType;
        sensing.value               = tx.value;
        sensing.sensorIdentifier    = tx.sensorIdentifier;
        sensing.sensingTimestamp    = tx.sensingTimestamp;

        return getAssetRegistry('org.bn.evoo.ProductShipmentSensing')
            .then(function (registry) {
                // add asset to registry
                return registry.add(sensing);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * newBasementSensing
 * @param {org.bn.evoo.newBasementSensing} newBasementSensing
 * @transaction
 */
async function newBasementSensing(tx) {
    var factory                 = getFactory();
    var NS                      = 'org.bn.evoo';

    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant = getCurrentParticipant();

    if (tx.process.maker.ownerId !== currentParticipant.ownerId){
        throw new Error('Operation not permitted.');
    } else {
        var sensing                 = factory.newResource(NS, 'BasementSensing', tx.sensingId);
        sensing.basement            = tx.basement;
        sensing.measureType         = tx.measureType;
        sensing.value               = tx.value;
        sensing.sensorIdentifier    = tx.sensorIdentifier;
        sensing.sensingTimestamp    = tx.sensingTimestamp;

        return getAssetRegistry('org.bn.evoo.BasementSensing')
            .then(function (registry) {
                // add asset to registry
                return registry.add(sensing);
            });
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * changeBatchOwnership
 * @param {org.bn.evoo.changeBatchOwnership} changeBatchOwnership
 * @transaction
 */
async function changeBatchOwnership(tx) {
    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant  = getCurrentParticipant();

    if (tx.batch.ownership.ownerId !== currentParticipant.ownerId) {
        throw new Error('Operation not permitted: you are not the owner.');
    } else {
        // Update the asset with the new owner.
        tx.batch.ownership      = tx.newOwner;

        // Get the asset registry for the asset.
        const assetRegistry = await getAssetRegistry('org.bn.evoo.Batch');
        // Update the asset in the asset registry.
        await assetRegistry.update(tx.batch);
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * changeProductOwnership
 * @param {org.bn.evoo.changeProductOwnership} changeProductOwnership
 * @transaction
 */
async function changeProductOwnership(tx) {
    // Get the current participant. The identity that was used to submit the transaction
    var currentParticipant  = getCurrentParticipant();

    if (tx.product.ownership.ownerId !== currentParticipant.ownerId) {
        throw new Error('Operation not permitted: you are not the owner.');
    } else {
        // Update the asset with the new owner.
        tx.product.ownership      = tx.newOwner;

        // Get the asset registry for the asset.
        const assetRegistry = await getAssetRegistry('org.bn.evoo.Product');
        // Update the asset in the asset registry.
        await assetRegistry.update(tx.product);
    }
}
/**---------------------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 * setupDemo
 * @param {org.bn.evoo.setupDemo} setupDemo
 * @transaction
 */
async function setupDemo(){
    // Owner#00000  => FARMER
    // Owner#11111  => MAKER
    // Owner#22222  => COURIER
    // Owner#33333  => SELLER

    var factory                         = getFactory();
    var NS                              = 'org.bn.evoo';

    // sample SensingTimestamp
    var timestamp = new Date('2018-01-01T00:00:00Z');

    // Plantations
    var plantation1                     = factory.newResource(NS, 'Plantation', '00000');
    plantation1.farmer                  = factory.newRelationship(NS, 'Owner', '00000');
    plantation1.latitude                = '43.778506';
    plantation1.longitude               = '10.423145';
    var plantation2                     = factory.newResource(NS, 'Plantation', '00001');
    plantation2.farmer                  = factory.newRelationship(NS, 'Owner', '00000');
    plantation2.latitude                = '43.778607';
    plantation2.longitude               = '10.419540';

    // FarmingProcess
    var dateBegin1 = new Date('2018-09-01T00:00:00Z');
    var dateEnd1 = new Date('2018-09-04T00:00:00Z');
    var farming1                        = factory.newResource(NS, 'FarmingProcess', '00000');
    farming1.plantation                 = factory.newRelationship(NS, 'Plantation', '00000');
    farming1.harvBegin                  = dateBegin1;
    farming1.harvEnd                    = dateEnd1;
    farming1.harvMethod                 = 'BY_HAND';
    farming1.year                       = 2018;
    var dateBegin2 = new Date('2018-09-04T00:00:00Z');
    var dateEnd2 = new Date('2018-09-08T00:00:00Z');
    var farming2                        = factory.newResource(NS, 'FarmingProcess', '00001');
    farming2.plantation                 = factory.newRelationship(NS, 'Plantation', '00001');
    farming2.harvBegin                  = dateBegin2;
    farming2.harvEnd                    = dateEnd2;
    farming2.harvMethod                 = 'BY_HAND';
    farming2.year                       = 2018;

    // FarmingProcessSensing
    var farmingSens1                    = factory.newResource(NS, 'FarmingProcessSensing', '00000');
    farmingSens1.farming                = factory.newRelationship(NS, 'FarmingProcess', '00000');
    farmingSens1.measureType            = 'TEMPERATURE';
    farmingSens1.value                  = 34;
    farmingSens1.sensorIdentifier       = '1426.dbyd.8926.bueh';
    farmingSens1.sensingTimestamp       = timestamp;
    var farmingSens2                    = factory.newResource(NS, 'FarmingProcessSensing', '00001');
    farmingSens2.farming                = factory.newRelationship(NS, 'FarmingProcess', '00000');
    farmingSens2.measureType            = 'HUMIDITY';
    farmingSens2.value                  = 88;
    farmingSens2.sensorIdentifier       = '1426.dbyd.8926.bueh';
    farmingSens2.sensingTimestamp       = timestamp;
    var farmingSens3                    = factory.newResource(NS, 'FarmingProcessSensing', '00002');
    farmingSens3.farming                = factory.newRelationship(NS, 'FarmingProcess', '00000');
    farmingSens3.measureType            = 'TEMPERATURE';
    farmingSens3.value                  = 31;
    farmingSens3.sensorIdentifier       = '1426.dbyd.8926.whsj';
    farmingSens3.sensingTimestamp       = timestamp;
    var farmingSens4                    = factory.newResource(NS, 'FarmingProcessSensing', '00003');
    farmingSens4.farming                = factory.newRelationship(NS, 'FarmingProcess', '00001');
    farmingSens4.measureType            = 'TEMPERATURE';
    farmingSens4.value                  = 42;
    farmingSens4.sensorIdentifier       = '1426.dbyd.8926.jdhb';
    farmingSens4.sensingTimestamp       = timestamp;
    var farmingSens5                    = factory.newResource(NS, 'FarmingProcessSensing', '00004');
    farmingSens5.farming                = factory.newRelationship(NS, 'FarmingProcess', '00001');
    farmingSens5.measureType            = 'HUMIDITY';
    farmingSens5.value                  = 70;
    farmingSens5.sensorIdentifier       = '1426.dbyd.8926.bueh';
    farmingSens5.sensingTimestamp       = timestamp;

    // Batch
    var creation1 = new Date('2018-10-01T00:00:00Z');
    var batch1                          = factory.newResource(NS, 'Batch', '00000');
    batch1.ownership                    = factory.newRelationship(NS, 'Owner', '00000');
    batch1.creationDate                 = creation1;
    batch1.farming                      = factory.newRelationship(NS, 'FarmingProcess', '00000');
    batch1.weight                       = 1200;
    var creation2 = new Date('2018-10-06T00:00:00Z');
    var batch2                          = factory.newResource(NS, 'Batch', '00001');
    batch2.ownership                    = factory.newRelationship(NS, 'Owner', '00000');
    batch2.creationDate                 = creation2;
    batch2.farming                      = factory.newRelationship(NS, 'FarmingProcess', '00000');
    batch2.weight                       = 1400;
    var creation3 = new Date('2018-10-04T00:00:00Z');
    var batch3                          = factory.newResource(NS, 'Batch', '00002');
    batch3.ownership                    = factory.newRelationship(NS, 'Owner', '11111');
    batch3.creationDate                 = creation3;
    batch3.farming                      = factory.newRelationship(NS, 'FarmingProcess', '00001');
    batch3.weight                       = 1300;
    var creation4 = new Date('2018-10-04T00:00:00Z');
    var batch4                          = factory.newResource(NS, 'Batch', '00003');
    batch4.ownership                    = factory.newRelationship(NS, 'Owner', '22222');
    batch4.creationDate                 = creation4;
    batch4.farming                      = factory.newRelationship(NS, 'FarmingProcess', '00001');
    batch4.weight                       = 1300;

    // ProductionProcess
    var prodBegin1 = new Date('2018-10-01T00:00:00Z');
    var prodEnd1 = new Date('2018-10-04T00:00:00Z');
    var prodProc1                       = factory.newResource(NS, 'ProductionProcess', '00000');
    prodProc1.maker                     = factory.newRelationship(NS, 'Owner', '11111');
    prodProc1.batch                     = factory.newRelationship(NS, 'Batch', '00000');
    prodProc1.begin                     = prodBegin1;
    prodProc1.end                       = prodEnd1;
    var prodBegin2 = new Date('2018-10-04T00:00:00Z');
    var prodEnd2 = new Date('2018-10-07T00:00:00Z');
    var prodProc2                       = factory.newResource(NS, 'ProductionProcess', '00001');
    prodProc2.maker                     = factory.newRelationship(NS, 'Owner', '11111');
    prodProc2.batch                     = factory.newRelationship(NS, 'Batch', '00001');
    prodProc2.begin                     = prodBegin2;
    prodProc2.end                       = prodEnd2;

    // ProductionProcessSensing
    var prodProcSens1                   = factory.newResource(NS, 'ProductionProcessSensing', '00000');
    prodProcSens1.process               = factory.newRelationship(NS, 'ProductionProcess', '00000');
    prodProcSens1.measureType           = 'TEMPERATURE';
    prodProcSens1.value                 = 17;
    prodProcSens1.sensorIdentifier      = '1426.dbyd.8926.djbc';
    prodProcSens1.processType           = 'DELEAFING';
    prodProcSens1.sensingTimestamp      = timestamp;
    var prodProcSens2                   = factory.newResource(NS, 'ProductionProcessSensing', '00001');
    prodProcSens2.process               = factory.newRelationship(NS, 'ProductionProcess', '00000');
    prodProcSens2.measureType           = 'HUMIDITY';
    prodProcSens2.value                 = 99;
    prodProcSens2.sensorIdentifier      = '1426.dbyd.8926.ejeh';
    prodProcSens2.processType           = 'WASHING';
    prodProcSens2.sensingTimestamp      = timestamp;
    var prodProcSens3                   = factory.newResource(NS, 'ProductionProcessSensing', '00002');
    prodProcSens3.process               = factory.newRelationship(NS, 'ProductionProcess', '00000');
    prodProcSens3.measureType           = 'TEMPERATURE';
    prodProcSens3.value                 = 45;
    prodProcSens3.sensorIdentifier      = '1426.dbyd.8926.djeu';
    prodProcSens3.processType           = 'CRUSHING';
    prodProcSens3.sensingTimestamp      = timestamp;
    var prodProcSens4                   = factory.newResource(NS, 'ProductionProcessSensing', '00003');
    prodProcSens4.process               = factory.newRelationship(NS, 'ProductionProcess', '00001');
    prodProcSens4.measureType           = 'TEMPERATURE';
    prodProcSens4.value                 = 22;
    prodProcSens4.sensorIdentifier      = '1426.dbyd.8926.djbc';
    prodProcSens4.processType           = 'DELEAFING';
    prodProcSens4.sensingTimestamp      = timestamp;
    var prodProcSens5                   = factory.newResource(NS, 'ProductionProcessSensing', '00004');
    prodProcSens5.process               = factory.newRelationship(NS, 'ProductionProcess', '00001');
    prodProcSens5.measureType           = 'HUMIDITY';
    prodProcSens5.value                 = 67;
    prodProcSens5.sensorIdentifier      = '1426.dbyd.8926.djeu';
    prodProcSens5.processType           = 'DECANTING';
    prodProcSens5.sensingTimestamp      = timestamp;

    // Basement
    var basement1                       = factory.newResource(NS, 'Basement', '00000');
    basement1.maker                     = factory.newRelationship(NS, 'Owner', '11111');
    basement1.latitude                  = '47.778506';
    basement1.longitude                 = '12.423145';
    var basement2                       = factory.newResource(NS, 'Basement', '00001');
    basement2.maker                     = factory.newRelationship(NS, 'Owner', '11111');
    basement2.latitude                  = '56.778607';
    basement2.longitude                 = '22.419540';

    // BasementSensing
    var basementSens1                   = factory.newResource(NS, 'BasementSensing', '00000');
    basementSens1.basement              = factory.newRelationship(NS, 'Basement', '00000');
    basementSens1.measureType           = 'TEMPERATURE';
    basementSens1.value                 = 12;
    basementSens1.sensorIdentifier      = '1426.dbyd.8926.bueh';
    basementSens1.sensingTimestamp      = timestamp;
    var basementSens2                   = factory.newResource(NS, 'BasementSensing', '00001');
    basementSens2.basement              = factory.newRelationship(NS, 'Basement', '00000');
    basementSens2.measureType           = 'HUMIDITY';
    basementSens2.value                 = 45;
    basementSens2.sensorIdentifier      = '1426.dbyd.8926.bueh';
    basementSens2.sensingTimestamp      = timestamp;
    var basementSens3                   = factory.newResource(NS, 'BasementSensing', '00002');
    basementSens3.basement              = factory.newRelationship(NS, 'Basement', '00000');
    basementSens3.measureType           = 'TEMPERATURE';
    basementSens3.value                 = 15;
    basementSens3.sensorIdentifier      = '1426.dbyd.8926.whsj';
    basementSens3.sensingTimestamp      = timestamp;
    var basementSens4                   = factory.newResource(NS, 'BasementSensing', '00003');
    basementSens4.basement              = factory.newRelationship(NS, 'Basement', '00001');
    basementSens4.measureType           = 'TEMPERATURE';
    basementSens4.value                 = 30;
    basementSens4.sensorIdentifier      = '1426.dbyd.8926.jdhb';
    basementSens4.sensingTimestamp      = timestamp;
    var basementSens5                   = factory.newResource(NS, 'BasementSensing', '00004');
    basementSens5.basement              = factory.newRelationship(NS, 'Basement', '00001');
    basementSens5.measureType           = 'HUMIDITY';
    basementSens5.value                 = 55;
    basementSens5.sensorIdentifier      = '1426.dbyd.8926.bueh';
    basementSens5.sensingTimestamp      = timestamp;

    // Product
    var product1                        = factory.newResource(NS, 'Product', '00000');
    product1.ownership                  = factory.newRelationship(NS, 'Owner', '11111');
    product1.basement                   = factory.newRelationship(NS, 'Basement', '00000');
    product1.creationDate               = creation1;
    product1.batch                      = factory.newRelationship(NS, 'Batch', '00000');
    var product2                        = factory.newResource(NS, 'Product', '00001');
    product2.ownership                  = factory.newRelationship(NS, 'Owner', '11111');
    product2.basement                   = factory.newRelationship(NS, 'Basement', '00000');
    product2.creationDate               = creation2;
    product2.batch                      = factory.newRelationship(NS, 'Batch', '00000');
    var product3                        = factory.newResource(NS, 'Product', '00002');
    product3.ownership                  = factory.newRelationship(NS, 'Owner', '11111');
    product3.basement                   = factory.newRelationship(NS, 'Basement', '00000');
    product3.creationDate               = creation3;
    product3.batch                      = factory.newRelationship(NS, 'Batch', '00003');
    var product4                        = factory.newResource(NS, 'Product', '00003');
    product4.ownership                  = factory.newRelationship(NS, 'Owner', '11111');
    product4.basement                   = factory.newRelationship(NS, 'Basement', '00000');
    product4.creationDate               = creation4;
    product4.batch                      = factory.newRelationship(NS, 'Batch', '00001');
    var product5                        = factory.newResource(NS, 'Product', '00004');
    product5.ownership                  = factory.newRelationship(NS, 'Owner', '11111');
    product5.basement                   = factory.newRelationship(NS, 'Basement', '00000');
    product5.creationDate               = creation4;
    product5.batch                      = factory.newRelationship(NS, 'Batch', '00001');

    // BatchShipment
    var shipBatchBegin1 = new Date('2018-10-01T00:00:00Z');
    var shipBatchEnd1 = new Date('2018-10-02T00:00:00Z');
    var batchShip1                      = factory.newResource(NS, 'BatchShipment', '00000');
    batchShip1.courier                  = factory.newRelationship(NS, 'Owner', '22222');
    batchShip1.begin                    = shipBatchBegin1;
    batchShip1.end                      = shipBatchEnd1;
    batchShip1.batches                  = [];
    batchShip1.batches.push(
        factory.newRelationship(NS, 'Batch', '00000')
    );
    batchShip1.batches.push(
        factory.newRelationship(NS, 'Batch', '00001')
    );
    var shipBatchBegin2 = new Date('2018-10-01T00:00:00Z');
    var shipBatchEnd2 = new Date('2018-10-02T00:00:00Z');
    var batchShip2                      = factory.newResource(NS, 'BatchShipment', '00001');
    batchShip2.courier                  = factory.newRelationship(NS, 'Owner', '22222');
    batchShip2.begin                    = shipBatchBegin2;
    batchShip2.end                      = shipBatchEnd2;
    batchShip2.batches                  = [];
    batchShip2.batches.push(
        factory.newRelationship(NS, 'Batch', '00002')
    );

    // Shop
    var shop1                           = factory.newResource(NS, 'Shop', '00000');
    shop1.seller                        = factory.newRelationship(NS, 'Owner', '33333');
    shop1.latitude                      = '45.778506';
    shop1.longitude                     = '56.376462';
    shop1.name                          = 'House of oil';
    var shop2                           = factory.newResource(NS, 'Shop', '00001');
    shop2.seller                        = factory.newRelationship(NS, 'Owner', '33333');
    shop2.latitude                      = '43.778506';
    shop2.longitude                     = '58.376462';
    shop2.name                          = 'Italian EVOO';

    // Order
    var orderDate1 = new Date('2018-11-01T00:00:00Z');
    var order1                          = factory.newResource(NS, 'Order', '00000');
    order1.shop                         = factory.newRelationship(NS, 'Shop', '00000');
    order1.quantity                     = 30;
    order1.date                         = orderDate1;
    var orderDate2 = new Date('2018-11-06T00:00:00Z');
    var order2                          = factory.newResource(NS, 'Order', '00001');
    order2.shop                         = factory.newRelationship(NS, 'Shop', '00001');
    order2.quantity                     = 25;
    order2.date                         = orderDate2;

    // BatchShipmentSensing
    var batchShipSens1                  = factory.newResource(NS, 'BatchShipmentSensing', '00000');
    batchShipSens1.shipment             = factory.newRelationship(NS, 'BatchShipment', '00000');
    batchShipSens1.measureType          = 'TEMPERATURE';
    batchShipSens1.value                = 17;
    batchShipSens1.sensorIdentifier     = '1426.dbyd.8926.djbc';
    batchShipSens1.sensingTimestamp     = timestamp;
    var batchShipSens2                  = factory.newResource(NS, 'BatchShipmentSensing', '00001');
    batchShipSens2.shipment             = factory.newRelationship(NS, 'BatchShipment', '00000');
    batchShipSens2.measureType          = 'HUMIDITY';
    batchShipSens2.value                = 99;
    batchShipSens2.sensorIdentifier     = '1426.dbyd.8926.ejeh';
    batchShipSens2.sensingTimestamp     = timestamp;
    var batchShipSens3                  = factory.newResource(NS, 'BatchShipmentSensing', '00002');
    batchShipSens3.shipment             = factory.newRelationship(NS, 'BatchShipment', '00000');
    batchShipSens3.measureType          = 'TEMPERATURE';
    batchShipSens3.value                = 45;
    batchShipSens3.sensorIdentifier     = '1426.dbyd.8926.djeu';
    batchShipSens3.sensingTimestamp     = timestamp;
    var batchShipSens4                  = factory.newResource(NS, 'BatchShipmentSensing', '00003');
    batchShipSens4.shipment             = factory.newRelationship(NS, 'BatchShipment', '00001');
    batchShipSens4.measureType          = 'TEMPERATURE';
    batchShipSens4.value                = 22;
    batchShipSens4.sensorIdentifier     = '1426.dbyd.8926.djbc';
    batchShipSens4.sensingTimestamp     = timestamp;
    var batchShipSens5                  = factory.newResource(NS, 'BatchShipmentSensing', '00004');
    batchShipSens5.shipment             = factory.newRelationship(NS, 'BatchShipment', '00001');
    batchShipSens5.measureType          = 'HUMIDITY';
    batchShipSens5.value                = 67;
    batchShipSens5.sensorIdentifier     = '1426.dbyd.8926.djeu';
    batchShipSens5.sensingTimestamp     = timestamp;

    // ProductShipment
    var shipProdBegin1 = new Date('2018-10-01T00:00:00Z');
    var shipProdEnd1 = new Date('2018-10-02T00:00:00Z');
    var prodShip1                       = factory.newResource(NS, 'ProductShipment', '00000');
    prodShip1.courier                   = factory.newRelationship(NS, 'Owner', '22222');
    prodShip1.begin                     = shipProdBegin1;
    prodShip1.end                       = shipProdEnd1;
    prodShip1.order                     = factory.newRelationship(NS, 'Order', '00000');
    prodShip1.products                  = [];
    prodShip1.products.push(
        factory.newRelationship(NS, 'Product', '00000')
    );
    prodShip1.products.push(
        factory.newRelationship(NS, 'Product', '00001')
    );
    var shipProdBegin2 = new Date('2018-10-02T00:00:00Z');
    var shipProdEnd2 = new Date('2018-10-03T00:00:00Z');
    var prodShip2                       = factory.newResource(NS, 'ProductShipment', '00001');
    prodShip2.courier                   = factory.newRelationship(NS, 'Owner', '22222');
    prodShip2.begin                     = shipProdBegin2;
    prodShip2.end                       = shipProdEnd2;
    prodShip2.order                     = factory.newRelationship(NS, 'Order', '00001');
    prodShip2.products                  = [];
    prodShip2.products.push(
        factory.newRelationship(NS, 'Product', '00002')
    );
    prodShip2.products.push(
        factory.newRelationship(NS, 'Product', '00003')
    );

    // ProductShipmentSensing
    var prodShipSens1                   = factory.newResource(NS, 'ProductShipmentSensing', '00000');
    prodShipSens1.shipment              = factory.newRelationship(NS, 'ProductShipment', '00000');
    prodShipSens1.measureType           = 'TEMPERATURE';
    prodShipSens1.value                 = 35;
    prodShipSens1.sensorIdentifier      = '1426.dbyd.8926.djfk';
    prodShipSens1.sensingTimestamp      = timestamp;
    var prodShipSens2                   = factory.newResource(NS, 'ProductShipmentSensing', '00001');
    prodShipSens2.shipment              = factory.newRelationship(NS, 'ProductShipment', '00000');
    prodShipSens2.measureType           = 'HUMIDITY';
    prodShipSens2.value                 = 90;
    prodShipSens2.sensorIdentifier      = '1426.dbyd.8926.ruri';
    prodShipSens2.sensingTimestamp      = timestamp;
    var prodShipSens3                   = factory.newResource(NS, 'ProductShipmentSensing', '00002');
    prodShipSens3.shipment              = factory.newRelationship(NS, 'ProductShipment', '00000');
    prodShipSens3.measureType           = 'TEMPERATURE';
    prodShipSens3.value                 = 4;
    prodShipSens3.sensorIdentifier      = '1426.dbyd.8926.djfk';
    prodShipSens3.sensingTimestamp      = timestamp;
    var prodShipSens4                   = factory.newResource(NS, 'ProductShipmentSensing', '00003');
    prodShipSens4.shipment              = factory.newRelationship(NS, 'ProductShipment', '00001');
    prodShipSens4.measureType           = 'TEMPERATURE';
    prodShipSens4.value                 = 2;
    prodShipSens4.sensorIdentifier      = '1426.dbyd.8926.djfk';
    prodShipSens4.sensingTimestamp      = timestamp;
    var prodShipSens5                   = factory.newResource(NS, 'ProductShipmentSensing', '00004');
    prodShipSens5.shipment              = factory.newRelationship(NS, 'ProductShipment', '00001');
    prodShipSens5.measureType           = 'HUMIDITY';
    prodShipSens5.value                 = 67;
    prodShipSens5.sensorIdentifier      = '1426.dbyd.8926.ruri';
    prodShipSens5.sensingTimestamp      = timestamp;


    return getAssetRegistry(NS + '.Plantation')
        .then(function (plantationRegistry) {
            // add Plantation
            return plantationRegistry.addAll([plantation1, plantation2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.FarmingProcess');
        })
        .then(function(farmingRegistry) {
            // add FarmingProcess
            return farmingRegistry.addAll([farming1, farming2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.FarmingProcessSensing');
        })
        .then(function(farmingSensRegistry) {
            // add FarmingProcessSensing
            return farmingSensRegistry.addAll([farmingSens1, farmingSens2, farmingSens3, farmingSens4, farmingSens5]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Batch');
        })
        .then(function(batchRegistry) {
            // add Batch
            return batchRegistry.addAll([batch1, batch2, batch3, batch4]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Shop');
        })
        .then(function(shopRegistry) {
            // add Shop
            return shopRegistry.addAll([shop1, shop2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Order');
        })
        .then(function(orderRegistry) {
            // add Order
            return orderRegistry.addAll([order1, order2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.ProductionProcess');
        })
        .then(function(prodRegistry) {
            // add ProductionProcess
            return prodRegistry.addAll([prodProc1, prodProc2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.ProductionProcessSensing');
        })
        .then(function(prodSensRegistry) {
            // add ProductionProcessSensing
            return prodSensRegistry.addAll([prodProcSens1, prodProcSens2, prodProcSens3, prodProcSens4, prodProcSens5]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Basement');
        })
        .then(function(basementRegistry) {
            // add Basement
            return basementRegistry.addAll([basement1, basement2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.BasementSensing');
        })
        .then(function(basementSensRegistry) {
            // add BasementSensing
            return basementSensRegistry.addAll([basementSens1, basementSens2, basementSens3, basementSens4, basementSens5]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Product');
        })
        .then(function(productRegistry) {
            // add Product
            return productRegistry.addAll([product1, product2, product3, product4, product5]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.BatchShipment');
        })
        .then(function(batchShipRegistry) {
            // add BatchShipment
            return batchShipRegistry.addAll([batchShip1, batchShip2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.BatchShipmentSensing');
        })
        .then(function(batchShipSensRegistry) {
            // add BatchShipmentSensing
            return batchShipSensRegistry.addAll([batchShipSens1, batchShipSens2, batchShipSens3, batchShipSens4, batchShipSens5]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.ProductShipment');
        })
        .then(function(prodShipRegistry) {
            // add ProductShipment
            return prodShipRegistry.addAll([prodShip1, prodShip2]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.ProductShipmentSensing');
        })
        .then(function(prodShipSensRegistry) {
            // add ProductShipmentSensing
            return prodShipSensRegistry.addAll([prodShipSens1, prodShipSens2, prodShipSens3, prodShipSens4, prodShipSens5]);
        });
}