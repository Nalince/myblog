const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');
const ObjectId = mongodb.ObjectId;
const router = express.Router();


router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const allPosts = await db.getDb().collection('posts').find({},{_id:1, title: 1, summary: 1,'author.name': 1}).toArray();
  // console.log(allPosts);
  res.render('posts-list',{posts: allPosts});
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post',{authors:authors});
});

router.post('/posts',async function (req, res) {
  const authorId = new ObjectId((req.body.author).trim()); //(req.body.id).trim()
  const author = await db.getDb().collection('authors').findOne({ _id: authorId});
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
    
  };
  const result = await db.getDb().collection('posts').insertOne(newPost);
  // console.log(result);
  res.redirect('/posts');
  
});

router.get('/posts/:id',async (req,res)=>{
  const postId = req.params.id;
  const postIdM = new ObjectId((postId).trim());
  const postOne = await db.getDb().collection('posts').findOne({ _id: postIdM});
  if(!postOne){
    return res.status(404).render('404');
  }

  postOne.humanReadableDate = postOne.date.toLocaleDateString('en-US',{
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  postOne.date = postOne.date.toISOString();
  res.render('post-detail',{post: postOne});
});

router.get('/posts/:id/edit',async (req,res)=>{
  const postId = req.params.id;
  const postIdM = new ObjectId((postId).trim());
  const postOne = await db.getDb().collection('posts').findOne({ _id: postIdM},{});
  if(!postOne){
    return res.status(404).render('404');
  }
  res.render('update-post',{post: postOne});
});

router.post('/posts/:id/edit',async function (req, res) {
  const postId = new ObjectId((req.params.id).trim()); //(req.body.id).trim()
  const result = await db.getDb().collection('posts').updateOne({ _id: postId},{ $set: {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
  }});
  res.redirect('/posts');
  
});
router.post('/posts/:id/delete',async (req,res)=>{
  const postId = req.params.id;
  const postIdM = new ObjectId((postId).trim());
  const result = await db.getDb().collection('posts').deleteOne({ _id: postIdM});
  if(!result){
    return res.status(404).render('404');
  }
  res.redirect('/posts');
});


module.exports = router;