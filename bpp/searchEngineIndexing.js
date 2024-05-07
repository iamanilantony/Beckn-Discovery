const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

// Fetch the beckn.json file
const bppUrl = 'https://example.com/beckn.json';
fetch(bppUrl)
  .then(response => response.json())
  .then(becknJson => {
    // Verify the signature
    const caPublicKey = fs.readFileSync('ca.pem');
    const bppCert = fs.readFileSync('bpp_cert.pem');
    const verify = crypto.createVerify('SHA256');
    verify.update(becknJson.payload);

    if (verify.verify(bppCert.publicKey, becknJson.signature, 'base64')) {
      console.log('Signature is valid');
    } else {
      console.error('Invalid signature');
      return;
    }

    // Parse the beckn.json file
    const providerDetails = becknJson.provider;
    const catalog = becknJson.catalog;

    // Index the catalog
    const esClient = new Client({ node: 'http://localhost:9200' });
    const bulkOperations = catalog.flatMap(product => [
      { index: { _index: 'beckn', _id: product.id } },
      {
        name: product.name,
        description: product.description,
        price: product.price,
        // ... add other relevant fields
      },
    ]);

    esClient.bulk({ refresh: true, operations: bulkOperations })
      .then(() => console.log('Indexed catalog successfully'))
      .catch(err => console.error('Error indexing catalog:', err));
  })
  .catch(err => console.error('Error fetching beckn.json:', err));