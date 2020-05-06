import io from '.';
import userlistCollection from '../db/collections/user-access-list';

const ioUserList = io.of('/userList');

/**
 * @description room user list for specific chat room
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {Array} ChatRoomUsers room user list
 */
class ChatRoom {
    constructor(roomId) {
        userlistCollection
            .getAccessList({ sessionId: roomId })
            .then((result) => {
                console.log(result);
                if (result === null) {
                    userlistCollection.createAccessList({ sessionId: roomId });
                } else {
                    this.accesslistId = result._id;
                }
            });
        this.roomId = roomId;
        this.ChatRoomUsers = [];
    }

    /**
     * @description get the chat room id
     * @returns {String} the room id
     */
    getRoomId() {
        return this.roomId;
    }

    /**
     * @description get the user list for this room
     * @returns {Array} the user list
     */
    getUserList() {
        return this.ChatRoomUsers;
    }

    /**
     * @description adding new user to this chat room
     * @arg {Json} newUser the user document for the new user
     */
    addUser(newUser) {
        if (this.checkUser(newUser.jwt) < 0) {
            const newUserCopy = newUser;
            newUserCopy.from = new Date();
            this.ChatRoomUsers.push(newUser);
        }
        console.log(this.ChatRoomUsers);
    }

    /**
     * @description remove the user from this user list by the specific jwt,
     * Normally we use this function to remove user from the list because user might using the same username to login from multiple devices
     * @arg {String} jwt the user jwt
     */
    removeUserByJWT(jwt) {
        const userIndex = this.checkUser(jwt);
        if (userIndex >= 0) {
            const user = this.ChatRoomUsers[userIndex];
            userlistCollection.newUserAccessRecord({
                accesslistId: this.accesslistId,
                userId: user._id,
                from: user.from,
                to: new Date(),
            });
            this.ChatRoomUsers = this.ChatRoomUsers.filter(function (value) {
                return value.jwt !== jwt;
            });
        }
        console.log(this.ChatRoomUsers);
    }

    /**
     * @description remove the user from this user list by the specific userId
     * @arg {String} userId the user userId
     */
    removeUserByID(userId) {
        if (this.checkUser(userId) >= 0) {
            this.ChatRoomUsers = this.ChatRoomUsers.filter(function (value) {
                return value._id !== userId;
            });
        }
    }

    /**
     * @description check if the user is in this chat room
     * @arg {String} jwt the user jwt
     * @returns {Number} the index of the user in the user list
     */
    checkUser(jwt) {
        return this.ChatRoomUsers.findIndex((user) => user.jwt === jwt);
    }
}

/**
 * @description the list of all the room
 * @returns {Array}
 */
const roomList = [];

/**
 * @description get the chat room class
 * @arg {String} roomId corresponds to sessionId of the session
 * @returns {ChatRoom} the chat room for the roomId
 */
const GetChatRoom = (roomId) => {
    return roomList.find((room) => room.roomId === roomId);
};

/**
 * @description check the chat room is exist or not
 * @arg {String} roomId corresponds to sessionId of the session
 * @returns {Number} the room Index in the room list
 */
const CheckRoom = (roomId) => {
    return roomList.findIndex((room) => room.roomId === roomId);
};

/**
 * @description search the user in the specific room
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {String} jwt corresponds to the user jwt
 * @returns {JSON} {roomIndex : the room's index in the roomlistlist for the room, userIndex: the user index in the room}
 */
const CheckUser = (roomId, jwt) => {
    const RoomIndex = CheckRoom(roomId);
    if (RoomIndex !== -1) {
        return {
            roomIndex: RoomIndex,
            userIndex: roomList[RoomIndex].checkUser(jwt),
        };
    }
    return { roomIndex: RoomIndex, userIndex: -1 };
};

/**
 * @description add new user to specific room
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {Json} user user info
 * @returns {Array} the room list
 */
const AddNewUser = async (roomId, user) => {
    const { roomIndex } = CheckUser(roomId, user.jwt);
    if (roomIndex >= 0) {
        roomList[roomIndex].addUser(user);
        ioUserList.to(roomId).emit('user-connect', user);
        return roomList;
    }
    const newRoom = new ChatRoom(roomId);
    roomList.push(newRoom);
    roomList[roomList.length - 1].addUser(user);
    return roomList;
};

/**
 * @description disconnect a user from specific room
 * @arg {String} roomId corresponds to sessionId of the session
 * @arg {Json} user user info
 * @returns {Array} the room list
 */
const DisConnectUser = async (roomId, user) => {
    const { roomIndex, userIndex } = CheckUser(roomId, user.jwt);
    if (roomIndex >= 0 && userIndex >= 0) {
        roomList[roomIndex].removeUserByJWT(user.jwt);
        ioUserList.to(roomId).emit('user-disconnect', user.jwt);
    }
    return roomList;
};

/**
 * @description call when connection the chat room socket
 * @arg {socket} socket socket information
 */
async function onConnection(socket) {
    const { roomId } = socket.handshake.query;
    // roomId is just the sessionId -- we have different chatrooms for every session
    if (roomId) {
        console.log('userlist disconnected');
        socket.join(roomId);
    }
    socket.on('disconnect', () => {
        console.log('userlist disconnect');
    });
    // TODO: load current question
    // TODO: 193
    // register that a user joined this chatroom
}
ioUserList.on('connection', onConnection);

export default {
    GetChatRoom,
    AddNewUser,
    DisConnectUser,
};
