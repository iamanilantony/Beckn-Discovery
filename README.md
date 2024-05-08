# Beckn-Discovery



> ## Description
> This proof of concept is to evaluate how search engines can be used to index Beckn websites and make them discoverable. It is an alternate model to a central registry-based mechanism.
> 
> ## Goals
> BPP
> 
> * [ ]   BPP to host a signed Beckn descriptor file on their domain issued by a certification authority.
> * [ ]   Search engines should be able to verify this descriptor and index their catalog.
> * [ ]   BPPs should be able to push changes to their catalog incrementally to the search engine(s).
> 
> Bap
> 
> * [ ]   BAP can also host a signed Beckn descriptor file on their domain issued by a certification authority.
> * [ ]   BAPs can discover Bpps and their products via search engines (like Beckn gateway)
> * [ ]   BPPs should be able to verify Baps signatures using the BAP's Beckn descriptor.
> 
> ## Expected Outcome
> Peers should be able to verify each other and transact as an open network with no central controlling facilitator.
> 
> ## Acceptance Criteria
> * [ ]   Beckn reference Gateway to be enhanced to function as a search engine.
> * [ ]   A Reference Bpp should be able to push catalog changes to the gateway
> * [ ]   Reference Bap should be able to choose the gateway as a search engine for discovery purposes.
> 
> ## Implementation Details
> 1. A github repo consisting of certification authorities ,search engines and their Public keys.
> 2. Beckn.json (beckn descriptor) file can be signed by one of the authorities.
> 3. The authority may host the beckn registry for validating endpoints and keys.
>    *. Once validated, the apps will be issued a beckn.json file affixed with their signature.
> 4. Lucene to be used for indexing the catalog.
> 5. /search of gateway to look into local indexed catalog
> 6. unsolicited /on_search from bpp to be used to push full/part catalog
> 
> ## Mockups / Wireframes
> ### Product Name
> Beckn
> 
> ### Project Name
> Beckn Application discovery via search technologies.
> 
> ### Organization Name:
> Beckn Open Collective
> 
> ### Domain
> Trade and Commerce



