import { api, LightningElement } from 'lwc';

import QUOTE_NAME from '@salesforce/schema/Quote.Name';
import OPPORTUNITY_ID from '@salesforce/schema/Quote.OpportunityId'
import QUOTE from '@salesforce/schema/QUOTE';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateQuoteForm extends LightningElement {
   
    strName;
    @api opportunityId;
    // Change Handlers.
    nameChangedHandler(event)
    {
        this.strName = event.target.value;
    }

    
    createQuote(){
    // Creating mapping of fields of opportunity with values
    console.log('Opp Id : ' + this.opportunityId);
    var fields = {'Name':this.strName, 'OpportunityId' : this.opportunityId};  
    // Record details to pass to create method with api name of Object.
    var objRecordInput = {'apiName' : 'Quote', fields};
    // LDS method to create record.
    createRecord(objRecordInput).then(
        response => 
        {   
                const event = new ShowToastEvent({
                    title: 'Success!',
                    message: `Quote with Id : ${response.id} was succesfully created `,
                    variant:"success"
                })        
              this.dispatchEvent(event);
              this.dispatchEvent(new CustomEvent('create'));
              this.hideModalBox();
           }).catch(
        error => 
        {
        alert('Error: ' +JSON.stringify(error));
        });
   }

   hideModalBox(){
    this.dispatchEvent(new CustomEvent("hide"));
   }



}