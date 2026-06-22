const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🚀 Starting Phase 2 Gamification End-to-End Integration Tests...');

  let studentToken = '';
  let mentorToken = '';
  let studentId = '';
  let mentorId = '';
  let groupId = '';
  let challengeId = '';

  try {
    // 1. Log in Student
    console.log('\n--- 1. Logging in Student... ---');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'student.demo@studycircle.com',
        password: 'Demo@123',
        portal: 'student'
      })
    });
    assert.strictEqual(studentLoginRes.status, 200, 'Student login should succeed');
    const studentLoginData = await studentLoginRes.json();
    studentToken = studentLoginData.token;
    studentId = studentLoginData.user.id;
    console.log('✓ Student logged in successfully. Token length:', studentToken.length);

    // 2. Log in Mentor
    console.log('\n--- 2. Logging in Mentor... ---');
    const mentorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mentor.demo@studycircle.com',
        password: 'Demo@123',
        portal: 'mentor'
      })
    });
    assert.strictEqual(mentorLoginRes.status, 200, 'Mentor login should succeed');
    const mentorLoginData = await mentorLoginRes.json();
    mentorToken = mentorLoginData.token;
    mentorId = mentorLoginData.user.id;
    console.log('✓ Mentor logged in successfully. Token length:', mentorToken.length);

    // 3. Get Student Profile
    console.log('\n--- 3. Fetching Student Profile... ---');
    const studentProfileRes = await fetch(`${BASE_URL}/auth/profile/student.demo@studycircle.com`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(studentProfileRes.status, 200, 'Fetching student profile should succeed');
    const studentProfile = await studentProfileRes.json();
    assert.ok(studentProfile.profile, 'Profile object should exist');
    console.log('✓ Student profile fetched. Username:', studentProfile.profile.username, 'Coins:', studentProfile.profile.focusCoins);

    // 4. Get Mentor Profile (Initial state)
    console.log('\n--- 4. Fetching Mentor Profile... ---');
    const mentorProfileRes = await fetch(`${BASE_URL}/auth/profile/mentor.demo@studycircle.com`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(mentorProfileRes.status, 200, 'Fetching mentor profile should succeed');
    const mentorProfile = await mentorProfileRes.json();
    assert.ok(mentorProfile.profile, 'Profile mentor object should exist');
    console.log('✓ Mentor profile fetched. Username:', mentorProfile.profile.username);
    console.log('  Initial Mentor Reputation:', mentorProfile.profile.reputation);

    // 5. Rate Mentor (Student rates Mentor)
    console.log('\n--- 5. Submitting Mentor Rating... ---');
    const rateRes = await fetch(`${BASE_URL}/auth/mentors/${mentorId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        rating: 5,
        feedback: 'Outstanding guidance and clear teaching style!'
      })
    });
    assert.strictEqual(rateRes.status, 200, 'Rating mentor should succeed');
    const rateData = await rateRes.json();
    console.log('✓ Rating response:', rateData.message);

    // 6. Get Mentor Ratings List
    console.log('\n--- 6. Verifying Rating in List... ---');
    const ratingsRes = await fetch(`${BASE_URL}/auth/mentors/${mentorId}/ratings`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(ratingsRes.status, 200, 'Fetching ratings should succeed');
    const ratingsData = await ratingsRes.json();
    assert.ok(Array.isArray(ratingsData.ratings), 'Ratings should be an array');
    assert.ok(ratingsData.ratings.length > 0, 'Ratings list should not be empty');
    console.log('✓ Ratings found:', ratingsData.ratings.length, 'reviews.');
    console.log('  Latest review text:', ratingsData.ratings[0].feedback);

    // 7. Get Mentor Profile (Updated state)
    console.log('\n--- 7. Re-fetching Mentor Profile to verify reputation score... ---');
    const mentorProfileUpdatedRes = await fetch(`${BASE_URL}/auth/profile/mentor.demo@studycircle.com`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const mentorProfileUpdated = await mentorProfileUpdatedRes.json();
    console.log('  Updated Mentor Reputation:', mentorProfileUpdated.profile.reputation);
    assert.ok(mentorProfileUpdated.profile.reputation.avgRating > 0, 'Average stars should be updated');

    // 8. Fetch/Join Group by Slug
    console.log('\n--- 8. Joining Group "programming-dsa" as Student... ---');
    const groupRes = await fetch(`${BASE_URL}/groups/by-slug/programming-dsa`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(groupRes.status, 200, 'Fetching group by slug should succeed');
    const groupData = await groupRes.json();
    groupId = groupData.group.id;
    console.log('✓ Joined Group ID:', groupId, 'Name:', groupData.group.name);

    // 8.5. Mentor Joins Group by Slug (to satisfy isMember check)
    console.log('\n--- 8.5. Joining Group "programming-dsa" as Mentor... ---');
    const mentorGroupRes = await fetch(`${BASE_URL}/groups/by-slug/programming-dsa`, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    assert.strictEqual(mentorGroupRes.status, 200, 'Mentor fetching group by slug should succeed');

    // 9. Mentor Creates a Group Challenge
    console.log('\n--- 9. Mentor Creating a Circle Challenge... ---');
    const challengeRes = await fetch(`${BASE_URL}/groups/${groupId}/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mentorToken}`
      },
      body: JSON.stringify({
        title: 'DS & Algo Challenge',
        description: 'Log 2 hours of study time inside DSA Room',
        targetType: 'study_hours',
        targetValue: 2.0,
        xpReward: 150,
        coinReward: 50
      })
    });
    assert.strictEqual(challengeRes.status, 201, 'Mentor creating challenge should succeed');
    const challengeData = await challengeRes.json();
    challengeId = challengeData.challenge.id;
    console.log('✓ Challenge created successfully. Challenge ID:', challengeId);

    // 10. Fetch Group Challenges List
    console.log('\n--- 10. Fetching Group Challenges... ---');
    const listChallengesRes = await fetch(`${BASE_URL}/groups/${groupId}/challenges`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(listChallengesRes.status, 200, 'Retrieving challenges list should succeed');
    const listChallengesData = await listChallengesRes.json();
    assert.ok(listChallengesData.challenges.length > 0, 'Challenges array should not be empty');
    console.log('✓ Verified challenges count in circle:', listChallengesData.challenges.length);

    // 11. Test Progress Progression (Log study hours)
    console.log('\n--- 11. Student Logging Study Progress to advance challenge... ---');
    const logRes = await fetch(`${BASE_URL}/progress/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        groupId,
        studyMinutes: 120, // 2 hours
        notesCreated: 0,
        tasksCompleted: 0
      })
    });
    assert.strictEqual(logRes.status, 200, 'Logging study progress should succeed');
    const logData = await logRes.json();
    console.log('✓ Progress logged. XP Capacity Remaining Today:', logData.dailyXpCapacityRemaining);

    // 12. Verify Challenge Progress updated
    console.log('\n--- 12. Verifying Challenge progress increased... ---');
    const checkChallengeRes = await fetch(`${BASE_URL}/groups/${groupId}/challenges`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const checkChallengeData = await checkChallengeRes.json();
    const targetChallenge = checkChallengeData.challenges.find(c => c.id === challengeId);
    console.log('  Challenge title:', targetChallenge.title);
    console.log('  Challenge progress:', targetChallenge.currentProgress, '/', targetChallenge.targetValue);
    assert.ok(targetChallenge.currentProgress >= targetChallenge.targetValue, 'Challenge progress should be fully complete (>= 2.0)');

    // 13. Student Claims Challenge Reward
    console.log('\n--- 13. Student Claiming Reward... ---');
    const claimRes = await fetch(`${BASE_URL}/groups/${groupId}/challenges/${challengeId}/claim`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(claimRes.status, 200, 'Claiming challenge reward should succeed');
    const claimData = await claimRes.json();
    console.log('✓ Claim successful! Message:', claimData.message);
    console.log('  New XP:', claimData.xp, 'Level:', claimData.level, 'Focus Coins:', claimData.focusCoins);
    assert.ok(claimData.badges.includes(`challenge_${challengeId}`), 'Badges array should contain the challenge ID');

    // 14. Redeem Shop cosmetic
    console.log('\n--- 14. Purchasing Cosmetic in Shop... ---');
    const shopRes = await fetch(`${BASE_URL}/progress/purchase-reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        rewardId: 'cyberpunk',
        cost: 100,
        type: 'theme',
        value: 'Neon Cyberpunk Theme'
      })
    });
    assert.strictEqual(shopRes.status, 200, 'Purchasing reward should succeed');
    const shopData = await shopRes.json();
    console.log('✓ Shop redemption response:', shopData.message);
    console.log('  Coins remaining:', shopData.focusCoins);
    assert.ok(shopData.badges.includes('cyberpunk'), 'Badges should list the cyberpunk theme ID');

    console.log('\n🌟 ALL INTEGRATION TESTS PASSED TRIUMPHANTLY! 🌟');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUN ENCOUNTERED A FAILURE:', error);
    process.exit(1);
  }
};

runTests();
