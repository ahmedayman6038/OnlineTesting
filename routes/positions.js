var express = require('express');
var router = express.Router();


/* GET positions listing */
router.get('/', function (req, res, next) {
  var sql = "SELECT * FROM `position`";
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('positions', {
      title: 'Positions',
      positions: result
    });
  });
});

/* GET add position page */
router.get('/add', function (req, res, next) {
  res.render('addPosition', {
    title: 'Positions',
    name: "",
    error: ""
  });
});

/* Add position */
router.post('/add', function (req, res, next) {
  var name = req.body.Name;
  var available = req.body.Available;
  if (!available) {
    available = false;
  }
  var sql1 = "SELECT * FROM position WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      return res.render('addPosition', {
        title: 'Positions',
        name: name,
        error: "Name already exist"
      });
    }
    var sql2 = "INSERT INTO `position`(`Name`,`Available`) VALUES ('" + name + "'," + available + ")";
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/positions');
    });
  });
});

/* GET edit position page */
router.get('/edit/:id', function (req, res, next) {
  var id = req.params.id;
  var sql1 = "SELECT * FROM position WHERE ID = " + id;
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    res.render('editPosition', {
      title: 'Positions',
      id: result[0].ID,
      name: result[0].Name,
      available: result[0].Available,
      error: ""
    });
  });
});

/* Edit position */
router.post('/edit', function (req, res, next) {
  var id = req.body.ID;
  var name = req.body.Name;
  var available = req.body.Available;
  if (!available) {
    available = false;
  }
  var sql1 = "SELECT * FROM position WHERE Name = '" + name + "'";
  db.query(sql1, function (err, result) {
    if (err)
      return res.status(500).send(err);
    if (result.length > 0) {
      if (result[0].ID != id) {
        return res.render('editPosition', {
          title: 'Positions',
          id: id,
          name: name,
          available: available,
          error: "Name already exist"
        });
      }
    }
    var sql2 = "UPDATE `position` SET `Name`='" + name + "',`Available`=" + available + " WHERE ID=" + id;
    db.query(sql2, function (err, result) {
      if (err)
        return res.status(500).send(err);
      res.redirect('/positions');
    });
  });
});

/* Delete position */
router.delete('/delete/:id', function (req, res, next) {
  var id = req.params.id;
  var sql = "DELETE FROM `position` WHERE ID=" + id;
  db.query(sql, function (err, result) {
    if (err)
      return res.status(500).send(err);
    return res.status(200).send("Item deleted sucessfully");
  });
});

module.exports = router;