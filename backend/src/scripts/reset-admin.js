/**
 * One-off script: removes any pre-existing admin (by email or phone) and
 * re-seeds the super admin from .env. Use this when rotating credentials.
 *
 * Usage: node src/scripts/reset-admin.js
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('../Config/db');
const User = require('../Modules/Users/user.model');
const config = require('../Config');

const resetAdmin = async () => {
  try {
    await connectDB();

    const newEmail = config.admin.email.toLowerCase();
    const newPhone = config.admin.phone;

    // Remove any user that is colliding with the new admin's email or phone
    // (except the new admin itself, which may have already been seeded).
    const collisions = await User.find({
      role: 'admin',
      $or: [{ email: newEmail }, { phone: newPhone }],
    });

    for (const u of collisions) {
      // Keep the new admin if it already exists with correct email + role.
      const matchesNew = u.email === newEmail && u.phone === newPhone && u.role === 'admin';
      if (!matchesNew) {
        console.log(`Removing old admin: ${u.email} (id=${u._id})`);
        await u.deleteOne();
      }
    }

    // Also delete the well-known default admin email if it's still present
    // (in case the email was never updated by the user).
    const legacyDelete = await User.findOneAndDelete({
      role: 'admin',
      email: 'admin@pharmacy.com',
    });
    if (legacyDelete) {
      console.log(`Removed legacy admin: ${legacyDelete.email}`);
    }

    // Now upsert the configured admin.
    let admin = await User.findOne({ email: newEmail }).select('+password');

    if (admin) {
      const previousEmail = admin.email;
      admin.name = config.admin.name;
      admin.phone = newPhone;
      admin.email = newEmail;
      admin.password = config.admin.password;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log('Admin updated:');
      console.log(`  Previous email: ${previousEmail}`);
    } else {
      admin = await User.create({
        name: config.admin.name,
        phone: newPhone,
        email: newEmail,
        password: config.admin.password,
        role: 'admin',
        isActive: true,
      });
      console.log('Admin created:');
    }

    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${config.admin.password}`);

    // List remaining admins for sanity
    const remaining = await User.find({ role: 'admin' }).select('email name isActive _id');
    console.log(`\nAdmins in DB after reset (${remaining.length}):`);
    remaining.forEach((u) =>
      console.log(`  - ${u.email} (${u.name}) isActive=${u.isActive} id=${u._id}`)
    );

    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
};

resetAdmin();
