import { LightningElement, api, wire, track} from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getRelatedQuotes from '@salesforce/apex/QuoteController.getQuotes';
import cloneQuote from '@salesforce/apex/QuoteController.cloneQuote';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import SYNCEDQUOTE_FIELD from '@salesforce/schema/Opportunity.SyncedQuoteId';        
import OPPORTUNITY_FIELD from '@salesforce/schema/Opportunity.Id';	 
import OPPORTUNITY_PRICEBOOKID from '@salesforce/schema/Opportunity.Pricebook2Id';	


const fields = [OPPORTUNITY_PRICEBOOKID]
const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Sync', name: 'Sync' },
    { label: 'Clone', name: 'Clone' }
     ];

export default class QuotesList extends NavigationMixin(LightningElement) {

   @api recordId;
   @track records;
   error;
   refresh;
   saveDraftValues = [];
   @api columnWidthsMode;
   recordPageUrl;
   @track currentQuoteId;
   submitedQuoteLineItems;
   selectedPriceBook;
   selectedPriceBookId;
   hasRendered = false;
   
   showProducts = false;
   showEditProducts = false;
   showAddProducts = false;
   showAddPriceBook = false;
   ShowSelectPriceBookEntry =false;
   showAddQuoteLineItems = false;

   
   @track isModalOpen = false;
   openModal() {
       // to open modal set isModalOpen tarck value as true
       this.isModalOpen = true;
   }
   handleHide(){
    this.isModalOpen = false;
   }
 
   columns = [
    { label: 'Quote Name', fieldName: 'Name', editable:'true' },
    { label: 'Quote Status', fieldName: 'Status', type: 'Picklist', editable:'true'},   
    { label: 'GrandTotal', fieldName: 'GrandTotal', type: 'currency'},
    {label: 'Products', type: 'button-icon',  initialWidth:100,  iconName: 'standard:product',  name: 'Products',
      typeAttributes:
      {
          iconName: 'standard:product',
          name: 'Quoteproducts'
      }},
    { type: 'action', typeAttributes: { rowActions: actions} }  
          ];

    
   @wire(getRelatedQuotes, {opportunityId:'$recordId'}) 
   relatedquotes(wireResult){
   const { data, error } = wireResult;
   this.refresh = wireResult;
   if(data){ 
        this.records = data;
        //console.log('received records ' + JSON.stringify(this.records));        
    } else if(error){
        console.log('This is error ' + JSON.stringify(error));
     }
   }

   // get the currentpricebookId;
   @wire(getRecord, {recordId : '$recordId', fields})
   currentOpportunity;
    
   @api
   get selectedPriceBook(){
     this.selectedPriceBookId = getFieldValue(this.currentOpportunity.data, OPPORTUNITY_PRICEBOOKID );
     return this.selectedPriceBookId;
   }
   set selectedPriceBook(value){
     this.selectedPriceBookId = value; 
   }
  
   renderedCallback() {   
    console.log('inside Quote Main  2 : ' + this.selectedPriceBook);  
   }

   handleSave(event) {       
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(
            draft =>
             {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));        
        Promise.all(promises)
        .then(
            res => 
            {
              this.ShowToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
              this.saveDraftValues = [];
              return this.refreshList();
        })
        .catch(
            error =>
             {
               this.ShowToast('Error', 'An Error Occured!!', 'error', 'dismissable');
        })
        .finally(() => {
            this.saveDraftValues = [];
        });
   
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'show_details':

                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {  
                        recordId: row.Id,                    
                        objectApiName: 'Quote',
                        actionName: 'view',
                    },
                });                
                break;

            case 'Sync':

                const fields = {}; 
                fields[OPPORTUNITY_FIELD.fieldApiName] = this.recordId;
                fields[SYNCEDQUOTE_FIELD.fieldApiName] = row.Id;
                const recordInput = {fields};

                updateRecord(recordInput).then(
                    () => {
                    this.ShowToast('sync Quote', 'Quote was synced succesfully', 'success', 'dismissible');
                    return this.refreshList();
                }).catch( () => {
                    this.ShowToast('Fail sync Quote', 'Fail to sync Quote', 'error', 'dismissible')
                } )
                break;

            case 'Clone':

                let self = this;
                cloneQuote({quoteId : row.Id})
                    .then(
                    response => 
                    {  
                        console.log('response' + response.Id);
                        self.refreshList();
                        self.ShowToast("Quote Cloned", "Quote clonned succesfully", "success", "dismissible");
                    })
                    .catch(
                       error =>
                         {
                              console.log('error :' + JSON.stringify(error));
                              self.ShowToast("Quote Failed to Clone", "Quote cloning failed", "error", "dismissible");
                    })
                break;

            case 'Quoteproducts':
              this.currentQuoteId = row.Id;
              this.showProducts = true;                
        }
    }

    // Handle Edit Product Component 
    handleEditProduct(){
        console.log('Handle Edit Product Received : ');
        this.refreshList();
    }

    handleHideRelatedProducts(){
        this.showProducts = false;
    }

    handleShowAddProducts(){
        this.showAddProducts = true; 
        this.showAddPriceBook = false;
    }

    // Handle Add product Price book and products 
    handleShowAddPriceBook(){
        this.showAddPriceBook = true;
        console.log('Show Add price book equals true' );
    }

    handleHideSelectPriceBook(){
        console.log('Quote main received hide');
        this.showAddPriceBook = false;
    }
 
    handleCreate(){
        console.log("handle Create 3 Captutred");
        this.refreshList();
    }   

    // Handle Hide and Add Quote Line Items 
    handleHideAddQuoteLineItems(){
        this.showAddQuoteLineItems = false;
    }

    handleBackToPriceBookEntry(){
        console.log('handleBackToPriceBookEntry Received ');
        this.ShowSelectPriceBookEntry = true;
    }

    // Handle selectPriceBook to display pricebookentry element first and then 
    handleSelectPriceBook(event){
        console.log('Inside Handle Select Price book in QuoteMain 5 ');
        console.log('The selected price book is equal tooo ' + event.detail);    
        this.showAddProducts = false; 
        this.ShowSelectPriceBookEntry = true;
        // capture detail value and give it to a variable that is gonna be passe in quoteMain.html
       // this.selectedPriceBook = event.detail;       
    }

    handleSelectPriceBookEntry(){
        console.log("Handle Select price book entry event received ");
        this.ShowSelectPriceBookEntry = false;
        this.showAddPriceBook = false;
    }

    handleShowSelectPriceBookEntry(){
        console.log('handleShowSelectPriceBookEntry is executed ');
        this.ShowSelectPriceBookEntry = true;
    }

    handleSubmitedQuoteLineItems(event){ 
        console.log('Submit is received 5 :' + JSON.stringify(event.detail));
        this.showAddQuoteLineItems = true;
        this.submitedQuoteLineItems = event.detail;
    }

    handleInsertQuoteLineItems(){
        console.log('handle insert quote lines received 11 : ');
        this.refreshList();
        // this.showProducts = true;
        // let self = this; 
        // setTimeout(() => {self.template.querySelector("c-related-products").refreshRelatedProductsList()}, 10000);
        // console.log('Second refresh is called ');
    }


    // Handle Edit products component popup visibility 
    handleShowEditProducts(){
        this.showEditProducts = true;
        console.log("here again " + this.showEditProducts );
    }

    handleHideEditProducts(){
        this.showEditProducts = false;
    }

    showCreate(){
        this.showQuote = true;
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


