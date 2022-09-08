import express from "express";
import { MongoClient, ObjectId} from "mongodb";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app =express();
app.use(cors());
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
app.use(express.json());

async function createConnection(){
    const client= new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Connected to mongoDB");
    return client;
}

const client = await createConnection();

app.get("/",(req,res)=>{
    res.send("This is CRUD API");
});


// create-user starts
app.post("/createUser", async (req,res)=>{
let newUser = req.body;

//check if user email id already exists in db
//insert user only if email id does not exist
let checkUserExistence = await checkUser(newUser.emailId);

if(checkUserExistence){
    res.send({msg:"User already exists!!"});
}
else{
    let result = await client.db("day24").collection("users").insertOne(newUser);
    res.send({msg:result.acknowledged});
}

})
// create-user ends

//find user to edit starts
app.get("/findUser/:id", async (req,res) => {
    let {id} = req.params;
    let result = await client.db("day24").collection("users").findOne({_id:ObjectId(id)});
    res.send(result);
})
//find user to edit ends

//updateUser starts
app.put("/updateUser/:id", async(req,res) => {
    let {id} = req.params;
    let updatedUser = req.body;
    let result = await client.db("day24").collection("users").updateOne({_id:ObjectId(id)},{$set:updatedUser});
    res.send(result);
})
//update user ends

//Delete user starts
app.delete("/deleteUser/:id", async(req,res) => {
    let {id} = req.params;
    let result = await client.db("day24").collection("users").deleteOne({_id:ObjectId(id)});
    res.send(result);
})
//Delete user ends



//get user profile from db starts
app.get("/getProfile/:id", async(req,res) => {
    let {id}= req.params;
    let result = await client.db("day24").collection("profiles").findOne({_id:id});
    res.send(result);
})
//get user profile gfrom db endds

//edit profile starts
app.put("/editProfile/:id", async(req,res) => {
    let {id}= req.params;
    let obj = req.body;
    
    let result = await client.db("day24").collection("profiles").updateOne({_id:id},{$set:obj});
    res.send(result);
})
//edit profile ends


app.get("/users", async(req,res) => {
    let usersList = await client.db("day24").collection("users").find().toArray();
    res.send(usersList);
})

app.listen(PORT,() => console.log(`App is listening to port ${PORT}`));




async function checkUser(email){
    let res = false;
    let allUsers = await client.db("day24").collection("users").find().toArray();

    //loop through all account's email id
    allUsers.map((accnt) =>{

        if(accnt.emailId === email){
            res= true;
        }
    })
    return res;
}