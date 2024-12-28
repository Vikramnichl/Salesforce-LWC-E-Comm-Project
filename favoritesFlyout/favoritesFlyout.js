import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getFavoriteListNames from '@salesforce/apex/FavoritesController.getFavoriteListNames';
import createFavoriteList from '@salesforce/apex/FavoritesController.createFavoriteList';
import addProductToFavoriteList from '@salesforce/apex/FavoritesController.addProductToFavoriteList';
import clearAllItemsFromList from '@salesforce/apex/FavoritesController.clearAllItemsFromList';
import doesFavoriteNameExist from '@salesforce/apex/FavoritesController.doesFavoriteNameExist';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class FavoritesFlyout extends LightningElement {


    @api productId;  // Add this to receive the productId from the parent component
    isFavListNameError = false;
    @api isFilterOpen = false;
    @track isSlideOut = false;
    // @api existingFavArray;
    _existingFavArray;
    // Input values
    favoriteName = '';
    @track favoriteLists = [];
    favoriteDescription = '';
    favoriteListsData;
    @track isSaving = false;   // Spinner visibility flag
    @track isClearing = false; // Spinner visibility for CLEAR

    @api
    set existingFavArray(val) {
        this._existingFavArray = val;
        console.log('existingFavArray check From', JSON.stringify(this._existingFavArray));
        console.table(this._existingFavArray);
        if (this.favoriteListsData != null && this.favoriteListsData != undefined) {
            this.setFavoriteData();
        }
    }

    get contentClass() {
        return this.isSaving ? 'blurred-content' : '';
    }

    connectedCallback() {
        console.log('Product ID received in flyout:', this.productId);  // Log to check if the productId is received
    }

    get existingFavArray() {
        return this._existingFavArray;
    }

    get sidebarClass() {
        return this.isSlideOut ? 'slide-out' : (this.isFilterOpen ? 'slide-in' : '');
    }

    CloseFavFilter() {
        this.isSlideOut = true;
        setTimeout(() => {
            this.isFilterOpen = false;
            this.isSlideOut = false;
            // Dispatch the close event to notify the parent
            this.dispatchEvent(new CustomEvent('closefilter'));
        }, 500); // Match the CSS animation duration
    }


    get sidebarClass() {
        return this.isSlideOut ? 'slide-out' : (this.isFilterOpen ? 'slide-in' : '');
    }


    @wire(getFavoriteListNames)
    wiredFavoriteLists(result) {
        this.wiredFavoriteListsResult = result; // Save the @wire result
        const { data, error } = result;

        if (data) {
            console.debug("Show All data", data);
            this.favoriteListsData = data;
            // Map the favorite lists for use in the template
            this.setFavoriteData();
        } else if (error) {
            this.error = error;
            console.error('Error fetching favorite lists:', error);
        }
    }



    setFavoriteData() {
        this.favoriteLists = this.favoriteListsData
            ? this.favoriteListsData.map((list) => ({
                id: list.Id,
                name: list.ListName__c,
                checkboxId: `checkbox-unique-id-${list.Id}`,
                isChecked: this.existingFavArray
                    ? this.existingFavArray.includes(list.Id)
                    : false,
            }))
            : [];
        console.log('Mapped favoriteLists:', JSON.stringify(this.favoriteLists));
    }

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

    handleDescriptionChange(event) {
        this.favoriteDescription = event.target.value;
    }



    handleCheckboxChange(event) {
        this.isVisible = false;
        const checkboxId = event.target.dataset.id; // The id should match the checkbox ID generated earlier
        const isChecked = event.target.checked;

        console.log('Checkbox ID:', checkboxId);
        console.log('Is Checked:', isChecked);

        // Update the favoriteLists array with the new checkbox state
        this.favoriteLists = this.favoriteLists.map(list => {
            if (list.id === checkboxId) {  // Ensure matching the original checkboxId
                // console.log('Updating list item:', list);
                console.log('Updated favorite item:', JSON.stringify(this.list));
                return { ...list, isChecked: event.target.checked };
            }
            return list;
        });

        // Creating a new list with latest data
        this.updatedList = [...this.favoriteLists];
        // console.log('Updated favorite lists:', this.updatedList);
        console.log('Updated favorite lists:', JSON.stringify(this.updatedList));

        if (!this.newFavouriteList) {
            this.newFavouriteList = [];
        }

        const updatedItem = this.favoriteLists.find(list => list.id === checkboxId);
        const existingItem = this.newFavouriteList.find(item => item.id === checkboxId);

        // console.log('Updated item:', updatedItem);
        console.log('Updated favorite item:', JSON.stringify(this.updatedItem));
        // console.log('Existing item in newFavouriteList:', existingItem);
        console.log('Updated favorite lists:', JSON.stringify(this.existingItem));

        if (existingItem) {
            if (existingItem.isChecked !== isChecked) {
                console.log('Updating existing item in newFavouriteList');
                this.newFavouriteList = this.newFavouriteList.map(item =>
                    item.id === checkboxId ? updatedItem : item
                );
            }
        } else {
            console.log('Adding new item to newFavouriteList');
            this.newFavouriteList = [...this.newFavouriteList, updatedItem];
        }
    }



    // handleSave() {
    //     console.log('Save Button click');
    //     this.isSaving = true; // Show spinner
    //     console.log('isSaving set to true');
    //     const trimmedName = this.favoriteName.trim();
    //     // Validation: Ensure at least one action is specified
    //     // if (!this.favoriteName && (!this.favoriteLists || !this.favoriteLists.some(list => list.isChecked))) {
    //     //     console.error('Either a new favorite list name or an existing list selection is required.');
    //     //     this.isSaving = false;
    //     //     this.showToast('Warning', 'Please provide a new favorite list name or select existing lists.', 'warning');
    //     //     return;
    //     // }
    //     if (this.isFavListNameError || trimmedName === '') {
    //         this.showToast('Error', this.errorMessage || 'Favorite Name is required.', 'error');
    //         this.isSaving = false; // Reset spinner before return
    //         return;
    //     }
       

    //     const promises = [];
    //     if (this.trimmedName) {
    //         const createListPromise = createFavoriteList({
    //             listName: this.trimmedName,
    //             description: this.favoriteDescription
    //         })
    //             .then(result => {
    //                 console.log('New Favorite List Created:', result);
    //                 // Add the product to the newly created list
    //                 return addProductToFavoriteList({
    //                     productId: this.productId,
    //                     favoriteListId: result
    //                 });
    //             })
    //             .catch(error => {
    //                 console.error('Error creating new favorite list:', JSON.stringify(error));
    //                 throw new Error('Failed to create a new favorite list.');
    //             });

    //         promises.push(createListPromise);
    //     }

    //     // Adding the product to selected existing favorite lists
    //     const selectedLists = this.favoriteLists.filter(list => list.isChecked); // Correctly retrieve selected lists
    //     if (selectedLists.length > 0) {
    //         console.log('Adding product to selected existing lists:', JSON.stringify(selectedLists));

    //         const existingListsPromise = Promise.all(
    //             selectedLists.map(list =>
    //                 addProductToFavoriteList({
    //                     productId: this.productId,
    //                     favoriteListId: list.id,
    //                 })
    //                     .then(() => {
    //                         console.log(`Product added to favorite list ID: ${list.id}`);
    //                     })
    //                     .catch(error => {
    //                         console.error(`Failed to add product to list ID: ${list.id}`, error);
    //                         throw new Error('Failed to add product to selected favorite lists.');
    //                     })
    //             )
    //         );

    //         promises.push(existingListsPromise);
    //     }
    //     // Handle all promises
    //     Promise.all(promises)
    //         .then(() => {
    //             console.log('Product successfully added to selected lists.');
    //             return refreshApex(this.wiredFavoriteListsResult); // Refresh favorite lists
    //         })
    //         .then(() => {
    //             if (this.wiredFavoriteListsResult.data) {
    //                 console.log('Refreshing favorite lists data');
    //                 this.favoriteListsData = this.wiredFavoriteListsResult.data;
    //                 this.setFavoriteData(); // Update UI with refreshed data
    //             }
    //             console.log('Closing the flyout after save');
    //             this.CloseFavFilter(); // Close the flyout after save
    //         })
    //         .catch(error => {
    //             this.showToast('Error', error.message || 'Failed to complete the operation.', 'error');
    //             console.error('Error:', error);
    //         })
    //         .finally(() => {
    //             setTimeout(() => {
    //                 console.log('Hiding the spinner');
    //                 this.isSaving = false; // Hide spinner
    //             }, 100); // Allow time for UI update
    //             this.favoriteName = '';
    //             this.favoriteDescription = '';
    //         });
    // }

    handleSave() {
    console.log('Save Button click');
    this.isSaving = true; // Show spinner

    const trimmedName = this.favoriteName.trim();
    const selectedLists = this.favoriteLists.filter(list => list.isChecked);

    // Validation: Ensure at least one action is specified
    if (!trimmedName && selectedLists.length === 0) {
        this.showToast('Error', 'Please provide a favorite list name or select at least one existing list.', 'error');
        this.isSaving = false; // Reset spinner
        return;
    }

    const promises = [];

    // Create a new favorite list if a name is provided
    if (trimmedName) {
        const createListPromise = createFavoriteList({
            listName: trimmedName,
            description: this.favoriteDescription,
        })
            .then(result => {
                console.log('New Favorite List Created:', result);
                // Add the product to the newly created list
                return addProductToFavoriteList({
                    productId: this.productId,
                    favoriteListId: result,
                });
            })
            .catch(error => {
                console.error('Error creating new favorite list:', error);
                throw new Error('Failed to create a new favorite list.');
            });

        promises.push(createListPromise);
    }

    // Add product to selected existing favorite lists
    if (selectedLists.length > 0) {
        console.log('Adding product to selected existing lists:', selectedLists);

        const existingListsPromise = Promise.all(
            selectedLists.map(list =>
                addProductToFavoriteList({
                    productId: this.productId,
                    favoriteListId: list.id,
                })
                    .then(() => {
                        console.log(`Product added to favorite list ID: ${list.id}`);
                    })
                    .catch(error => {
                        console.error(`Failed to add product to list ID: ${list.id}`, error);
                        throw new Error('Failed to add product to selected favorite lists.');
                    })
            )
        );

        promises.push(existingListsPromise);
    }

    // Handle all promises
    Promise.all(promises)
        .then(() => {
            console.log('Product successfully added to selected lists.');
              const productAddedEvent = new CustomEvent('productadded', {
                detail: {
                    message: 'Product added to favorite list successfully!',
                },
                bubbles: true, // Allow the event to bubble up
                composed: true, // Cross shadow DOM boundaries
            });
            this.dispatchEvent(productAddedEvent);
            return refreshApex(this.wiredFavoriteListsResult);
        })
        .then(() => {
            if (this.wiredFavoriteListsResult.data) {
                this.favoriteListsData = this.wiredFavoriteListsResult.data;
                this.setFavoriteData();
            }
            this.CloseFavFilter();
        })
        .catch(error => {
            this.showToast('Error', error.message || 'Failed to complete the operation.', 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            console.log('Hiding the spinner');
            this.isSaving = false; // Hide spinner
            this.favoriteName = '';
            this.favoriteDescription = '';
        });
}

    get isSaveDisabled() {
        const trimmedValue = this.favoriteName.trim();

        // Check if any checkbox is selected
        const isAnyCheckboxSelected = this.favoriteLists.some(list => list.isChecked);

        // Check if the favorite name is valid
        const isFavoriteNameValid =
            trimmedValue !== '' && // Not empty or whitespace
            !/[^a-zA-Z0-9\s-]/.test(trimmedValue) && // Valid characters
            !this.isFavListNameError; // No server-side error

        // Enable save button if either condition is true
        return !(isAnyCheckboxSelected || isFavoriteNameValid);
    }


    clearSelection() {
        this.isSaving = true;

        // Reset checkboxes
        if (this.favoriteLists) {
            this.favoriteLists = this.favoriteLists.map(list => ({
                ...list,
                isChecked: false
            }));
        }

        this.existingFavArray = [];
        clearAllItemsFromList({ productId: this.productId });

        // Refresh the favorite lists
        refreshApex(this.wiredFavoriteListsResult)
            .then(() => {
                if (this.wiredFavoriteListsResult.data) {
                    this.favoriteListsData = this.wiredFavoriteListsResult.data;
                    this.setFavoriteData();
                }
            })
            .catch(error => {
                console.error('Error refreshing favorite lists:', error);
            })
            .finally(() => {
                console.log('Final step reached, hiding spinner');
                setTimeout(() => {
                    this.isSaving = false; // Hide spinner
                    this.isClearSelection = true;
                    this.CloseFavFilter();
                    console.log('isClearing set to false');
                }, 1000); // Allow time for UI update
            });
    }
    // clearSelection() {
    //     console.log('clearSelection called');
    //     this.isClearing = true; // Show spinner
    //     console.log('isClearing set to true');

    //     // Reset checkboxes
    //     if (this.favoriteLists) {
    //         this.favoriteLists = this.favoriteLists.map(list => ({
    //             ...list,
    //             isChecked: false
    //         }));
    //     }

    //     // Refresh the favorite lists
    //     refreshApex(this.wiredFavoriteListsResult)
    //         .then(() => {
    //             if (this.wiredFavoriteListsResult.data) {
    //                 this.favoriteListsData = this.wiredFavoriteListsResult.data;
    //                 this.setFavoriteData();
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error refreshing favorite lists:', error);
    //         })
    //         .finally(() => {
    //             console.log('Final step reached, hiding spinner');
    //             setTimeout(() => {
    //                 this.isClearing = false; // Hide spinner
    //                 console.log('isClearing set to false');
    //             }, 1000); // Allow time for UI update
    //         });
    // }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }



}