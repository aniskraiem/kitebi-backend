const Post = require("../models/post");
const User = require("../models/user");
exports.getAllComment= async (req, res) => {
  
    try {
      const post = await Post.findById(req.params.id);
    res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }

  exports.EditComment= async (req, res) => {
      console.log(req.body)
      console.log(req.params)

      try {
      const post = await Post.findById(req.params.id);
      let comment =post.comments;
      comment.map(x=>{
        if(x._id==req.params.comment_id){
            x.text=req.body.textc
        }
      })
      post.save()
    res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }


  exports.addcomment= async (req, res) => {
  
    try {
    //   const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.body.id);

      const newComment = {
        text: req.body.text,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        avatar: user.pictureId,
        user: req.body.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }

  
  exports.deleteComment= async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      // Pull out comment
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      // Make sure comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
    //   // Check user
    //   if (comment.user.toString() !== req.user.id) {
    //     return res.status(401).json({ msg: 'User not authorized' });
    //   }
  
      post.comments = post.comments.filter(
        ({ id }) => id !== req.params.comment_id
      );
  
      await post.save();
  
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }

exports.getAll = async (req, res) => {
    try {
        const userPosts = await Post.find();
        res.status(200).json(userPosts);
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getAllPopulated = async (req, res) => {
    try {
        res.status(200).send({"posts": await Post.find().populate("userId")});
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getAllPopulatedByUser = async (req, res) => {
    try {
        const userPosts = await Post.find({
            userId: req.params.userId
        }).populate("userId");
        res.status(200).json({posts: userPosts});
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getByUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.get = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.add = async (req, res) => {
    const newPost = new Post(req.body);

    if (req.files) {
        // SAVE IMAGE
        if (req.files.file) {
            newPost.img = req.files.file[0].filename;
        }

        // SAVE AUDIO
        if (req.files.audio) {
            newPost.audioId = req.files.audio[0].filename;
        }
    }

    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
}

exports.addOnlyImage = async (req, res) => {
    const newPost = new Post(req.body);

    if (req.file) {
        newPost.img = req.file.filename
    }

    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
}

exports.addOnlyAudio = async (req, res) => {
    const newPost = new Post(req.body);

    if (req.file) {
        newPost.audioId = req.file.filename
    }
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
}

exports.update = async (req, res) => {
    try {
        let post = await Post.updateOne({_id: req.params.id}, {$set: req.body});
        res.status(200).json("the post has been updated");

    } catch (err) {
        res.status(500).json(err);
    }
}

exports.delete = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.like = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: {likes: req.body.userId}});
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({$pull: {likes: req.body.userId}});
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.likeMobile = async (req, res) => {

    console.log(req.body)

    try {
        const post = await Post.findById(req.body.idPost);

        if (post) {
            if (!post.likes.includes(req.body.idUser)) {
                await Post.findByIdAndUpdate(
                    {_id: req.body.idPost},
                    {
                        $push: {
                            likes: req.body.idUser,
                        },
                    }
                )
                res.status(200).json("The post has been liked");
            } else {
                await Post.findByIdAndUpdate(
                    {_id: req.body.idPost},
                    {
                        $pull: {
                            likes: req.body.idUser,
                        },
                    }
                )
                res.status(200).json("The post has been disliked");
            }
        } else {
            res.status(404).json("Post not found")
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
}
