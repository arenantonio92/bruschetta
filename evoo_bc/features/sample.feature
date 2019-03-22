#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

Feature: Sample

    Background:
        Given I have deployed the business network definition ..
        And I have added the following participants of type org.bn.evoo.Owner
            | ownerId       | firstName     | lastName      | telephone     | address       | email             | ownerType     |      
            | farmerPart    | name1         | surname1      | 556677        | xyz           | farmer@evoo.bc    | FARMER        |
            | makerPart     | name2         | surname2      | 556677        | xyz           | maker@evoo.bc     | MAKER         |
            | courierPart   | name3         | surname3      | 556677        | xyz           | courier@evoo.bc   | COURIER       |
            | sellerPart    | name4         | surname4      | 556677        | xyz           | seller@evoo.bc    | SELLER        |
        And I have added the following assets of type org.bn.evoo.Plantation
            | plantationId  | farmer        | latitude      | longitude     |
            | 1             | farmerPart    | x             | y             |
        And I have added the following assets of type org.bn.evoo.FarmingProcess
            | farmingProcId | plantation    | year          | harvBegin                 | harvEnd                   | harvMethod        |
            | 1             | 1             | 2018          | 2018-01-01T00:00:00.000Z  | 2018-01-03T00:00:00.000Z  | MACHINE           |
        And I have added the following assets of type org.bn.evoo.FarmingProcessSensing
            | sensingId     | farming       | measureType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.Basement
            | basementId    | maker         | latitude      | longitude     |
            | 1             | makerPart     | x             | y             |
        And I have added the following assets of type org.bn.evoo.BasementSensing
            | sensingId     | basement      | measureType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.Batch
            | batchId       | farming       | ownership     | creationDate              | weight        |
            | 1             | 1             | farmerPart    | 2018-02-01T00:00:00.000Z  | 1000          |
            | 2             | 1             | makerPart     | 2018-02-01T00:00:01.000Z  | 1000          |
            | 3             | 1             | courierPart   | 2018-02-01T00:00:02.000Z  | 1000          |
        And I have added the following assets of type org.bn.evoo.ProductionProcess
            | productionProcessId           | maker         | batch         | begin                     | end                       |
            | 1                             | makerPart     | 2             | 2018-05-01T00:00:00.000Z  | 2018-05-01T03:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.ProductionProcessSensing
            | sensingId     | process       | measureType   | processType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | DELEAFING     | 30            | AAAA-0000         | 2018-05-01T02:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.Product
            | productId     | batch         | ownership     | basement      | creationDate              |
            | 1             | 2             | makerPart     | 1             | 2018-05-01T04:00:00.000Z  |
            | 2             | 2             | courierPart   | 1             | 2018-05-01T04:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.Shop
            | shopId        | latitude      | longitude     | name          | seller        |
            | 1             | x             | y             | shop1         | sellerPart    |
        And I have added the following assets of type org.bn.evoo.Order
            | orderId       | quantity      | date                      | shop          |
            | 1             | 5             | 2018-05-01T04:00:00.000Z  | 1             |
        And I have added the following assets of type org.bn.evoo.BatchShipment
            """
            {"$class":"org.bn.evoo.BatchShipment", "shipmentId":"1", "courier":"courierPart", "batches":["3"], "begin":"2018-01-01T00:00:00.000Z", "end":"2018-01-01T04:00:00.000Z"}    
            """
        And I have added the following assets of type org.bn.evoo.BatchShipmentSensing
            | sensingId     | shipment      | measureType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-01T03:00:00.000Z  |
        And I have added the following assets of type org.bn.evoo.ProductShipment
            """
            {"$class":"org.bn.evoo.ProductShipment", "shipmentId":"1", "courier":"courierPart", "products":["2"], "order":"1", "begin":"2018-01-01T00:00:00.000Z", "end":"2018-01-01T04:00:00.000Z"}    
            """
        And I have added the following assets of type org.bn.evoo.ProductShipmentSensing
            | sensingId     | shipment      | measureType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
        And I have issued the participant org.bn.evoo.Owner#farmerPart with the identity farmerIdentity
        And I have issued the participant org.bn.evoo.Owner#makerPart with the identity makerIdentity
        And I have issued the participant org.bn.evoo.Owner#courierPart with the identity courierIdentity
        And I have issued the participant org.bn.evoo.Owner#sellerPart with the identity sellerIdentity
        
    Scenario: A participant with an issued identity can read all the assets
        When I use the identity farmerIdentity
        Then I should have the following assets of type org.bn.evoo.Batch
            | batchId       | farming       | ownership     | creationDate              | weight        |
            | 1             | 1             | farmerPart    | 2018-02-01T00:00:00.000Z  | 1000          |
            | 2             | 1             | makerPart     | 2018-02-01T00:00:01.000Z  | 1000          |
            | 3             | 1             | courierPart   | 2018-02-01T00:00:02.000Z  | 1000          |
    
    Scenario: A participant of type FARMER can create a new Plantation asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newPlantation
            | plantationId  | latitude      | longitude |
            | 2             | x             | y         |
        Then I should have the following assets of type org.bn.evoo.Plantation
            | plantationId  | farmer        | latitude      | longitude     |
            | 1             | farmerPart    | x             | y             |
            | 2             | farmerPart    | x             | y             |
    
    Scenario: A participant of type SELLER can create a new Shop asset invoking the transaction
        When I use the identity sellerIdentity
        And I submit the following transaction of type org.bn.evoo.newShop
            | shopId        | latitude      | longitude     | name          |      
            | 2             | x             | y             | shop2         |
        Then I should have the following assets of type org.bn.evoo.Shop
            | shopId        | latitude      | longitude     | name          | seller        |
            | 1             | x             | y             | shop1         | sellerPart    |
            | 2             | x             | y             | shop2         | sellerPart    |
    
    Scenario: A participant of type SELLER can create a new Order asset invoking the transaction
        When I use the identity sellerIdentity
        And I submit the following transaction of type org.bn.evoo.newOrder
            | orderId       | quantity      | shop          |    
            | 2             | 5             | 1             |
        Then I should have the following assets of type org.bn.evoo.Order
            | orderId       | quantity      | date                      | shop          |
            | 1             | 5             | 2018-05-01T04:00:00.000Z  | 1             |
            | 2             | 5             | 1900-01-01T00:00:00.000Z  | 1             |
    
    Scenario: A participant of type FARMER can create a new FarmingProcess asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newFarmingProcess
            | farmingProcId | plantation    | year          |    
            | 2             | 1             | 2018          |
        Then I should have the following assets of type org.bn.evoo.FarmingProcess
            | farmingProcId | plantation    | year          | harvBegin                 | harvEnd                   | harvMethod        |
            | 1             | 1             | 2018          | 2018-01-01T00:00:00.000Z  | 2018-01-03T00:00:00.000Z  | MACHINE           |
            | 2             | 1             | 2018          | 1900-01-01T00:00:00.000Z  | 1900-01-01T00:00:00.000Z  | UNDEFINED         |
    
    Scenario: A participant of type FARMER can create a new Batch asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newBatch
            | batchId       | farming       | creationDate              | weight        |    
            | 4             | 1             | 2018-02-01T00:00:00.000Z  | 1000          |
        Then I should have the following assets of type org.bn.evoo.Batch
            | batchId       | farming       | ownership     | creationDate              | weight        |
            | 1             | 1             | farmerPart    | 2018-02-01T00:00:00.000Z  | 1000          |
            | 2             | 1             | makerPart     | 2018-02-01T00:00:01.000Z  | 1000          |
            | 3             | 1             | courierPart   | 2018-02-01T00:00:02.000Z  | 1000          |
            | 4             | 1             | farmerPart    | 2018-02-01T00:00:00.000Z  | 1000          |   
    
    Scenario: A participant of type MAKER can create a new ProductionProcess asset invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newProductionProcess
            | productionProcessId   | batch         | begin                     |    
            | 2                     | 2             | 2018-05-01T00:00:00.000Z  |
        Then I should have the following assets of type org.bn.evoo.ProductionProcess
            | productionProcessId           | maker         | batch         | begin                     | end                       |
            | 1                             | makerPart     | 2             | 2018-05-01T00:00:00.000Z  | 2018-05-01T03:00:00.000Z  |
            | 2                             | makerPart     | 2             | 2018-05-01T00:00:00.000Z  | 1900-01-01T00:00:00.000Z  |
    
    Scenario: A participant of type COURIER can create a new BatchShipment asset invoking the transaction
        When I use the identity courierIdentity
        And I submit the following transaction of type org.bn.evoo.newBatchShipment
            """
            {"$class":"org.bn.evoo.newBatchShipment", "shipmentId":"2", "batches":["3"], "begin":"2018-01-01T00:00:00.000Z"}
            """
        Then I should have the following assets of type org.bn.evoo.BatchShipment
            """
            [
            {"$class":"org.bn.evoo.BatchShipment", "shipmentId":"1", "courier":"courierPart", "batches":["3"], "begin":"2018-01-01T00:00:00.000Z", "end":"2018-01-01T04:00:00.000Z"},  
            {"$class":"org.bn.evoo.BatchShipment", "shipmentId":"2", "courier":"courierPart", "batches":["3"], "begin":"2018-01-01T00:00:00.000Z", "end":"1900-01-01T00:00:00.000Z"}   
            ]
            """
    
    Scenario: A participant of type COURIER can create a new ProductShipment asset invoking the transaction
        When I use the identity courierIdentity
        And I submit the following transaction of type org.bn.evoo.newProductShipment
            """
            {"$class":"org.bn.evoo.newProductShipment", "shipmentId":"2", "products":["2"], "order":"1", "begin":"2018-01-01T00:00:00.000Z"}
            """
        Then I should have the following assets of type org.bn.evoo.ProductShipment
            """
            [
            {"$class":"org.bn.evoo.ProductShipment", "shipmentId":"1", "courier":"courierPart", "products":["2"], "order":"1", "begin":"2018-01-01T00:00:00.000Z", "end":"2018-01-01T04:00:00.000Z"},  
            {"$class":"org.bn.evoo.ProductShipment", "shipmentId":"2", "courier":"courierPart", "products":["2"], "order":"1", "begin":"2018-01-01T00:00:00.000Z", "end":"1900-01-01T00:00:00.000Z"}
            ]
            """
    
    Scenario: A participant of type MAKER can create a new Basement asset invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newBasement
            | basementId    | latitude      | longitude     |    
            | 2             | x             | y             |
        Then I should have the following assets of type org.bn.evoo.Basement
            | basementId    | maker         | latitude      | longitude     |
            | 1             | makerPart     | x             | y             |
            | 2             | makerPart     | x             | y             |
    
    Scenario: A participant of type MAKER can create a new Product asset invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newProduct
            | productId     | batch         | basement      | creationDate              |
            | 3             | 2             | 1             | 2018-05-01T04:00:00.000Z  |
        Then I should have the following assets of type org.bn.evoo.Product
            | productId     | batch         | ownership     | basement      | creationDate              |
            | 1             | 2             | makerPart     | 1             | 2018-05-01T04:00:00.000Z  |
            | 2             | 2             | courierPart   | 1             | 2018-05-01T04:00:00.000Z  |
            | 3             | 2             | makerPart     | 1             | 2018-05-01T04:00:00.000Z  |
    
    Scenario: A participant of type FARMER can create a new FarmingProcessSensing asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newFarmingProcessSensing
            | sensingId     | farming       | measureType   | value         | sensorIdentifier  | sensingTimestamp      |    
            | 2             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
        Then I should have the following assets of type org.bn.evoo.FarmingProcessSensing
            | sensingId     | farming       | measureType   | value         | sensorIdentifier  | sensingTimestamp          |
            | 1             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
            | 2             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |   
    
    Scenario: A participant of type !FARMER cannot create a new Plantation asset invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newPlantation
            | plantationId  | latitude      | longitude |
            | 2             | x             | y         |
        Then I should get an error matching /Current participant is not a farmer./
    
    Scenario: A participant of type !SELLER cannot create a new Shop asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newShop
            | shopId        | latitude      | longitude     | name          |      
            | 2             | x             | y             | shop2         |
        Then I should get an error matching /Current participant is not a seller./
    
    Scenario: A participant of type !SELLER cannot create a new Order asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newOrder
            | orderId       | quantity      | shop          |    
            | 2             | 5             | 1             |
        Then I should get an error matching /Current participant is not a seller./
    
    Scenario: A participant of type !FARMER cannot create a new FarmingProcess asset invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newFarmingProcess
            | farmingProcId | plantation    | year          |    
            | 2             | 1             | 2018          |
        Then I should get an error matching /Current participant is not a farmer./
    
    Scenario: A participant cannot create a new Batch asset invoking the transaction if it is not the owner of the corresponding plantation
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newBatch
            | batchId       | farming       | creationDate              | weight        |    
            | 4             | 1             | 2018-02-01T00:00:00.000Z  | 1000          |
        Then I should get an error matching /Current farmer is not the plantation owner./
    
    Scenario: A participant of type !MAKER cannot create a new ProductionProcess asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newProductionProcess
            | productionProcessId   | batch         | begin                     |    
            | 2                     | 2             | 2018-05-01T00:00:00.000Z  |
        Then I should get an error matching /Current participant is not a maker./
    
    Scenario: A participant of type !COURIER cannot create a new BatchShipment asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newBatchShipment
            """
            {"$class":"org.bn.evoo.newBatchShipment", "shipmentId":"2", "batches":["3"], "begin":"2018-01-01T00:00:00.000Z"}
            """
        Then I should get an error matching /Current participant is not a courier./
    
    Scenario: A participant of type !COURIER cannot create a new ProductShipment asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newProductShipment
            """
            {"$class":"org.bn.evoo.newProductShipment", "shipmentId":"2", "products":["2"], "order":"1", "begin":"2018-01-01T00:00:00.000Z"}
            """
        Then I should get an error matching /Current participant is not a courier./
    
    Scenario: A participant of type !MAKER cannot create a new Basement asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newBasement
            | basementId    | latitude      | longitude     |    
            | 2             | x             | y             |
        Then I should get an error matching /Current participant is not a maker./
    
    Scenario: A participant of type !MAKER cannot create a new Product asset invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.newProduct
            | productId     | batch         | basement      | creationDate              |
            | 3             | 2             | 1             | 2018-05-01T04:00:00.000Z  |
        Then I should get an error matching /Current participant is not a maker./
    
    Scenario: A participant cannot create a new FarmingProcessSensing asset if it is not the owner of the corresponding plantation
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.newFarmingProcessSensing
            | sensingId     | farming       | measureType   | value         | sensorIdentifier  | sensingTimestamp      |    
            | 2             | 1             | TEMPERATURE   | 30            | AAAA-0000         | 2018-01-02T00:00:00.000Z  |
        Then I should get an error matching /Operation not permitted./
    
    Scenario: A participant that owns the Batch can change its ownership invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.changeBatchOwnership
            | newOwner      | batch         |   
            | makerPart     | 1             |
        Then I should have the following assets of type org.bn.evoo.Batch
            | batchId       | farming       | ownership     | creationDate              | weight        |
            | 1             | 1             | makerPart     | 2018-02-01T00:00:00.000Z  | 1000          |
            | 2             | 1             | makerPart     | 2018-02-01T00:00:01.000Z  | 1000          |
            | 3             | 1             | courierPart   | 2018-02-01T00:00:02.000Z  | 1000          |
    
    Scenario: A participant that does not own the Batch cannot change its ownership invoking the transaction
        When I use the identity farmerIdentity
        And I submit the following transaction of type org.bn.evoo.changeBatchOwnership
            | newOwner      | batch         |   
            | makerPart     | 3             |
        Then I should get an error matching /Operation not permitted: you are not the owner./
    
    Scenario: A participant that owns the Product can change its ownership invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.changeProductOwnership
            | newOwner      | product       |   
            | courierPart   | 1             |
        Then I should have the following assets of type org.bn.evoo.Product
            | productId     | batch         | ownership     | basement      | creationDate              |
            | 1             | 2             | courierPart   | 1             | 2018-05-01T04:00:00.000Z  |
            | 2             | 2             | courierPart   | 1             | 2018-05-01T04:00:00.000Z  |
    
    Scenario: A participant that does not own the Product cannot change its ownership invoking the transaction
        When I use the identity makerIdentity
        And I submit the following transaction of type org.bn.evoo.changeProductOwnership
            | newOwner      | product       |   
            | makerPart     | 2             |
        Then I should get an error matching /Operation not permitted: you are not the owner./
    
    Scenario: A participant cannot create a new participant by itself
        When I use the identity farmerIdentity
        And I add the following participant of type org.bn.evoo.Owner
            | ownerId       | firstName     | lastName      | telephone     | address       | email             | ownerType     |      
            | farmerPart    | name1         | surname1      | 556677        | xyz           | farmer@evoo.bc    | FARMER        |
        Then I should get an error matching /does not have .* access to resource/
    
    Scenario: A participant can modify assets on its ownership
        When I use the identity farmerIdentity
        And I update the following asset of type org.bn.evoo.Plantation
            | plantationId  | farmer        | latitude      | longitude     |
            | 1             | farmerPart    | x2            | y2            |
        Then I should have the following assets of type org.bn.evoo.Plantation
            | plantationId  | farmer        | latitude      | longitude     |
            | 1             | farmerPart    | x2            | y2            |

    Scenario: A participant cannot modify assets that are not on its ownership
        When I use the identity makerIdentity
        And I update the following asset of type org.bn.evoo.Plantation
            | plantationId  | farmer        | latitude      | longitude     |
            | 1             | farmerPart    | x2            | y2            |
        Then I should get an error matching /does not have .* access to resource/