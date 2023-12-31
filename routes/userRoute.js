//imports

const express = require("express");
const user_route = express();
const path = require("path")
const userController = require("../controllers/userController")
const multer = require("multer")
const session = require("express-session")
const config = require("../config/config")
const auth = require("../middleware/auth")
const addressController = require('../controllers/addressController')
const cartController = require('../controllers/cartController')
const checkoutController = require('../controllers/checkoutController')
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController')
const couponController = require('../controllers/couponController')
const pdfController = require('../controllers/pdfController')
const reviewController =require('../controllers/reviewController')

//session setup
user_route.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
}));



//application middlewares

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')
user_route.use(express.static('public'))
user_route.use('assets/css', express.static(__dirname + 'public'))
user_route.use("/public", express.static("public", { "extensions": ["js"] }));

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));


//file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/assets/images/userImages'))
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname
    cb(null, name);
  }

})

const upload = multer({ storage: storage });


//GET REQUESTS
user_route.get('/register', userController.loadRegister);

user_route.get('/',auth.isLogout, userController.loadHome)
user_route.get('/home', auth.isLogin, userController.loadHome)

user_route.get('/otp-page', userController.loadOTPpage)
user_route.get('/login',auth.isLogout, userController.loginLoad)
user_route.get('/userProfile', auth.isLogin, userController.loadUserProfile)
user_route.get('/userDashboard', auth.isLogin, userController.loadUserDashboard)
user_route.get('/logout', auth.isLogin, userController.userLogout)
user_route.get('/forgotpassword', userController.forgotPassword)
user_route.get('/edituser', auth.isLogin, userController.loadEditUser)
user_route.get('/changePassword', userController.loadUserPasswordReset)
user_route.get('/delete-user', auth.isLogin, userController.deleteUser)
//address
user_route.get('/address', auth.isLogin, addressController.loadAddress)
user_route.get('/addaddress', auth.isLogin, addressController.loadAddAddress)
user_route.get('/editaddress', auth.isLogin, addressController.loadEditAddress)
user_route.get('/deleteaddress', auth.isLogin, addressController.deleteAddress)
//product
user_route.get('/productlist', productController.productList)
user_route.get('/viewproduct/:productId', productController.productView)



//cart
user_route.get('/cart', auth.isLogin, cartController.getcart)


//wishlist
user_route.get('/wishlist', auth.isLogin,wishlistController.getWishlist)
user_route.get('/addToWishlist/:productId', wishlistController.addToWishlist)
user_route.get('/addToCartFromWishlist/:productId', wishlistController.addToCartFromWishlist)
user_route.delete("/removeFromWishlist", wishlistController.removeFromWishlist);


//checkout
user_route.get('/checkout', auth.isLogin, checkoutController.getCheckout)
user_route.get('/orderPlaced', auth.isLogin, checkoutController.orderPlaced)
user_route.get('/cancelOrder/:orderId',auth.isLogin,checkoutController.cancelOrder)
user_route.get('/returnOrder/:orderId',auth.isLogin,checkoutController.returnOrder)

//blogpage
user_route.get('/blog', userController.loadBlog)


//contact
user_route.get('/contact', userController.loadContact)


//coupon
user_route.get('/availableCoupons',auth.isLogin, couponController.getAvailableCoupons)

//Invoice
user_route.get('/generate-invoice/:orderId',auth.isLogin,pdfController.generateInvoice)

//wallet
user_route.get('/wallet',auth.isLogin,userController.loadWallet)

//REVIEW
user_route.post('/postReview',auth.isLogin,reviewController.postReview)
user_route.get('/viewratings', auth.isLogin,reviewController.viewrating)
user_route.get('/deleteReview',auth.isLogin, reviewController.deleteReview)




//POST REQUESTS
//user
user_route.post('/register', upload.single('image'), userController.insertUser)
user_route.post('/login', userController.verifyLogin)
user_route.post('/otpVerification', userController.OTPVerification)
user_route.post('/forgotpassword', userController.forgotPasswordOTP)
user_route.post('/userforgotpassword', userController.userforgotPasswordOTP)
user_route.post('/passwordotpVerification', userController.passwordOTPVerification)
user_route.post('/resetpassword', userController.resetPassword)
user_route.post('/userResetpassword', userController.userResetPassword)
user_route.post('/edituser', auth.isLogin, upload.single('image'), userController.updateProfile)
user_route.get('/resendOtp', userController.resendOTP);
//address
user_route.post('/addAddress', auth.isLogin, addressController.postAddAddress);
user_route.post('/editaddress', auth.isLogin, addressController.editAddress);
//cart
user_route.post('/add-to-cart/:productId', cartController.addtocart);
user_route.delete('/removeCartItem', auth.isLogin, cartController.deleteCart)
user_route.put('/updateCart',cartController.updateCartCount)
user_route.put('/updateQuantity/:productId',cartController.updateQuantity)

//checkout
user_route.post('/razorpayOrder',auth.isLogin,checkoutController.razorpayOrder)
user_route.post('/cashondelivery',auth.isLogin,checkoutController.cashOnDelivery)
user_route.post('/walletpayment',auth.isLogin,checkoutController.walletPayment)
user_route.post('/updatePaymentStatus',auth.isLogin,checkoutController.updatePaymentStatus)
//orders
user_route.get('/userorderlist', auth.isLogin, checkoutController.userOrderlist)
user_route.get('/userorderdetails', auth.isLogin, checkoutController.userOrderDetails)
//coupon
user_route.post('/applyCoupon',auth.isLogin,checkoutController.applyCoupon)











module.exports = user_route;