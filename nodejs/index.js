const express = require("express");

var session = require("express-session");
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000*5 },
  })
);

// Access the session as req.session
app.get("/views",  function (req, res, next) {
  if (req.session.views) {
    req.session.views++;
    res.setHeader("Content-Type", "text/html");
    res.write("<p>views: " + Math.floor(req.session.views) + "</p>");
    res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
    res.end();
  } else {
    req.session.views = 1;
    res.end("welcome to the session demo. refresh!");
  }
});

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  if(req.session.counter){
    res.render("index", {counter: req.session.counter});
  }else{
    req.session.counter = 0;
    res.render("index", {counter: req.session.counter});
  }
  });

app.get('/add', (req,res)=>{
  req.session.counter++
  res.redirect('/')
})

app.get('/take', (req,res)=>{
  req.session.counter--
  res.redirect('/')
})

//app.use(errormiddleware);

app.get('/todolist',sessionmiddleware, (req,res)=>{
  
  if(req.session.todolist){
    res.render('todolist',{liste:req.session.todolist})
  }
  else
  {
    req.session.todolist=[]
    res.render('todolist',{liste:req.session.todolist})
  }
})

app.post('/todo/new', (req,res)=>{
  const {tache} = req.body ;
  req.session.todolist.push({
    id: req.session.views,
    tache,
    terminer:false 
  });
  res.redirect('/todolist');
})

app.get('/todo/del' , (req,res)=>{
 const{id}= req.query;
 req.session.todolist = req.session.todolist.filter((e,i)=>{
   return e.id!=id ;   
 })
 res.redirect('/todolist');
})

app.get('/todo/complete', (req,res)=>{
  const{id}= req.query;
  req.session.todolist = req.session.todolist.map((e,i)=>{
    if(e.id==id){
      e.terminer = true;
    }   
    return e;
 })
 res.redirect('/todolist');
})

app.listen(8080, () => {
  console.log("Serveur à l'écoute");
});

function middleware(req, res, next) {
  const error = new Error("broke");
  throw error;
}

function errormiddleware(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
}

function sessionmiddleware(req,res,next) {
  if (req.session.views) {
    req.session.views++;
    next();
  } else {
    req.session.views = 1;
    next();
  }
}
