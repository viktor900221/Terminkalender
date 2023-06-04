const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'terminkalender',
  });

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db ' + connection.state);
});



// GET Eintrag
app.get("/eintrag", async (req, res) => {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'terminkalender',
      });
  
      const sql = "SELECT * FROM Eintrag";
      const [rows] = await connection.promise().query(sql);
  
      const einträge = rows.map((row) => {
        return {
          id: row.id,
          eintrag: row.eintrag,
          datum: row.datum,
        };
      });
  
      res.json(einträge);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
  
  // POST Eintrag
  app.post('/eintrag', async (request, response) => {
    const { eintrag, datum } = request.body;
  
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'terminkalender',
      });
  
      const sql = 'INSERT INTO Eintrag (eintrag, datum) VALUES (?, ?)';
      const [result] = await connection.promise().query(sql, [eintrag, datum]);
  
      console.log(result.affectedRows, 'Rows Inserted');
  
      response.status(200).send({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Error inserting data' });
    }
  });



//DELETE Eintrag
app.delete('/eintrag/:id', async (request, response) => {
    const { id } = request.params;
  
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'terminkalender',
      });
  
      const sql = 'DELETE FROM Eintrag WHERE id = ?';
      const [result] = await connection.promise().query(sql, [id]);
  
      if (result.affectedRows === 0) {
        console.error('Error deleting data: no data found for the given ID');
        return response.status(404).send({ message: 'Error deleting data: no data found for the given ID' });
      } else {
        console.log('Data deleted successfully');
        return response.json({ success: true });
      }
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Error deleting data' });
    }
  });

//UPDATE Eintrag
app.patch('/eintrag/:id', async (request, response) => {
    const { id } = request.params;
    const { eintrag, datum } = request.body;
  
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'terminkalender',
      });
  
      const sql = 'UPDATE Eintrag SET eintrag = ?, datum = ? WHERE id = ?';
      const [result] = await connection.promise().query(sql, [eintrag, datum, id]);
  
      if (result.affectedRows === 0) {
        console.error('Error updating data: no data found for the given ID');
        return response.status(404).send({ message: 'Error updating data: no data found for the given ID' });
      } else {
        console.log('Data updated successfully');
        return response.json({ success: true });
      }
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Error updating data' });
    }
  });

  


app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});



