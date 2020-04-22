import Users from '../db/collections/users';

class userConnectingList {
    constructor () {
        this.connectingUsers = new Array();
    }
    
    checkUserExist(userId) {
        for (let i = 0; i < this.connectingUsers.length; i++) {
            if (this.connectingUsers[i]._id.toString() === userId.toString()) {
                return true;
            }
        }
        return false;
    }

    addUser(user) {
        if(this.checkUserExist(user._id) === true) {
            return {success: false, reason: "The user has already login"};
        }
    
        this.connectingUsers.push(user);
        return {success: true, reason: "The user login success"};
    }

    addUserByUserID(userId) {
        if(this.checkUserExist(userId) === true) {
            return {success: false, reason: "The user has already login"};
        }
        Users.findByUserId(userId).then(r => {
            this.connectingUsers.push(r)
        }).catch(exception => {
            console.log(exception)
        })
        
    } 

    removeUser(userId) {
        if(! checkUserExist(userId)) {
            return {success: false, reason: "The user did not login"};
        }
        this.connectingUsers = this.connectingUsers.filter(function(value, index, arr) {
            return value._id !== userId;
        })
        return {success: true, reason: "success remove the user"};
    }

    getList() {
        const userList = this.connectingUsers;
        return userList;
    }

    getTotalNumber() {
        return this.connectingUsers.length();
    }
}

const connectingList = new userConnectingList();

export default {
    connectingList
}

