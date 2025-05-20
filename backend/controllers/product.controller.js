import mongoose from 'mongoose';
import Product from '../../models/product.model.js'


export const createProducts = async (req,res) => { // use to give what user needs for request and response from databse
    const product = req.body; //user will send this data. req.body means we can access the request of the customer from this

    if (!product.name || (!product.price) || (!product.image)) {npm
        return res.status(400).json({
            success: false,
            message: "Please Provide All Fields"
        });
    }
    

    const newProduct = new Product(product);    // hold a new instant named newproduct, (prodct) = should be the type defined by us

    try {
        await newProduct.save(); //This line tries to save the newly created product (newProduct) to the database using Mongoose. 
        res.status(201).json({success:true,data:newProduct}); //data.newproduct contains newly created details of the product
    } catch (error) {
        console.log("error in create product:",error.message);
        res.status(500).json({success:false,message:"Server Error"});
}
};

export const deleteProduct =  async (req,res)=> {
    
    const {id} = req.params             // here params means the path of url. api/products/123456 => api/products/id. if we want the id we can just say req.params.id
                                        // from const {id} => we extract the path of product and we extracted the id of the product and it stored in constant id.
    //console.log("id: ",id)              // showing the value of id


    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({success:true,message: "Product Deleted"});
        
    } catch (error) {
        res.status(404).json({success:false,message:"Product Not Found"});
    }   
};

export const getProduct = async (req, res) => {
    try {
        const products = await Product.find({});                    // this Product.find gives all the products in library
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error.message); // Log the error for debugging
        res.status(500).json({ success: false, message: "Server Error" }); // Respond with an error message
    }
}

export const updateProduct = async (req, res) => {
    const { id } = req.params; // Get the product ID from the request parameters
    const product = req.body;  // Get the updated product data from the request body

    // Check if the ID is a valid MongoDB Object ID
    // if (!mongoose.Types.ObjectId.isValid(id)) { 
    //     return res.status(404).json({ success: false, message: "Invalid Product ID" });
    // }
    
    try {
        // Correct the method name from `findIdAndUpdate` to `findByIdAndUpdate`
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
        
        // Check if the product was found and updated
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        // Return the updated product details
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error.message); // Log the error for debugging
        res.status(500).json({ success: false, message: "Server Error" });
    }
}