const rooms = {}; // groupId -> array of users
const noteViewers = {}; // noteId -> array of users
const typingUsers = {}; // noteId -> array of userIds

module.exports = (io) => {
  io.on('connection', (socket) => {
    let currentGroupId = null;
    let currentUser = null;
    let activeNoteId = null;

    // Presence: join group room
    socket.on('join-room', ({ groupId, user }) => {
      currentGroupId = groupId;
      currentUser = { ...user, deskIndex: null, socketId: socket.id };
      
      socket.join(groupId);
      
      if (!rooms[groupId]) {
        rooms[groupId] = [];
      }
      
      // Filter out duplicate user sessions
      rooms[groupId] = rooms[groupId].filter(u => u.id !== user.id);
      rooms[groupId].push(currentUser);
      
      io.to(groupId).emit('room-presence-update', rooms[groupId]);
    });

    // Seating desks
    socket.on('sit-at-desk', ({ groupId, deskIndex }) => {
      if (!rooms[groupId]) return;
      const user = rooms[groupId].find(u => u.socketId === socket.id);
      if (user) {
        user.deskIndex = deskIndex;
        io.to(groupId).emit('room-presence-update', rooms[groupId]);
      }
    });

    socket.on('stand-up', ({ groupId }) => {
      if (!rooms[groupId]) return;
      const user = rooms[groupId].find(u => u.socketId === socket.id);
      if (user) {
        user.deskIndex = null;
        io.to(groupId).emit('room-presence-update', rooms[groupId]);
      }
    });

    // Notes: select / view note
    socket.on('view-note-start', ({ groupId, noteId, user }) => {
      activeNoteId = noteId;
      if (!noteViewers[noteId]) {
        noteViewers[noteId] = [];
      }
      
      // Filter out duplicate user sessions in this note
      noteViewers[noteId] = noteViewers[noteId].filter(u => u.id !== user.id);
      noteViewers[noteId].push({ ...user, socketId: socket.id });

      io.to(groupId).emit('note-viewers-update', {
        noteId,
        viewers: noteViewers[noteId]
      });
    });

    socket.on('view-note-stop', ({ groupId, noteId, user }) => {
      if (noteId && noteViewers[noteId]) {
        noteViewers[noteId] = noteViewers[noteId].filter(u => u.socketId !== socket.id);
        io.to(groupId).emit('note-viewers-update', {
          noteId,
          viewers: noteViewers[noteId]
        });
      }
      if (activeNoteId === noteId) {
        activeNoteId = null;
      }
    });

    // Notes: typing status
    socket.on('typing-start', ({ groupId, noteId, user }) => {
      if (!typingUsers[noteId]) {
        typingUsers[noteId] = [];
      }
      if (!typingUsers[noteId].includes(user.fullName)) {
        typingUsers[noteId].push(user.fullName);
      }
      io.to(groupId).emit('note-typing-update', {
        noteId,
        typingUsers: typingUsers[noteId]
      });
    });

    socket.on('typing-stop', ({ groupId, noteId, user }) => {
      if (typingUsers[noteId]) {
        typingUsers[noteId] = typingUsers[noteId].filter(name => name !== user.fullName);
        io.to(groupId).emit('note-typing-update', {
          noteId,
          typingUsers: typingUsers[noteId]
        });
      }
    });

    // Notes: live cursor coordinate sync
    socket.on('cursor-move', ({ groupId, noteId, user, position }) => {
      // Broadcast to everyone in group except the sender
      socket.to(groupId).emit('note-cursor-update', {
        noteId,
        userId: user.id,
        userName: user.fullName,
        position // { line, ch }
      });
    });

    // Doubts: broadcast warning/toast for new doubt to all active room members
    socket.on('new-doubt-posted', ({ groupId, user, doubtTitle }) => {
      socket.to(groupId).emit('new-doubt-alert', {
        doubtTitle,
        authorName: user.fullName,
        authorUsername: user.username
      });
    });

    const leaveRoom = () => {
      if (currentGroupId && rooms[currentGroupId]) {
        rooms[currentGroupId] = rooms[currentGroupId].filter(u => u.socketId !== socket.id);
        io.to(currentGroupId).emit('room-presence-update', rooms[currentGroupId]);
      }
      
      // Clean up note viewers if they leave or disconnect
      if (activeNoteId && noteViewers[activeNoteId]) {
        noteViewers[activeNoteId] = noteViewers[activeNoteId].filter(u => u.socketId !== socket.id);
        io.to(currentGroupId).emit('note-viewers-update', {
          noteId: activeNoteId,
          viewers: noteViewers[activeNoteId]
        });
        
        // Clean up typing if applicable
        if (currentUser && typingUsers[activeNoteId]) {
          typingUsers[activeNoteId] = typingUsers[activeNoteId].filter(name => name !== currentUser.fullName);
          io.to(currentGroupId).emit('note-typing-update', {
            noteId: activeNoteId,
            typingUsers: typingUsers[activeNoteId]
          });
        }
      }
    };

    socket.on('leave-room', leaveRoom);
    socket.on('disconnect', leaveRoom);
  });
};
