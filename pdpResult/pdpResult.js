import { LightningElement, track } from 'lwc';
import getProductById from '@salesforce/apex/FavoritesController.getProductById';

export default class PdpResult extends LightningElement {
    @track product = {};
    @track productId = null;

    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        this.productId = productId;

        if (productId) {
            this.fetchProductDetails(productId);
        } else {
            console.error('Product ID is undefined or missing in the URL.');
        }
    }

    fetchProductDetails(productId) {
        getProductById({ productId })
            .then((data) => {
                this.product = data;
            })
            .catch((error) => {
                console.error('Error fetching product details:', error);
            });
    }
}