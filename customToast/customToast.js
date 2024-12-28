import { LightningElement, api } from 'lwc';
// import tick from '@salesforce/resourceUrl/successicon';

export default class CustomToast extends LightningElement {
  @api message = '';
  @api variant = 'success'; // Default variant, you can pass any string here
//   @api approvalIcon = tick;

  get toastClass() {
    
    // You can define custom styles for different variants
    let str = `custom-toast slds-theme_${this.variant}`;
    const svgElement = this.template.querySelector('svg.slds-icon.slds-icon_small');

// Check if the element exists and remove the class
if (svgElement) {
    svgElement.classList.remove('slds-icon');
    svgElement.classList.remove('slds-icon_small');
}
    return str;
  }
}