import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProducts from '@salesforce/apex/FavoritesController.getProducts';

export default class PlpResult extends NavigationMixin(LightningElement) {
    @track products = []; // All products fetched from Apex
    @track filteredProducts = []; // Filtered products
    @track searchTerm = ''; // Search input value
    @track noResults = false; // Tracks if no results were found
    @track selectedSort = 'bestmatches'; // Default sort criteria
     @track toastMessage = '';
    @track showToastComponent = false;
    @track toastVariant = '';
    @track productCount = 0; // Count of filtered products
    @track sortOptions = [
        { label: 'Best Matches', value: 'bestmatches' },
        { label: 'Low to High', value: 'low-to-high' },
        { label: 'High to Low', value: 'high-to-low' },
        { label: 'Newest', value: 'newest' }
    ];

    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
              console.log('Fetched Products:', data);
            // Clone the products to make them mutable and add isFavorite and favoriteIcon
            this.products = data.map((product) => ({
                ...product,
                isFavorite: false, // Default favorite status
                favoriteIcon: 'utility:favorite_border', // Default icon (outlined heart)
            }));
            this.filteredProducts = [...this.products]; // Initialize filtered list
            this.productCount = this.filteredProducts.length;
        } else if (error) {
            console.error('Error fetching products:', error);
        }
    }

    connectedCallback() {
    this.template.addEventListener('productadded', this.handleProductAdded.bind(this));
}

handleProductAdded(event) {
    const message = event.detail?.message || 'Product added successfully!';
    this.toastVariant = 'success'; // Set variant to success
    this.toastMessage = message;
    this.showToastComponent = true;

    // Automatically hide the toast after 5 seconds
    setTimeout(() => {
        this.showToastComponent = false;
    }, 5000);
}

disconnectedCallback() {
    this.template.removeEventListener('productadded', this.handleProductAdded.bind(this));
}

    // Handle Favorite Click - Toggle Favorite Status
   handleFavoriteClick(event) {
    const productId = event.target?.dataset?.id; // Safely access dataset
    if (!productId) {
        console.error("Product ID not found");
        return;
    }
    const product = this.filteredProducts.find((p) => p.Id === productId);
    if (product) {
        product.isFavorite = !product.isFavorite;
        product.favoriteIcon = product.isFavorite ? 'utility:favorite' : 'utility:favorite_border';
    }
}

    // Handle Search Input Change
    handleSearchChange(event) {
        this.searchTerm = event.target.value; // Update search term

        // Filter products based on search term
        this.filteredProducts = this.products.filter((product) =>
            product.Name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

        this.noResults = this.filteredProducts.length === 0; // Show no results if no match
        this.productCount = this.filteredProducts.length; // Update product count
    }

    // Handle Sort Change
    handleSortChange(event) {
        this.selectedSort = event.target.value;
        this.sortProducts();
    }

    // Sort the products based on the selected sort option
    sortProducts() {
        switch (this.selectedSort) {
            case 'low-to-high':
                this.filteredProducts = this.filteredProducts.sort((a, b) => a.Discounted_Price__c - b.Discounted_Price__c);
                break;
            case 'high-to-low':
                this.filteredProducts = this.filteredProducts.sort((a, b) => b.Discounted_Price__c - a.Discounted_Price__c);
                break;
            case 'newest':
                this.filteredProducts = this.filteredProducts.sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate));
                break;
            default:
                this.filteredProducts = this.products; // Default sorting
                break;
        }
    }

    // Reset Filters
    resetFilters() {
        this.filteredProducts = [...this.products]; // Reset filters
        this.searchTerm = ''; // Clear search
        this.selectedSort = 'bestmatches'; // Reset sort option
        this.noResults = false; // Reset no results flag
    }


    hoverImage(event) {
    try {
        const mainImage = event.target.dataset.mainImage;
        const hoverImage = event.target.dataset.hoverImage;
        event.target.src = hoverImage || mainImage; // Fallback to main image
    } catch (error) {
        console.error("Error in hoverImage:", error);
    }
}
    @track isFavFilterOpen = false;
    @track selectedProductId = null;
  openFavFilter(event) {
      const productId = event.target.closest('button')?.dataset?.id;
        if (!productId) {
            console.error('Product ID not found.');
            return;
        }
        console.log(`Opening favorites flyout for Product ID: ${productId}`);
        this.selectedProductId = productId;
        this.isFavFilterOpen = true;
        console.log('isFilterOpen in parent:', this.isFavFilterOpen);
  }
   closeFavFilter() {
         console.log('Closing favorites flyout.');
        this.isFavFilterOpen = false;
        this.selectedProductId = null;
    }

    handleFilterClose() {
    this.isFavFilterOpen = true; // Force reset
    setTimeout(() => {
        this.isFavFilterOpen = false;
    }, 0);
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

    handleProductClick(event) {
        const productId = event.currentTarget.dataset.id;
        if (!productId) {
            console.error('Product ID is missing.');
            return;
        }

        // Navigate to the product detail page
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/product?productId=${productId}`
            }
        });
    }


}