var chatKey = '';
currentUserKey = '';
document.addEventListener('keydown',function(key){
    if(key.which === 13){
        SendMessage();
    }
});


function StartChat(friendKey,friendName,friendPhoto)
{
   
    var db=firebase.database().ref('friend_list');
    flag = false;
    var friendList = {friendId:friendKey , userId:currentUserKey};
    
    db.on('value',function(friends){
        friends.forEach(function(data){
            var user = data.val();
            if((user.friendId === friendList.friendId && user.userId === friendList.userId) || (user.friendId === friendList.userId && user.userId === friendList.friendId))
            {    
                flag=true;
                chatKey = data.key;
            }

        });
        if(flag === false)
        {
           chatKey = firebase.database().ref('friend_list').push(friendList , function(error){
                if(error)
                {
                    alert(error);
                }
                else
                {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style','display:none');
                    
                     hideChatList();
                }
            }).getKey();
        }
        else{
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style','display:none');
            
             hideChatList();
            
        }
       
        //dislplay friend name and photo in message panel
        document.getElementById('divChatName').innerHTML= friendName;
        document.getElementById('imgChat').src=friendPhoto;
        document.getElementById('messages').innerHTML='';
      
        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();
        
        //display the chat messages
       LoadChatMessages(chatKey,friendPhoto);
    });
  

}
function LoadChatMessages(chatKey,friendPhoto)
{
    var db=firebase.database().ref('chatMessages').child(chatKey);
    db.on('value',function(chats){
        var messageDisplay='';
        chats.forEach(function(data){
           var chat=data.val();
            var dateTime=chat.dateTime;
           
            if(chat.userId !== currentUserKey)
            {
              messageDisplay +=`  <div class="row">
              <div class="col-2 col-sm-1 col-md-1 ">
               <img src="${friendPhoto}" class="chat_pic rounded-circle"></img>
              </div>
              <div class="col-6 col-sm-7 col-md-7">
                  <p class="recieve">${chat.msg}
                      <span class="time float-right">${chat.dateTime}</span>
                  </p>
              </div>
          </div>`;
            }
            else{
                messageDisplay +=`   <div class="row justify-content-end">
                <div class="col-6 col-sm-7 col-md-7 ">
                   <p class="sent float-right">${chat.msg}
                       <span class="time float-right">${dateTime}</span>
                   </p>
               </div>
               <div class="col-2 col-sm-1 col-md-1 ">
                   <img src="${firebase.auth().currentUser.photoURL}" class="chat_pic rounded-circle"></img>
                  </div>
                 
            </div>`; 
         
            }
         
        
        });
        document.getElementById('messages').innerHTML=messageDisplay;
        document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
        
    });
}
function showChatList()
{
    document.getElementById('side-1').classList.remove('d-none','d-md-block');
    document.getElementById('side-2').classList.add('d-none'); 
}
function hideChatList()
{
    document.getElementById('side-1').classList.add('d-none','d-md-block');
    document.getElementById('side-2').classList.remove('d-none'); 
}

