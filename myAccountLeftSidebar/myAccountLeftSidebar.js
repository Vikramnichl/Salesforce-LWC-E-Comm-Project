// // import { LightningElement } from 'lwc';
// // export default class MyAccountLeftSidebar extends LightningElement {

// // }

// import { LightningElement, track, api } from 'lwc';
// import { NavigationMixin } from "lightning/navigation";
// // import getLoggedInUserDetails from '@salesforce/apex/MyAccountController.getLoggedInUserDetails';
// // import accountType from '@salesforce/apex/B2BUtils.getAccountTypeLWC';
// // import profileEdit from '@salesforce/resourceUrl/Profile_Edit';
// // import basePath from "@salesforce/community/basePath";
// // import getUserTypeLWC from '@salesforce/apex/B2BUtils.getUserTypeLWC';

// export default class MyAccountLeftSidebar extends NavigationMixin(LightningElement) {
//     user;
//     contact;
//     isAdmin;
//     isWholesale = false;
//     @api selectedMenuItem;
//     userTypeCA = false;

//     connectedCallback() {
//         this.profileEditIcon = profileEdit;
//         // this.getAccountType();
//         this.loadUserDetails();
//         this.getUserAccountType();
        
//         // Load selected menu from localStorage if present
//         const savedMenuItem = window.localStorage.getItem('selectedMenuItem');
//         this.selectedMenuItem = savedMenuItem ? savedMenuItem : '';
//     }

//     get myAccountClass() {
//         return this.selectedMenuItem === 'myAccount' ? 'selected' : '';
//     }

//     get ordersClass() {
//         return this.selectedMenuItem === 'orders' ? 'selected' : '';
//     }

//     get InvoiceClass() {
//         return this.selectedMenuItem === 'invoices' ? 'selected' : '';
//     }

//      get myFavorite() {
//         return this.selectedMenuItem === 'My Favorites' ? 'selected' : '';
//     }


//     get ordersummary() {
//         return this.selectedMenuItem === 'ordersummary' ? 'selected' : '';
//     }

//     handleMenuSelect(event) {
//         this.selectedMenuItem = event.detail.value;  
//         console.log('Selected Menu Item:', this.selectedMenuItem);
//         window.localStorage.setItem('selectedMenuItem', this.selectedMenuItem);
//     }

//     handleSignOut() {
//         const sitePrefix = basePath.replace(
//             /\/s$/i, ""
//         );
//         window.location.href = sitePrefix + "/secur/logout.jsp";
//     }

//     // Update selectedMenuItem and save to localStorage before navigation
//     updateMenuAndNavigate(menuItem, url) {
//         this.selectedMenuItem = menuItem;
//        window.localStorage.setItem('selectedMenuItem', menuItem); // Save selected menu to localStorage

//         // Perform the navigation
//         this[NavigationMixin.Navigate]({
//             type: 'standard__webPage',
//             attributes: {
//                 url: url
//             }
//         });
//     }

//     navigateToOrdersummary() {
//         if (this.selectedMenuItem !== 'ordersummary') {
//             this.updateMenuAndNavigate('ordersummary', '/ordersummary');
//         }
//     }
 
//     navigateToAccount() {
//         if (this.selectedMenuItem !== 'myAccount') {
//             this.updateMenuAndNavigate('myAccount', '/myaccount');
//         }
//     }
 
//     navigateToInvoices() {
//         if (this.selectedMenuItem !== 'invoices') {
//             this.updateMenuAndNavigate('invoices', '/invoices');
//         }
//     }

// // method to navigate
//     navigateToFavorite(){
//          if (this.selectedMenuItem !== 'favorite') {
//             this.updateMenuAndNavigate('favorite', '/my-favorites');
//         }
//     }
 
//     navigateToOrders() {
//         if (this.selectedMenuItem !== 'orders') {
//             this.updateMenuAndNavigate('orders', '/orders');
//         }
//     }

//     // getAccountType() {
//     //     accountType()
//     //         .then(result => {
//     //             if (result === 'Wholesale') {
//     //                 this.isWholesale = true;
//     //             }
//     //         })
//     //         .catch(error => {
//     //             console.error('Error:', error);
//     //         });
//     // }

//     getUserAccountType() {
//         getUserTypeLWC()
//             .then(result => {
//                 if (result[0] === 'Wholesale') {
//                     this.isWholesale = true;
//                 }
//                 if(result[1] === 'false'){
//                     this.userTypeCA = false;
//                 }
//                 else if(result[1] === 'true'){
//                     this.userTypeCA = true;
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//     }

//     // Load user details using Apex
//     loadUserDetails() {
//         getLoggedInUserDetails()
//             .then(result => {
//                 if (result) {
//                     this.user = result.user;
//                     this.contact = result.contact;
//                     this.isAdmin = false;
//                 } else {
//                     this.isAdmin = true;
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching user details:', error);
//             });
//     }
// }

import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// import profileEdit from '@salesforce/resourceUrl/Profile_Edit';

export default class MyAccountLeftSidebar extends NavigationMixin(LightningElement) {
  @api selectedMenuItem;
  isWholesale = true;
  userTypeCA = false;

 connectedCallback() {
    const path = window.location.pathname;
    this.selectedMenuItem = path.includes('favorite-overview') ? 'ordersummary' :
                            path.includes('category') ? 'myAccount' :
                            path.includes('create-favorite') ? 'invoices' :
                            path.includes('my-favorites') ? 'favorite' :
                            path.includes('edit-favorites') ? 'orders' : '';
}

  get myAccountClass() {
    return this.selectedMenuItem === 'myAccount' ? 'selected' : '';
  }

  get ordersClass() {
    return this.selectedMenuItem === 'orders' ? 'selected' : '';
  }

  get InvoiceClass() {
    return this.selectedMenuItem === 'invoices' ? 'selected' : '';
  }

  get myFavorite() {
    return this.selectedMenuItem === 'favorite' ? 'selected' : '';
  }

  get ordersummary() {
    return this.selectedMenuItem === 'ordersummary' ? 'selected' : '';
  }

  updateMenuAndNavigate(menuItem, url) {
    this.selectedMenuItem = menuItem;
    window.localStorage.setItem('selectedMenuItem', menuItem);

    this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: { url: url },
    });
  }

  navigateToOrdersummary() {
    if (this.selectedMenuItem !== 'ordersummary') {
      this.updateMenuAndNavigate('ordersummary', '/favorite-overview');
    }
  }

  navigateToAccount() {
    if (this.selectedMenuItem !== 'myAccount') {
      this.updateMenuAndNavigate('myAccount', '/category');
    }
  }

  navigateToInvoices() {
    if (this.selectedMenuItem !== 'invoices') {
      this.updateMenuAndNavigate('invoices', '/create-favorite');
    }
  }

  navigateToFavorite() {
    if (this.selectedMenuItem !== 'favorite') {
      this.updateMenuAndNavigate('favorite', '/my-favorites');
    }
  }

  navigateToOrders() {
    if (this.selectedMenuItem !== 'orders') {
      this.updateMenuAndNavigate('orders', '/edit-favorites');
    }
  }

  handleSignOut() {
    const sitePrefix = basePath.replace(/\/s$/i, '');
    window.location.href = `${sitePrefix}/secur/logout.jsp`;
  }
}