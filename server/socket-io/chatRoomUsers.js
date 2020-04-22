
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
    checkUser (userId) {
        return  this.ChatRoomUsers.findIndex(user => user._id === userId) 
    }
}


const roomList = []
const GetChatRoom = (roomId) => {
    return roomList.find(room => room.roomId === roomId);
}

const CheckRoom = (roomId) => {
    return roomList.findIndex(room => room.roomId === roomId);
}
const CheckUser = (roomId, userId) => {
    const RoomIndex = CheckRoom(roomId)
    if(RoomIndex !== -1){
        return{roomIndex: RoomIndex, userIndex: roomList[RoomIndex].checkUser(userId)};
        
    }
    return {roomIndex: RoomIndex, userIndex:-1};
    
}
const AddNewUser = async (roomId, user) => {
    const {roomIndex, userIndex} = CheckUser(roomId, user._id);
    if(roomIndex >= 0 ) {
        roomList[roomIndex].addUser(user);
        return roomList;
    }
    const newRoom = new ChatRoom(roomId);
    roomList.push(newRoom);
    roomList[roomList.length-1].addUser(user);
    return roomList;
    
}
export default{
    GetChatRoom,
    AddNewUser

};