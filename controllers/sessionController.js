// sessionController.js

const sha = require("sha256");

// 사용자 세션 확인
const checkUserSession = (req, res) => {
  if (req.session.user) {
    console.log("세션 유지");
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
};

// 사용자 로그인 함수
const loginUser = async (req, res, mydb) => {
  const { userId, userPw } = req.body;
  console.log("id: ", userId);
  console.log(`pw: ${userPw}`);

  try {
    const result = await mydb.collection("account").findOne({ userId });

    if (!result) {
      return res.json({ err: "아이디를 찾을 수 없습니다" });
    } else if (result.userPw && result.userPw === sha(userPw)) {
      req.session.user = { userId, userPw };
      console.log("새로운 로그인");
      res.json({ user: req.session.user });
    } else {
      return res.json({ err: "비밀번호가 틀렸습니다" });
    }
  } catch (err) {
    console.log("로그인 에러 : ", err);
    res.status(500).json({ err: "서버 오류" });
  }
};

// 사용자 로그아웃 함수
const logoutUser = (req, res) => {
  console.log("로그아웃");
  req.session.destroy();
  res.json({ user: null });
};

module.exports = {
  checkUserSession,
  loginUser,
  logoutUser,
};
