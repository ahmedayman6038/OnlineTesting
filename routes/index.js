var express = require('express');
var router = express.Router();
var secret = require('../helper/secret');
var utility = require('../helper/utility');

/* GET registration page. */
router.get('/', function (req, res, next) {
  var sql = "SELECT * FROM `position`";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('index', {
      title: 'Registration',
      positions: result
    });
  });
});

/* GET candidate continue page. */
router.get('/continue', function (req, res, next) {
  res.render('candidateContinue', {
    title: 'continue',
    error: ""
  });
});

/* POST candidate continue page. */
router.post('/continue', function (req, res, next) {
  var email = req.body.Email;
  var sql = "SELECT * FROM `candidate` WHERE Email = '" + email + "'";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      if (result[0].Deadline != null) {
        var uid = secret.hide(result[0].ID.toString());
        return res.redirect('/profile/' + uid);
      }
    }
    res.render('candidateContinue', {
      title: 'continue',
      error: "Email Not Exist"
    });
  });
});

/* GET hr login page */
router.get(['/hr', '/login'], function (req, res, next) {
  res.render('login', {
    title: 'Login',
    error: "",
    userUrl: ""
  });
});

/* POST hr login page */
router.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = secret.hide(req.body.password.toString());
  var returnUrl = req.query.ReturnUrl.toString();
  var sql = "SELECT * FROM hr WHERE Email = '" + email + "' && Password = '" + password + "'";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length == 0) {
      return res.render('login', {
        title: 'Login',
        error: "Email or Password Not Exist"
      });
    }
    req.session.hrId = result[0].ID;
    req.session.hrName = result[0].Name;
    req.session.hrEmail = result[0].Email;
    if (returnUrl != "") {
      return res.redirect(returnUrl);
    }
    return res.redirect("/candidates");
  });
});

/* Add candidate registraion */
router.post('/addRegistration', function (req, res, next) {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  var firstName = req.body.FirstName;
  var lastName = req.body.LastName;
  var name = firstName + ' ' + lastName;
  var email = req.body.Email;
  var phone = req.body.Phone;
  var postion = req.body.Position;
  var file = req.files.CV;
  if (file.mimetype === "application/pdf") {
    var fileExtension = file.mimetype.split('/')[1];
    var fileName = secret.hide(email);
    var fileSave = fileName + '.' + fileExtension;
    file.mv(`routes/uploads/${fileSave}`, function (err) {
      if (err)
        return res.status(500).send(err);
    });
  } else {
    return res.status(400).send("Only pdf format allowed");
  }
  var sql = "INSERT INTO `candidate`(`Name`, `Email`, `Phone`, `CV`, `PositionID`) VALUES ('" + name + "','" + email + "','" + phone + "','" + fileName + "'," + postion + ")";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    return res.status(200).send("Data added sucessfully");
  });
});

/* Check candidate email exist */
router.get('/checkEmail/:email', function (req, res, next) {
  var useremail = req.params.email;
  var sql = "SELECT * FROM candidate WHERE Email = '" + useremail + "'";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      return res.status(400).send("Email already existing");
    }
    return res.status(200).send("Email not founded");
  });
});

