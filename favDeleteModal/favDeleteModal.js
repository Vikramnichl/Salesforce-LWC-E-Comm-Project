// import { LightningElement, api } from 'lwc';

// export default class FavDeleteModal extends LightningElement {
//     @api isModalOpen = false;

//     // Close the modal and notify the parent
//     closeModal() {
//         this.isModalOpen = false;
//         this.dispatchEvent(new CustomEvent('closemodal'));
//     }

//     // Save changes and close the modal
//     saveChanges() {
//         console.log('Favorite deleted!');
//         this.closeModal();
//     }
// }

import { LightningElement, api } from 'lwc';

export default class FavDeleteModal extends LightningElement {
    @api isModalOpen = false; // Controls modal visibility
    @api selectedfavoriteid; // The selected favorite list ID to delete

    // Close the modal (triggered by the "Cancel" button)
    closeModal() {
        console.log("Modal close triggered");
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent); // Dispatch event to parent to close modal
    }

    // Confirm the deletion (triggered by the "OK" button)
    confirmDelete() {
        console.log("Confirm delete triggered with ID:", this.selectedfavoriteid);
        const deleteEvent = new CustomEvent('deleteconfirm', {
            detail: this.selectedfavoriteid
        });
        this.dispatchEvent(deleteEvent); // Dispatch event to parent to confirm deletion
    }
}