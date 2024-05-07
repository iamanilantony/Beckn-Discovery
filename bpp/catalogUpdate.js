const express = require('express');
const app = express();
const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');


const fetchCaPublicKey = async (caTrustedSource) => {
  // Implement logic to fetch the CA's public key from a trusted source
  // (e.g., a central registry, a secure server, or a database)
  // Return the CA's public key
};

const fetchBppCertificate = async (certUrl) => {
  // Fetch the BPP's certificate from the provided URL
  const response = await fetch(certUrl);
  const bppCert = await response.text();
  return bppCert;
};


const fetchAndVerifyBecknJson = async (bppUrl, caTrustedSource) => {
  try{
    const response = await fetch(`${bppUrl}/beckn.json`);
    const becknJson = await response.json();

    // Fetch the CA's public key from a trusted source
    const caPublicKey = await fetchCaPublicKey(caTrustedSource);

    // Verify the signature
    const bppCert = await fetchBppCertificate(becknJson.provider.certUrl);

    const caPublicKey = fs.readFileSync('ca.pem');
    const bppCert = fs.readFileSync('bpp_cert.pem');
    const verify = crypto.createVerify('SHA256');
    verify.update(becknJson.payload);

    if(verify.verify(bppCert.publicKey, becknJson.signature, 'base64')){
      console.log('Signature is valid')
    }
    else{
      throw new Error('Invalid signature')
    }
  return becknJson    
  }

  catch(err){
    console.log('Error fetching and verifying beckn.json', err)
    throw err;
  }
}


  // Helper function to check if two objects are equal
  const isEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
  };

const handleCatalogUpdate = async (bppUrl, updateType) => {
    // Fetch and verify the updated beckn.json file
    const updatedBecknJson = await fetchAndVerifyBecknJson(bppUrl);
  
    // Extract the updated catalog information
    const updatedCatalog = updatedBecknJson.catalog;
  
    // Update the index in Elasticsearch
    const esClient = new Client({ node: 'http://localhost:9200' });
  
    if (updateType === 'full') {
      // Perform a full reindex
      await esClient.deleteByQuery({
        index: 'beckn',
        body: {
          query: {
            term: {
              bppUrl: bppUrl,
            },
          },
        },
      });
  
      const bulkOperations = updatedCatalog.flatMap(product => [
        { index: { _index: 'beckn', _id: product.id } },
        {
          bppUrl: bppUrl,
          name: product.name,
          description: product.description,
          price: product.price,
          // ... add other relevant fields
        },
      ]);
  
      await esClient.bulk({ refresh: true, operations: bulkOperations });
    } else if (updateType === 'partial') {

    // First, fetch the existing catalog for the BPP
    const existingCatalog = await esClient.search({
        index: 'beckn',
        body: {
          query: {
            term: {
              bppUrl: bppUrl,
            },
          },
        },
      });
  
      // Prepare the update operations
      const updateOperations = [];
  
      // Update modified products
      const modifiedProducts = updatedCatalog.filter(
        product =>
          existingCatalog.body.hits.hits.some(
            hit => hit._id === product.id && !isEqual(hit._source, product)
          )
      );
  
      updateOperations.push(
        ...modifiedProducts.flatMap(product => [
          { update: { _index: 'beckn', _id: product.id } },
          { doc: product },
        ])
      );
  
      // Delete removed products
      const removedProductIds = existingCatalog.body.hits.hits
        .map(hit => hit._id)
        .filter(id => !updatedCatalog.some(product => product.id === id));
  
      updateOperations.push(
        ...removedProductIds.map(id => ({
          delete: { _index: 'beckn', _id: id },
        }))
      );
  
      // Add new products
      const newProducts = updatedCatalog.filter(
        product =>
          !existingCatalog.body.hits.hits.some(hit => hit._id === product.id)
      );
  
      updateOperations.push(
        ...newProducts.flatMap(product => [
          { index: { _index: 'beckn', _id: product.id } },
          {
            bppUrl: bppUrl,
            name: product.name,
            description: product.description,
            price: product.price,
          },
        ])
      );
  
      // Apply the update operations
      if (updateOperations.length > 0) {
        await esClient.bulk({ refresh: true, operations: updateOperations });
      }
    }
  };
  


app.post('/catalog/update', async (req, res) => {
  try {
    const bppUrl = req.body.bppUrl;
    const updateType = req.body.updateType; // e.g., 'full', 'partial'

    // Process the catalog update
    await handleCatalogUpdate(bppUrl, updateType);

    res.status(200).send('Catalog update processed successfully');
  } catch (err) {
    console.error('Error processing catalog update:', err);
    res.status(500).send('Error processing catalog update');
  }
});


