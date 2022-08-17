import { LightningElement, wire, api, track } from 'lwc';
import getRelatedProducts from '@salesforce/apex/QuoteController.relatedProducts';
import PRODUCT_NAME from '@salesforce/schema/QuoteLineItem.Product2Id';
import LINE_NUMBER from '@salesforce/schema/QuoteLineItem.LineNumber';
import ID from '@salesforce/schema/QuoteLineItem.Id';
import PRODUCT_UNITPRICE from '@salesforce/schema/QuoteLineItem.UnitPrice';
import PRODUCT_QUANTITY from '@salesforce/schema/QuoteLineItem.Quantity';
import PRODUCT_SUBTOTAL from '@salesforce/schema/QuoteLineItem.Subtotal'
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class EditProducts extends LightningElement {
    
    @api quoteId;
    @track result;
    productResults;
    showEditProductsTable;
    draftValues;
    saveDraftValues = [];

    columns = [
        { label: 'Product Name', fieldName: 'Product2Name'},
        { label: 'Price', fieldName: 'UnitPrice'},   
        { label: 'Subtotal', fieldName: 'Subtotal', type: 'currency'},
        { label: 'Quantity', fieldName: 'Quantity', editable: true}
    ];

    @wire(getRelatedProducts, {quoteId : '$quoteId'})
    RelatedProducts(wireResults){
        const {data, error} = wireResults;
        this.refresh = wireResults;
        
        if(data)
        {
            console.log('Original data 6 :' + JSON.stringify(data));
            let newData = data.map(
              (row) => 
                {
                     return {
                        ...row, Product2Name : row.Product2.Name 
                     }
                }
            )

            console.log(' Modified array :' + JSON.stringify(newData));
            this.productResults = newData;
            
      
        }
        else if(error)
        {
           this.productResults = undefined;
           this.error = error;
        }
    }
    

    handleSave(event){
        this.saveDraftValues = event.detail.draftValues;
        let myTableResult = this.saveDraftValues[0];
     
        const fields = {}; 
                fields[ID.fieldApiName] = myTableResult.Id;
                fields[PRODUCT_QUANTITY.fieldApiName] = myTableResult.Quantity;
                const recordInput = {fields};
                let self = this;

                updateRecord(recordInput)
                .then(() => 
                    {
                        this.ShowToast('Product Updated', 'Product succesfully updated', 'success', 'dismissible');
                        self.dispatchEvent(new CustomEvent('productedited'));
                        this.saveDraftValues = [];
                        console.log('Draft values are 6 : ' + this.saveDraftValues);

                        return this.refreshList();
                    })
                .catch( () =>
                    {
                        this.ShowToast('Fail Update Product', 'Fail to update product', 'error', 'dismissible')
                    }) 
                .finally( () =>
                {
                    this.saveDraftValues = [];
                })                  
    }



    hideModalBox()
    {
        this.showEditProductsTable = false;
        this.dispatchEvent(
            new CustomEvent("hideeditproducttable")
        )
    }

    ShowToast(title, message, variant, mode){
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
            });
            this.dispatchEvent(evt);
    }

    refreshList(){  
        return  refreshApex(this.refresh);
      }
}