export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || '').trim());

export const isPhone = (v) => /^[0-9+\-\s()]{6,20}$/.test(String(v || '').trim());

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validateChangePassword = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Current password is required';
  if (!newPassword) errors.newPassword = 'New password is required';
  else if (newPassword.length < 6) errors.newPassword = 'At least 6 characters';
  if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateSalesman = ({ name, phone, email, password }) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!phone) errors.phone = 'Phone is required';
  else if (!isPhone(phone)) errors.phone = 'Invalid phone';
  if (!email) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validateSale = ({ amount, quantity }) => {
  const errors = {};
  const a = Number(amount);
  if (amount === '' || amount == null) errors.amount = 'Amount is required';
  else if (isNaN(a) || a < 0) errors.amount = 'Amount must be a non-negative number';
  if (quantity !== '' && quantity != null) {
    const q = Number(quantity);
    if (isNaN(q) || q < 0 || !Number.isInteger(q)) errors.quantity = 'Quantity must be a non-negative integer';
  }
  return errors;
};

export const validateAttendance = ({ status }) => {
  const errors = {};
  if (!status) errors.status = 'Status is required';
  return errors;
};
