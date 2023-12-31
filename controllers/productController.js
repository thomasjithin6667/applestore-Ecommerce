//=====================================================================================================================================//
//PRODUCT CONTROLLER
//=====================================================================================================================================//
//module imports

const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel')
const sharp = require('sharp')
const path = require("path");
const Review=require('../models/reviewModel')

//=====================================================================================================================================//
//toggle function to list and unlist product from admin side
const unlistProduct = async (req, res) => {
  try {
    const admin = req.session.adminData
    const id = req.query.id;


    const product = await Product.findById(id);



    product.list = !product.list;


    await product.save();

    res.redirect('/admin/productlist');
  } catch (error) {
    console.log(error.message);


  }
};

//=====================================================================================================================================//
//function to load add product page in admin side
const loadaddProduct = async (req, res) => {
  try {
    const admin = req.session.adminData
    const categoriesData = await Category.find({})

    res.render('product-add', { admin: admin, category: categoriesData })
  } catch (error) {
    console.log(error.message)
  }
};

//=====================================================================================================================================//
//function to insert product from admin side
const insertProduct = async (req, res) => {
  try {
    const categoriesData = await Category.find({});
    const admin = req.session.adminData;

    const existingProduct = await Product.findOne({ name: req.body.name });

    if (existingProduct) {
      return res.render('product-add', {
        message: 'Product already exists',
        admin: admin,
        category: categoriesData,
      });
    }

    const newProduct = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      quantity: req.body.quantity,
      battery: req.body.battery,
      productColor: req.body.productColor,
      ram: req.body.ram,
      rom: req.body.rom,
      expandable: req.body.expandable,
      frontCam: req.body.frontCam,
      rearCam: req.body.rearCam,
      processor: req.body.processor,
      discription:req.body.discription
    };

    if (req.files) {
      newProduct.productImages = [];

      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;

        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];

          const image = sharp(file.path);

          const metadata = await image.metadata();
          const width = metadata.width;
          const height = metadata.height;

          const aspectRatio = width / height;

          const targetSize = { width: 679, height: 679 };

          if (width > targetSize.width || height > targetSize.height) {
            image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
          } else {
            image.resize(targetSize.width, targetSize.height);
          }

          const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;

          const resizedImagePath = path.join(__dirname, '../public/assets/images/productImages', tempFilename);

          await image.toFile(resizedImagePath);

          newProduct.productImages.push(tempFilename);
        }
      }
    }

    const savedProduct = await new Product(newProduct).save();

    return res.render('product-add', {
      message: 'Product added successfully',
      admin: admin,
      category: categoriesData,
    });
  } catch (error) {
    const categoriesData = await Category.find({});
    console.error(error.message);
    const admin = req.session.adminData;
    res.render('product-add', { error: error.message, category: categoriesData, admin: admin });
  }
};

