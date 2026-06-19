const { User, Group, GroupMember, SharedNote } = require('../models');

const seedDatabase = async () => {
  try {
    // Ensure Swathi Hani is always present in the database (self-healing credentials for Render)
    const swathiExists = await User.findOne({
      where: { username: 'swathi_hani21' }
    });
    if (!swathiExists) {
      console.log('Self-healing DB check: Swathi Hani not found. Seeding Swathi Hani...');
      await User.create({
        fullName: 'Swathi Hani',
        username: 'swathi_hani21',
        password: 'Swathi@123',
        role: 'student',
        phoneOrEmail: 'hanumanthuswathi24@gmail.com',
        isVerified: true,
        isApproved: true,
        email: 'hanumanthuswathi24@gmail.com',
        gender: 'female',
        avatarUrl: '/swathi-avatar.png',
        streakCount: 0,
        totalStudyHours: 0.0
      });
    }

    const userCount = await User.count();
    if (userCount > 1) {
      console.log('Database already has demo data. Skipping further seeding.');
      return;
    }

    console.log('Seeding database with demo profiles and workspaces...');

    // 1. Create demo users
    const student = await User.create({
      fullName: 'Vijay Kumar (VR Siddhartha, Vijayawada)',
      username: 'student.demo@studycircle.com',
      password: 'Demo@123',
      role: 'student',
      phoneOrEmail: 'student.demo@studycircle.com',
      isVerified: true,
      isApproved: true,
      streakCount: 15,
      totalStudyHours: 120.0
    });

    const mentor = await User.create({
      fullName: 'Dr. Srinivasa Rao (RVR Siddhartha, Guntur)',
      username: 'mentor.demo@studycircle.com',
      password: 'Demo@123',
      role: 'mentor',
      phoneOrEmail: 'mentor.demo@studycircle.com',
      isVerified: true,
      isApproved: true,
      streakCount: 5,
      totalStudyHours: 42.0
    });

    const admin = await User.create({
      fullName: 'Hanumanthu Prasad (AU, Vizag)',
      username: 'admin.demo@studycircle.com',
      password: 'Demo@123',
      role: 'admin',
      phoneOrEmail: 'admin.demo@studycircle.com',
      isVerified: true,
      isApproved: true,
      streakCount: 12,
      totalStudyHours: 100.0
    });

    // 2. Create study circles
    const codingGroup = await Group.create({
      name: 'Coding Room',
      description: 'Perfect for beginners. Learn syntax, basic logic flow, and build small scripts together.',
      subject: 'Programming',
      inviteCode: 'code2026',
      isPublic: true
    });

    const dsaGroup = await Group.create({
      name: 'DSA Room',
      description: 'Practice coding and problem solving. Explore arrays, trees, dynamic programming, and complexity analyses.',
      subject: 'Algorithms',
      inviteCode: 'dsa2026',
      isPublic: true
    });

    const aiGroup = await Group.create({
      name: 'AI Room',
      description: 'Explore AI concepts and projects. Discuss neural networks, deep learning, NLP, and model fine-tuning.',
      subject: 'Artificial Intelligence',
      inviteCode: 'ai2026',
      isPublic: true
    });

    // 3. Attach student to circles
    await GroupMember.create({
      userId: student.id,
      groupId: codingGroup.id,
      role: 'student'
    });

    await GroupMember.create({
      userId: student.id,
      groupId: dsaGroup.id,
      role: 'student'
    });

    await GroupMember.create({
      userId: student.id,
      groupId: aiGroup.id,
      role: 'student'
    });

    // Attach mentor
    await GroupMember.create({
      userId: mentor.id,
      groupId: dsaGroup.id,
      role: 'mentor'
    });

    // 4. Seed Shared Notes
    await SharedNote.create({
      name: 'DBMS Cheat Sheet.pdf',
      size: '2.4 MB',
      type: 'syllabus',
      publishedBy: 'Dr. Srinivasa Rao (Mentor)'
    });

    await SharedNote.create({
      name: 'Aptitude Formulas Sheet.pdf',
      size: '1.1 MB',
      type: 'exam',
      publishedBy: 'Hanumanthu Prasad (Admin)'
    });

    await SharedNote.create({
      name: 'OS Concurrency Lecture.pdf',
      size: '3.8 MB',
      type: 'lecture',
      publishedBy: 'Dr. Srinivasa Rao (Mentor)'
    });

    await SharedNote.create({
      name: 'Computer Networks Syllabus.pdf',
      size: '1.5 MB',
      type: 'syllabus',
      publishedBy: 'Hanumanthu Prasad (Admin)'
    });

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error during seeding:', err);
  }
};

module.exports = { seedDatabase };
