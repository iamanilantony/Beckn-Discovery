
## Current Search Flow

The gateway will receive the "/search" request from the BAP which will include details like domain and product name/description. Subsequently after receiving the request the gateway goes to the registry and does a **lookup** to find eligible BPPs for the specific transaction based on the current domain. After the list of BPPs is received back to the gateway. The gateway then fires individual "/search" request on these BPPs. For which each BPPs  will respond asynchronously back to the corresponding BAP and for finding the BAP url the BPPs come back to the registry and then fires a webhook to the "onSearch" request of the BAP. And then the rest of the flow continues.

![[Pasted image 20240604020844.png]]


## New Flow

Instead of the BPPs returning their **onSearch** query to the BAP, the BPPs will fire the same request on the gateway.this case will include the whole catalogue which can be a Delta request or a complete catalogue and this catalogue will be stored in our gateway and will be indexed using Lucene and when the next time, A BAP is searching for that particular item, instead of going back to the BPP, we will run through the indexed catalogue and will return the items without ever going back to the BPP, therefore reducing multiple network requests. 

And to keep the code with minimal from partner BAPs, we after receiving a request from the BAP and querying through our already indexed catalogue of items we will construct multiple BPP on-Search jsons  and we'll iterate and hit the BAP using these jsons to mimic the request coming from multiple BPPs.

%% (This can be done, utilising a loophole in our current implementation which is the BAPs only ensure that the BPPs json coming ) %%



![[Pasted image 20240604212441.png]]




**Beckn.json format**

```

subscriber_id: {
	type: string
	description: A unique ID describing a subscriber on a network.
}
country: {
	type: code
	description: Country code.
}
city: {
	type: string
	description: City code.
}
domain: {
	type: string
	description: domain category eg: Skilling, energy etc
}
signing_public_key: {
	type: string
	description: Signed key signed by certification autority or registry.
}
encr_public_key: {
	type: string
	description: Base64 encoded encryption key string.
}
valid_from: {
	type: date-time
	description: Date BPP has been active from.
}
valid_until: {
	type: date-time
	description: Date BPP has been active to.
}


gstn: {
	type: string
	description: GST number of the business.
}
bank_account_number: {
	type: number
	description: Bank account number for /confirm.
}
bank_ifsc: {
	type: string
	description: Bank ifsc details for /confirm.
}
upi_uri: {
	type: string
	description: business UPI url. 
	eg: https://api.bpp.com/pay?amt=$640&mode=upi&vpa=bpp@upi"
}

grievance_url: {
	type: string
	description: The link for isssues and grievances.
}


apisSupported: {
	search: {
		type: string
		testcases: The link for isssues and grievances.
		organisation: 
		signature
	}

}




```


Beckn.json suggestions

If some testing entities come in the future for every endpoint of the BPPs we can also add a layer that which all endpoints are tested with a signed key option for each data verified by entities.

apisSupported

Customer support url

****