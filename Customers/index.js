const express=require('express');
const http=require('http');
const path=require('path');
const urlencoded=require('url');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const json=require('json');
const nano=require('nano')('http://admin:password@localhost:5984');
const routes=require('./routes');

var app=express();
var db=nano.use('feedback');

app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,'public')));

app.get('/',routes.index);

app.post('/new_entry',function(req,res){
    var name=req.body.name;
    var email=req.body.email;
    var phone=req.body.phone;
    var rating=req.body.rating;

    db.insert({name:name,phone:phone,email:email,rating:rating,crazy:true},phone,function(err,body,header){
        if(err){
            res.send('Error submitting feedback');
            return;
        }
        res.send('Feedback submitted successfully');
    });
});

app.post('/view_entry',function(req,res){
    var alldata="You have submitted: ";
    db.get(req.body.phone,{revs_info:true},function(err,body){
        if(!err){
            console.log(body);
        }
        if(body){
            alldata+"Name: "+body.name+"<br/>Phone: "+body.phone+"<br/>Email ID: "+body.email+"<br/>Rating: "+body.rating;
        }else{
            alldata="No records found."
        }
        res.send(alldata);
    });
});

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express Server listening on port '+app.get('port'));
});