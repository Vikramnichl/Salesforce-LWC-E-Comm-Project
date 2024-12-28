import { LightningElement ,track,api,wire} from 'lwc';
export default class CustomThemeLayout extends LightningElement {

//   brandLogo=  'https://yeti--b2bdev--c.sandbox.vf.force.com/resource/1731113597000/brandLogo';
profileImage=  'data:image/png;base64,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'
 @track isVisible = false;

  onMyAccountClick() {
        this.isVisible = !this.isVisible;  // Toggle visibility
    }

    // Close flyout
    onMyAccountClose() {
        this.isVisible = false;
    }
   

}

// import { LightningElement, api, track, wire } from 'lwc';
// import Cart_Image from '@salesforce/resourceUrl/cartImage';
// import Profile_Image from '@salesforce/resourceUrl/profileImage';
// import Country_Flag from '@salesforce/resourceUrl/usaFlag';
// import Search_Icon from '@salesforce/resourceUrl/searchIcon';
// import Banner_Image from '@salesforce/resourceUrl/bannerImage';
// import Yeti_Logo from '@salesforce/resourceUrl/brandLogo';
// import Hamburger_Menu from '@salesforce/resourceUrl/menuIcons';
// import Outdoor_Image from '@salesforce/resourceUrl/outdoorImage';
// import getProductHierarchy from '@salesforce/apex/ProductHierarchyController.getProductHierarchy';
// import { NavigationMixin } from 'lightning/navigation';
// import basePath from "@salesforce/community/basePath";
// import bagicon from '@salesforce/resourceUrl/bagicon';
// import getCurrentUserBuyerGroupName from '@salesforce/apex/ProductHierarchyController.getCurrentUserBuyerGroupName';
// import getCurrentUserBuyerGroupInfo from '@salesforce/apex/PDPController.getCurrentUserBuyerGroupInfo';
// import getCartCount from '@salesforce/apex/B2BCartItemController.getCartCount';
// import getCartCountImperative from '@salesforce/apex/B2BCartItemController.getCartCountImperative';
// // import { subscribe,unsubscribe,MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
// // import recordSelectedId from '@salesforce/messageChannel/Counting_Update__c';
// import global_search_icon from '@salesforce/resourceUrl/global_search';
// import { subscribe, MessageContext, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
// import pdpToMyBag    from '@salesforce/messageChannel/pdpToMyBagMessageChannel__c';
// import cartRemovalToMyBag    from '@salesforce/messageChannel/cartRemovalToMyBagMessageChannel__c';
// import accountType from '@salesforce/apex/B2BUtils.getAccountTypeLWC';
// import customizeToMyBag    from '@salesforce/messageChannel/customizeToMyBagMessageChannel__c';
// import customizeDrinkwareToMyBag    from '@salesforce/messageChannel/customizeDrinkwareToMyBagMessageChannel__c';
// import emptyToMyBag    from '@salesforce/messageChannel/emptyCartToMyBagMessageChannel__c';
// import customizeDrinkwareFromPDPToMyBag    from '@salesforce/messageChannel/customizeDrinkwareFromPDPToMyBagMessageChannel__c';
// import hamburger_Image from '@salesforce/resourceUrl/hamburger';
// import logImpersonationActivity from "@salesforce/apex/CSRFlowHandler.logImpersonationActivity";

// export default class CustomThemeLayout extends NavigationMixin(LightningElement) {
// 	cartImage = Cart_Image ;
// 	profileImage = Profile_Image;
// 	usaFlag = Country_Flag;
// 	searchIcon = Search_Icon;
// 	bannerImage = Banner_Image;
// 	brandLogo = Yeti_Logo;
// 	menuIcons = Hamburger_Menu;
//     outdoorImage = Outdoor_Image;
//     bagIcon;
//     @track productCount;
//     subscription =null;
    

//     @track buyerGroups = [];
//     @track categories = [];
//     @track error;
//     @api buyerGroupId;
//     @api CategoryId;
// 	@api isVisible = false;
//     @track isSlideOut = false;
// 	@track isShopByColour = false;
//     @track searchModal = false;
//     @track isWholesale = false;
//     globalSearchIcon = global_search_icon;
//     @api isHBVisible = false;
//     @track isHBSlideOut = false;
//     hamburgerImage = hamburger_Image;
//     @track isHBClick = false;

// 	get sidebarClass() {
//         if (!this.isSlideOut) {
//             return this.isVisible ? 'slide-in' : 'slide-out';
//         } else {
//             this.isSlideOut = false;
//             return 'slide-out'
//         }
//     }   

