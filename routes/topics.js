var express = require('express');
var router = express.Router();


/* GET topics listing */
router.get('/', function (req, res, next) {
  var sql = "SELECT * FROM `topic`";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('topics', {
      title: 'Topics',
      topics: result
    });
  });
});

/* GET add topic page */
router.get('/add', function (req, res, next) {
  res.render('addTopic', {
    title: 'Topics',
    name: "",
    questions: "",
    error: ""
  });
});

/* Add topic */
router.post('/add', function (req, res, next) {
  var name = req.body.Name;
  var questions = req.body.Questions;
  var sql1 = "SELECT * FROM topic WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      return res.render('addTopic', {
        title: 'Topics',
        name: name,
        questions: questions,
        error: "Name already exist"
      });
    }
    var sql2 = "INSERT INTO `topic`(`Name`,`QuestionsNumber`) VALUES ('" + name + "',"+questions+")";
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/topics');
    });
  });
});

/* GET edit topic page */
router.get('/edit/:id', function (req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM topic WHERE ID = " + id;
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('editTopic', {
      title: 'Topics',
      id: result[0].ID,
      name: result[0].Name,
      questions: result[0].QuestionsNumber,
      error: ""
    });
  });
});

/* Edit topic */
router.post('/edit', function (req, res, next) {
  var id = req.body.ID;
  var name = req.body.Name;
  var questions = req.body.Questions;
  var sql1 = "SELECT * FROM topic WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      if (result[0].ID != id) {
        return res.render('editTopic', {
          title: 'Topics',
          id: id,
          name: name,
          questions: questions,
          error: "Name already exist"
        });
      }
    }
    var sql2 = "UPDATE `topic` SET `Name`='" + name + "',`QuestionsNumber`="+questions+" WHERE ID=" + id;
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/topics');
    });
  });
});

/* Delete topic */
router.delete('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  var sql = "DELETE FROM `topic` WHERE ID=" + id;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    return res.status(200).send("Item deleted sucessfully");
  });
});

module.exports = router;