function SendMessage()
{
    
 
    var time =new Date();
    var chatMessage ={
    userId:currentUserKey,
    msg:document.getElementById('txtMessage').value,
    dateTime:time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
};
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage,function(error){
        if(error)
        {
            alert(error);
        }
        else
        {
           
         //   var message=`   <div class="row justify-content-end">
         //   <div class="col-6 col-sm-7 col-md-7 ">
           //    <p class="sent float-right">${document.getElementById('txtMessage').value}
         //          <span class="time float-right">${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
          //     </p>
         //  </div>
        //   <div class="col-2 col-sm-1 col-md-1 ">
         //      <img src="${firebase.auth().currentUser.photoURL}" class="chat_pic rounded"></img>
          //    </div>
             
       // </div>`; 
       // document.getElementById('messages').innerHTML+=message;
        document.getElementById('txtMessage').value='';
        document.getElementById('txtMessage').focus();
       // document.getElementById('messages').scrollTo(0,document.getElementById('messages').clientHeight);
        
        }
    });
   }
   function LoadChatList()
   {
       var frnd_lst='';
       var db=firebase.database().ref('friend_list');
       db.on('value',function(lists){
          frnd_lst=`<li class="list-group-item" >
           <input type="text" placeholder="search or new chat" class="form-control form-rounded" ></input>
       </li>`;
        lists.forEach(function(data){
            var lst = data.val();
            var friendKey = '';
            if(lst.friendId === currentUserKey){
                friendKey = lst.userId;
            }
            else if(lst.userId === currentUserKey)
            {
                friendKey = lst.friendId;
            }
          
            if(friendKey !== "")
            {
                firebase.database().ref('users').child(friendKey).on('value',function(data){
                    var user= data.val();
                   frnd_lst+=`<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" class="rounded-circle gym_title"></img>
                        </div>
                        <div class="col-md-10" >
                            <div class="name">${user.name}</div>
                            <div class="under-name">this is some msg text</div>
                            
                        </div>
                    </div>
                </li>`;
                });

            }
           
        });
        document.getElementById('lstChat').innerHTML=frnd_lst;
        frnd_lst='';
       
       });
   }
function PopulateFriendList()
{
    document.getElementById('lstFriend').innerHTML=`<div class="text-center">
    <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem;"></span>
    </div>`;
    var db=firebase.database().ref('users');
       var lst='';
    db.on('value',function(users){
        if(users.hasChildren())
        {
             lst=` <li class="list-group-item" >
            <input type="text" placeholder="search " class="form-control form-rounded" ></input>
        </li>`;
        }
        users.forEach(function(data){
            if(users.email !== firebase.auth().currentUser.email)
            {
            var user = data.val();
            lst+=   `   <li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="StartChat('${data.key}','${user.name}','${user.photoURL}')">
            <div class="row">
                <div class="col-md-2">
                    <img src=${user.photoURL} class="rounded-circle gym_title"></img>
                </div>
                <div class="col-md-10" >
                    <div class="name">${user.name}</div>
                    <div class="under-name">this is some msg text</div>
                    
                </div>
            </div>
        </li>`;
            }
        });
        document.getElementById('lstFriend').innerHTML=lst;
        lst='';
    });
}
function signIn()
{
   
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);

}
function signOut()
{
    firebase.auth().signOut();
    document.getElementById('display_nm').innerHTML="Aay's CHAT System ";
       
}
function onFirebaseStateChanged()
{
    firebase.auth().onAuthStateChanged(onStateChanged);
}
function onStateChanged(user)
{
    var d = (new Date()).toString().split(' ').splice(1,3).join(' ');
  
    if(user)
    {
    
        var usersProfile={email:'',name:'',photoURL:'',dateJoined:'',expiry_date:'',email_sent:''};
        usersProfile.email=firebase.auth().currentUser.email;
        usersProfile.name=firebase.auth().currentUser.displayName;
        usersProfile.photoURL=firebase.auth().currentUser.photoURL;
        usersProfile.dateJoined=d;
        usersProfile.expiry_date="NA";
        usersProfile.email_sent="no";
        var db=firebase.database().ref('users');
        var flag= false;
        db.on('value',function(users){
            users.forEach(function(data){
                var user = data.val();
                if(user.email === usersProfile.email)
                {
                    currentUserKey = data.key;
                    flag=true;
                }
            });
            if(flag === false)
            {
                firebase.database().ref('users').push(usersProfile,callback);
     
            }
            else
            {
                document.getElementById('display_nm').innerHTML=firebase.auth().currentUser.displayName;
        
            }
        });
         document.getElementById('si').style="display:none";
        document.getElementById('so').style='';
        document.getElementById('lnkNewChat').classList.remove('disabled');
        LoadChatList();
        
    }
    else
    {
        document.getElementById('si').style='';
        document.getElementById('so').style="display:none";
       document.getElementById('lnkNewChat').classList.add('disabled');
    }
}
onFirebaseStateChanged();
function callback(error)
{
    if(error)
    {
        alert(error);
    }
    else
    {
        alert('data inserted');
    }
}