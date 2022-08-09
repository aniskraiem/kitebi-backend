let Audiobook = require("../models/audiobook");
const fs = require("fs");
const User = require("../models/user");

exports.get = async (req, res) => {
    res.send({audiobook: await Audiobook.findById(req.body._id)});
};
exports.getwithParams = async (req, res) => {
    res.send({audiobook: await Audiobook.findById(req.params.bookId)});
};
exports.getAll = async (req, res) => {
    res.send({audiobooks: await Audiobook.find()});
};

exports.getFavorite = async (req, res) => {
    let user = await User.findById(req.params.userId).populate("favoriteAudiobooks")
    res.send({audiobooks: await user.favoriteAudiobooks});
};

exports.add = async (req, res) => {
    const {title, author, releaseDate,categories} = req.body;

    let audiobook = await new Audiobook({
        title,
        author,
        releaseDate,
        categories:req.body.categories,
        coverId: req.files.cover[0].filename,
        audioId: req.files.audio[0].filename
    })
    audiobook.save();
    return res.send({message: "Audiobook added successfully", audiobook});
};

exports.update = async (req, res) => {
    const {_id} = req.body;
    try {
  
        let audiobook = await Audiobook.findById(_id);
        if (req.file) {
            pictureFileName = req.file.filename;
        }else{

            pictureFileName = audiobook.coverId;
           
        }
        if (audiobook) {

            audiobook.title= req.body.title?req.body.title:audiobook.title,
            audiobook.author= req.body.author?req.body.author:audiobook.author,
            audiobook.releaseDate= req.body.releaseDate?req.body.releaseDate:audiobook.releaseDate,
            audiobook.categories=req.body.categories?req.body.categories:audiobook.categories,
            audiobook.coverId= pictureFileName
        }
        await  audiobook.save()
        return res.send(audiobook);
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: error});
        

    }

};

exports.toggleFavorite = async (req, res) => {
    const {_id, userId} = req.body;

    let user = await User.findById(userId);

    if (user) {
        if (user.favoriteAudiobooks.includes(_id)) {
            await user.update({
                $pull: {
                    favoriteAudiobooks: _id
                }
            });
            return res.send({message: "Favorite Audiobook added"});
        } else {
            await user.update({
                $push: {
                    favoriteAudiobooks: _id
                }
            });
            return res.send({message: "Favorite Audiobook removed"});
        }
    } else {
        return res.status(404).send({message: "User does not exist"});
    }
};

exports.delete = async (req, res) => {
    await Audiobook.findById(req.params.bookId)
        .then(function (audiobook) {

            deleteFile("./uploads/audiobooks/" + audiobook.coverId)
            deleteFile("./uploads/audiobooks/" + audiobook.pdfId)

            audiobook.remove();

            return res.status(201).send({message: "Audiobook deleted"});
        }).catch(function (error) {
            console.log(error)
            res.status(500).send();
        });
};

exports.deleteAll = async (req, res) => {
    Audiobook.find()
        .then(function (audiobooks) {
            audiobooks.forEach(function (audiobook) {

                deleteFile("./uploads/audiobooks/" + audiobook.coverId)
                deleteFile("./uploads/audiobooks/" + audiobook.pdfId)

                audiobook.remove();
            });

            res.send({message: "All audiobooks have been deleted"});
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).send();
        });
};

function deleteFile(fullPath) {
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error("Could not delete file " + fullPath + " : " + err);
            return;
        }
    });
}

exports.addFavAudioBook = async (req, res) => {
    try {

        await User.findByIdAndUpdate(req.params.userId, {$push: {favoriteAudiobooks: req.params.AudibookId}})
        res.status(200).json({msg: 'AudioBook added to favoriteAudiobooks'})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: 'something went wrong.'})
    }
}

exports.RemoveWishItem = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, {$pull: {favoriteAudiobooks: req.params.AudibookId}})
        res.status(200).json({msg: 'AudioBook removed from favoriteAudiobooks'})
    } catch (error) {
        res.status(500).json({msg: 'something went wrong.'})
    }
}

exports.getUserInfo = async (req, res) => {
    try {
        const userInfo = await User.findOne({_id: req.params.userId}).populate('favoriteAudiobooks')
        res.status(200).json(userInfo)
    } catch (error) {
        res.status(500).json({msg: 'something went wrong.'})
    }
}

exports.getcategorie=async (req, res) => {

    try {
        const data=    await Audiobook.find().select('categories').distinct('categories')
        res.json(data)
    } catch (error) {
        res.json(error)
    }
}