//=====================================================================================================================================//
//function to load productlist in admin side
const loadProductList = async (req, res) => {
  const admin = req.session.adminData;
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const perPage = 3;
    const status = req.query.status;


    const filter = {
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
      ],
    };

    if (status === "blocked") {
      filter.list = false;
    } else if (status === "unblocked") {
      filter.list = true;
    } else if (status === "instock") {
      filter.quantity = { $gt: 0 };
    } else if (status === "outofstock") {
      filter.quantity = 0;
    } else {

    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    const productsData = await Product.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render('productlist', { products: productsData, admin: admin, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
}

//=====================================================================================================================================//
//function to edit product in admin side
const editProduct = async (req, res) => {
  try {
    const categoriesData = await Category.find({});
    const admin = req.session.adminData;
    const productId = req.body.productId;

    try {
      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.render('edit-product', { message: 'Product not found', admin: admin, category: categoriesData });
      }

      if (req.body.name) {
        existingProduct.name = req.body.name;
      }
      if (req.body.category) {
        existingProduct.category = req.body.category;
      }
      if (req.body.price) {
        existingProduct.price = req.body.price;
      }
      if (req.body.discountPrice) {
        existingProduct.discountPrice = req.body.discountPrice;
      }
      if (req.body.quantity) {
        existingProduct.quantity = req.body.quantity;
      }

      if(req.body.discription){
        existingProduct.discription=req.body.discription
      }

      if (req.files) {
        for (let i = 1; i <= 4; i++) {
          const fieldName = `image${i}`;

          if (req.files[fieldName]) {
            const file = req.files[fieldName][0];

            const image = sharp(file.path);

            const metadata = await image.metadata();
            const width = metadata.width;
            const height = metadata.height;

            const targetSize = { width: 679, height: 679 };


            if (width > targetSize.width || height > targetSize.height) {
              image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
            } else {
              image.resize(targetSize.width, targetSize.height);
            }


            const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;
            const editedImagePath = path.join(__dirname, '../public/assets/images/productImages', tempFilename);
            await image.toFile(editedImagePath);

            existingProduct.productImages[i - 1] = tempFilename;
          }
        }
      }

      if (req.body.battery) {
        existingProduct.battery = req.body.battery;
      }
      if (req.body.productColor) {
        existingProduct.productColor = req.body.productColor;
      }
      if (req.body.ram) {
        existingProduct.ram = req.body.ram;
      }
      if (req.body.rom) {
        existingProduct.rom = req.body.rom;
      }
      if (req.body.expandable) {
        existingProduct.expandable = req.body.expandable;
      }
      if (req.body.frontCam) {
        existingProduct.frontCam = req.body.frontCam;
      }
      if (req.body.rearCam) {
        existingProduct.rearCam = req.body.rearCam;
      }
      if (req.body.processor) {
        existingProduct.processor = req.body.processor;
      }

      await existingProduct.save();

      res.redirect('/admin/productlist');
    } catch (error) {
      res.render('show-product', { error: error.message, category: categoriesData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=====================================================================================================================================//
//function to load  product detail page in adminside
const loadShowProduct = async (req, res) => {
  try {
    const admin = req.session.adminData
    const id = req.query.id

    const productData = await Product.findById({ _id: id })
    if (productData) {
      res.render('show-product', { products: productData, admin: admin })

    } else {
      res.redirect('/admin/productlist')

    }

  } catch (error) {
    console.log(error.message);

  }
};

//=====================================================================================================================================//
//function to load product edit page in admin side
const loadEditProduct = async (req, res) => {
  try {
    const categoriesData = await Category.find({})
    const admin = req.session.adminData
    const id = req.query.id

    const productData = await Product.findById({ _id: id })
    if (productData) {
      res.render('edit-product', { products: productData, admin: admin, category: categoriesData })

    } else {
      res.redirect('/admin/productlist')

    }

  } catch (error) {
    console.log(error.message);

  }
};

//=====================================================================================================================================//
//function to load product list page in user side
const productList = async (req, res) => {
  try {
    req.session.lastGetRequest = req.originalUrl;

    
    const categoriesData = await Category.find({});
    const search = req.query.search || '';
    const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
    const priceRange = req.query.price || 'all';
    const colors = Array.isArray(req.query.color) ? req.query.color : [req.query.color];
    const sortBy = req.query.sortBy || 'priceLowToHigh';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    let minPrice = 0;
    let maxPrice = Number.MAX_VALUE;

    switch (priceRange) {
      case 'under25':
        maxPrice = 20000;
        break;
      case '25to50':
        minPrice = 20000;
        maxPrice = 40000;
        break;
      case '50to100':
        minPrice = 40000;
        maxPrice = 60000;
        break;
      case '100to200':
        minPrice = 60000;
        maxPrice = 80000;
        break;
      case '200above':
        minPrice = 80000;
        break;
      default:
        // Handle default case
    }

    let sortQuery = {};

    if (sortBy === 'priceLowToHigh') {
      sortQuery = { price: 1 };
    } else if (sortBy === 'priceHighToLow') {
      sortQuery = { price: -1 };
    }

    const filter = {
      $or: [
        { category: { $in: categories.map(c => new RegExp(c, 'i')) } },
      ],
      price: { $gte: minPrice, $lte: maxPrice },
      productColor: { $in: colors.map(c => new RegExp(c, 'i')) },
    };

    const searchFilter = {
      $or: [
        { name: { $regex: '.' + search + '.', $options: 'i' } },
        { category: { $regex: '.' + search + '.', $options: 'i' } },
        { discountPrize: { $regex: '.' + search + '.', $options: 'i' } },
      ],
    };

    const totalProductsCount = await Product.countDocuments({
      $and: [filter, searchFilter],
    });

    const totalPages = Math.ceil(totalProductsCount / limit);
    const skip = (page - 1) * limit;


    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });

      const productsData = await Product.find({
        $and: [filter, searchFilter],
      }).sort(sortQuery).skip(skip).limit(limit);

      const selectedCategories = categories;
      const selectedPriceRange = priceRange;
      const selectedColors = colors;

      res.render('productlist', {
        user: userData,
        products: productsData,
        category: categoriesData,
        sortBy,
        selectedCategories,
        selectedPriceRange,
        selectedColors,
        totalPages,
        currentPage: page,
      });
    } else { 


      const productsData = await Product.find({
        $and: [filter, searchFilter],
      }).sort(sortQuery).skip(skip).limit(limit);

      const selectedCategories = categories;
      const selectedPriceRange = priceRange;
      const selectedColors = colors;

      res.render('productlist', {
        user: null,
        products: productsData,
        category: categoriesData,
        sortBy,
        selectedCategories,
        selectedPriceRange,
        selectedColors,
        totalPages,
        currentPage: page,
      });
    }
  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
  }
};


//=====================================================================================================================================//
//function to view product detail page in user side
const productView = async (req, res) => {
 req.session.lastGetRequest=req.originalUrl ;
  try {
    
    if (req.session.user_id) {
      const productId = req.params.productId;
      const reviewData= await Review.find({productId:productId}).populate('userId')
      const userReviewData = await Review.findOne({productId:productId,userId:req.session.user_id})
      const userData = await User.findById({ _id: req.session.user_id })
      const productData = await Product.findById(productId);
      const sameProducts = await Product.find({
        list: true,
        category: productData.category,
        _id: { $ne: productId },
  
      }).limit(7)
      res.render('productView', { user: userData, product: productData, sameProducts: sameProducts,reviews:reviewData,userReview:userReviewData})
  
      

  } else {

    const productId = req.params.productId;
    const reviewData= await Review.find({productId:productId}).populate('userId')
    
    const productData = await Product.findById(productId);
    const sameProducts = await Product.find({
      list: true,
      category: productData.category,
      _id: { $ne: productId },

    }).limit(7)
    res.render('productView', { user:null, product: productData, sameProducts: sameProducts ,reviews:reviewData })


      


  }



  

  } catch (error) {
    console.log(error.message);

  }


}

//=====================================================================================================================================//
//delete the productImages individually
const deleteProductImage = async (req, res) => {
  try {
    const admin = req.session.adminData
    const productId = req.query.productId;
    const categoriesData = await Category.find({});
    const imageIndex = parseInt(req.query.imageIndex);
    console.log(productId);

    const product = await Product.findById(productId);

    const imageToDelete = product.productImages[imageIndex];

    product.productImages.splice(imageIndex, 1);

    await product.save();


    res.render('edit-product', { products: product, admin: admin, category: categoriesData })
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

//=====================================================================================================================================//
module.exports = {

  loadaddProduct,
  insertProduct,
  loadProductList,
  loadEditProduct,
  loadShowProduct,
  editProduct,
  unlistProduct,
  productView,
  productList,
  deleteProductImage

}
//=====================================================================================================================================//
//=====================================================================================================================================//






