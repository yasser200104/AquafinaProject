public with sharing class QuoteController {
    
    @AuraEnabled(cacheable=true)
    public static List<Quote> getQuotes(Id opportunityId)
    {
        return [Select ID, Name, Status,IsSyncing,  GrandTotal From Quote where OpportunityId = :opportunityId];
    }
    
    @AuraEnabled
    public static Quote cloneQuote(Id quoteId)
    {

        Quote  quote = [SELECT FIELDS(STANDARD)  FROM Quote where Id = :quoteId LIMIT 1];
        
        List<QuoteLineItem> quoteLineItemsToClone = [SELECT Product2Id, QuoteId, LineNumber, Quantity, ListPrice, Subtotal,
                                                     UnitPrice, TotalPrice 
                                                     FROM QuoteLineItem WHERE  QuoteId = :quoteId];
        
        List<QuoteLineItem> newQuoteItems = new List<QuoteLineItem>();
  
        Quote  eQuote = quote.clone( false, true, false, false );
        eQuote.Name += ' Clone' ;
            
         for(QuoteLineItem qlt : quoteLineItemsToClone)
         {
          	QuoteLineItem newqlt = qlt.clone(false, true, false, false);
            newqlt.QuoteId = eQuote.Id;
            newQuoteItems.add(newqlt);           
         }
                    
        insert eQuote;
        insert newQuoteItems; 
        
        return  eQuote;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<QuoteLineItem> relatedProducts(Id quoteId)
    {
        return [SELECT Product2Id, Product2.Name, QuoteId, LineNumber, Quantity, ListPrice, Subtotal,
                        UnitPrice, TotalPrice 	
                FROM QuoteLineItem WHERE  QuoteId = :quoteId];
    }
    
    @AuraEnabled
    public static boolean ifPriceBookExist(Id quoteId)
    {
        Quote currentQuote = [SELECT Id, Pricebook2Id  FROM Quote WHERE  Id = :quoteId];
        boolean priceBookExist = true;
        
        if(String.isBlank(currentQuote.Pricebook2Id)){
                priceBookExist = false;             
            } 
        return priceBookExist;
    }  
    
    @AuraEnabled(cacheable=true)
    public static List<PriceBook2> getActivePriceBooks()
    {
        List<PriceBook2> activePriceBooks = [Select Id, Name from PriceBook2 Where IsActive = true]; 
        return activePriceBooks;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> getActiveProducts()
    {
        List<Product2> activeProducts = [Select Id, Name from Product2 Where IsActive = true];
        return activeProducts;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<PriceBookEntry> getRelatedPriceBookEntry(Id priceBookId)
    {
        list<PriceBookEntry> RelatedPriceBookEntry = [Select Id, UnitPrice, Product2Id ,Product2.Name,
                                                      Product2.Description, Product2.Family,
                                                      ProductCode , isActive  from PriceBookEntry 
                                                      where Pricebook2Id = :priceBookId And isActive = true];
        
        return RelatedPriceBookEntry;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Quote> getQuotePricebookId(Id quoteID)
    {
        return [SELECT Name, pricebook2Id from  quote where Id = :quoteID];
    }
    
    @AuraEnabled 
    public static List<QuoteLineItem> insertQuoteLineItems(String newQuoteLineItemsDataString){
        List<QuoteLineItem>  newQuoteLineItems = (List<QuoteLineItem>) JSON.deserialize(newQuoteLineItemsDataString, List<QuoteLineItem>.class);
        
        if(newQuoteLineItems.size() > 0 ){
            insert newQuoteLineItems; 
            System.debug('New Quote Line items succesfully submited ');
        }
            
        return newQuoteLineItems;    
    }
    
 
    
    
    
    
            
 }