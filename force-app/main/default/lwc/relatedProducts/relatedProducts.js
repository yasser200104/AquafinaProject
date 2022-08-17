import { LightningElement, wire, api } from 'lwc';

import getRelatedProducts from '@salesforce/apex/QuoteController.relatedProducts';
import QUOTE_NAME from '@salesforce/schema/QuoteLineItem.QuoteId';
import { refreshApex } from '@salesforce/apex';

import PRODUCT_NAME from '@salesforce/schema/QuoteLineItem.Product2Id';
import PRODUCT_UNITPRICE from '@salesforce/schema/QuoteLineItem.UnitPrice';
import PRODUCT_QUANTITY from '@salesforce/schema/QuoteLineItem.Quantity';
import PRODUCT_SUBTOTAL from '@salesforce/schema/QuoteLineItem.Subtotal';
import ifPriceBookExist from '@salesforce/apex/QuoteController.ifPriceBookExist'
import QUOTEMC from '@salesforce/messageChannel/appMessageChannel__c'

export default class RelatedProducts extends LightningElement {

    @api quoteId;
    refresh;
    productResults;
    error;
    showEditProducts = false;
    showAddProducts = false;
    
    columns = [
        { label: 'Product', fieldName: 'Product2Name'},
        { label: 'Price', fieldName: 'UnitPrice'},   
        { label: 'Quantity', fieldName: 'Quantity'},
        { label: 'Subtotal', fieldName: 'Subtotal', type: 'currency'}
    ];

    renderedCallback(){
        this.refreshRelatedProductsList();
    }
    
    @wire(getRelatedProducts, {quoteId : '$quoteId'})
    RelatedProducts(wireResults){
        const {data, error} = wireResults;
        this.refresh = wireResults;
        if(data)
        {
            let newData = data.map(
                (row) => 
                {
                    return {...row, Product2Name : row.Product2.Name}
                }
            )
            this.productResults = newData;
            this.error = undefined;
            console.log('Related products  result 11:  ' + JSON.stringify(this.productResults))
        }
        else if(error)
        {
           this.productResults = undefined;
           this.error = error;
        }
    }


    hideModalBox(){
        this.dispatchEvent(new CustomEvent("hiderelatedproducts"));   
    }

    handleAddProducts(){
        // calls hideModalBox to to hide this component
        this.hideModalBox();
        let self = this;     
        // check wether price book exists        
        ifPriceBookExist({quoteId : this.quoteId})
           .then(result => 
            {
                if(result === false)
                {
                    self.showAddProducts = true;                                    
                    // Dispatch event to quote main to display pricebook 
                    self.dispatchEvent(
                        new CustomEvent('showaddpricebook')
                    );     
                }
                else {
                    self.dispatchEvent(
                        new CustomEvent('showselectpricebookentry')
                    ); 
                }
            })
            .catch(
                error => 
                {
                  console.log('Error :' + JSON.stringify(error));
                }
            )
        
        // dispatch addproduct event that is captured by quoteMain product to show popup 
        this.dispatchEvent(new CustomEvent('showaddproducts'));
    }

    handleEditProducts(){
        this.hideModalBox();
        this.showEditProducts = true; 
        this.dispatchEvent(
            new CustomEvent("showeditproducts")
        );
        console.log("showEditProducts is " + this.showEditProducts);

    }

     
    refreshRelatedProductsList(){  
        refreshApex(this.refresh);
    } 

}