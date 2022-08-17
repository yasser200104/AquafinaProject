import { LightningElement, api, track} from 'lwc';
import { NavigationMixin  } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';


export default class CreateQuote extends NavigationMixin(LightningElement) {
   @api opportunityId;
   @track records;

  navigateToNewContact(){
    
  }    
}