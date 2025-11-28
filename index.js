const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Model (Product)
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDesc: String,
    fullDesc: String,
    price: Number,
    image: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.models?.Product || mongoose.model("Product", productSchema);

// -------------------
// MongoDB Connection (Cached for Vercel)
// -------------------
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// -------------------
// Routes
// -------------------

// Root
app.get("/", (req, res) => {
  res.send("Gadget Store Server Running");
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    await dbConnect();
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET single product
app.get("/api/products/:id", async (req, res) => {
  try {
    await dbConnect();
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// POST add product
app.post("/api/products", async (req, res) => {
  try {
    await dbConnect();
    const newProduct = await Product.create(req.body);
    res.json({ message: "Product added", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding product" });
  }
});

// PUT update product
app.put("/api/products/:id", async (req, res) => {
  try {
    await dbConnect();
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Start server (optional for Vercel, but fine locally)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