/* GET candidate profile page. */
router.get('/profile/:uid', function (req, res, next) {
  var uid = req.params.uid;
  var candidateId = secret.reveal(uid);
  var sql = 'SELECT candidate.ID, candidate.Name AS "CandidateName", candidate.Email, candidate.Phone, candidate.Deadline, position.Name AS "PositionName" FROM candidate INNER JOIN position ON candidate.PositionID = position.ID WHERE candidate.ID = ' + candidateId + ';SELECT exam.ID, exam.Name, candidate_exam.Date, candidate_exam.Completed from candidate_exam INNER JOIN exam ON candidate_exam.ExamID = exam.ID WHERE candidate_exam.CandidateID = ' + candidateId;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result[0][0].Deadline == null) {
      return res.redirect("/login");
    }
    var sql2 = "SELECT * FROM candidate_exam WHERE candidate_exam.candidateID = " + candidateId + ";SELECT * FROM candidate_exam WHERE candidate_exam.candidateID = " + candidateId + " && candidate_exam.Completed = 1";
    db.query(sql2, function (err, result2) {
      if (err)
        return res.status(500).send(err);
      if (result2[0].length == result2[1].length) {
        return res.render('message', {
          title: 'Test Completed',
          message: "Your test has been completed and we will see your results and send back an email",
          url: "/continue"
        });
      }
      if (result[0][0].Deadline < new Date()) {
        return res.render('message', {
          title: 'Expired Deadline',
          message: "Your Deadline has been expired",
          url: "/"
        });
      }
      var date1 = new Date();
      var date2 = result[0][0].Deadline;
      result[0][0].Deadline = utility.calculateDeadline(date1, date2);
      var completed = 0;
      for (let i = 0; i < result[1].length; i++) {
        result[1][i].ID = secret.hide(result[1][i].Name + '/' + result[1][i].ID.toString() + '/' + candidateId);
        if (result[1][i].Completed == 1) {
          completed += 1;
        }
      }
      res.render('candidateProfile', {
        title: 'Profile',
        candidate: result[0][0],
        exams: result[1],
        completed: completed
      });
    });
  });
});

/* GET candidate exam page. */
router.get('/exam/:token', function (req, res, next) {
  var examToken = req.params.token;
  var token = secret.reveal(examToken).split('/');
  var examName = token[0];
  var examId = token[1];
  var candidateId = token[2];
  var questions = [];
  var sql = "SELECT Completed FROM `candidate_exam` WHERE CandidateID = " + candidateId + " && ExamID = " + examId;
  var result = dbsync.query(sql);
  if (result[0].Completed == 0) {
    var sql1 = "SELECT topic.ID, topic.Name, topic.QuestionsNumber FROM exam_topic INNER JOIN topic ON topic.ID = exam_topic.TopicID WHERE exam_topic.ExamID = " + examId;
    var result1 = dbsync.query(sql1);
    for (let i = 0; i < result1.length; i++) {
      var topicId = result1[i].ID;
      var questionsNumber = result1[i].QuestionsNumber;
      var sql2 = "SELECT question.ID, question.Name FROM question WHERE question.TopicID = " + topicId + " ORDER BY RAND() LIMIT " + questionsNumber;
      var result2 = dbsync.query(sql2);
      var answers = [];
      for (let j = 0; j < result2.length; j++) {
        var questionId = result2[j].ID;
        var sql3 = "SELECT answer.ID, answer.Name FROM answer WHERE answer.QuestionID = " + questionId + " && answer.Valid = 1;SELECT answer.ID, answer.Name FROM answer WHERE answer.QuestionID = " + questionId + " && answer.Valid = 0 ORDER BY RAND() LIMIT 3";
        var result3 = dbsync.query(sql3);
        var answer1 = {
          ID: result3[0][0].ID,
          Name: result3[0][0].Name
        };
        var answer2 = {
          ID: result3[1][0].ID,
          Name: result3[1][0].Name
        };
        var answer3 = {
          ID: result3[1][1].ID,
          Name: result3[1][1].Name
        };
        var answer4 = {
          ID: result3[1][2].ID,
          Name: result3[1][2].Name
        };
        answers.push(answer1);
        answers.push(answer2);
        answers.push(answer3);
        answers.push(answer4);
        var validPosition = utility.getRandomInt(0, 3);
        var temp = answers[validPosition];
        answers[validPosition] = answers[0];
        answers[0] = temp;
        var question = {
          ID: result2[j].ID,
          Name: result2[j].Name,
          Answers: answers
        };
        questions.push(question);
        answers = [];
      }
    }
    var sql4 = "UPDATE `candidate_exam` SET `Completed`=" + 1 + ", `Questions` = " + questions.length + " WHERE CandidateID = " + candidateId + " && ExamID = " + examId;
    var result4 = dbsync.query(sql4);
    var time = (questions.length * 10 * 1000) + 10000;
    req.session.examToken = examToken;
    req.session.cookie.maxAge = time + 5000;
    res.render('candidateExam', {
      title: 'Exam',
      questions: questions,
      candidateId: candidateId,
      examName: examName,
      time: time,
      token: secret.hide(candidateId + '/' + examId)
    });
  } else {
    var uid = secret.hide(candidateId);
    return res.redirect("/profile/" + uid);
  }
});

