const bcrypt = require('bcryptjs');

const checkHash = async () => {
  const hash = '$2a$10$RipQPbwhKsMQkx4YZArC6OBgr7hfXpVK2fHrWNdZ3bI..1S9sHUpG';
  const pass = 'Swathi@123';
  const match = await bcrypt.compare(pass, hash);
  console.log('Does Swathi@123 match hash?', match);
};

checkHash();
