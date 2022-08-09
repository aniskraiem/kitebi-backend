let Book = require("../models/book");
const fs = require("fs");
const User = require("../models/user");

exports.getAll = async (req, res) => {
    res.send({books: await Book.find()});
};

exports.get = async (req, res) => {
    try {
        const id = req.params.bookId;
        const book = await Book.findById({_id: id});

        res.status(200).json({
            book,
        });
    } catch (err) {
        res.status(500);
    }
};

exports.getFavorite = async (req, res) => {
    let user = await User.findById(req.params.userId).populate("favoriteBooks")
    res.send({books: await user.favoriteBooks});
};

exports.getParams = async (req, res) => {
    res.send({book: await Book.findById({_id: req.params.bookId})});
};

exports.add = async (req, res) => {
    const {title, author, releaseDate, categories} = req.body;
    let book = await new Book({
        title,
        author,
        releaseDate,
        categories,
        coverId: req.files.cover[0].filename,
        pdfId: req.files.pdf[0].filename
    }).save();
    return res.send({message: "Book added successfully", book});
};
exports.getcategorie = async (req, res) => {
    try {
        const data = await Book.find().select('categories').distinct('categories')
        res.json(data)
    } catch (error) {
        res.json(error)
    }
}



exports.update = async (req, res) => {
    const {_id} = req.body;
    try {
    
        let book = await Book.findById(_id);
        if (req.file) {
            pictureFileName = req.file.filename;
        }else{

            pictureFileName = book.coverId;
           
        }
        if (book) {

            book.title= req.body.title?req.body.title:book.title,
            book.author= req.body.author?req.body.author:book.author,
            book.releaseDate= req.body.releaseDate?req.body.releaseDate:book.releaseDate
            book.categories=req.body.categories?req.body.categories:book.categories,
            book.coverId= pictureFileName
      
        }
        
      await  book.save()
      return res.send(book);
    } catch (error) {
        return res.send({message: "Book does not exist"});
  
    }
 

};

exports.toggleFavorite = async (req, res) => {
    const {_id, userId} = req.body;

    let user = await User.findById(userId);

    if (user) {
        if (user.favoriteBooks.includes(_id)) {
            await user.update({
                $pull: {
                    favoriteBooks: _id
                }
            });
            return res.send({message: "Favorite book added"});
        } else {
            await user.update({
                $push: {
                    favoriteBooks: _id
                }
            });
            return res.send({message: "Favorite book removed"});
        }
    } else {
        return res.status(404).send({message: "User does not exist"});
    }
};

exports.delete = async (req, res) => {
    await Book.findById(req.params.bookId)
        .then(function (book) {
            deleteFile("./uploads/books/" + book.coverId)
            deleteFile("./uploads/books/" + book.pdfId)

            book.remove();

            return res.status(201).send({message: "Book deleted"});
        }).catch(function (error) {
            console.log(error)
            res.status(500).send();
        });
};

exports.deleteAll = async (req, res) => {
    Book.find({})
        .then(function (books) {
            books.forEach(function (book) {

                deleteFile("./uploads/books/" + book.coverId)
                deleteFile("./uploads/books/" + book.pdfId)

                book.remove();
            });

            res.send({message: "All books have been deleted"});
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
        }
    });
}

exports.addFavBook = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, {$push: {favoriteBooks: req.params.bookId}})
        res.status(200).json({msg: 'book added to favoriteBooks'})
    } catch (error) {
        res.status(500).json({msg: 'something went wrong.'})
    }
}

exports.RemoveWishItem = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, {$pull: {favoriteBooks: req.params.bookId}})
        res.status(200).json({msg: 'Book removed from favoriteBooks'})
    } catch (error) {
        res.status(500).json({msg: 'something went wrong.'})
    }
}


exports.getUserInfo = async (req, res) => {
    try {
        const userInfo = await User.findOne({_id: req.params.userId}).populate('favoriteBooks')
        res.status(200).json(userInfo)
    } catch (error) {
        res.status(500).json({msg: 'something went wrong.'})

    }
}
