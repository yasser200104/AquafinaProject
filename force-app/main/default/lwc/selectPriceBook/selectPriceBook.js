import { LightningElement, wire, api, track } from 'lwc';
import getActivePriceBooks from '@salesforce/apex/QuoteController.getActivePriceBooks';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import QUOTE_ID from '@salesforce/schema/Quote.Id';
import QUOTE_PRICEBOOKID from '@salesforce/schema/Quote.Pricebook2Id'

export default class SelectPriceBook extends LightningElement {
    priceBookOptions;
    error;
    @api quoteId;

    @wire(getActivePriceBooks)
    ActivePriceBooks({data, error}){ 
        if(data) 
        {      
          this.priceBookOptions = data.map( (row) =>{ 
              return {
                      label : row.Name,
                      value : row.Id
                    }});
           this.priceBookOptions.unshift({label :'None', value : 'null'});
           this.error = undefined;
        } 
       else if(error)
        {
          this.error = error;
          this.priceBookOptions = undefined;
          console.log('Error :' + JSON.stringify(error))
        }
    }

    hideSelectPriceBook(){
      console.log('Hide select price book executed 2');
      this.dispatchEvent(
        new CustomEvent('hideselectpricebook')
      );
    }

     /*Dispatch event to parent quoteMain to communicate that a 
       - price book was selected so we can display selectPriceBookEntry  */
    handleChange(event){   
        let selectedPriceBookId = event.detail.value;
        console.log('The selected Price book is ' + selectedPriceBookId) ;

        const fields = {};
         fields[QUOTE_ID.fieldApiName] = this.quoteId;
         fields[QUOTE_PRICEBOOKID.fieldApiName] = selectedPriceBookId;

        const recordInput = {fields};

        let self = this;

        updateRecord(recordInput)
           .then((response) => {
              self.dispatchEvent(new CustomEvent('selectpricebook', {detail : this.selectedPriceBookId }));
              self.dispatchEvent(
                new ShowToastEvent({
                  title: 'Price Book Selected Succesfully ',
                  variant: 'success'
                        })
                )})              
          .catch((error) => {
            self.dispatchEvent(
              new ShowToastEvent({
                title: 'Fail To Select PriceBook ',
                variant: 'error'
            })
          )})
    } 
}