/* Save candidate answer. */
router.post('/saveAnswer/:qid/:aid', function (req, res, next) {
  var questionId = req.params.qid;
  var answerId = req.params.aid;
  if (req.session.examToken) {
    var token = secret.reveal(req.session.examToken).split('/');
    var examId = token[1];
    var candidateId = token[2];
    var sql1 = "SELECT * FROM `candidate_exam_question` WHERE `Candidate_ExamCandidateID` = " + candidateId + " && `Candidate_ExamExamID` = " + examId + " &&`QuestionID` = " + questionId;
    db.query(sql1, function (err, result1) {
      if (err)
        return res.status(500).send(err);
      if (result1.length > 0) {
        var sql2 = "UPDATE `candidate_exam_question` SET `AnswerID`=" + answerId + " WHERE `Candidate_ExamCandidateID` = " + candidateId + " && `Candidate_ExamExamID` = " + examId + " && `QuestionID` = " + questionId;
        db.query(sql2, function (err, result2) {
          if (err)
            return res.status(500).send(err);
          return res.status(202).send("Answer saved sucessfully");
        });
      } else {
        var sql3 = "INSERT INTO `candidate_exam_question`(`Candidate_ExamCandidateID`, `Candidate_ExamExamID`, `QuestionID`, `AnswerID`) VALUES (" + candidateId + "," + examId + "," + questionId + "," + answerId + ")";
        db.query(sql3, function (err, result3) {
          if (err)
            return res.status(500).send(err);
          return res.status(201).send("Answer saved sucessfully");
        });
      }
    });
  } else {
    return res.status(400).send("session has been expired");
  }
});

/* Send result mail */
router.get('/result/:token', function (req, res, next) {
  var token = secret.reveal(req.params.token).split('/');
  var candidateId = token[0];
  var examId = token[1];
  var sql1 = "SELECT candidate.Name AS CandidateName, exam.Name AS ExamName, candidate_exam.Questions FROM `candidate_exam` INNER JOIN candidate ON candidate.ID = candidate_exam.CandidateID INNER JOIN exam ON exam.ID = candidate_exam.ExamID WHERE CandidateID = " + candidateId + " && ExamID = " + examId + ";SELECT COUNT(*) AS QuestionsNumber FROM `candidate_exam_question` INNER JOIN answer on candidate_exam_question.AnswerID = answer.ID WHERE candidate_exam_question.Candidate_ExamCandidateID = " + candidateId + " && candidate_exam_question.Candidate_ExamExamID = " + examId + " && answer.Valid = 1";
  db.query(sql1, function (err, result1) {
    if (err)
      return res.status(500).send(err);
    var candidateName = result1[0][0].CandidateName;
    var examName = result1[0][0].ExamName;
    var questions = parseInt(result1[0][0].Questions);
    var correct = parseInt(result1[1][0].QuestionsNumber);
    var score = (correct / questions) * 100;
    var sql2 = "SELECT candidate.Email FROM candidate WHERE candidate.ID = " + candidateId + ";SELECT hr.Email FROM hr";
    db.query(sql2, function (err, result2) {
      if (err)
        return res.status(500).send(err);
      var emails = [result2[0][0].Email];
      for (let i = 0; i < result2[1].length; i++) {
        emails.push(result2[1][i].Email);
      }
      for (let j = 0; j < emails.length; j++) {
        res.mailer.send('resultEmail', {
          to: emails[j],
          subject: 'Exam Result',
          code: secret.hide(candidateId),
          candidateName: candidateName,
          examName: examName,
          questions: questions,
          correct: correct,
          score: score
        }, function (err) {
          if (err)
            return res.status(500).send("not sended");
        });
      }
      res.render('message', {
        title: 'Exam Result',
        message: "Answers submitted sucessfully, We sended back an email with the your result.",
        url: "/profile/" + secret.hide(candidateId)
      });
    })
  })
});

module.exports = router;