//      @wire(MessageContext)
//      messageContext;

//     connectedCallback() {
//         this.bagIcon = bagicon;
//         window.addEventListener('load', this.getBagItemCount.bind(this));
//         this.subscribeToMessageChannel();
//         this.getAccountType();
//     }

//     constructor(){
//         super();
//         this.getBagItemCount();
//     }

//     subscribeToMessageChannel(){
//         this.subscription = subscribe(
//             this.messageContext,pdpToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//         this.subscription = subscribe(
//             this.messageContext,cartRemovalToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//         this.subscription = subscribe(
//             this.messageContext,customizeToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//         this.subscription = subscribe(
//             this.messageContext,customizeDrinkwareToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//         this.subscription = subscribe(
//             this.messageContext,emptyToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//         this.subscription = subscribe(
//             this.messageContext,customizeDrinkwareFromPDPToMyBag,
//             (payload) => this.handleMessage(payload),
//             { scope: APPLICATION_SCOPE }
//         );
//     }
    
//     handleMessage(message){
        
//         let prodqty = message.totalQuanityInCart>0?message.totalQuanityInCart:0;
//         this.productCount = prodqty;
//         //this.recordId = message.recordId;
//     }

//     disconnectedCallback() {
//         this.unsubscribeFromMessageChannel(); // Unsubscribe when component is destroyed
//     }

//     unsubscribeFromMessageChannel() {
//         if (this.subscription) {
//             unsubscribe(this.subscription); // Properly unsubscribe
//             this.subscription = null;
//         }
//     }
    
// 	onMyAccountClick() {
//         this.isVisible = true;
//         if(this.isHBVisible === true)
//         {
//             this.onMyHBClose();     
//             this.isVisible = true;
//         }
//         else
//         {
//             this.isVisible = true;
//         }
//     }

//     onhamburgerClick() {
//         this.isHBVisible = true;
//         this.isHBClick = true;
//     }
//     get sidebarHBClass() {
//         if (!this.isHBSlideOut) {
//             return this.isHBVisible ? 'slide-in' : 'slide-out';
//         } else {
//             this.isHBSlideOut = false;
//             return 'slide-out'
//         }
//     }
//     onMyHBClose() {
//         this.isHBSlideOut = true;
//         this.isHBClick = false;
//         setTimeout(() => {
//             this.dispatchEvent(new CustomEvent('closesidebar'));
//             this.isHBVisible = false;
//         }, 500);
//     }
//     handleFormClick(event){
//         if(this.isHBVisible === true)
//         {
//             this.onMyHBClose();     
//         }
//         const target = event.target.textContent;
//         if (target === 'Information and Forms') {
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__webPage',
//                 attributes: {
//                     url: '/infoandform'
//                 }
//             });
//         }
//     }

//     onCartClick()
//     {
//         if(this.isHBVisible === true)
//         {
//             this.onMyHBClose();     
//         }
//     }

// 	onMyAccountClose() {
//         this.isSlideOut = true;
//         setTimeout(() => {
//             this.dispatchEvent(new CustomEvent('closesidebar'));
//             this.isVisible = false;
//         }, 500);
//     }

//     handleSignOut() {
//         const type = "Logout"; // Type of impersonation activity
//         const opportunityId = null; // Opportunity ID if applicable, otherwise null

//         logImpersonationActivity({ type: type, opportunity: opportunityId || null }) 
//             .then((sessionId) => {
//                 console.log("Session ID returned:", sessionId);
//                 console.log("Impersonation activity logged successfully.");
//                // Redirect to the logout page after logging the activity
//                 const sitePrefix = basePath.replace(
//                   /\/s$/i, ""
//                 );
//                  window.location.href = sitePrefix + "/secur/logout.jsp";
//             })
//             .catch((error) => {
//                 console.error("Error logging impersonation activity:", error);
//                // Proceed with logout even if logging fails
//                 const sitePrefix = basePath.replace(
//                   /\/s$/i, ""
//                 );
//                  window.location.href = sitePrefix + "/secur/logout.jsp";
//             });
//       }
    
//   /*
//     handleSignOut() {

//         const type = "Logout"; // Type of impersonation activity
//         const opportunityId = null; // Opportunity ID if applicable, otherwise null
    
//         console.log("Attempting to log impersonation activity with type:", type, "and opportunityId:", opportunityId);
    
//         logImpersonationActivity({ type, opportunityId })
//             .then((sessionId) => {
//                 console.log("Session ID returned:", sessionId);
//                 console.log("Impersonation activity logged successfully.");
    
