import { LightningElement, track, api } from 'lwc';
import createFavoriteList from '@salesforce/apex/FavoritesController.createFavoriteList';
import { NavigationMixin } from 'lightning/navigation'; // Import NavigationMixin
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import doesFavoriteNameExist from '@salesforce/apex/FavoritesController.doesFavoriteNameExist';
export default class CreateFavorite extends NavigationMixin(LightningElement) {
    @track favoriteName = ''; // Holds the favorite name
    @track favoriteDescription = ''; // Holds the favorite description
    @track isSaving = false; // Spinner visibility flag
    @api isAdmin = false; // Flag to toggle admin view (optional, based on your use case)
  @track  isFavListNameError = false;
    // Handle input change for Favorite Name
   handleNameChange(event) {
        clearTimeout(this.debounceTimeout);

        this.favoriteName = event.target.value;
        const trimmedValue = this.favoriteName.trim();

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

    // Handle input change for Favorite Description
    handleDescriptionChange(event) {
        this.favoriteDescription = event.target.value;
    }

    // Handle Save button click
    // handleSave() {
    //     if (!this.favoriteName.trim()) {
    //         this.showToast('Error', 'Favorite name is required.', 'error');
    //         return;
    //     }

    //     this.isSaving = true;

    //     // Validate name again before save (in case user bypassed UI checks)
    //     doesFavoriteNameExist({ name: this.favoriteName.toLowerCase(), excludeListId: this.listId })
    //         .then((exists) => {
    //             if (exists) {
    //                 this.showToast('Error', 'Cannot save. Duplicate favorite list name exists.', 'error');
    //                 this.isSaving = false;
    //             } else {
    //                 // Proceed with saving the favorite list
    //                 createFavoriteList({
    //                     listName: this.favoriteName,
    //                     description: this.favoriteDescription,
    //                 })
    //                     .then(() => {
    //                         this.showToast('Success', 'Favorite list created successfully.', 'success');
    //                         this.clearForm();
    //                         this.navigateToMyFavorites();
    //                     })
    //                     .catch((error) => {
    //                         console.error('Error creating favorite list:', error);
    //                         this.showToast('Error', 'Failed to create favorite list. Please try again.', 'error');
    //                     })
    //                     .finally(() => {
    //                         this.isSaving = false;
    //                     });
    //             }
    //         })
    //         .catch((error) => {
    //             console.error('Error during duplicate validation:', error);
    //             this.isSaving = false;
    //             this.showToast('Error', 'An unexpected error occurred. Please try again.', 'error');
    //         });


    //     // Call Apex method to create favorite list
    //     createFavoriteList({
    //         listName: this.favoriteName,
    //         description: this.favoriteDescription
    //     })
    //         .then(() => {
    //             this.showToast('Success', 'Favorite list created successfully.', 'success');
    //             this.clearForm();
    //             this.navigateToMyFavorites(); // Navigate back to "My Favorites"
    //         })
    //         .catch(error => {
    //             console.error('Error creating favorite list:', error);
    //             this.showToast('Error', 'Failed to create favorite list. Please try again.', 'error');
    //         })
    //         .finally(() => {
    //             this.isSaving = false;
    //         });
    // }

     handleSave() {
        if (!this.favoriteName.trim()) {
            this.showToast('Error', 'Favorite name is required.', 'error');
            return;
        }

        if (this.isFavListNameError) {
            this.showToast('Error', 'Cannot save. Duplicate favorite list name exists.', 'error');
            return;
        }

        this.isSaving = true;

        // Re-validate name on save to ensure no duplicates
        doesFavoriteNameExist({ name: this.favoriteName.toLowerCase(), excludeListId: this.listId })
            .then((exists) => {
                if (exists) {
                    this.showToast('Error', 'Cannot save. Duplicate favorite list name exists.', 'error');
                    this.isSaving = false;
                } else {
                    // Proceed with saving the favorite list
                    return createFavoriteList({
                        listName: this.favoriteName,
                        description: this.favoriteDescription,
                    });
                }
            })
            .then(() => {
                this.showToast('Success', 'Favorite list created successfully.', 'success');
                this.clearForm();
                this.navigateToMyFavorites();
            })
            .catch((error) => {
                if (error) {
                    console.error('Error creating favorite list:', error);
                    this.showToast('Error', 'Failed to create favorite list. Please try again.', 'error');
                }
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    // Handle Cancel button click
    handleCancel() {
        this.clearForm();
        this.navigateToMyFavorites(); // Navigate back to "My Favorites" on cancel
    }

    // Clear form fields
    clearForm() {
        this.favoriteName = '';
        this.favoriteDescription = '';
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }


    // Method to navigate to My Favorites page
    navigateToMyFavorites() {
        // Navigate to the "My Favorites" page
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/my-favorites', // Replace with your actual My Favorites URL
            },
        });
    }

    navigateToFavorite() {
        // Directly use the existing logic to navigate to "My Favorites"
        if (this.selectedMenuItem !== 'favorite') {
            this.updateMenuAndNavigate('favorite', '/my-favorites');
        }
    }

}