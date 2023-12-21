// 환경 변수
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const sha = require("sha256");
const cors = require("cors");
const session = require("express-session");

// controllers
const sessionController = require("./controllers/sessionController");
const postControllers = require("./controllers/postControllers");

app.use(
  session({
    secret: process.env.SESSION_NO,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;

let mydb;
mongoose
  .connect(URL, { dbName: "db1" })
  .then(() => {
    console.log("MongoDB에 연결");
    mydb = mongoose.connection.db;
  })
  .catch((err) => {
    console.log("MongoDB 연결 실패: ", err);
  });

app.post("/signup", async (req, res) => {
  console.log(req.body.userId);
  console.log(req.body.userPw);
  console.log(req.body.userGroup);
  console.log(req.body.userEmail);

  try {
    await mydb.collection("account").insertOne({
      userId: req.body.userId,
      userPw: sha(req.body.userPw),
      userGroup: req.body.userGroup,
      userEmail: req.body.userEmail,
    });

    console.log("회원가입 성공");
    res.json({ message: "회원가입 성공" });
  } catch (err) {
    console.log("회원가입 에러: ", err);
    res.status(500).send({ error: err });
  }
});

// 로그인
app.get("/login", sessionController.checkUserSession);
app.get("/", sessionController.checkUserSession);

app.post("/login", async (req, res) => {
  sessionController.loginUser(req, res, mydb);
});

// 로그아웃
app.get("/logout", sessionController.logoutUser);

// 게시판
// posts
app.get("/posts", postControllers.getPosts);

app.get("/posts/total", async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    res.json({ total: totalPosts });
  } catch (error) {
    console.log("오류: ", error);
    res.status(500).send("서버 오류");
  }
});

// 게시글 작성
app.post("/posts/write", async (req, res) => {
  const { title, content, writer, wdate } = req.body;
  try {
    const newPost = new Post({ title, content, writer, wdate });
    await newPost.save();
    res.sendStatus(200);
  } catch (error) {
    console.log("작성 오류: ", error);
    res.status(500).send("서버 작성 오류");
  }
});

// 게시글 읽기
app.get("/posts/read/:id", async (req, res) => {
  const postId = req.params.id;
  console.log(postId);

  try {
    const post = await Post.findOne({ _id: postId }).lean();
    if (!post) {
      return res.status(404).json({ error: "내용을 찾을 수 없습니다" });
    }
    res.json(post);
  } catch (error) {
    console.log("읽기 오류: ", error);
    res.status(500).send("서버 읽기 오류");
  }
});

// 게시글 삭제
app.post("/posts/delete/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await Post.deleteOne({ _id: postId });
    res.sendStatus(200);
  } catch (error) {
    console.log("삭제 오류: ", error);
    res.status(500).send("서버 삭제 오류");
  }
});

// 게시글 수정
app.post("/posts/update", async (req, res) => {
  const { id, title, content, writer, wdate } = req.body;
  try {
    await Post.updateOne({ _id: id }, { title, content, writer, wdate });
    res.sendStatus(200);
  } catch (error) {
    console.log("수정 오류: ", error);
    res.status(500).send("서버 수정 오류");
  }
});

app.listen(PORT, () => {
  console.log("8080번 포트에서 실행 중");
});
