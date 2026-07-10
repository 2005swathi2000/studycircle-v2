const isGmailTypo = (email) => {
  if (typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const gmailTypos = [
    'gmaail.com', 'gmaill.com', 'gamil.com', 'gmal.com', 'gmil.com', 
    'gmaile.com', 'gmai.com', 'gmeil.com', 'gmail.con', 'gamail.com',
    'gmaail.co', 'gmaill.co', 'gamil.co', 'gmal.co', 'gmil.co', 
    'gmaile.co', 'gmai.co', 'gmeil.co', 'gamail.co', 'gmaial.com'
  ];
  return gmailTypos.includes(domain);
};

const runTests = () => {
  const testCases = [
    { email: 'swathi@gmail.com', expected: false },
    { email: 'swathi@gmail.co.in', expected: false },
    { email: 'swathi@gmaail.com', expected: true },
    { email: 'swathi@gamil.com', expected: true },
    { email: 'swathi@gmaill.com', expected: true },
    { email: 'swathi@gmal.com', expected: true },
    { email: 'swathi@gmil.com', expected: true },
    { email: 'swathi@gmail.con', expected: true },
    { email: 'swathi@yahoo.com', expected: false },
    { email: 'swathi.hani@studycircle.com', expected: false }
  ];

  console.log('=== Running Gmail Typo Validator Tests ===');
  let passedCount = 0;
  for (const tc of testCases) {
    const actual = isGmailTypo(tc.email);
    const passed = actual === tc.expected;
    console.log(`Email: ${tc.email} -> Typo detected? ${actual}. Expected: ${tc.expected}. Result: ${passed ? 'PASSED' : 'FAILED'}`);
    if (passed) passedCount++;
  }
  console.log(`\nTests completed: ${passedCount}/${testCases.length} passed.`);
  process.exit(passedCount === testCases.length ? 0 : 1);
};

runTests();
