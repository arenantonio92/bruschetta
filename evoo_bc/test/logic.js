/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write the unit tests for your transction processor functions here
 */

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const namespace = 'org.bn.evoo';
const participantType = 'Owner';
const participantNS = namespace + '.' + participantType;

describe('#' + namespace, () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    // Name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // Admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for Owners.
    const farmerCardName = 'farmerIdentity';
    const makerCardName = 'makerIdentity';
    const courierCardName = 'courierIdentity';
    const sellerCardName = 'sellerIdentity';

    // These are a list of receieved events.
    let events;

    let businessNetworkName;

    before(async () => {
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // Identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);
        const deployerCardName = 'PeerAdmin';

        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     */
    async function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        await adminConnection.importCard(cardName, card);
    }

    // This is called before each test is executed.
    beforeEach(async () => {
        // Generate a business network definition from the project directory.
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
        businessNetworkName = businessNetworkDefinition.getName();
        await adminConnection.install(businessNetworkDefinition);
        const startOptions = {
            networkAdmins: [
                {
                    userName: 'admin',
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkName, businessNetworkDefinition.getVersion(), startOptions);
        await adminConnection.importCard(adminCardName, adminCards.get('admin'));

        // Create and establish a business network connection
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);

        // Get the factory for the business network.
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        const participantRegistry = await businessNetworkConnection.getParticipantRegistry(participantNS);

        /**-------------------------------------------------- Create the participants --------------------------------------------------**/

        const farmer = factory.newResource(namespace, participantType, 'farmerPart');
        farmer.firstName = 'name1';
        farmer.lastName = 'surname1';
        farmer.telephone = '556677';
        farmer.address = 'xyz';
        farmer.email = 'farmer@evoo.bc';
        farmer.ownerType = 'FARMER';

        const maker = factory.newResource(namespace, participantType, 'makerPart');
        maker.firstName = 'name2';
        maker.lastName = 'surname2';
        maker.telephone = '556677';
        maker.address = 'xyz';
        maker.email = 'maker@evoo.bc';
        maker.ownerType = 'MAKER';

        const courier = factory.newResource(namespace, participantType, 'courierPart');
        courier.firstName = 'name3';
        courier.lastName = 'surname3';
        courier.telephone = '556677';
        courier.address = 'xyz';
        courier.email = 'courier@evoo.bc';
        courier.ownerType = 'COURIER';

        const seller = factory.newResource(namespace, participantType, 'sellerPart');
        seller.firstName = 'name4';
        seller.lastName = 'surname4';
        seller.telephone = '556677';
        seller.address = 'xyz';
        seller.email = 'seller@evoo.bc';
        seller.ownerType = 'SELLER';

        participantRegistry.addAll([farmer, maker, courier, seller]);

        /**-------------------------------------------------- Create the assets --------------------------------------------------**/
        var assetType = '';
        var assetRegistry = '';
        var asset1 = '';
        var asset2 = '';
        var asset3 = '';

        assetType = 'Plantation';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.farmer = factory.newRelationship(namespace, participantType, 'farmerPart');
        asset1.latitude = 'x';
        asset1.longitude = 'y';
        assetRegistry.addAll([asset1]);

        assetType = 'FarmingProcess';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.plantation = factory.newRelationship(namespace, 'Plantation', '1');
        asset1.year = 2018;
        asset1.harvBegin = new Date('2018-01-01T00:00:00.00Z');
        asset1.harvEnd = new Date('2018-01-03T00:00:00.000Z');
        asset1.harvMethod = 'MACHINE';
        assetRegistry.addAll([asset1]);

        assetType = 'FarmingProcessSensing';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        asset1.measureType = 'TEMPERATURE';
        asset1.value = 30;
        asset1.sensorIdentifier = 'AAAA-0000';
        asset1.sensingTimestamp = new Date('2018-01-02T00:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'Basement';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.maker = factory.newRelationship(namespace, participantType, '1');
        asset1.latitude = 'x';
        asset1.longitude = 'y';
        assetRegistry.addAll([asset1]);

        assetType = 'BasementSensing';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.basement = factory.newRelationship(namespace, 'Basement', '1');
        asset1.measureType = 'TEMPERATURE';
        asset1.value = 30;
        asset1.sensorIdentifier = 'AAAA-0000';
        asset1.sensingTimestamp = new Date('2018-01-02T00:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'Batch';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        asset1.ownership = factory.newRelationship(namespace, participantType, 'farmerPart');
        asset1.creationDate = new Date('2018-02-01T00:00:00.000Z');
        asset1.weight = 1000;
        asset2 = factory.newResource(namespace, assetType, '2');
        asset2.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        asset2.ownership = factory.newRelationship(namespace, participantType, 'makerPart');
        asset2.creationDate = new Date('2018-02-01T00:00:00.000Z');
        asset2.weight = 1000;
        asset3 = factory.newResource(namespace, assetType, '3');
        asset3.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        asset3.ownership = factory.newRelationship(namespace, participantType, 'courierPart');
        asset3.creationDate = new Date('2018-02-01T00:00:00.000Z');
        asset3.weight = 1000;
        assetRegistry.addAll([asset1, asset2, asset3]);

        assetType = 'ProductionProcess';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.maker = factory.newRelationship(namespace, participantType, 'makerPart');
        asset1.batch = factory.newRelationship(namespace, 'Batch', '2');
        asset1.begin = new Date('2018-05-01T00:00:00.000Z');
        asset1.end =new Date('2018-05-01T03:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'ProductionProcessSensing';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.process = factory.newRelationship(namespace, 'ProductionProcess', '1');
        asset1.measureType = 'TEMPERATURE';
        asset1.processType = 'DELEAFING';
        asset1.value = 30;
        asset1.sensorIdentifier = 'AAAA-0000';
        asset1.sensingTimestamp = new Date('2018-05-01T02:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'Product';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.batch = factory.newRelationship(namespace, 'Batch', '2');
        asset1.ownership = factory.newRelationship(namespace, participantType, 'makerPart');
        asset1.basement = factory.newRelationship(namespace, 'Basement', '1');
        asset1.creationDate = new Date('2018-05-01T04:00:00.000Z');
        asset2 = factory.newResource(namespace, assetType, '2');
        asset2.batch = factory.newRelationship(namespace, 'Batch', '2');
        asset2.ownership = factory.newRelationship(namespace, participantType, 'courierPart');
        asset2.basement = factory.newRelationship(namespace, 'Basement', '1');
        asset2.creationDate = new Date('2018-05-01T04:00:00.000Z');
        assetRegistry.addAll([asset1, asset2]);

        assetType = 'Shop';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.seller = factory.newRelationship(namespace, participantType, 'sellerPart');
        asset1.latitude = 'x';
        asset1.longitude = 'y';
        asset1.name = 'shop1';
        assetRegistry.addAll([asset1]);

        assetType = 'Order';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.shop = factory.newRelationship(namespace, 'Shop', '1');
        asset1.quantity = 5;
        asset1.date = new Date('2018-05-01T04:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'BatchShipment';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.courier = factory.newRelationship(namespace, participantType, 'courierPart');
        asset1.batches = [];
        asset1.batches.push(
            factory.newRelationship(namespace, 'Batch', '3')
        );
        asset1.begin = new Date('2018-01-01T00:00:00.000Z');
        asset1.end = new Date('2018-01-01T04:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'BatchShipmentSensing';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.shipment = factory.newRelationship(namespace, 'BatchShipment', '1');
        asset1.measureType = 'TEMPERATURE';
        asset1.value = 30;
        asset1.sensorIdentifier = 'AAAA-0000';
        asset1.sensingTimestamp = new Date('2018-01-01T03:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'ProductShipment';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.courier = factory.newRelationship(namespace, participantType, 'courierPart');
        asset1.order = factory.newRelationship(namespace, 'Order', '1');
        var productsRef = [];
        productsRef.push(
            factory.newRelationship(namespace, 'Product', '2')
        );
        asset1.products = productsRef;
        asset1.begin = new Date('2018-01-01T00:00:00.000Z');
        asset1.end = new Date('2018-01-01T04:00:00.000Z');
        assetRegistry.addAll([asset1]);

        assetType = 'ProductShipmentSensing';
        assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.' + assetType);
        asset1 = factory.newResource(namespace, assetType, '1');
        asset1.shipment = factory.newRelationship(namespace, 'ProductShipment', '1');
        asset1.measureType = 'TEMPERATURE';
        asset1.value = 30;
        asset1.sensorIdentifier = 'AAAA-0000';
        asset1.sensingTimestamp = new Date('2018-01-02T00:00:00.000Z');
        assetRegistry.addAll([asset1]);

        /**-------------------------------------------------- Issue the identities --------------------------------------------------**/

        let identity = await businessNetworkConnection.issueIdentity(participantNS + '#farmerPart', 'farmerIdentity');
        await importCardForIdentity(farmerCardName, identity);
        identity = await businessNetworkConnection.issueIdentity(participantNS + '#makerPart', 'makerIdentity');
        await importCardForIdentity(makerCardName, identity);
        identity = await businessNetworkConnection.issueIdentity(participantNS + '#courierPart', 'courierIdentity');
        await importCardForIdentity(courierCardName, identity);
        identity = await businessNetworkConnection.issueIdentity(participantNS + '#sellerPart', 'sellerIdentity');
        await importCardForIdentity(sellerCardName, identity);
    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The name of the card for the identity to use
     */
    async function useIdentity(cardName) {
        await businessNetworkConnection.disconnect();
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', (event) => {
            events.push(event);
        });
        await businessNetworkConnection.connect(cardName);
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    }

    //Testing READ permissions
    it('A participant with an issued identity can read all the assets', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Batch');
        const assets = await assetRegistry.getAll();

        // Validate the assets.
        assets.should.have.lengthOf(3);
    });

    //Testing CREATE permissions over participants
    it('A participant cannot create a new participant by itself', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        const newParticipant = factory.newResource(namespace, participantType, 'newParticipant');
        newParticipant.firstName = 'name5';
        newParticipant.lastName = 'surname5';
        newParticipant.telephone = '556677';
        newParticipant.address = 'xyz';
        newParticipant.email = 'newParticipant@evoo.bc';
        newParticipant.ownerType = 'FARMER';

        const participantRegistry = await businessNetworkConnection.getParticipantRegistry(participantNS);
        participantRegistry.add(newParticipant).should.be.rejectedWith(/does not have .* access to resource/);
    });

    //Testing UPDATE permissions
    it('A participant can modify assets on its ownership', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Update the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Plantation');
        let asset1 = await assetRegistry.get('1');
        asset1.latitude = 'x2';
        asset1.longitude = 'y2';
        await assetRegistry.update(asset1);

        // Validate the asset.
        asset1 = await assetRegistry.get('1');
        asset1.farmer.getFullyQualifiedIdentifier().should.equal(participantNS + '#farmerPart');
        asset1.latitude.should.equal('x2');
        asset1.longitude.should.equal('y2');
    });

    //Testing UPDATE permissions
    it('A participant cannot modify assets that are not on its ownership', async () => {
        // Use the identity for farmer.
        await useIdentity(makerCardName);

        // Update the asset, then get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Plantation');
        let asset1 = await assetRegistry.get('1');
        asset1.latitude = 'x2';
        asset1.longitude = 'y2';
        await assetRegistry.update(asset1).should.be.rejectedWith(/does not have .* access to resource/);
    });

    //Testing transaction org.bn.evoo.newPlantation (SUCCESS)
    it('A participant of type FARMER can create a new Plantation asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newPlantation');
        transaction.plantationId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Plantation');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.farmer.getFullyQualifiedIdentifier().should.equal(participantNS + '#farmerPart');
        asset1.latitude.should.equal('x');
        asset1.longitude.should.equal('y');
    });

    //Testing transaction org.bn.evoo.newPlantation (FAILURE)
    it('A participant of type !FARMER cannot create a new Plantation asset invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newPlantation');
        transaction.plantationId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a farmer./);
    });

    //Testing transaction org.bn.evoo.newShop (SUCCESS)
    it('A participant of type SELLER can create a new Shop asset invoking the transaction', async () => {
        // Use the identity for seller.
        await useIdentity(sellerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newShop');
        transaction.shopId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        transaction.name = 'shop2';
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Shop');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.seller.getFullyQualifiedIdentifier().should.equal(participantNS + '#sellerPart');
        asset1.latitude.should.equal('x');
        asset1.longitude.should.equal('y');
        asset1.name.should.equal('shop2');
    });

    //Testing transaction org.bn.evoo.newShop (FAILURE)
    it('A participant of type !SELLER cannot create a new Shop asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newShop');
        transaction.shopId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        transaction.name = 'shop2';
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a seller./);
    });

    //Testing transaction org.bn.evoo.newOrder (SUCCESS)
    it('A participant of type SELLER can create a new Order asset invoking the transaction', async () => {
        // Use the identity for seller.
        await useIdentity(sellerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newOrder');
        transaction.orderId = '2';
        transaction.quantity = 5;
        transaction.shop = factory.newRelationship(namespace, 'Shop', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Order');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.shop.getFullyQualifiedIdentifier().should.equal(namespace + '.Shop#1');
        asset1.quantity.should.equal(5);
    });

    //Testing transaction org.bn.evoo.newOrder (FAILURE)
    it('A participant of type !SELLER cannot create a new Order asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newOrder');
        transaction.orderId = '2';
        transaction.quantity = 5;
        transaction.shop = factory.newRelationship(namespace, 'Shop', '1');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a seller./);
    });

    //Testing transaction org.bn.evoo.newFarmingProcess (SUCCESS)
    it('A participant of type FARMER can create a new FarmingProcess asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newFarmingProcess');
        transaction.farmingProcId = '2';
        transaction.year = 2018;
        transaction.plantation = factory.newRelationship(namespace, 'Plantation', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.FarmingProcess');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.plantation.getFullyQualifiedIdentifier().should.equal(namespace + '.Plantation#1');
        asset1.year.should.equal(2018);
        asset1.harvBegin.toDateString.should.equal(new Date('1900-01-01T00:00:00.000Z').toDateString);
        asset1.harvEnd.toDateString.should.equal(new Date('1900-01-01T00:00:00.000Z').toDateString);
        asset1.harvMethod.should.equal('UNDEFINED');
    });

    //Testing transaction org.bn.evoo.newFarmingProcess (FAILURE)
    it('A participant of type !FARMER cannot create a new FarmingProcess asset invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newFarmingProcess');
        transaction.farmingProcId = '2';
        transaction.year = 2018;
        transaction.plantation = factory.newRelationship(namespace, 'Plantation', '1');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a farmer./);
    });

    //Testing transaction org.bn.evoo.newBatch (SUCCESS)
    it('A participant of type FARMER can create a new Batch asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBatch');
        transaction.batchId = '4';
        transaction.creationDate = new Date('2018-02-01T00:00:00.000Z');
        transaction.weight = 1000;
        transaction.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Batch');
        const asset1 = await assetRegistry.get('4');

        // Validate the asset.
        asset1.farming.getFullyQualifiedIdentifier().should.equal(namespace + '.FarmingProcess#1');
        asset1.ownership.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#farmerPart');
        asset1.creationDate.toDateString.should.equal(new Date('2018-02-01T00:00:00.000Z').toDateString);
        asset1.weight.should.equal(1000);
    });

    //Testing transaction org.bn.evoo.newBatch (FAILURE)
    it('A participant cannot create a new Batch asset invoking the transaction if it is not the owner of the corresponding plantation', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBatch');
        transaction.batchId = '4';
        transaction.creationDate = new Date('2018-02-01T00:00:00.000Z');
        transaction.weight = 1000;
        transaction.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current farmer is not the plantation owner./);
    });

    //Testing transaction org.bn.evoo.newProductionProcess (SUCCESS)
    it('A participant of type MAKER can create a new ProductionProcess asset invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProductionProcess');
        transaction.productionProcessId = '2';
        transaction.begin = new Date('2018-05-01T00:00:00.000Z');
        transaction.batch = factory.newRelationship(namespace, 'Batch', '2');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.ProductionProcess');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.maker.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#makerPart');
        asset1.batch.getFullyQualifiedIdentifier().should.equal(namespace + '.Batch#2');
        asset1.begin.toDateString.should.equal(new Date('2018-05-01T00:00:00.000Z').toDateString);
        asset1.end.toDateString.should.equal(new Date('1900-01-01T00:00:00.000Z').toDateString);
    });

    //Testing transaction org.bn.evoo.newProductionProcess (FAILURE)
    it('A participant of type !MAKER cannot create a new ProductionProcess asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProductionProcess');
        transaction.productionProcessId = '2';
        transaction.begin = new Date('2018-05-01T00:00:00.000Z');
        transaction.batch = factory.newRelationship(namespace, 'Batch', '2');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a maker./);
    });

    //Testing transaction org.bn.evoo.newBatchShipment (SUCCESS)
    it('A participant of type COURIER can create a new BatchShipment asset invoking the transaction', async () => {
        // Use the identity for courier.
        await useIdentity(courierCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBatchShipment');
        transaction.shipmentId = '2';
        transaction.batches = [];
        transaction.batches.push(
            factory.newRelationship(namespace, 'Batch', '3')
        );
        transaction.begin = new Date('2018-01-01T00:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.BatchShipment');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.courier.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#courierPart');
        asset1.batches[0].getFullyQualifiedIdentifier().should.equal(namespace + '.Batch#3');
        asset1.begin.toDateString.should.equal(new Date('2018-01-01T00:00:00.000Z').toDateString);
        asset1.end.toDateString.should.equal(new Date('2018-01-01T04:00:00.000Z').toDateString);
    });

    //Testing transaction org.bn.evoo.newBatchShipment (FAILURE)
    it('A participant of type !COURIER cannot create a new BatchShipment asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBatchShipment');
        transaction.shipmentId = '2';
        transaction.batches = [];
        transaction.batches.push(
            factory.newRelationship(namespace, 'Batch', '3')
        );
        transaction.begin = new Date('2018-01-01T00:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a courier./);
    });

    //Testing transaction org.bn.evoo.newProductShipment (SUCCESS)
    it('A participant of type COURIER can create a new ProductShipment asset invoking the transaction', async () => {
        // Use the identity for courier.
        await useIdentity(courierCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProductShipment');
        transaction.shipmentId = '2';
        transaction.products = [];
        transaction.products.push(
            factory.newRelationship(namespace, 'Product', '2')
        );
        transaction.begin = new Date('2018-01-01T00:00:00.000Z');
        transaction.order = factory.newRelationship(namespace, 'Order', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.ProductShipment');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.courier.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#courierPart');
        asset1.order.getFullyQualifiedIdentifier().should.equal(namespace + '.Order#1');
        asset1.products[0].getFullyQualifiedIdentifier().should.equal(namespace + '.Product#2');
        asset1.begin.toDateString.should.equal(new Date('2018-01-01T00:00:00.000Z').toDateString);
        asset1.end.toDateString.should.equal(new Date('2018-01-01T04:00:00.000Z').toDateString);
    });

    //Testing transaction org.bn.evoo.newProductShipment (FAILURE)
    it('A participant of type !COURIER cannot create a new ProductShipment asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProductShipment');
        transaction.shipmentId = '2';
        transaction.products = [];
        transaction.products.push(
            factory.newRelationship(namespace, 'Product', '2')
        );
        transaction.begin = new Date('2018-01-01T00:00:00.000Z');
        transaction.order = factory.newRelationship(namespace, 'Order', '1');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a courier./);
    });

    //Testing transaction org.bn.evoo.newBasement (SUCCESS)
    it('A participant of type MAKER can create a new Basement asset invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBasement');
        transaction.basementId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Basement');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.maker.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#makerPart');
        asset1.latitude.should.equal('x');
        asset1.longitude.should.equal('y');
    });

    //Testing transaction org.bn.evoo.newBasement (FAILURE)
    it('A participant of type !MAKER cannot create a new Basement asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newBasement');
        transaction.basementId = '2';
        transaction.latitude = 'x';
        transaction.longitude = 'y';
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a maker./);
    });

    //Testing transaction org.bn.evoo.newProduct (SUCCESS)
    it('A participant of type MAKER can create a new Product asset invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProduct');
        transaction.productId = '3';
        transaction.batch = factory.newRelationship(namespace, 'Batch', '2');
        transaction.basement = factory.newRelationship(namespace, 'Basement', '1');
        transaction.creationDate = new Date('2018-05-01T04:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Product');
        const asset1 = await assetRegistry.get('3');

        // Validate the asset.
        asset1.batch.getFullyQualifiedIdentifier().should.equal(namespace + '.Batch#2');
        asset1.ownership.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#makerPart');
        asset1.basement.getFullyQualifiedIdentifier().should.equal(namespace + '.Basement#1');
        asset1.creationDate.toDateString.should.equal(new Date('2018-05-01T04:00:00.000Z').toDateString);
    });

    //Testing transaction org.bn.evoo.newProduct (FAILURE)
    it('A participant of type !MAKER cannot create a new Product asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newProduct');
        transaction.productId = '3';
        transaction.batch = factory.newRelationship(namespace, 'Batch', '2');
        transaction.basement = factory.newRelationship(namespace, 'Basement', '1');
        transaction.creationDate = new Date('2018-05-01T04:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Current participant is not a maker./);
    });

    //Testing transaction org.bn.evoo.*Sensing (SUCCESS)
    it('A participant of type FARMER can create a new FarmingProcessSensing asset invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newFarmingProcessSensing');
        transaction.sensingId = '2';
        transaction.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        transaction.measureType = 'TEMPERATURE';
        transaction.value = 30;
        transaction.sensorIdentifier = 'AAAA-0000';
        transaction.sensingTimestamp = new Date('2018-01-02T00:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.FarmingProcessSensing');
        const asset1 = await assetRegistry.get('2');

        // Validate the asset.
        asset1.farming.getFullyQualifiedIdentifier().should.equal(namespace + '.FarmingProcess#1');
    });

    //Testing sensing transaction org.bn.evoo.*Sensing (FAILURE)
    it('A participant cannot create a new FarmingProcessSensing asset if it is not the owner of the corresponding plantation', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'newFarmingProcessSensing');
        transaction.sensingId = '2';
        transaction.farming = factory.newRelationship(namespace, 'FarmingProcess', '1');
        transaction.measureType = 'TEMPERATURE';
        transaction.value = 30;
        transaction.sensorIdentifier = 'AAAA-0000';
        transaction.sensingTimestamp = new Date('2018-01-02T00:00:00.000Z');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Operation not permitted./);
    });

    //Testing transaction org.bn.evoo.changeBatchOwnership (SUCCESS)
    it('A participant that owns the Batch can change its ownership invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'changeBatchOwnership');
        transaction.newOwner = factory.newRelationship(namespace, 'Owner', 'makerPart');
        transaction.batch = factory.newRelationship(namespace, 'Batch', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Batch');
        const asset1 = await assetRegistry.get('1');

        // Validate the asset.
        asset1.ownership.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#makerPart');
    });

    //Testing transaction org.bn.evoo.changeBatchOwnership (FAILURE)
    it('A participant that does not own the Batch cannot change its ownership invoking the transaction', async () => {
        // Use the identity for farmer.
        await useIdentity(farmerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'changeBatchOwnership');
        transaction.newOwner = factory.newRelationship(namespace, 'Owner', 'makerPart');
        transaction.batch = factory.newRelationship(namespace, 'Batch', '3');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Operation not permitted: you are not the owner./);
    });

    //Testing transaction org.bn.evoo.changeProductOwnership (SUCCESS)
    it('A participant that owns the Product can change its ownership invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'changeProductOwnership');
        transaction.newOwner = factory.newRelationship(namespace, 'Owner', 'courierPart');
        transaction.product = factory.newRelationship(namespace, 'Product', '1');
        await businessNetworkConnection.submitTransaction(transaction);

        // Get the asset.
        const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Product');
        const asset1 = await assetRegistry.get('1');

        // Validate the asset.
        asset1.ownership.getFullyQualifiedIdentifier().should.equal(namespace + '.Owner#courierPart');
    });

    //Testing transaction org.bn.evoo.changeProductOwnership (FAILURE)
    it('A participant that does not own the Product cannot change its ownership invoking the transaction', async () => {
        // Use the identity for maker.
        await useIdentity(makerCardName);

        // Submit the transaction.
        const transaction = factory.newTransaction(namespace, 'changeProductOwnership');
        transaction.newOwner = factory.newRelationship(namespace, 'Owner', 'makerPart');
        transaction.product = factory.newRelationship(namespace, 'Product', '2');
        await businessNetworkConnection.submitTransaction(transaction).should.be.rejectedWith(/Operation not permitted: you are not the owner./);
    });
});
