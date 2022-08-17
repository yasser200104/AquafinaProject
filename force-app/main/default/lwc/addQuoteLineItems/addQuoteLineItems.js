import { LightningElement, api, wire } from 'lwc';
import insertQuoteLineItems from '@salesforce/apex/QuoteController.insertQuoteLineItems'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 


export default class AddQuoteLineItems extends LightningElement {    
    // get pricebook entry data 
    @api quoteLineItems;
    @api quoteId;
    @api priceBookId;

 
    columns = [ 
        {label : 'Product Name', fieldName : 'Product2Name'},
        {label : 'Sales Price', fieldName : 'UnitPrice', type: 'currency'},
        {label : 'List Price', fieldName : 'ListPrice',  type: 'currency'},
        {label : 'Quantity', fieldName : 'Quantity', editable: true,  required:true },
        {label:'Discount', fieldName: 'Discount', editable: true}
    ]

    //Create quotelineitems based on pricebookentry selected and Discount, Quantity inputed by the user 
    hideAddQuoteLineItems(){
        this.dispatchEvent(
            new CustomEvent('hideaddquotelineitems')
        );
    } 

    handleBackClick(){
        this.hideAddQuoteLineItems();
        this.dispatchEvent(
           new CustomEvent('backtopricebookentry')
        );
    }

    handleSaveClick(){
        this.hideAddQuoteLineItems();
        let table = this.template.querySelector('lightning-datatable');
        let data = table.data;
        let saveDraftValues = table.draftValues;

        console.log('Working ...................');
        console.log('My data : ' + JSON.stringify(table.data));
        console.log('My draft Values : ' + JSON.stringify(table.draftValues));

        let inputValues = data.map((record) =>   
                       ({
                          ...record,
                          ...saveDraftValues.find((value) => value.Id === record.Id)
                       })
            )

        console.log('My input values  : ' + JSON.stringify(inputValues));

        let fields = inputValues.map(element => {
            return {
                     'Product2Id' : element.Id,
                     'PricebookEntryId' : this.priceBookId,                    
                     'ListPrice' : element.ListPrice,
                     'UnitPrice' : element.UnitPrice,
                     'Quantity' : element.Quantity,
                     'Discount' : element.Discount,
                     'QuoteId' : this.quoteId
            }
        });


        let fieldsString = JSON.stringify(fields);

        console.log('My fields are : ' + fieldsString);
        let self  = this;

        insertQuoteLineItems({newQuoteLineItemsDataString : fieldsString })
            .then( (response) => {
                self.dispatchEvent(new CustomEvent('insertquotelineitems'));
                
            })

    }

}