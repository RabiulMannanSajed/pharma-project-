/**
 * Seed script - upserts the super admin from .env (or config defaults).
 *
 * Behaviour:
 *   - If a user exists with the configured email, update their password/role/etc.
 *   - If a user exists with the previous default email, update it to the new one
 *     (so previously seeded admins can be migrated to the new credentials).
 *   - Otherwise, create a new admin with the configured credentials.
 *
 * Usage: npm run seed
 */
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = require("./Config/db");
const User = require("./Modules/Users/user.model");
const config = require("./Config");

// Hard-coded fallback to migrate the bundled default admin away from
// `admin@pharmacy.com`. If you intentionally want to keep the original
// admin, set PRESERVE_LEGACY_ADMIN=true in your environment.
const LEGACY_ADMIN_EMAIL =
  process.env.PRESERVE_LEGACY_ADMIN === "true" ? null : "admin@pharmacy.com";

const seed = async () => {
  try {
    await connectDB();

    const newEmail = config.admin.email.toLowerCase();
    const legacyEmail = LEGACY_ADMIN_EMAIL ? LEGACY_ADMIN_EMAIL.toLowerCase() : null;

    // Prefer matching by the new configured email first
    let admin = await User.findOne({ email: newEmail }).select("+password");

    // Fall back to the legacy default admin email so we can migrate it
    if (!admin && legacyEmail && legacyEmail !== newEmail) {
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
