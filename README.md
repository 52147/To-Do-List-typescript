# ToDo-List-Website


Build a dynamic data response To-Do-List website implemented by EJS and connected to backend database MongoDB to operate get, post, delete request from front-end localhost:3000 by using Node.js, Express.

The most challenging part to build this project was the typo in package.json, I spend lots of time to figure out why my project could not connect with heroku. And the termanl can not let me to git push heroko master and said there is some issue in my json file.
The issue is simple to solve, but it took me a while to found out where the issue was.

After I modified my json file(key map value and do not have comma in last document), and git add\* git commit -m "update" git push heroku master, and the website builds successfully by the heroku app.

What I found interested of built a full stack website by myself is that when the webiste is sucessfully released, all the time working on the project is worth it.

## 概述

1. 使用 Express 做框架。
2. 使用 MongoDB 來儲存所有 todo list 的名稱和其中的數據。
3. 使用路由(route)來對指定的 list 做增、刪、改、查，然後利用模板引擎來渲染數據生成 html，然後顯示到瀏覽器上。
4. 佈署 todo list 在 cyclic。

## Set Up

用 npm init 來為 project 創建一個 package.json，之後可以利用 npm <dependency> 來將 dependency 加到 package.json 中。

```
npm init
```

安裝 express

```
npm install express
```

安裝 mongoose

```
npm install mongoose
```

安裝 nodemon

```
npm install -g nodemon
```

使用 nodemon，讓 node project 被 nodemon 監視，如果 project 有被修改，nodemon 會自動重新在本地主機上運行

```
nodemon index.js
```

https://expressjs.com/en/starter/installing.html

https://www.npmjs.com/package/nodemon/v/1.18.10

## 實現

### 創建骨架

使用 MVC 軟體架構來設計網頁。

model : 導入 mongoose module 來對 mongodb 做操作。創建兩個 collection，一個為 list collection，用來儲存所有 list name，裡面包含一個 item collection，用來儲存指定 list 中的 item。

```javascript
const mongoose = require("mongoose");
```

view : 使用 ejs 模板引擎來利用模板文件渲染頁面。

```javascript
app.set("view engine", "ejs");
```

controller: 路由處理器來給予不同 http request 對應的操作。

```javascript
app.get("/", function (req, res) {
    ...
    res.render(...);
    }
```

#### 路由參數

使用路由參數讓使用者可以利用路由建立和使用不同的 list。

```javascript
// get url 中的路由參數以指定對應的list
app.get("/:customListName", function (req, res) {
  // 保存路由參數
  const customListName = _.capitalize(req.params.customListName);

  // 查詢 List Collection 中是否有對應的 List 名稱，如果沒找到的話，在List collection 創建一個新的list document
  // ，有的話將頁面導向那個list名稱的url
  List.findOne(
    {
      name: customListName,
    },
    function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    }
  );
});
```

https://hackmd.io/@Heidi-Liu/note-be201-express-node

### 使用 DB

#### 1. 連接到 MongoDB

```javascript
mongoose.connect(
  "mongodb+srv://123:123@cluster0.qc3xle7.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);
```

#### 2. 定義 Schema

items 的 schema，用來儲存不同的 items 名稱在對應的 list。

```javascript
const itemSchema = {
  name: String,
};
```

list 的 schema，用來儲存不同的 list 名稱於 list collcetion，其中內容有包含 item 的 collection。

```javascript
const listSchema = {
  name: String,
  items: [itemSchema],
};
```

#### 3. 創建模型

Item 的模型

```javascript
const Item = mongoose.model("Item", itemSchema);
```

List 的模型

```javascript
const List = mongoose.model("List", listSchema);
```

#### 4. 更新，刪除和查詢

儲存

<collection_name>.save(): 儲存更新過的的 document。

插入

<collection_name>.insertMany(...): 插入很多 doc

查詢

<collection_name>.find(...): 查詢所有 doc

<collection_name>.findOne(...): 查詢一個 doc

<collection_name>.findByIdAndRemove()

<collection_name>.findOneAndUpdate()

### host 網站

將網站利用 cyclic 佈署在雲端伺服器上。

## 自動化測試
