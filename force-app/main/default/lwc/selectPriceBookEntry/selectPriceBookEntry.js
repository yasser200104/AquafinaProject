import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getRelatedPriceBookEntry from '@salesforce/apex/QuoteController.getRelatedPriceBookEntry';
import OPPORTUNITY_PRICEBOOKID from '@salesforce/schema/Opportunity.Pricebook2Id';
import getQuotePricebook from '@salesforce/apex/QuoteController.getQuotePricebookId';	  
const fields = [OPPORTUNITY_PRICEBOOKID];
import { refreshApex } from '@salesforce/apex';


export default class SelectPriceBookEntry extends LightningElement {
    @api opportunityId; 
    @api quoteId;
    @track priceBookEntryResultsdata;
    selectedPriceBookId;
    quotePriceBookId;
    error;
    refresh;

    columns = [
        {label:'Product Name', fieldName :'Product2Name'},
        {label:'Product Code', fieldName :'ProductCode'},
        {label:'List Price', fieldName :'UnitPrice'},
        {label:'Product Description', fieldName :'Product2Description'},
        {label:'Product Family', fieldName :'Product2Family'}
    ];

    renderedCallback(){
      return refreshApex(this.refresh);
    }

     // get price book from Quote 
     @wire(getQuotePricebook, { quoteID: '$quoteId'})
     getCurrentQuote(results){
      const {data, error} = results;
      this.refresh = results;
       if(data){
         console.log('the currentQuoteId is : ' + this.quoteId);
         console.log('quote Data :' + JSON.stringify(data));
         console.log('Price book Id :' + data[0].Pricebook2Id);
       //  console.log('This is Pricebook Id ' + data.fields.Pricebook2Id.value)
          this.quotePriceBookId = data[0].Pricebook2Id;
          this.selectedPriceBookId = this.quotePriceBookId;
          console.log('Quote Price book Id :' + this.selectedPriceBookId);
 
       }
       else if(error){
         console.log('This is error ' + JSON.stringify(error))
       }
     }

    //Get pricebookId from opportunity 
    // @wire(getRecord, {recordId : '$opportunityId', fields})
    // getCurrentOpportunity(result){
    //   const {data , error} = result;
    //   if(data){
    //     console.log('This is Pricebook Id ' + data.fields.Pricebook2Id.value);
    //     this.selectedPriceBookId = data.fields.Pricebook2Id.value;
    //   }
    //   else if(error){
    //     console.log('This is error ' + JSON.stringify(error))
    //   }
    // }

    @wire(getRelatedPriceBookEntry, {priceBookId : '$selectedPriceBookId'})
    priceBookEntryResults({data, error})
    {
      if(data)
      {
         console.log('Received PricebookId : ' + this.selectedPriceBookId);
         console.log('priceBookEntryResults Data : ' + JSON.stringify(data));
         this.priceBookEntryResultsdata = data.map(row => {
                                      return {
                                        ...row,  
                                         Id : row.Id,
                                         Product2Name : row.Product2.Name, 
                                         Product2Description : row.Product2.Description,
                                         Product2Family : row.Product2.Family
                                      }}); 
         this.error = undefined;       
      }
      else if(error)
      {
        this.priceBookEntryResults = undefined;
        this.error = error;
        console.log('Book entryError : ' + JSON.stringify(error));
      }
    }

    hideSelectPriceBookEntry(){
        this.dispatchEvent(
            new CustomEvent('hideselectpricebookentry')
        );
    }

    submitSelectedPriceBookEntry(){
        this.hideSelectPriceBookEntry();    
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        
        console.log('Selected Rows are 8 :' + JSON.stringify(selectedRecords));
        if(selectedRecords.length > 0){        
            let selectedProducts = selectedRecords.map(currentItem => {
                    return { 'Id' :   currentItem.Id , 
                             'Product2Name' : currentItem.Product2.Name,
                             'UnitPrice' :   currentItem.UnitPrice,
                             'ListPrice' :    currentItem.UnitPrice
                             } 
            })  
            console.log('Inside Select price book ' + JSON.stringify(selectedProducts)) ;  
        this.dispatchEvent(
          new CustomEvent('submitedquotelineitems', {detail : selectedProducts })
        );           
        }        
    } 

}