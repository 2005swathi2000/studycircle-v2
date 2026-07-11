const { User } = require('./models');

async function testLogin(username, password, portal) {
  const normalizedUsername = username.trim().toLowerCase();
  const user = await User.findOne({
    where: { username: normalizedUsername }
  });
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { success: false, error: 'Invalid password' };
  }

  // Enforce Portal Restrictions / Role Separation
  if (portal === 'student') {
    if (user.role !== 'student') {
      return { success: false, error: 'This portal is only for students. Mentors and Admins must login via the right portal.' };
    }
  } else if (portal === 'mentor') {
    if (user.role !== 'mentor') {
      return { success: false, error: 'This option is only for mentors. Admins and Students must choose their correct option.' };
    }
  } else if (portal === 'admin') {
    if (user.role !== 'admin') {
      return { success: false, error: 'This option is only for administrators. Mentors and Students must choose their correct option.' };
    }
  }
  return { success: true, role: user.role };
}

async function run() {
  console.log("=== Running Portal Auth Validation Tests ===");
  
  // Test 1: Student tries to login via student portal (Should SUCCEED)
  const res1 = await testLogin('student.demo@studycircle.com', 'Demo@123', 'student');
  console.log('Test 1 (Student -> student portal):', res1.success ? 'PASSED' : 'FAILED', res1.error || '');

  // Test 2: Student tries to login via mentor portal (Should FAIL)
  const res2 = await testLogin('student.demo@studycircle.com', 'Demo@123', 'mentor');
  console.log('Test 2 (Student -> mentor portal):', !res2.success && res2.error.includes('only for mentors') ? 'PASSED' : 'FAILED', res2.error || '');

  // Test 3: Mentor tries to login via mentor portal (Should SUCCEED)
  const res3 = await testLogin('mentor.demo@studycircle.com', 'Demo@123', 'mentor');
  console.log('Test 3 (Mentor -> mentor portal):', res3.success ? 'PASSED' : 'FAILED', res3.error || '');

  // Test 4: Mentor tries to login via admin portal (Should FAIL)
  const res4 = await testLogin('mentor.demo@studycircle.com', 'Demo@123', 'admin');
  console.log('Test 4 (Mentor -> admin portal):', !res4.success && res4.error.includes('only for administrators') ? 'PASSED' : 'FAILED', res4.error || '');

  // Test 5: Admin tries to login via admin portal (Should SUCCEED)
  const res5 = await testLogin('tulasi', 'Tulasi@123', 'admin');
  console.log('Test 5 (Admin -> admin portal):', res5.success ? 'PASSED' : 'FAILED', res5.error || '');

  // Test 6: Admin tries to login via mentor portal (Should FAIL)
  const res6 = await testLogin('tulasi', 'Tulasi@123', 'mentor');
  console.log('Test 6 (Admin -> mentor portal):', !res6.success && res6.error.includes('only for mentors') ? 'PASSED' : 'FAILED', res6.error || '');

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
