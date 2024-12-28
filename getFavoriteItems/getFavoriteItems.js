import { LightningElement, track, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';  // Add this import
import getFavoriteItems from '@salesforce/apex/FavoritesController.getFavoriteItems';
import duplicateFavoriteList from '@salesforce/apex/FavoritesController.duplicateFavoriteList';
import deleteFavoriteList from '@salesforce/apex/FavoritesController.deleteFavoriteList';
import removeFavoriteItem from '@salesforce/apex/FavoritesController.removeFavoriteItem';
import { refreshApex } from '@salesforce/apex';

export default class GetFavoriteItems extends NavigationMixin(LightningElement) {
    @track favoriteItems = []; // Holds the favorite items to display
    @track favoriteListName = ''; // Favorite List Name
    @track favoriteListDescription = ''; // Description of the list
    @track favoriteListLastModified = ''; // Last modified date of the list
    @track showSpinner = false; // Spinner visibility control
    @track showModal = false; // Modal visibility control
    @track modalType = ''; // Tracks which modal type is triggered ('delete' or 'remove')
    @track selectedItemId = ''; // Holds the ID of the item to delete/remove
    @track selectedFavoriteId = null;
    @track toastMessage = '';
    @track showToastComponent = false;
    @track toastVariant = '';

    @api recordId; // Record ID from the page URL
    wiredFavoriteResult; // Holds the wired Apex result to refresh data

    @wire(CurrentPageReference)
    getState(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;
            this.recordId = state.listId || '';
        }
    }

    // Wire Apex method to fetch favorite items
    @wire(getFavoriteItems, { favoriteListId: '$recordId' })
    wiredGetFavoriteItems(result) {
        this.wiredFavoriteResult = result; // Store the result for refreshApex
        if (result.data) {
            const favoriteList = result.data[0] || {};

            // Map favorite list data
            this.favoriteListName = favoriteList.ListName__c || 'No List Found';
            this.favoriteListDescription = favoriteList.Description__c || 'No Description Available';
            this.favoriteListLastModified = favoriteList.LastModifiedDate
                ? new Date(favoriteList.LastModifiedDate).toLocaleString()
                : 'N/A';

            // Map favorite items
            this.favoriteItems = (favoriteList.Favorite_Items__r || []).map((item) => ({
                favItemId: item.Id,
                productName: item.Product__r.Name || 'No Name',
                displayURL: item.Product__r.Image_Url__c || '',
                description: item.Product__r.Description__c || 'No Description',
                price: (item.Product__r.Discounted_Price__c || item.Product__r.Original_Price__c || 0).toFixed(2),
                sku: item.Product__c || 'N/A',
                inStock: true, // Placeholder for stock logic
                showImage: !!item.Product__r.Image_Url__c, // Show image if the URL exists
            }));
        } else if (result.error) {
            console.error('Error fetching favorite items:', result.error);
            this.favoriteItems = [];
        }
    }

    // Handle Remove Action
    handleRemove() {
        const favoriteItemId = this.selectedItemId; // Use selectedItemId from modal logic

        if (favoriteItemId) {
            this.showSpinner = true;
            console.log('Removing item with ID:', favoriteItemId); // Debug log
            removeFavoriteItem({ favoriteItemId }) // Call Apex method
                .then(() => {
                    console.log('Item removed successfully:', favoriteItemId);
                    this.showCustomToast();
                    // Refresh the wire result to update the UI
                    return refreshApex(this.wiredFavoriteResult);
                })
                .catch((error) => {
                    console.error('Error removing favorite item:', error);
                })
                .finally(() => {
                    this.showSpinner = false;
                    this.handleCloseModal(); // Close modal after action
                });
        } else {
            console.error('Favorite Item ID is missing.');
        }
    }

    showCustomToast() {
        this.toastMessage = 'THE PRODUCT HAS BEEN REMOVED FROM YOUR FAVORITES'; // Updated message
        this.toastVariant = 'success'; // Set the toast variant (e.g., 'success', 'info', etc.)
        this.showToastComponent = true;

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            this.showToastComponent = false;
        }, 5000);
    }


    handleDeleteList(event) {
        this.modalType = 'delete';
        this.selectedFavoriteId = event.target.dataset.id; // Check if recordId is being passed
        console.log('Delete List Clicked: ID:', this.selectedFavoriteId);
        this.showModal = true;
    }

    handleRemoveItem(event) {
        this.modalType = 'remove';
        this.selectedItemId = event.target.dataset.id; // Check if item ID is passed
        console.log('Remove Item Clicked: ID:', this.selectedItemId);
        this.showModal = true;
    }

    handleCloseModal() {
        console.log('Closing Modal');
        this.showModal = false;
        this.modalType = '';
        this.selectedItemId = '';
        this.selectedFavoriteId = null;
    }

    handleModalConfirm() {
        console.log('Modal Confirm Triggered, Type:', this.modalType);
        if (this.modalType === 'delete') {
            this.handleDelete();
        } else if (this.modalType === 'remove') {
            this.handleRemove();
        }
    }

    // Getter to determine which modal content to display
    get isDeleteModal() {
        return this.modalType === 'delete';
    }

    get isRemoveModal() {
        return this.modalType === 'remove';
    }

    // Delete the favorite list
    handleDelete() {
        if (!this.selectedFavoriteId) {
            console.error("No favoriteListId found for deletion.");
            this.handleCloseModal();
            return;
        }

        this.showSpinner = true;

        deleteFavoriteList({ favoriteListId: this.selectedFavoriteId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Favorite List deleted successfully',
                        variant: 'success',
                    })
                );

                // Navigate to the favorites page after deletion
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/my-favorites',
                    },
                });
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: `Error deleting favorite list: ${error.body?.message || 'Unknown error'}`,
                        variant: 'error',
                    })
                );
                console.error('Error deleting favorite list:', error);
            })
            .finally(() => {
                this.showSpinner = false;
                this.handleCloseModal();
            });
    }
    // Handle Edit Action
    handleEditClick(event) {
        const favoriteId = event.target.dataset.id;

        if (favoriteId) {
            const editPageUrl = `/edit-favorites?listId=${favoriteId}`; // Pass only listId

            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: editPageUrl,
                },
            });
        } else {
            console.error('Error: Favorite ID is missing.');
        }
    }

    // Handle Duplicate Action
    handleDuplicateClick(event) {
        const listId = event.target.dataset.id;

        if (!listId) {
            console.error('Error: listId is missing in the HTML element');
            return;
        }
        this.showSpinner = true;
        duplicateFavoriteList({ favoriteListId: listId })
            .then((newList) => {
                console.log('List duplicated successfully. New List:', newList);

                // Navigate to the new duplicated list using its ID
                const baseUrl = '/favorites'; // Adjust this to your favorites page base URL
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: `${baseUrl}?listId=${newList.Id}`, // Use the new list's ID
                    },
                });

                // Optional success toast for confirmation
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `List "${newList.ListName__c}" duplicated successfully.`,
                        variant: 'success',
                    })
                );
            })
            .catch((error) => {
                console.error('Error duplicating favorite list:', error);
            })
            .finally(() => {
                this.showSpinner = false;
            });
    }

    // Open and close modal methods (if needed)
    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }
}