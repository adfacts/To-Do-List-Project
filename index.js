import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connecting
try {
    await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });
    console.log("Successfully connected to database");
} catch (err) {
    console.log(err);
}

const itemsSchema = new mongoose.Schema ({
    name: String
});

const AllToDo = mongoose.model("AllToDo", itemsSchema);
const WorkToDo = mongoose.model("WorkToDo", itemsSchema);
const HomeToDo = mongoose.model("HomeToDo", itemsSchema);
const AdditionalToDo = mongoose.model("AdditionalToDo", itemsSchema);

const item1 = new AllToDo({
    name: "Welcome to todo list app!"
});

const item2 = new AllToDo({
    name: "Click on the add button to create a new todo."
});

const item3 = new AllToDo({
    name: "Click to the todo to cancel it out."
});




//reading data
async function read(collection) {
    try {
        const toDos = await collection.find();
        console.log("Data read successfully.");
        // console.log(toDos);
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
            console.log("Saved to the database.");
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("Initial Data exists.");
    }
}
    
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

// let allToDo = [];

// let workToDo = [];

// let homeToDo = [];

// let additionalToDo = [];

// To check if initial data exists.



app.get("/", async (req, res) => {
    await initialCheckAndSave();
    const allToDo = await read(AllToDo);
    const url = '/';
    res.render("index.ejs", { allToDo, action: url });
});


app.post("/", async (req, res) => {
    // extra add the feature to tell if the input is invalid or empty.
    await savingData(AllToDo, req.body["newToDo"]);
    const allToDo = await read(AllToDo);
    const url = '/';
    res.render("index.ejs", { allToDo, action: url });
});

app.post("/delete", async (req, res) => {
    console.log("done");
    console.log(req.body);

});

app.get("/work", async (req, res) => {
    const workToDo = await read(WorkToDo);
    const url = '/work';
    res.render("work.ejs", { workToDo, action: url });
});

app.post("/work", async (req, res) => {
    await savingData(WorkToDo, req.body["newToDo"]);
    await savingData(AllToDo, req.body["newToDo"]);
    const workToDo = await read(WorkToDo);
    const url = '/work';
    res.render("work.ejs", { workToDo, action: url });
});

app.get("/home", async (req, res) => {
    const homeToDo = await read(HomeToDo);
    const url = "/home";
    res.render("home.ejs", { homeToDo, action: url });
});

app.post("/home", async (req, res) => {
    await savingData(HomeToDo, req.body["newToDo"]);
    await savingData(AllToDo, req.body["newToDo"]);
    const homeToDo = await read(HomeToDo);
    const url = "/home";
    res.render("home.ejs", { homeToDo, action: url });
});

app.get("/additional", async (req, res) => {
    const additionalToDo = await read(AdditionalToDo);
    const url = "/additional";
    res.render("additional.ejs", { additionalToDo, action: url });
});

app.post("/additional", async (req, res) => {
    await savingData(AdditionalToDo, req.body["newToDo"]);
    await savingData(AllToDo, req.body["newToDo"]);
    const additionalToDo = await read(additionalToDo);
    const url = "/additional";
    res.render("additional.ejs", { additionalToDo, action: url });
});

app.listen(port, () => {
    console.log("Server is running on port 3000.");
});
