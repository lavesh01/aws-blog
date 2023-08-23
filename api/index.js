const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const multer  = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use(cors({ credentials:true, origin: process.env.ORIGIN_URL}));

const salt = bcrypt.genSaltSync(10);
const secret = 'laksjdflkajslkfjalksf';
const bucket = 'lavesh-blog-app';

async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
    
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;

    const data = await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: 'public-read',
    }));
    
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
  }
  

app.post("/api/register", async (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        });
        res.json(userDoc);
    } catch (error) {
        res.status(400).json({ error: 'An error occurred while registering the user.' });
    }
});

app.post("/api/login", async (req, res) => {
        
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username: username });
        const passOk = bcrypt.compareSync(password, userDoc.password);
        
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, secret, {}, function (err, token) {
                if (err) throw err;
                res.cookie('token', token).json({
                    id: userDoc._id,
                    username: username
                });
            });
        } else {
            res.status(400).json("Wrong Credentials");
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while logging in.' });
    }
});

app.get("/api/profile", (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, (err, info) => {
            if (err) throw err;
            res.json(info);
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the user profile.' });
    }
});


app.get("/api/logout", (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    try {
        res.clearCookie('token').json('ok');
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while logging out.' });
    }
});

const upload = multer({dest:'/tmp'});
app.post('/api/post', upload.single('file'), async (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    try {
        const { title, summary, content } = req.body;
        
        const { originalname, path , mimetype} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) throw err;
            
            const url = await uploadToS3(newPath, originalname, mimetype);
            const PostDoc = await Post.create({
                title,
                summary,
                content,
                cover: url,
                author: info.id
            });

            res.json(PostDoc);
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the post.' });
    }
});

app.put('/api/post', upload.single('file'), async (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    try {
        let newPath = null;
        if (req.file) {
            const { originalname, path, mimetype } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
            var url = await uploadToS3(newPath, originalname, mimetype);
        }

        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) throw err;
            const { id, title, summary, content } = req.body;
            const postDoc = await Post.findById(id);
            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                return res.status(400).json('You are not the author of this post');
            }

            postDoc.title = title;
            postDoc.summary = summary;
            postDoc.content = content;
            postDoc.cover = url ? url : postDoc.cover;
            await postDoc.save();

            res.json(postDoc);
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the post.' });
    }
});


app.get('/api/post', async (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));

    try {
      const posts = await Post.find().populate('author',['username']);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/post/:id', async (req, res) => {
    
    mongoose.connect(process.env.MONGO_URL).then(e => {
        console.log("Connected to MongoDB");
    }).catch(err => console.log(err));
    
    try {
        const { id } = req.params;
        const postDoc = await Post.findById(id).populate('author', ['username']);
        res.json(postDoc);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the post.' });
    }
});


app.listen(process.env.PORT || 4000 , () => {
    console.log("Server running!");
});