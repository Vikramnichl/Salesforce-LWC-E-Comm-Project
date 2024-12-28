import { LightningElement, wire, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFavoriteLists from '@salesforce/apex/FavoritesController.getFavoriteLists';
import deleteFavoriteList from '@salesforce/apex/FavoritesController.deleteFavoriteList';
import duplicateFavoriteList from '@salesforce/apex/FavoritesController.duplicateFavoriteList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class MyFavorites extends NavigationMixin(LightningElement) {
    @track favoriteLists = [];
    @track toastMessage = '';
    @track showToastComponent = false;
    @track toastVariant = '';
    error;
    wiredFavoriteResult;

    @wire(getFavoriteLists)
    wiredFavoriteLists(result) {
        this.wiredFavoriteResult = result;
        const { error, data } = result;
        if (data) {
            console.log('Data from Apex:', data);
            this.favoriteLists = data.map(list => ({
                ...list,
                Id: list.Id,
                ListName: list.ListName__c, // Use the exact name as saved
                formattedLastModifiedDate: this.formatDate(list.LastModifiedDate),
                remainingCount: list.Favorite_Items__r?.length > 3
                    ? list.Favorite_Items__r.length - 3
                    : 0,
                Favorite_Items__r: list.Favorite_Items__r
                    ? list.Favorite_Items__r.map((item, index) => ({
                        ...item,
                        displayUrl: item.Product__r?.Image_Url__c || 'default_image_url',
                        productName: item.Product__r?.Name || 'No Product Name',
                        isVisible: index < 3 // Only first three items should have isVisible set to true
                    }))
                    : [],
            }));
        } else if (error) {
            this.error = error;
            console.error('Error fetching favorite lists:', this.error);
        }
    }

    connectedCallback() {
        this.template.addEventListener('favoriteupdated', this.handleFavoriteUpdated.bind(this));
    }

    renderedCallback() {
        // Refresh data every time the component is rendered
        console.log('Component rendered, refreshing data...');
        if (this.wiredFavoriteResult) {
            refreshApex(this.wiredFavoriteResult)
                .then(() => console.log('Data refreshed successfully'))
                .catch((error) => console.error('Error refreshing data:', error));
        }
    }



    handleFavoriteUpdated(event) {
        console.log('Favorite updated event received:', event.detail);

        refreshApex(this.wiredFavoriteResult) // Refresh the wire data
            .then(() => {
                console.log('Favorite lists refreshed successfully');
            })
            .catch((error) => {
                console.error('Error refreshing favorite lists:', error);
            });
    }

    // Format date to a more readable format
    formatDate(date) {
        if (!date) return '';

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        };

        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    // Navigation and other methods remain unchanged
    handleCreateFavoritesClick() {
        const nextbaseUrl = '/create-favorite'; // Replace with your actual page URL
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `${nextbaseUrl}`,
            },
        });
    }


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

    handleListClick(event) {
        const listId = event.currentTarget.dataset.id;
        const baseUrl = '/favorites';
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `${baseUrl}?listId=${listId}`,
            },
        });
    }


    @track showModal = false; // Controls modal visibility
    @track selectedFavoriteId;
    // Method to toggle modal visibility and set the selected favorite ID
    toggleModal(event) {
        this.selectedFavoriteId = event.target.dataset.id;
        this.showModal = true;
        console.log("ID to delete ----", this.selectedFavoriteId);
    }
    // Method to close modal
    // Close the modal
    handleCloseModal() {
        this.showModal = false;
        this.selectedFavoriteId = null; // Clear selected ID
    }
    @track showSpinner = false;
    handleDelete() {
        const favoriteListId = this.selectedFavoriteId; // Use the selected ID
        if (!favoriteListId) {
            console.error("No favoriteListId found for deletion.");
            this.handleCloseModal();
            return;
        }

        this.showSpinner = true;

        // Call Apex to delete the favorite list
        deleteFavoriteList({ favoriteListId })
            .then(() => {
                // Show success toast
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Favorite List deleted successfully',
                        variant: 'success',
                    })
                );

                // Refresh the list by removing the deleted item locally
                this.favoriteLists = this.favoriteLists.filter(
                    (list) => list.Id !== favoriteListId
                );
                return refreshApex(this.wiredFavoriteResult);
                // Close modal after successful deletion
                this.handleCloseModal();
            })
            .catch((error) => {
                // Show error toast
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
                // Always hide spinner regardless of success or error
                this.showSpinner = false;
                this.handleCloseModal();
                this.showCustomToast();

            });
    }

    showCustomToast() {
        this.toastMessage = 'THE FAVORITE LIST IS DELETED'; // Updated message
        this.toastVariant = 'success'; // Set the toast variant (e.g., 'success', 'info', etc.)
        this.showToastComponent = true;

        // Automatically hide the toast after 5 seconds
        setTimeout(() => {
            this.showToastComponent = false;
        }, 5000);
    }

    handleDuplicateClick(event) {
        const listId = event.target.dataset.id;

        if (!listId) {
            console.error('Error: listId is missing in the HTML element');
            return;
        }
        this.showSpinner = true;
        duplicateFavoriteList({ favoriteListId: listId })
            .then(newList => {
                console.log('New duplicate created:', newList);
                this.showSpinner = false;
                return refreshApex(this.wiredFavoriteResult);
            })
            .catch(error => {
                console.error('Error duplicating favorite list:', error);
                this.showSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error duplicating favorite list: ' + error.body.message,
                        variant: 'error',
                    })
                );
            });
    }
}