const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/ShopSpree")
  .then(() => console.log("MongoDB Connected to ShopSpree database"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  icon: String,
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  userEmail: String,
  address: String,
  phone: String,
  status: { type: String, default: "Pending" },
});
const Order = mongoose.model("Order", orderSchema);

const initialProducts = [
  { id: 1, name: "Cool T-Shirt", price: 499, icon: "👕" },
  { id: 2, name: "Sneakers", price: 1299, icon: "👟" },
  { id: 3, name: "Smart Watch", price: 2999, icon: "⌚" },
  { id: 4, name: "Backpack", price: 899, icon: "🎒" },
  { id: 5, name: "Wireless Earbuds", price: 1599, icon: "🎧" },
  { id: 6, name: "Sunglasses", price: 599, icon: "🕶️" },
  { id: 7, name: "Gaming Mouse", price: 1099, icon: "🖱️" },
  { id: 8, name: "Water Bottle", price: 299, icon: "🥤" },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
    }
  } catch (err) {}
};
seedProducts();

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error loading products" });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ message: "User already exists with this email!" });

    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({ message: "Signup successful! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({
        message: `Welcome back, ${user.name}!`,
        success: true,
        user: { name: user.name, email: user.email },
      });
    } else {
      res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { userEmail, address, phone } = req.body;
    const newOrder = new Order({ userEmail, address, phone });
    await newOrder.save();
    res.json({
      message: "Order Placed Successfully! Your items will be delivered soon.",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to place order.", success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
