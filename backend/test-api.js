const testApi = async () => {
  try {
    const email = 'hanumanthuswathi24@gmail.com';
    const username = 'Swathi_Hani21';
    const password = 'Swathi@123';

    // 1. Send OTP
    console.log('Sending OTP to', email);
    const otpRes = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Verification',
        value: email
      })
    });
    const otpData = await otpRes.json();
    console.log('Send OTP response:', otpData);

    if (!otpRes.ok) {
      console.log('Send OTP failed:', otpData);
      process.exit(1);
    }

    // 2. Fetch mock inbox to get OTP
    const inboxRes = await fetch('http://localhost:5000/api/auth/mock-inbox');
    const inbox = await inboxRes.json();
    const latestMail = inbox.find(m => m.to === email);
    if (!latestMail) {
      console.log('No mail found in mock inbox!');
      process.exit(1);
    }
    const match = latestMail.body.match(/verification code is: (\d+)/);
    if (!match) {
      console.log('Could not parse verification code!');
      process.exit(1);
    }
    const otp = match[1];
    console.log('Parsed OTP:', otp);

    // 3. Register user
    console.log('Registering user...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Swathi',
        lastName: 'Hani',
        username,
        password,
        role: 'student',
        email,
        phone: '9876543210',
        gender: 'female',
        otp
      })
    });
    const regData = await regRes.json();
    console.log('Registration response status:', regRes.status, regData);
    if (!regRes.ok && regData.error !== 'Username is already taken.') {
      console.log('Registration failed:', regData);
      process.exit(1);
    }

    // 4. Login user
    console.log('Attempting login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        portal: 'student'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login response status:', loginRes.status, loginData);
    if (!loginRes.ok) {
      console.log('Login failed:', loginData);
      process.exit(1);
    }

    console.log('SUCCESS: API-level registration and login flow is working perfectly!');
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
};

testApi();
