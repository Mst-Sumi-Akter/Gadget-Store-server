const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS CONFIG ===
const allowedOrigins = [
  "https://eclectic-cascaron-641d77.netlify.app", 
  "http://localhost:3000",            
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","DELETE"],
}));

// Middleware
app.use(express.json());

// === MongoDB Model ===
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDesc: String,
  fullDesc: String,
  price: Number,
  image: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.models?.Product || mongoose.model("Product", productSchema);

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// === ROUTES ===

// Root
app.get("/", (req, res) => {
  res.send("Gadget Store Server Running");
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// POST add product
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.json({ message: "Product added", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Error adding product" });
  }
});

// PUT update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
