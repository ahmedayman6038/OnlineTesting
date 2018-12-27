var express = require('express');
var router = express.Router();


/* GET questions listing */
router.get('/', function (req, res, next) {
  var sql = "SELECT q.ID, q.Name AS QuestionName, a.Name AS AnswerName, t.Name AS TopicName FROM question q INNER JOIN topic t ON q.TopicID = t.ID INNER JOIN answer a ON a.QuestionID = q.ID WHERE a.Valid = 1";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('questions', {
      title: 'Questions',
      questions: result
    });
  });
});

/* GET add question page */
router.get('/add', function (req, res, next) {
  var sql = "SELECT * FROM `topic`";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('addQuestion', {
      title: 'Questions',
      topics: result
    });
  });
});

/* Add question */
router.post('/add', function (req, res, next) {
  var name = req.body.Name;
  var topic = req.body.Topic;
  var counter = parseInt(req.body.Counter);
  var answers = [];
  var validQ = req.body.Valid;
  var answerKey;
  if (name[name.length - 1] != "?") {
    name += "?";
  }
  for (let i = 1; i <= counter; i++) {
    answerKey = "Answer" + i;
    answers.push(req.body[answerKey]);
  }
  var sql1 = "INSERT INTO `question`(`Name`, `TopicID`) VALUES ('" + name + "'," + topic + ");SELECT LAST_INSERT_ID() AS QuestionID ;";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    var questionId = result[1][0].QuestionID;
    for (let i = 0; i < answers.length; i++) {
      var valid = 0;
      if (i + 1 == validQ) {
        valid = 1;
      }
      var sql2 = "INSERT INTO `answer`(`Name`, `Valid`, `QuestionID`) VALUES ('" + answers[i] + "'," + valid + "," + questionId + ")";
      db.query(sql2, function (err, result) {
        if (err)
          return res.status(500).send(err);
      });
    }
    res.redirect('/questions');
  });
});

/* GET edit question page */
router.get('/edit/:id', function (req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM question WHERE ID = " + id + ";SELECT * FROM `topic`";
  db.query(sql1, function (err, result1) {
    if (err)
      return res.status(500).send(err);
    var sql2 = "SELECT * FROM answer WHERE QuestionID = " + id;
    db.query(sql2, function (err, result2) {
      if (err)
        return res.status(500).send(err);
      res.render('editQuestion', {
        title: 'Questions',
        id: result1[0][0].ID,
        name: result1[0][0].Name,
        topicId: result1[0][0].TopicID,
        answers: result2,
        topics: result1[1]
      });
    });
  });
});

/* Edit question */
router.post('/edit', function (req, res, next) {
  var id = req.body.ID;
  var name = req.body.Name;
  var topic = req.body.Topic;
  var counter = parseInt(req.body.Counter);
  var answers = [];
  var answersID = [];
  var validQ = req.body.Valid;
  var answerKey;
  var answerIDKey;
  if (name[name.length - 1] != "?") {
    name += "?";
  }
  for (let i = 1; i <= counter; i++) {
    answerKey = "Answer" + i;
    answerIDKey = "A" + i + "ID";
    answers.push(req.body[answerKey]);
    answersID.push(req.body[answerIDKey]);
  }
  var sql1 = "UPDATE `question` SET `Name`='" + name + "',`TopicID`=" + topic + " WHERE ID=" + id + ";DELETE FROM `answer` WHERE QuestionID =" + id;
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    for (let i = 0; i < answers.length; i++) {
      var valid = 0;
      if (i + 1 == validQ) {
        valid = 1;
      }
      var sql2 = "INSERT INTO `answer`(`Name`, `Valid`, `QuestionID`) VALUES ('" + answers[i] + "'," + valid + "," + id + ")";
      db.query(sql2, function (err, result) {
        if (err)
          return res.status(500).send(err);
      });
    }
    res.redirect('/questions');
  });
});

/* Delete question */
router.delete('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  var sql = "DELETE FROM `answer` WHERE QuestionID =" + id + " ;DELETE FROM `question` WHERE ID=" + id + ";";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    return res.status(200).send("Item deleted sucessfully");
  });
});

module.exports = router;