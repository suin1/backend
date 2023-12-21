// postControllers.js

// Post 모델
const Post = require("./models/postModel");

exports.getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    const posts = await Post.find()
      .sort({ wdate: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    res.json({ docs: posts, totalPages });
  } catch (error) {
    console.log("posts err: ", error);
    res.status(500).send("posts 서버 오류");
  }
};
