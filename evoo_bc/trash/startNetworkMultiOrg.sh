#!/bin/bash

composer card delete --card admin@evoo_bc
composer network install --card PeerAdmin@hlfv1 --archiveFile evoo_bc@0.0.10.bna
composer network start --networkName evoo_bc --networkVersion 0.0.10 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
composer card import --file networkadmin.card
composer network ping --card admin@evoo_bc
composer-rest-server -c admin@evoo_bc -p 3001