//                 // Redirect to the logout page after logging the activity
//                 // const sitePrefix = basePath.replace(/\/s$/i, "");
//                 // window.location.href = sitePrefix + "/secur/logout.jsp";
//             })
//             .catch((error) => {
//                 console.error("Error logging impersonation activity:", error);
    
//                 // Log additional details about the error to help debug
//                     console.error("Error details:", error.message); 
//                     console.error("Error stack trace:", error.stack);
                
    
//                 // Proceed with logout even if logging fails
//                 // const sitePrefix = basePath.replace(/\/s$/i, "");
//                 // window.location.href = sitePrefix + "/secur/logout.jsp";
//             });
//     }

//     /* 
//     handleSignOut() {
//         const sitePrefix = basePath.replace(
//             /\/s$/i, ""
//         );
//         window.location.href = sitePrefix + "/secur/logout.jsp";
//     }
//      */
//     // Navigate to the category detail page to fetch the categories' hierarchy
//     @wire(getProductHierarchy)
//     wiredCategories({ error, data }) {
//         if (data) {
//             this.categories = data.map(category => {
//                 const shouldShow = this.shouldShowNavSpotlight(category);
//                 const isShopByColorCategory = category.categoryName === 'SHOP BY COLOR';
//                 const isDrinkwareCategory = category.categoryName === 'DRINKWARE';

//                 // For Shop By Color, set the productCategoryId to null
//                 const productCategoryId = isShopByColorCategory ? null : category.categoryId;

//                 // Dynamically match subCategoryName for GoBox and YETI products
//                 const subCategories = category.subCategories.map(subCategory => {
//                     let updatedSubCategoryName = subCategory.subCategoryName;

//                     // Use regex to match any subCategoryName that contains 'GoBox' in any part of the name
//                     if (/\bgobox\b/i.test(subCategory.subCategoryName)) {
//                          updatedSubCategoryName = subCategory.subCategoryName.replace(/gobox/i, 'GoBox'); // Update for GoBox pattern found anywhere in the name
//                     } 
//                     // Use regex to match any subCategoryName that contains 'Yeti' in any part of the name
//                     else if (/\byeti\b/i.test(subCategory.subCategoryName)) {
//                         updatedSubCategoryName = subCategory.subCategoryName.replace(/yeti/i, 'YETI');
//                     }

//                     return {
//                         ...subCategory,
//                         subCategoryName: updatedSubCategoryName,
//                         products: subCategory.products.map(product => ({
//                             ...product,
//                             Name: product.Name
//                         }))
//                     };
//                 });

//                 return {
//                     ...category,
//                     subCategories,
//                     productCategoryId,
//                     showSpotlight: shouldShow,
//                     isShopByColorCategory: isShopByColorCategory,
//                     isDrinkwareCategory: isDrinkwareCategory
//                 };
//             });
//         } else if (error) {
//             this.error = error;
//         }
//     }

//     getAccountType(){
//         accountType()
//             .then(result => {
//                 if(result == 'Wholesale'){
//                     this.isWholesale = true;
//                 }
//             })
//             .catch(error => {
//                 console.error('Error: ',error);
//             });
//     }

//      // to fetch the buyer groups based on loggedIn User
//     @wire(getCurrentUserBuyerGroupInfo)
//     wiredBuyerGroupsName({ error, data }) {
//         if (data) {
//              if (data.BuyerGroup.Name.includes('Wholesale - CA')  || data.BuyerGroup.Name.includes('Corporate Sales - CA')) {
//                 this.isShopByColour = true;
//             } else {
//                 this.isShopByColour = false;
//             }
//         } else if (error) {
//             this.error = error;
//         }
//     }
//     // to fetch the buyer groups based on loggedIn User
//     @wire(getCurrentUserBuyerGroupName)
//     wiredBuyerGroups({ error, data }) {
//         if (data) {
//             this.buyerGroups = data;

//             this.updateCategoriesBasedOnBuyerGroups();
//         } else if (error) {
//             this.error = error;
//         }
//     }
//     @wire(getCartCount)
//     wiredGetCartCount({ error, data }) {
//         if (data) {
//             let prodqty = data >0?data:0;
//             this.productCount = prodqty;
//         }
//         else if (error){
//             this.productCount = 0;
//             console.error('Error in wiredGetCartCount -> getCartCount ->',error);
            
//         }
//     }
    
