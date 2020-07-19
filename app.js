const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vaibhav:test123@cluster0.wsvcn.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist page"
});

const item2 = new Item({
  name: "Press the + icon to add new item"
});

const item3 = new Item({
  name: "Press the <-- button to remove item"
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);

        } else {
          console.log("SuccessfullySaved items to database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: 'Today',
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const listItem= req.body.list;
  const item = new Item({
    name:req.body.newItem
  });

  if(listItem==="Today"){
item.save();
res.redirect("/");
}
else{
  List.findOne({name:listItem},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listItem);
  })
}
});

app.post("/delete",function(req,res){
  const itemID= req.body.checkBox;
  const listName=req.body.listName;

  if(listName==="today"){
  Item.findByIdAndRemove(itemID,function(err){
    if(!err){
      console.log("Successfully deleted item");
    }
  });
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName},
    {$pull:{items:{_id:itemID}}},
    function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });

}
});


app.get("/:titleName",function(req,res){
const titleName=_.capitalize(req.params.titleName);

List.findOne({name:titleName},function(err,result){
  if(!err){
    if(!result){
    const list= new List({
      name:titleName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+titleName);
  }
  else{
    res.render("list",{listTitle:result.name,newListItems:result.items});
  }
}
 });

});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
