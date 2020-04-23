import io from '.';


const ioUserList = io.of('/userList');
class ChatRoom {
    constructor (roomId) {
        this.roomId = roomId;
        this.ChatRoomUsers = new Array();
    }
    getRoomId() {
        return this.roomId;
    }
    getUserList() {
        return this.ChatRoomUsers;
    }
    addUser (newUser) {
        if(this.checkUser(newUser._id) < 0)
            this.ChatRoomUsers.push(newUser)
        console.log(this.ChatRoomUsers)
    }
    removeUserByJWT (jwt) {
        if(this.checkUser(jwt) >= 0)
        {
            this.ChatRoomUsers = this.ChatRoomUsers.filter(function(value, index, arr){

                return value.jwt !== jwt;
            
            });
        }
        console.log(this.ChatRoomUsers)
    }
    removeUserByID (userId) {
        if(this.checkUser(userId) >= 0)
        {
            this.ChatRoomUsers = this.ChatRoomUsers.filter(function(value, index, arr){

                return value._id !== userId;
            
            });
        }
        console.log(this.ChatRoomUsers)
    }
    checkUser (jwt) {
        return  this.ChatRoomUsers.findIndex(user => user.jwt === jwt) 
    }
}


const roomList = []
const GetChatRoom = (roomId) => {
    return roomList.find(room => room.roomId === roomId);
}

const CheckRoom = (roomId) => {
    return roomList.findIndex(room => room.roomId === roomId);
}
const CheckUser = (roomId, userId, jwt) => {
    const RoomIndex = CheckRoom(roomId)
    if(RoomIndex !== -1){
        return{roomIndex: RoomIndex, userIndex: roomList[RoomIndex].checkUser(jwt)};
        
    }
    return {roomIndex: RoomIndex, userIndex:-1};
    
}
const AddNewUser = async (roomId, user) => {
    const {roomIndex, userIndex} = CheckUser(roomId, user._id, user.jwt);
    if(roomIndex >= 0 ) {
        roomList[roomIndex].addUser(user);
        ioUserList.to(roomId).emit('userConnect', user);
        return roomList;
    }
    const newRoom = new ChatRoom(roomId);
    roomList.push(newRoom);
    roomList[roomList.length-1].addUser(user);
    return roomList;
    
}

const DisConnectUser = async (roomId, user) => {
    const {roomIndex, userIndex} = CheckUser(roomId, user._id, user.jwt);
    if(roomIndex >= 0 && userIndex >= 0) {
        roomList[roomIndex].removeUserByJWT(user.jwt);
        ioUserList.to(roomId).emit('userDisconnect', user.jwt);
    }
    return roomList
    
}
async function onConnection(socket) {
    const { roomId } = socket.handshake.query;
    // roomId is just the sessionId -- we have different chatrooms for every session
    console.log("userlist connect")
    if (roomId) {
        socket.join(roomId);
    }
    socket.on("disconnect",() => {
       console.log("userlist disconnect")
    });
    // TODO: load current question
    // TODO: 193
    // register that a user joined this chatroom
    
    
}
ioUserList.on('connection', onConnection); 

export default{
    GetChatRoom,
    AddNewUser,
    DisConnectUser

};