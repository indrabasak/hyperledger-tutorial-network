# Hyperledger Composer Example

Hyperledger Composer is an application development framework for creating
applications in Hyperledger Fabric applications. It contains APIs, a modeling 
language, and a programming model that can be used for defining and deploying
business networks and applications. A business network allows users
exchange assets via transactions.

Create a Business Network
=================================

```bash
$ yo hyperledger-composer:businessnetwork 
Welcome to the business network generator
? Business network name: hyperledger-tutorial-network
? Description: Indra's IBM Tutorial Network
? Author name:  Indra Basak
? Author email: ib@gmail.com
? License: Apache-2.0
? Namespace: com.basaki.network
   create package.json
   create permissions.acl
   create README.md
   create models/com.basaki.network.cto
   create .eslintrc.yml
   create features/sample.feature
   create features/support/index.js
   create test/logic.js
   create lib/logic.js
```

Define a Business Network
=================================

## Modelling
The Hyperledger models are stored in files with `.cto` extension. The model 
file contains definition of `asset`, `transaction`, `participant`, and `event`.
It extends `Hyperledger Composer Modelling Language` and implicitly extends 
the `Hyperledger Composer System Model`.

In this example, the model is stored in `com.basaki.network.cto`. It models
a `Trade` transaction and its relationship with  `Trader` participant
and `Commodity` asset.

```
Commodity identified by tradingSymbol {
    o String tradingSymbol
    o String description
    o String mainExchange
    o Double quantity
    --> Trader owner
}
participant Trader identified by tradeId {
    o String tradeId
    o String firstName
    o String lastName
}
transaction Trade {
    --> Commodity commodity
    --> Trader newOwner
}
```

## Transaction Logic

Transaction logic is expressed in `JavaScript` and stored in a file named 
`logic.js`. The `Trade` transaction accepts the identifier of the traded 
`Commodity` asset and the identifier of the `Trader` participant which
is set as the new owner.

```javascript
/**
 * Track the trade of a commodity from one trader to another
 * @param {com.basaki.network.Trade} trade - the trade to be processed
 * @transaction
 */
async function tradeCommodity(trade) {
    // update the commodity owner with the new owner
    trade.commodity.owner = trade.newOwner;

    // retrieve the asset registry for the commodity
    let assetRegistry = await getAssetRegistry('com.basaki.network.Commodity');

    // update the commodity in the asset registry
    await assetRegistry.update(trade.commodity);
}
```

## Access Control

The access controls of a Hyperledger business network are declared in 
`permission.acl`. Here participants are given permissions to access
different parts of the network. 

```
rule Default {
    description: "Allow all participants access to all resources"
    participant: "ANY"
    operation: ALL
    resource: "com.basaki.network.*"
    action: ALLOW
}

rule SystemACL {
  description:  "System ACL to permit all access"
  participant: "ANY"
  operation: ALL
  resource: "org.hyperledger.composer.system.**"
  action: ALLOW
}
```

Generate a Business Network Archive
=====================================
The business network definitions need to be packaged as
as deployable business network archive `.bna` file before it's deployed in the Hyperledger Fabric.

Navigate to `hyperledger-tutorial-network` folder and
execute the following command from the terminal:

```bash
composer archive create -t dir -n .
```

This should generate a file named `hyperledger-tutorial-network@0.0.1.bna`

```bash
$ composer archive create -t dir -n .

Looking for package.json of Business Network Definition
        Input directory: /Users/ib/hyperledger-tutorial-network

Found:
        Description: Indra&#39;s IBM Tutorial Network
        Name: hyperledger-tutorial-network
        Identifier: hyperledger-tutorial-network@0.0.1

Written Business Network Definition Archive file to
        Output file: hyperledger-tutorial-network@0.0.1.bna

Command succeeded
```

Create a Business Network Archive
====================================

Before proceeding any further, make sure you've created a 
`business network card` for the Hyperledger Fabric administrator and 
imported it in the Hyperledger Composer's wallet. A business network card 
contains information required to connect to a blockchain business network 
and the underlying Hyperledger Fabric network.

Previusly a `business network card`

## Deploy Business Network

To deploy the newly created business network, run the following command 
in the terminal from the `hyperledger-tutorial-network` directory:

```bash
composer network install --card PeerAdmin@fabric-network --archiveFile hyperledger-tutorial-network\@0.0.1.bna
```

where `PeerAdmin@fabric-network` is the previously imported business 
network card in the Hyperledger Composer's wallet. Here are the output:

```bash
$ composer network install --card PeerAdmin@fabric-network --archiveFile hyperledger-tutorial-network\@0.0.1.bna
✔ Installing business network. This may take a minute...
Successfully installed business network hyperledger-tutorial-network, version 0.0.1

Command succeeded
```

## Start Business Network

Run the following command to start the business network:

```bash
composer network start --networkName hyperledger-tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@fabric-network --file networkadmin.card
```
You should notice the following output if the business network starts successfully:

```bash
✔ Installing business network. This may take a minute...
Successfully installed business network hyperledger-tutorial-network, version 0.0.1

Command succeeded

ibasa-mb-52730:hyperledger-tutorial-network indra.basak$ composer network start --networkName hyperledger-tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@fabric-network --file networkadmin.card
Starting business network hyperledger-tutorial-network at version 0.0.1

Processing these Network Admins:
        userName: admin

✔ Starting business network definition. This may take a minute...
Successfully created business network card:
        Filename: networkadmin.card

Command succeeded
```

## Import Business Network Card

The use the newly created business network card, it needs to be imported 
by running the following command:

```bash
composer card import --file networkadmin.card
```

This should give the following output:

```bash
Successfully imported business network card
        Card file: networkadmin.card
        Card name: admin@hyperledger-tutorial-network

Command succeeded
```

To test if the the business network was deployed successfully, run the 
following command to `ping` the network:

```
composer network ping --card admin@hyperledger-tutorial-network
```

If the ping is successful, you should receive the following response:

```bash
The connection to the network was successfully tested: hyperledger-tutorial-network
        Business network version: 0.0.1
        Composer runtime version: 0.19.1
        participant: org.hyperledger.composer.system.NetworkAdmin#admin
        identity: org.hyperledger.composer.system.Identity#e763881f1d9837b5584e5943f76f16a52c869cea8eccb59907e2e462befc01e0

Command succeeded
```

Generate a REST server
==========================

Hyperledger Composer allows you to generate REST API in order to expose 
a business network. To create a REST API, run the following command:

```bash
composer-rest-server
```

When prompted, 
1. Enter `admin@hyperledger-tutorial-network` as the card name.

1. Select `never use namespaces` when asked to use namespaces.

1. Select `No` when asked to secure the API.

1. Select `Yes` when asked to enable event publication.

1. Select `No` when asked to enable TLS security.

The generated API is connected to the deployed blockchain and business network.

```bash
$ composer-rest-server
? Enter the name of the business network card to use: admin@hyperledger-tutorial-network
? Specify if you want namespaces in the generated REST API: never use namespaces
? Specify if you want to enable authentication for the REST API using Passport: No
? Specify if you want to enable event publication over WebSockets: Yes
? Specify if you want to enable TLS security for the REST API: No

To restart the REST server using the same options, issue the following command:
   composer-rest-server -c admin@hyperledger-tutorial-network -n never -w true

Discovering types from business network definition ...
Discovered types from business network definition
Generating schemas for all types in business network definition ...
Generated schemas for all types in business network definition
Adding schemas for all types to Loopback ...
Added schemas for all types to Loopback
Web server listening at: http://localhost:3000
Browse your REST API at http://localhost:3000/explorer
```