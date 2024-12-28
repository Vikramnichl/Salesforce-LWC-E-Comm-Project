import { LightningElement, track, api } from 'lwc';
import getFaqs from '@salesforce/apex/FavoritesController.getFaqs'; // Update the Apex class name if necessary

export default class FaqSection extends LightningElement {
    @api productId; // Product ID passed as an API property
    @track sections = []; // Holds FAQ data
    @track error; // Holds any error messages

    // Fetch FAQs when the component is initialized
    connectedCallback() {
        console.log('ConnectedCallback called. Product ID:', this.productId); // Debugging productId
        this.fetchFaqs();
    }

    // Method to fetch FAQs from the backend
    fetchFaqs() {
        if (!this.productId) {
            console.error('Product ID is undefined or missing'); // Debugging missing productId
            return;
        }

        console.log('Fetching FAQs for Product ID:', this.productId); // Debugging productId before Apex call

        getFaqs({ productId: this.productId })
            .then((data) => {
                console.log('Data received from Apex:', JSON.stringify(data, null, 2)); // Debugging data from Apex

                this.sections = data.map((faq) => ({
                    id: faq.Id,
                    title: faq.Title__c,
                    content: faq.Description__c,
                    isOpen: false // Default state for each FAQ section
                }));
                this.error = undefined;

                console.log('Transformed sections:', JSON.stringify(this.sections, null, 2)); // Debugging transformed sections
            })
            .catch((error) => {
                console.error('Error fetching FAQs:', JSON.stringify(error, null, 2)); // Debugging Apex error
                this.error = error;
                this.sections = []; // Clear sections on error
            });
    }

    // Method to toggle visibility of a FAQ section
    toggleSection(event) {
        const sectionId = event.target.dataset.id; // Get the ID of the clicked section
        console.log('Toggling section with ID:', sectionId); // Debugging section toggle

        this.sections = this.sections.map((section) => {
            if (section.id === sectionId) {
                section.isOpen = !section.isOpen; // Toggle the clicked section
            } else {
                section.isOpen = false; // Close other sections
            }
            return section;
        });

        console.log('Updated sections after toggle:', JSON.stringify(this.sections, null, 2)); // Debugging sections state
    }

    
}