//     getBagItemCount(){
//         getCartCountImperative().then(data=>{
//             let prodqty = data >0?data:0;
//             this.productCount = prodqty;
//             if(data = undefined){
//                 this.productCount = 0;
//             }
//         }).catch(err=>{
//             this.productCount = 0;
//             console.error('Error getting cart count', err);
//         })
//     }


//     shouldShowNavSpotlight(category) {
//         // Get the buyer group IDs that the current user is part of
//         const userBuyerGroupIds = this.buyerGroups;
        
//         // Determine if the spotlight should be shown based on category and buyer group
//         const spotlightEnabledCategories = ['NEW ARRIVALS', 'SHOP BY COLOR', 'COOLERS', 'BAGS', 'CARGO', 'OUTDOOR LIVING', 'APPAREL'];
        
//         // Check if the category should show spotlight based on its buyer group
//         const showSpotlight = spotlightEnabledCategories.includes(category.categoryName) && userBuyerGroupIds.includes(category.buyerGroup);
        
//         return showSpotlight;
//     }

//     updateCategoriesBasedOnBuyerGroups() {
//         if (this.categories && this.buyerGroups) {
//             this.categories = this.categories.map(category => {
//                 return {
//                     ...category,
//                     showSpotlight: this.shouldShowNavSpotlight(category)
//                 };
//             });
//         }
//     }
 
//     // Navigate to the category detail page
//     handleCategoryClick(event) {
//         const categoryId = event.target.dataset.id; 
//         const categoryName = event.currentTarget.dataset.name;
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__recordPage',
//                 attributes: {
//                     recordId: categoryId,
//                     objectApiName: 'ProductCategory',
//                     actionName: 'view'
//                 },
//                 state: {
//                     recordId: categoryId,
//                     name: 'ALL '+categoryName.toUpperCase()
//                 }
//             });
//     }

//     handleBlockClick(event) {
//         event.preventDefault();
//         event.stopPropagation();
//     }
 
//     // Navigate to the subcategory detail page
//     handleSubCategoryClick(event) {
//         const subCategoryId = event.target.dataset.id;
//         const subCategoryName = event.target.dataset.name;
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__recordPage',
//                 attributes: {
//                     recordId: subCategoryId,
//                     objectApiName: 'ProductCategory',

//                     actionName: 'view'
//                 },
//                 state: {
//                     recordId: subCategoryId,
//                     name: subCategoryName.toUpperCase()
//                 }
//             });
//     }
 
//     // Navigate to the product detail page
//     handleProductClick(event) {
//         const productId = event.target.dataset.id;
//         const productName = event.target.dataset.name;
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__recordPage',
//                 attributes: {
//                     recordId: productId,
//                     objectApiName: 'ProductCategory',
//                     actionName: 'view'
//                 },
//                 state: {
//                     recordId: productId,
//                     name: productName.toUpperCase()
//                 }
//             });
//     }

//     @track showDropdown = false;
//     hideTimeout;

//     handleMouseOver(){
//         clearTimeout(this.hideTimeout);
//         this.showDropdown=true;
//     }

//     handleMouseOut(){
//         this.hideTimeout = setTimeout(()=> {
//             this.showDropdown=false;
//         }, 300);
//     }

    
//     handleMegamenuClick(event){
//         if(event.target.tagName === 'A'){
//             event.preventDefault();
//         }
//         window.location.reload();
//     }

//     updateItemsCount(e){
//         //this.productCount = e.detail;
//     }
//     handleRedirect(event) {
//         const target = event.target.textContent;
//         if (target === 'My Account') {
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__webPage',
//                 attributes: {
//                     url: '/ordersummary'
//                 }
//             });
//         }
//         if (target === 'My Orders') {
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__webPage',
//                 attributes: {
//                     url: '/orders'
//                 }
//             });
//         }
//         if (target === 'My Invoices') {
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__webPage',
//                 attributes: {
//                     url: '/invoices'
//                 }
//             });
//         }
//         if (target === 'My Favorites') {
//             this[NavigationMixin.Navigate]({
//                 type: 'standard__webPage',
//                 attributes: {
//                     url: '/my-favorites'
//                 }
//             });
//         }
//         // handle other redirections like Orders, Favorites, etc.


//         //Close the Slideout
//         this.onMyAccountClose();
//     }

//     // Handle Global search state from custom theme layout
//     openSearchModal(){
//         if(this.isHBVisible === true)
//         {
//             this.onMyHBClose();     
//         }
//         this.searchModal = true;
//     }
 
//     closeSearchModal(){
//         this.searchModal = false;
//     }
// }