var express = require('express');
var secret = require('../helper/secret');
var router = express.Router();

/* Logout hr. */
router.get('/logout', function (req, res, next) {
    req.session.hrId = null;
    return res.redirect("/login");
});

/* GET hrs listing */
router.get('/', function (req, res, next) {
    var sql = "SELECT * FROM `hr`";
    db.query(sql, function (err, result) {
        if (err)
            return res.status(500).send(err);
        res.render('hrs', {
            title: 'HRS',
            hrs: result
        });
    });
});

/* GET add hr page */
router.get('/add', function (req, res, next) {
    res.render('addHr', {
        title: 'HRS',
        name: "",
        email: "",
        error: ""
    });
});

/* Add hr */
router.post('/add', function (req, res, next) {
    var name = req.body.Name;
    var email = req.body.Email;
    var password = secret.hide(req.body.Password);
    var sql1 = "SELECT * FROM hr WHERE Email = '" + email + "'";
    db.query(sql1, function (err, result) {
        if (err)
            return res.status(500).send(err);
        if (result.length > 0) {
            return res.render('addHr', {
                title: 'HRS',
                name: name,
                email: "",
                error: "Email already exist"
            });
        }
        var sql2 = "INSERT INTO `hr`(`Name`,`Password`,`Email`) VALUES ('" + name + "','" + password + "','" + email + "')";
        db.query(sql2, function (err, result) {
            if (err)
                return res.status(500).send(err);
            res.redirect('/hrs');
        });
    });
});

/* GET edit hr page */
router.get('/edit/:id', function (req, res, next) {
    var id = req.params.id;
    var sql1 = "SELECT * FROM hr WHERE ID = " + id;
    db.query(sql1, function (err, result) {
        if (err)
            return res.status(500).send(err);
        res.render('editHr', {
            title: 'HRS',
            id: result[0].ID,
            name: result[0].Name,
            email: result[0].Email,
            error: ""
        });
    });
});

/* Edit hr */
router.post('/edit', function (req, res, next) {
    var id = req.body.ID;
    var name = req.body.Name;
    var email = req.body.Email;
    var password = secret.hide(req.body.Password);
    var sql1 = "SELECT * FROM hr WHERE Email = '" + email + "'";
    db.query(sql1, function (err, result) {
        if (err)
            return res.status(500).send(err);
        if (result.length > 0) {
            if (result[0].ID != id) {
                return res.render('editHr', {
                    title: 'HRS',
                    id: id,
                    name: name,
                    email: email,
                    error: "Email already exist"
                });
            }
        }
        var sql2 = "UPDATE `hr` SET `Name`='" + name + "', `Password`='" + password + "', `Email`='" + email + "' WHERE ID=" + id;
        db.query(sql2, function (err, result) {
            if (err)
                return res.status(500).send(err);
            res.redirect('/hrs');
        });
    });
});

/* Remove hr */
router.delete('/delete/:id', function (req, res, next) {
    var id = req.params.id;
    var sql = "DELETE FROM `hr` WHERE ID=" + id;
    db.query(sql, function (err, result) {
        if (err)
            return res.status(500).send(err);
        return res.status(200).send("Item deleted sucessfully");
    });
});

module.exports = router;