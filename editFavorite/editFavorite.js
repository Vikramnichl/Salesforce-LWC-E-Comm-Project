import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getFavoriteDetails from '@salesforce/apex/FavoritesController.getFavoriteDetails';
import updateFavoriteDetails from '@salesforce/apex/FavoritesController.updateFavoriteDetails';
import doesFavoriteNameExist from '@salesforce/apex/FavoritesController.doesFavoriteNameExist';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EditFavorite extends NavigationMixin(LightningElement) {
    @track favoritesName = '';
    @track favoritesDescription = '';
    @track isFavListNameError = false;
    @track errorMessage = '';
    @track showSpinner = false;
    @api listId;

    debounceTimeout;

    // Fetch `listId` from navigation state and load the latest data
    @wire(CurrentPageReference)
    getState(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;
            this.listId = state.listId || '';
            if (this.listId) {
                this.fetchLatestData();
            }
        }
    }

    // Fetch the latest data from the server
    async fetchLatestData() {
        this.showSpinner = true;
        try {
            const favorite = await getFavoriteDetails({ listId: this.listId });
            if (favorite) {
                this.favoritesName = favorite.ListName__c || '';
                this.favoritesDescription = favorite.Description__c || '';
            }
        } catch (error) {
            console.error('Error fetching favorite details:', error);
            this.showToast('Error', 'Failed to load favorite details. Please try again.', 'error');
        } finally {
            this.showSpinner = false;
        }
    }

    handleNameChange(event) {
        clearTimeout(this.debounceTimeout);

        this.favoritesName = event.target.value;
        const trimmedValue = this.favoritesName.trim();

        // Immediate validation for empty or whitespace-only input
        if (trimmedValue === '') {
            this.isFavListNameError = true;
            this.errorMessage = 'Favorite Name is required.';
            return;
        }

        const invalidChars = /[^a-zA-Z0-9\s-]/;
        if (invalidChars.test(trimmedValue)) {
            this.isFavListNameError = true;
            this.errorMessage = 'Name can only contain letters, numbers, and spaces.';
            return;
        }

        // Debounce server-side validation for existing names
        this.debounceTimeout = setTimeout(() => {
            doesFavoriteNameExist({ name: trimmedValue, excludeListId: this.listId })
                .then((exists) => {
                    this.isFavListNameError = exists;
                    if (exists) {
                        this.errorMessage = 'NEW FAVORITE NAME ALREADY EXISTS.';
                    } else {
                        this.errorMessage = ''; // Clear error if the name is unique
                    }
                })
                .catch((error) => {
                    console.error('Error validating name:', error);
                    this.isFavListNameError = false;
                    this.errorMessage = ''; // Reset error state
                });
        }, 500); // Debounce time: 500ms
    }

    handleDescriptionChange(event) {
        this.favoritesDescription = event.target.value;
    }

    async handleSave() {
        const trimmedName = this.favoritesName.trim();

        if (this.isFavListNameError || trimmedName === '') {
            this.showToast('Error', this.errorMessage || 'Favorite Name is required.', 'error');
            return;
        }


        this.showSpinner = true;
        try {
            await updateFavoriteDetails({
                listId: this.listId,
                name: trimmedName,
                description: this.favoritesDescription || '',
            });

            this.showToast('Success', 'Favorite updated successfully.', 'success');
            this.navigateToMyFavorites();
        } catch (error) {
            console.error('Error updating favorite:', error);
            this.showToast('Error', 'Failed to update favorite. Please try again.', 'error');
        } finally {
            this.showSpinner = false;
        }
    }

    get isSaveDisabled() {
        // return this.isFavListNameError || this.favoritesName.trim() === '';
        const trimmedValue = this.favoritesName.trim();
        return (
            trimmedValue === '' || // Blank spaces
            /[^a-zA-Z0-9 ]/.test(trimmedValue) || // Invalid characters
            this.isFavListNameError // Name already exists
        );
    }

    handleCancel() {
        this.navigateToMyFavorites();
    }

    navigateToMyFavorites() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/my-favorites',
            },
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}