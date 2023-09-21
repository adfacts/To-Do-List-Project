import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connecting
try {
    await mongoose.connect("mongodb+srv://admin-aman:Test123@cluster0.tmicwtn.mongodb.net/todolistDB", { useNewUrlParser: true });
    console.log("Successfully connected to database");
} catch (err) {
    console.log(err);
}

const itemsSchema = new mongoose.Schema ({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const AllToDo = mongoose.model("AllToDo", itemsSchema);
const List = mongoose.model("List", listSchema);


const item1 = new AllToDo({
    name: "Welcome to todo list app!"
});

const item2 = new AllToDo({
    name: "Click on the add button to create a new todo."
});

const item3 = new AllToDo({
    name: "Tick the checkbox and then click on the todo to delete it."
});


// TODO: To be used for all reading operations.
//reading data
async function read(collection) {
    try {
        const toDos = await collection.find();
        return toDos
    } catch (err) {
        console.log(err);
    }
}

//checking initial data and saving
async function initialCheckAndSave() {
    const result = await read(AllToDo);
    if (result.length === 0) {
        try {
            await AllToDo.insertMany([item1, item2, item3]);
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("Initial Data exists.");
    }
}

// TODO: To be used for all saving operations.
async function savingData(collection, toDo) {
    const newToDo = new collection({
        name: toDo
    });

    try {
        await newToDo.save();
        console.log("Data Saved.");
    } catch (err) {
        console.log(err);
    }
}


app.get("/", async (req, res) => {
    await initialCheckAndSave();
    const allToDo = await read(AllToDo);
    const url = '/';
    res.render("index.ejs", {listTitle: "All Tasks", allToDo, action: url, customLists: await List.find() });
});


app.post("/", async (req, res) => {
    await savingData(AllToDo, req.body["newToDo"]);
    const allToDo = await read(AllToDo);
    const url = '/';
    res.render("index.ejs", {listTitle: "All Tasks", allToDo, action: url, customLists: await List.find() });
});

app.post("/delete", async (req, res) => {
    const id = req.body.checkbox;
    console.log("id: ",id);
    const customListName = req.body["customListName"];
    console.log("customListName: ", customListName);
    const referringURL = new URL(req.get("referer")).pathname;
    console.log("referringURL: ", referringURL);
    if (typeof id !== "undefined") {
        if (referringURL === "/") {
            await AllToDo.findByIdAndDelete(id);
            res.redirect("/");
        } else {
            await List.findOneAndUpdate({ name: customListName }, { $pull: { items: { _id: id } } });
            await AllToDo.findByIdAndDelete(id);
            res.redirect(referringURL);
        }
    } else {
        res.redirect(referringURL);
    }
});

// to handle favicon.ico stuff.
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});


// to handle custom lists
app.get("/:customListName", async (req, res) => {
    
    const customListName = req.params.customListName;
    const url = "/addToList";
    const existingList = await List.findOne({ name: customListName });
    res.render("index.ejs", { listTitle: customListName, allToDo: existingList.items, action: url, customLists: await List.find() });
});

app.post("/createList", async (req, res) => {
    const customListName = _.capitalize(req.body["customListName"]);
    const url = "/addToList";
    const existingList = await List.findOne({ name: customListName });
    if (!existingList) {
        console.log("Doesn't exist!");
        const list = new List({
            name: customListName,
            items: []
        });
        await list.save();
        res.render("index.ejs", { listTitle: customListName, allToDo: list.items, action: url, customLists: await List.find() });
    } else {
        console.log("Exists!");
        res.redirect("/" + customListName);
    }
});

app.post("/addToList", async (req, res) => {
    const customListName = req.body["customListName"];
    const url = "/addToList";

    const existingList = await List.findOne({ name: customListName });

    const item = new AllToDo({
        name: req.body["newToDo"]
    });
    
    existingList.items.push(item);
    await existingList.save();
    await item.save();
    res.redirect("/" + customListName);
});

app.listen(port, () => {
    console.log("Server is running on port 3000.");
});
