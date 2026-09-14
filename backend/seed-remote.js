/**
 * Seed script for remote MongoDB Atlas database.
 * Uses the same .env file as your backend.
 * Usage: node seed-remote.js
 */
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const connectDB = require("./src/Config/db");
const User = require("./src/Modules/Users/user.model");
const config = require("./src/Config");

const seed = async () => {
  try {
    await connectDB();

    const newEmail = config.admin.email.toLowerCase();
    const legacyEmail = "admin@pharmacy.com";

    let admin = await User.findOne({ email: newEmail }).select("+password");

    if (!admin) {
      admin = await User.findOne({ email: legacyEmail }).select("+password");
    }

    if (admin) {
      const previousEmail = admin.email;
      admin.name = config.admin.name;
      admin.phone = config.admin.phone;
      admin.email = newEmail;
      admin.password = config.admin.password;
      admin.role = "admin";
      admin.isActive = true;
      await admin.save();

      console.log("Super admin updated:");
      console.log(`  Previous email: ${previousEmail}`);
      console.log(`  Email:          ${admin.email}`);
      console.log(`  Password:       ${config.admin.password}`);
      process.exit(0);
    }

    const created = await User.create({
      name: config.admin.name,
      phone: config.admin.phone,
      email: newEmail,
      password: config.admin.password,
      role: "admin",
      isActive: true,
    });

    console.log("Default admin created:");
    console.log(`  Email:    ${created.email}`);
    console.log(`  Password: ${config.admin.password}`);
    console.log("  Please change the password after first login.");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
