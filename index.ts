/* init basic express app */
import express, { Request, Response, NextFunction } from "express"
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import { Schema, model, connect } from "mongoose"


/* require config */
import dotenv from "dotenv"
dotenv.config()

/* PORT should be capitalized */
const port = process.env.PORT || 3000

/* Routes */
import { routerList } from "./routes"
routerList(app)

/* Error Handling */
import { initUncaughtException, initUnhandledRejection } from "./utils/process"
import { appError, errorHandlerMainProcess } from "./utils/mixinTools"
initUncaughtException()
initUnhandledRejection()
// app.use((req: Request, res: Response, next: NextFunction) => {
//     next(appError(404, "40401", "No Routes"))
// })
app.use(errorHandlerMainProcess)

//利用 jshint 來檢查代碼錯誤

// 利用 require() 來引用模塊
// use require() to load express and body-parser module
// const express = require("express")
import bodyParser from "body-parser"
import mongoose from "mongoose" // require mongoose module
import _ from "lodash"
import { render } from "ejs"

// 使用 node.js 框架 express
// create an express application
// const app = express()

// connect with mongoose MongoDB   -> 寫在emb
mongoose.connect(
    "mongodb+srv://123:123@cluster0.qc3xle7.mongodb.net/todolistDB"
)
// mongoose.set("strictQuery", true)

// mongodb schema : schema map with mongo db collection
const itemSchema = new Schema({
    name: String,
})


// model function: a instance of document
const Item = mongoose.model("Item", itemSchema)




// create 3 document
const item1 = new Item({
    name: "Welcome to your todolist!",
})

const item2 = new Item({
    name: "Hit the + button to add a new item.",
})

const item3 = new Item({
    name: "<-- Hit this to delete an item.",
})

// put the 3 item in the array
const defaultItems = [item1, item2, item3]

// const listSchema = {
//     name: String,
//     items: [itemSchema],
// }
const listSchema = new Schema({
    name: String,
    items: [itemSchema],
})

const List = mongoose.model("List", listSchema)

// put the middleware ejs at the path "view-engine"
app.set("view engine", "ejs")

// use bodyParser middleware urlendcode function
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// use middleware to access static file via http
app.use(express.static("public"))
const today = new Date()

const day = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
})

// send data back when receive get request from the path '/'
app.get("/", function (req, res) {
    // create a find function to find item(empty bracket means find all)
    Item.find({}, function (err : any, foundItems : any) {
        // if there is nothing in Item, insert 3 item, else display foundItems on browser
        if (foundItems.length === 0) {
            // insert mant document in mongo db
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully saved default items to DB.")
                }
            })
            res.redirect("/") // redirect to / (root browser)
        } else {
            res.render("list", {
                listTitle: day,
                newListItems: foundItems,
            })
        }
    })
})

app.get("/", function (req, res) {
    Item.find({}, function (err  : any, foundItems : any) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully savevd default items to DB.")
                }
            })
            res.redirect("/")
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems,
            })
        }
    })
})

// get url 中的路由參數以指定對應的list
app.get("/:customListName", function (req, res) {
    // 保存路由參數
    const customListName = _.capitalize(req.params.customListName)

    // 查詢 List Collection 中是否有對應的 List 名稱，如果沒找到的話，在List collection 創建一個新的list document
    // ，有的話將頁面導向那個list名稱的url
    List.findOne(
        {
            name: customListName,
        },
        function (err : any, foundList : any) {
            if (!err) {
                if (!foundList) {
                    //Create a new list
                    const list = new List({
                        name: customListName,
                        items: defaultItems,
                    })
                    list.save()
                    res.redirect("/" + customListName)
                } else {
                    //Show an existing list
                    res.render("list", {
                        listTitle: foundList.name,
                        newListItems: foundList.items,
                    })
                }
            }
        }
    )
})

// use post to deal with the data that user submit from browser
app.post("/", function (req, res) {
    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: itemName,
    })

    if (listName === day) {
        item.save()
        res.redirect("/")
    } else {
        List.findOne(
            {
                name: listName,
            },
            function (err : any, foundList : any) {
                foundList.items.push(item)
                foundList.save()
                res.redirect("/" + listName)
            }
        )
    }
})

// delete function
app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, function (err : any) {
            if (!err) {
                console.log("Successfully deleted checked item.")
                res.redirect("/")
            }
        })
    } else {
        List.findOneAndUpdate(
            {
                name: listName,
            },
            {
                $pull: {
                    items: {
                        _id: checkedItemId,
                    },
                },
            },
            function (err : any, foundList : any) {
                if (!err) {
                    res.redirect("/" + listName)
                }
            }
        )
    }
})

// Q: how to make about page show?????
app.get("/about", function (req, res) {
    res.render("about")
})

app.listen(process.env.PORT || 8000, function () {

    console.log("Server started on port 8000")

})
