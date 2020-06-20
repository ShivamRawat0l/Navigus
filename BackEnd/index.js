const express = require("express")
const bcrypt = require("bcrypt")
const handlebars = require('express-handlebars');
var bodyParser = require("body-parser");
const path =require('path')
const fetch = require('node-fetch');
const session = require('express-session')
const jwt = require("jsonwebtoken");
var cors = require('cors')
const { type } = require("os");

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let req1 = new XMLHttpRequest();

const jwtKey = "passwordhell"
const jwtExpirySeconds = 300
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var idMapper= {} ;
var channelMapper = {};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.get("/a",(req,res)=>{
    res.sendFile(path.join(__dirname+'/main.html'));
})
app.get("/register",(req,res)=>{
    res.render(path.join(__dirname+'/main.html'),{name:"",success:""});
})
app.get("/login",(req,res)=>{
    res.render(path.join(__dirname+'/login.html'),{token:"",success:'',error:''});
})
app.post("/register",(req,res)=>{
    console.log(req.body.username)
    fetch("https://api.jsonbin.io/b/5eed19e72406353b2e08de31",{headers: {
    'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
  }}).then(a=>a.json()).then(async blob=>{
      var user = {"email": req.body.username , "password":req.body.password}
      
      console.log(blob);
        if(req.body.username==="" || req.body.password===""){
            console.log("HERE");
            res.render(path.join(__dirname+'/main.html'),{name:"Username or Password Empty",success:""});
            return 
        }
        for( const item of blob["Config"]){
            if(await item["email"]==req.body.username){
                console.log(item["password"])
            await    res.render(path.join(__dirname+'/main.html'),{name:"USERNAME ALREADY IN USE",success:""});
            return 
            }
        }
      await  blob["Config"].push(user);
     await console.log(blob)
    await   fetch("https://api.jsonbin.io/b/5eed19e72406353b2e08de31", {
      
    body: JSON.stringify(blob),
    headers: {
        "Content-Type":"application/json",
     'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
     'versioning':'false'
   },
    method: "PUT"
        
  }).then(response=>{console.log(response); res.render(path.join(__dirname+'/main.html'),{name:"",success:"USER CREATED"}); return})
  .catch(err=>{
    res.render(path.join(__dirname+'/main.html'),{name:"USERNAME ALREADY IN USE",success:""});
  })
  
  
  }).catch(err=>{
    res.render(path.join(__dirname+'/main.html'),{name:"USERNAME ALREADY IN USE",success:""});
  })
  
})
app.post("/login",(req,res)=>{
    var accountFound = false;
    fetch("https://api.jsonbin.io/b/5eed19e72406353b2e08de31",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then( blob=>{
        for( const item of blob["Config"]){
            if( item["email"]==req.body.username){
                if( item["password"]==req.body.password)
                {
                    accountFound = true;  
                }
            } 
        }
        if(accountFound){
            const user= {
                username : req.body.username,
            }
             jwt.sign({user:user},"password",async (err,token)=>{
                console.log(token)
                 res.render(path.join(__dirname+'/login.html'),{token:token,success:"",error:""});
                return
            })
        }
        else{
            res.render(path.join(__dirname+'/login.html'),{token:"",success:"",error:"Username or password incorrect"});
        }     
      })
      

})
app.get("/verifyToken",(req,res)=>{
    const token = req.query.jwt;
    console.log(token)
    if(typeof token!=='undefined'){
            jwt.verify(token,'password',(err,authData)=>{
                console.log(err)
                console.log(authData)
                res.json({
                    username: authData['user']
                })
            });
    }else {
        res.json([false]);
    }
})

app.get("/new",(req,res)=>{
    res.render(path.join(__dirname+'/newDocument.html'))
})













app.get("/addDocument",(req,res)=>{
    fetch("https://api.jsonbin.io/b/5eede831e2ce6e3b2c761e3c",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then(async (blob)=>{
      
        
        for( const  item of blob["Files"]){
           if(await item==req.query.name){
            res.send({added:false})
            return 
           }
       }
     await  blob["Files"].push(req.query.name);
     await console.log(blob)
     await  fetch("https://api.jsonbin.io/b/5eede831e2ce6e3b2c761e3c", {
     
   body:  JSON.stringify(blob),
   headers: {
       "Content-Type":"application/json",
       'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
       'versioning':'false'
  },
   method: "PUT"
       
 }).then(response=>{
        if(response.status==200){
            res.json({added:true})
        }
        else{
            res.json({added:false})
        }
 })
 .catch(err=>{
   res.json({added:false})
 })
 
 })
    
    
    
})
app.get("/getAllDocuments",(req,res)=>{
    fetch("https://api.jsonbin.io/b/5eede831e2ce6e3b2c761e3c",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then(async (blob)=>{
            res.json(blob);
      })
    
    
})


io.on('connection', (socket) => {
   var userData ; 
    socket.on('disconnect', function () {
        
      
        io.sockets.in(channelMapper[socket.id]).emit('disconnectClient', idMapper[socket.id]);
        socket.leave(channelMapper[socket.id]);
        /*
        fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then( (blob)=>{
          blob[userData['channel']]=blob[userData['channel']].filter(data=>{
              if(data!=userData['name'])
              return data;
          })
          fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011", {
     
            body:  JSON.stringify(blob),
            headers: {
                "Content-Type":"application/json",
                'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
                'versioning':'false'
           },
            method: "PUT"
                
          })


      })
      */
     });
     
     socket.on('UserName', function (msg) {
        console.log(msg);

        socket.join(msg["channel"]);
        channelMapper[socket.id]=msg['channel'];
        idMapper[socket.id]=msg['name'];
        userData = msg;
        idMapper[socket.id]=msg['name'];
        io.of('/').adapter.clients([msg['channel']], (err, client) => {
            clients = client.map(data=>{
                return idMapper[data];
            })
            io.sockets.in(msg["channel"]).emit('newConnection', clients);
            console.log(clients)
          });
         
        
/*
       fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then( (blob)=>{
          blob[msg['channel']].push(msg['name']);
          fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011", {
     
            body:  JSON.stringify(blob),
            headers: {
                "Content-Type":"application/json",
                'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
                'versioning':'false'
           },
            method: "PUT"
                
          })


      })*/
  });
})
app.get("/read",(req,res)=>{
    res.render(path.join(__dirname+'/session.html'));
})


app.get("/getUsers",(req,res)=>{
    fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011",{headers: {
        'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
      }}).then(a=>a.json()).then( (blob)=>{
          var found =false;
            if(blob[req.query.docname]==undefined){
                fetch("https://api.jsonbin.io/b/5eede831e2ce6e3b2c761e3c",{headers: {
                    'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
                  }}).then(a=>a.json()).then( (bob)=>{



                    for(const files of bob["Files"]){
                        if(files==req.query.docname){
                            found=true;
                            break;
                        }
                    } 
                    if(found){
                        blob[req.query.docname]=[];
                    fetch("https://api.jsonbin.io/b/5eee064697cb753b4d146011", {
                        body:  JSON.stringify(blob),
                        headers: {
                            "Content-Type":"application/json",
                            'secret-key': '$2b$10$TM5cAtXueg31IxToas.zuu2NL2qiVyKXqpcAoCJ4kHY31iA/NiZ9i',
                            'versioning':'false'
                       },
                        method: "PUT"
                            
                      }).then(response=>{
                                 res.json([false]);
                             
                      })
                    }
                    else{
                        res.json([false]);
                    }

                        
                  })
                   
                    
                
                
            }else{
                res.json(blob[req.query.docname]);
                
            }
           
      })
})
http.listen(8000)
