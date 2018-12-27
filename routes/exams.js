var express = require('express');
var router = express.Router();


/* GET exams listing */
router.get('/', function (req, res, next) {
  var sql = "SELECT * FROM `exam`";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('exams', {
      title: 'Exams',
      exams: result
    });
  });
});

/* GET add exam page */
router.get('/add', function (req, res, next) {
  res.render('addExam', {
    title: 'Exams',
    name: "",
    error: ""
  });
});

/* Add exam */
router.post('/add', function (req, res, next) {
  var name = req.body.Name;
  var sql1 = "SELECT * FROM exam WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      return res.render('addExam', {
        title: 'Exams',
        name: name,
        error: "Name already exist"
      });
    }
    var sql2 = "INSERT INTO `exam`(`Name`) VALUES ('" + name + "')";
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/exams');
    });
  });
});

/* GET edit exam page */
router.get('/edit/:id', function (req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM exam WHERE ID = " + id;
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('editExam', {
      title: 'Exams',
      id: result[0].ID,
      name: result[0].Name,
      error: ""
    });
  });
});

/* Edit exam */
router.post('/edit', function (req, res, next) {
  var id = req.body.ID;
  var name = req.body.Name;
  var sql1 = "SELECT * FROM exam WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      if (result[0].ID != id) {
        return res.render('editExam', {
          title: 'Exams',
          id: id,
          name: name,
          error: "Name already exist"
        });
      }
    }
    var sql2 = "UPDATE `exam` SET `Name`='" + name + "' WHERE ID=" + id;
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/exams');
    });
  });
});

/* Remove exam */
router.delete('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  var sql = "DELETE FROM `exam` WHERE ID=" + id;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    return res.status(200).send("Item deleted sucessfully");
  });
});

/* GET add topic page */
router.get('/topics/:id', function (req, res, next) {
  var examId = req.params.id;
  var sql1 = "SELECT * FROM `topic`";
  var sql2 = "SELECT topic.ID, topic.Name FROM exam_topic INNER JOIN topic ON exam_topic.TopicID = topic.ID WHERE exam_topic.ExamID = " + examId;
  db.query(sql1, function (err, result1) {
    if (err)
      return res.status(500).send(err);
    db.query(sql2, function (err, result2) {
      if (err)
        return res.status(500).send(err);
      res.render('addExamTopic', {
        title: 'Exams',
        examId: examId,
        topics: result1,
        examTopics: result2
      });
    });
  });
});

/* Add topic to exam */
router.post('/addTopic/:topicId/to/:examId', function (req, res, next) {
  var topicId = req.params.topicId;
  var examId = req.params.examId;
  var sql = "INSERT INTO `exam_topic`(`ExamID`, `TopicID`) VALUES (" + examId + "," + topicId + ")";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.status(200).send("Data added sucessfully");
  });
});

/* Remove topic to exam */
router.post('/removeTopic/:topicId/to/:examId', function (req, res, next) {
  var topicId = req.params.topicId;
  var examId = req.params.examId;
  var sql = "DELETE FROM `exam_topic` WHERE ExamID = " + examId + " && TopicID = " + topicId;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.status(200).send("Data removed sucessfully");
  });
});

module.exports = router;