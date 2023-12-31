//imports

const express = require("express");
const admin_route = express();
const path = require("path")
const adminController = require("../controllers/adminController")
const checkoutController = require('../controllers/checkoutController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
const transactionController = require('../controllers/transactionController')
const multer = require("multer")
const session = require("express-session")
const config = require("../config/config")
const auth = require("../middleware/adminAuth")
const fs = require('fs');
const discountController= require('../controllers/discountController')
const reviewController =require('../controllers/reviewController')
const excelController=require('../controllers/excelController')


//session setup
admin_route.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
}));



//application middlewares

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')
admin_route.use(express.static('public'))
admin_route.use('assets/css', express.static(__dirname + 'public'))
admin_route.use("/public", express.static("public", { "extensions": ["js"] }));

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));


//  storage for category images
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/assets/images/categoryImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  }
});


const categoryUpload = multer({ storage: categoryStorage });






//  storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/assets/images/productImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});


const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);


//multer middleware for banner
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/assets/images/bannerImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  }
});

const bannerUpload = multer({ storage: bannerStorage });

module.exports = bannerUpload;


//GET REQUESTS
//admin
admin_route.get('/', adminController.loadAdminLogin)
admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", auth.isLogin, adminController.logout)
admin_route.get("/userlist", auth.isLogin, adminController.loadUserlist)
admin_route.get('/block-user', auth.isLogin, adminController.blockUser)

//product
admin_route.get("/addproduct", auth.isLogin, productController.loadaddProduct)
admin_route.get("/productlist", auth.isLogin, productController.loadProductList)
admin_route.get('/edit-product', auth.isLogin, productController.loadEditProduct)
admin_route.get('/show-product', auth.isLogin, productController.loadShowProduct)
admin_route.get('/unlist-product', auth.isLogin, productController.unlistProduct)
admin_route.get('/productimagedelete', auth.isLogin, productController.deleteProductImage)
//category
admin_route.get("/addcategory", auth.isLogin, categoryController.loadaddCategory)
admin_route.get("/categorylist", auth.isLogin, categoryController.loadCategorylist)
admin_route.get('/edit-category', auth.isLogin, categoryController.loadEditCategory)
admin_route.get('/delete-category', auth.isLogin, categoryController.deleteCategory)
admin_route.get('/unlist-category', auth.isLogin, categoryController.unlistCategory)
//orders
admin_route.get('/orderlist', auth.isLogin, checkoutController.orderList)
admin_route.get('/orderdetails', auth.isLogin, checkoutController.orderDetails)
admin_route.get('/orderstatus', auth.isLogin, checkoutController.setStatus)


//coupons
admin_route.get('/getAddCoupon',auth.isLogin,couponController.getCoupon)
admin_route.get('/viewCoupon',auth.isLogin,couponController.viewCoupon)
admin_route.get('/viewCouponUsers/:couponId', auth.isLogin,couponController.viewCouponUsedUsers)
admin_route.get('/couponstatus', auth.isLogin, couponController.unlistCoupon)
admin_route.get('/editCoupon',auth.isLogin,couponController.getEditCoupon)


//banner
admin_route.get('/banner-add',auth.isLogin,bannerController.loadAddBanner);
admin_route.get('/banner-list',auth.isLogin,bannerController.loadBannerList);
admin_route.get('/banner-edit',auth.isLogin,bannerController.loadEditBanner);
admin_route.get('/unlist-banner',auth.isLogin,bannerController.unlistBanner);


//salereport

admin_route.get('/sales-report',auth.isLogin,adminController.getSalesReport)
admin_route.get('/excelsalesreport',auth.isLogin,excelController.getExcelSalesReport)

//transaction
admin_route.get('/transactions', auth.isLogin,transactionController.loadTransaction)

//offers
admin_route.get('/offer-list',auth.isLogin,discountController.loadOfferList)
admin_route.get('/offer-add',auth.isLogin,discountController.loadAddOffer)
admin_route.get('/offer-edit',auth.isLogin,discountController.loadEditOffer)
admin_route.get('/unlist-offer',auth.isLogin,discountController.unlistOffer)

//reviews
admin_route.get('/reviews-list', auth.isLogin,reviewController.loadReviewlist )
admin_route.get('/reviews-delete',auth.isLogin, reviewController.adminDeleteReview)




//POST REQUESTS
//category
admin_route.post('/addcategory', auth.isLogin, categoryUpload.single('categoryImage'), categoryController.insertCategory);
admin_route.post('/edit-category', auth.isLogin, categoryUpload.single('categoryImage'), categoryController.editCategory);


//product

admin_route.post('/', adminController.verifyLogin)
admin_route.post('/addproduct', auth.isLogin, uploadFields, productController.insertProduct);
admin_route.post('/edit-product', auth.isLogin, uploadFields, productController.editProduct);

//coupon
admin_route.post('/addCoupon',couponController.postAddCoupon)
admin_route.post('/editCoupon',auth.isLogin,couponController.editCoupon)

//banner
admin_route.post('/banner-add', auth.isLogin, bannerUpload.single('image'), bannerController.addBanner);
admin_route.post('/banner-edit', auth.isLogin, bannerUpload.single('image'), bannerController.editBanner);

//offer
admin_route.post('/offer-add',auth.isLogin,discountController.addOffer)
admin_route.post('/offer-edit',auth.isLogin,discountController.editOffer)







admin_route.get('*', (req, res) => {
  res.render('401-notAuthorized')
})


module.exports = admin_route;