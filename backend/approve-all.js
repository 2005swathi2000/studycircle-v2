const { User } = require('./models');

const approveAll = async () => {
  try {
    const updated = await User.update({ isApproved: true }, { where: {} });
    console.log(`[Approval Update] Approved all users in DB. Affected count: ${updated[0]}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

approveAll();
