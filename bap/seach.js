const fetch = require('node-fetch');

const searchEngineUrl = 'https://search.beckn.io';

async function discoverBPPs(query) {
  try {
    const searchUrl = `${searchEngineUrl}/search?q=${encodeURIComponent(query)}`;

    // Send the search request to the search engine
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (response.ok) {
      const bpps = data.results.map(result => ({
        name: result.provider.name,
        url: result.provider.url,
        catalog: result.catalog,
      }));

      return bpps;
    } else {
      console.error('Error searching for BPPs:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error searching for BPPs:', error);
    return [];
  }
}


// Example usage
const query = 'restaurants in Bangalore';
discoverBPPs(query)
  .then(bpps => {
    console.log('Discovered BPPs:');
    bpps.forEach(bpp => {
      console.log(`Name: ${bpp.name}`);
      console.log(`URL: ${bpp.url}`);
      console.log('Catalog:');
      bpp.catalog.forEach(product => {
        console.log(`- ${product.name} (${product.price})`);
      });
      console.log('---');
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });