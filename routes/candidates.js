var express = require('express');
var router = express.Router();
var secret = require('../helper/secret');
var utility = require('../helper/utility');

/* GET candidates listing. */
router.get('/', function (req, res, next) {
  var option = req.query.option;
  var result1, sql1, value;
  if (option == "email") {
    value = req.query.email;
    sql1 = "SELECT candidate.ID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS PositionName FROM candidate INNER JOIN position ON candidate.PositionID = position.ID WHERE candidate.Email LIKE '%" + value + "%'";
  } else if (option == "name") {
    value = req.query.name;
    sql1 = "SELECT candidate.ID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS PositionName FROM candidate INNER JOIN position ON candidate.PositionID = position.ID WHERE candidate.Name LIKE '%" + value + "%'";
  } else if (option == "type") {
    value = req.query.type;
    sql1 = "SELECT candidate.ID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS PositionName FROM candidate INNER JOIN position ON candidate.PositionID = position.ID INNER JOIN candidate_exam ON candidate.ID = candidate_exam.CandidateID WHERE candidate_exam.ExamID = " + value;
  } else if (option == "date") {
    value = req.query.date;
    sql1 = "SELECT DISTINCT candidate.ID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS PositionName FROM candidate INNER JOIN position ON candidate.PositionID = position.ID INNER JOIN candidate_exam ON candidate.ID = candidate_exam.CandidateID WHERE candidate_exam.Date = '" + value + "'";
  } else {
    value = "";
    sql1 = "SELECT candidate.ID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS PositionName FROM candidate INNER JOIN position ON candidate.PositionID = position.ID";
  }
  result1 = dbsync.query(sql1);
  var sql2 = "SELECT * FROM `exam`";
  var result2 = dbsync.query(sql2);
  res.render('candidates', {
    title: 'Candidates',
    candidates: result1,
    exams: result2,
    option: option,
    value: value
  });
});

/* GET approve page */
router.get('/approve/:id', function (req, res, next) {
  var candidateId = req.params.id;
  var sql1 = "SELECT * FROM `exam`";
  var sql2 = "SELECT exam.ID, exam.Name FROM candidate_exam INNER JOIN exam ON candidate_exam.ExamID = exam.ID WHERE candidate_exam.CandidateID = " + candidateId;
  db.query(sql1, function (err, result1) {
    if (err)
      return res.status(500).send(err);
    db.query(sql2, function (err, result2) {
      if (err)
        return res.status(500).send(err);
      res.render('approve', {
        title: 'Approve',
        candidateId: candidateId,
        exams: result1,
        userExams: result2
      });
    });
  });
});

/* Add exam to candidate */
router.post('/addExam/:examId/to/:candidateId', function (req, res, next) {
  var examId = req.params.examId;
  var candidateId = req.params.candidateId;
  var sql = "INSERT INTO `candidate_exam`(`CandidateID`, `ExamID`, `Date`) VALUES (" + candidateId + "," + examId + ",'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "')";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.status(200).send("Data added sucessfully");
  });
});

/* Remove exam to candidate */
router.post('/removeExam/:examId/to/:candidateId', function (req, res, next) {
  var examId = req.params.examId;
  var candidateId = req.params.candidateId;
  var sql = "DELETE FROM `candidate_exam` WHERE CandidateID = " + candidateId + " && ExamID = " + examId;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.status(200).send("Data removed sucessfully");
  });
});

/* Send approval mail */
router.post('/sendApprovalMail/:candidateId/:deadline', function (req, res, next) {
  var candidateId = req.params.candidateId;
  var days = parseInt(req.params.deadline);
  var sql1 = "SELECT * FROM `candidate` WHERE ID = " + candidateId;
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length == 0) {
      return res.status(404).send("Candidate not founded");
    }
    var url = req.hostname + "/profile/" + secret.hide(candidateId);
    res.mailer.send('approvalEmail', {
      to: result[0].Email,
      subject: 'Approved',
      url: url,
      name: result[0].Name.split(' ')[0]
    }, function (err) {
      if (err)
        return res.status(500).send("not sended");
      console.log(new Date());
      var newDate = utility.addDays(new Date(), days);
      console.log(newDate);
      var sql2 = "UPDATE `candidate` SET `Deadline`= '" + newDate.toISOString().slice(0, 19).replace('T', ' ') + "' WHERE ID = " + candidateId;
      db.query(sql2, function (err, result) {
        if (err)
          return res.status(500).send(err);
        res.status(200).send("candidate approved sucessfully");
      });
    });
  });
});

/* GET candidate cv */
router.get('/cv/:id', function (req, res, next) {
  var id = req.params.id;
  var sql = "SELECT * FROM candidate WHERE ID =" + id;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    var file = __dirname + '/uploads/' + result[0].CV + '.pdf';
    res.download(file);
  });
});

/* GET result page */
router.get('/result/:id', function (req, res, next) {
  var candidateId = req.params.id;
  var results = [];
  var sql1 = "SELECT candidate.ID As CandidateID, candidate.Name AS CandidateName, candidate.Email, candidate.Phone, exam.ID AS ExamID, exam.Name AS ExamName, candidate_exam.Questions FROM `candidate_exam` INNER JOIN exam on exam.ID = candidate_exam.ExamID INNER JOIN candidate ON candidate.ID = candidate_exam.CandidateID WHERE candidate_exam.CandidateID = " + candidateId + ";SELECT * FROM `candidate_exam` WHERE candidate_exam.CandidateID = " + candidateId + "&& Completed = 1";
  var result1 = dbsync.query(sql1);
  if (result1[0].length == result1[1].length) {
    for (let i = 0; i < result1[0].length; i++) {
      var sql2 = "SELECT question.Name AS QuestionName, answer.Name AS AnswerName, answer.Valid FROM `candidate_exam_question` INNER JOIN answer on candidate_exam_question.AnswerID = answer.ID INNER JOIN question on candidate_exam_question.QuestionID = question.ID WHERE candidate_exam_question.Candidate_ExamCandidateID = " + candidateId + " && candidate_exam_question.Candidate_ExamExamID = " + result1[0][i].ExamID;
      var result2 = dbsync.query(sql2);
      var questions = [];
      var questionsCorrect = 0;
      for (let j = 0; j < result2.length; j++) {
        var correct = "No";
        if (result2[j].Valid == 1) {
          questionsCorrect += 1;
          correct = "Yes";
        }
        var question = {
          QuestionName: result2[j].QuestionName,
          QuestionAnswer: result2[j].AnswerName,
          QuestionCorrect: correct
        }
        questions.push(question);
      }
      var score = (questionsCorrect / result1[0][i].Questions) * 100;
      var result = {
        CandidateName: result1[0][i].CandidateName,
        CandidateEmail: result1[0][i].Email,
        CandidatePhone: result1[0][i].Phone,
        ExamID: result1[0][i].ExamID,
        ExamName: result1[0][i].ExamName,
        QuestionsNumber: result1[0][i].Questions,
        QuestionsSolved: result2.length,
        QuestionsCorrect: questionsCorrect,
        Score: score,
        ExamQuestions: questions
      }
      results.push(result);
      questions = [];
    }
    return res.render('candidateResult', {
      title: 'Result',
      results: results,
      completed: 1
    });
  }
  var result = {
    CandidateName: result1[0][0].CandidateName,
    CandidateEmail: result1[0][0].Email,
    CandidatePhone: result1[0][0].Phone
  }
  results.push(result);
  return res.render('candidateResult', {
    title: 'Result',
    results: results,
    completed: 0,
  });
});

module.exports = router;