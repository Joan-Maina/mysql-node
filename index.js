// const { json } = require('express');
const express = require('express');

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();

const connection = require('./helpers/databaseConnect');

const { signUpValidation, encryptPassword } = require("./helpers");

const PORT = process.env.PORT || 3000;

app.use(express.json())

app.get("/", (req, res) => {
    let sql = 'SELECT * FROM user_details';
    connection.query(sql, (err, result) => {

        if(err) throw err;
        console.log(result);
        // res.send(result);
    })
  });
//create route
  app.post("/signup",async(req, res) => {
    // res.send('jo');

    const { error } = signUpValidation(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message });

   firstname = req.body.firstname,
   lastname = req.body.lastname,
   email = req.body.email,
   project = req.body.project,
   password = req.body.password

   const pass = await encryptPassword(password);
     
    let insertSql = 'INSERT INTO user_details (first_name, last_name, email, project, password) values (?,?,?,?,?);';

    // console.log(insertSql)
    connection.query(insertSql, [firstname, lastname, email, project, pass],function (err, rows, fields) { 
      if (err) throw err;
         console.log("User data is inserted successfully "); 
  });
  });
//read route
  app.post('/login', (req, res)=>{
    try{
       const email = req.body.email;
       const password = req.body.password;

       let selectSql = 'SELECT password from user_details where email = ?;';

       connection.query(selectSql,email, async function(err, result, rows, fields){
         if (err) throw err;
         if(result.length == 0){

           console.log('oops! looks like you made a mistake');

         }else{

          const dbPassword = result[0].password;
        
          let auth = await bcrypt.compare(password, dbPassword);
  
          if(auth == false){
 
            res.status(401).send('wrong inputs')
 
          }
          else{

            let jwtSql = 'SELECT first_name, last_name, email, project FROM user_details WHERE email = ?; ';

            connection.query(jwtSql, email, async function(err, result, rows, fields){
              console.log(JSON.stringify(result[0]))

              let userDetails = JSON.stringify(result[0]);
              jwt.sign({userDetails}, process.env.SECRETKEY,{expiresIn:'1h'}, (err, token) => {
                // if (err) throw err;
                console.log({userDetails})
                return res.status(200).json({
                  message: "login sucessful",
                  token
                });
              });
            });
           
           console.log('you are now logged in!')
 
          }
         }
       })
    }
    catch{
    }
  })
//update route
  app.post('/updateDetails', async(req, res) => {
    try{
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const project = req.body.project;
      const password = req.body.password;

      let verifyUpdateSql = 'SELECT password from user_details where email = ?;';

      connection.query(verifyUpdateSql,email, async function(err, result, rows, fields){
        
      console.log(result)

      if(result.length == 0){

          console.log('oops! looks like you made a mistake');

}else{
  const dbPassword = result[0].password;
        
          let auth = await bcrypt.compare(password, dbPassword);
  
          if(auth == false){
 
            res.status(401).send('wrong inputs')
 
          }else{
            let updateSql = 'UPDATE user_details SET first_name = ?, last_name =?, email = ?, project= ?, password =? WHERE email = ?;';

            const pass = await encryptPassword(password);

            connection.query(updateSql, [firstname, lastname, email, project, pass, email],  function(err, result, rows, fields){
      
              console.log(result)
      
              if (err) throw err;
              console.log("User data is updated successfully "); 
      
            });
          }
}

      });
     

      

    }
    catch{

    }
  });

  //delete route
  app.post('/deleteDetails', async(req, res) => {
    try{
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const project = req.body.project;
      const password = req.body.password;

      let verifyUpdateSql = 'SELECT password from user_details where email = ?;';

      connection.query(verifyUpdateSql,email, async function(err, result, rows, fields){
        
      console.log(result)

      if(result.length == 0){

          console.log('oops! looks like you made a mistake');

}else{
  const dbPassword = result[0].password;
        
          let auth = await bcrypt.compare(password, dbPassword);
  
          if(auth == false){
 
            res.status(401).send('wrong inputs')
 
          }else{
            let deleteSql = 'DELETE FROM user_details WHERE email = ?;';

            const pass = await encryptPassword(password);

            connection.query(deleteSql,email,  function(err, result, rows, fields){
      
              console.log(result)
      
              if (err) throw err;
              console.log("User data is deleted successfully "); 
      
            });
          }
}
      });
    }
    catch{

    }
  });

  // app.post('/auth/login', async(req, res) => {
  //   try{
  
  //     const { email, password } = req.body;
  //     const user = users.find(user => user.email === email);
      
  //     if(!user){
  
  //       return res.status(401).json({message: 'no such user exists'});
  
  //     }else{
  //       console.log(user.pass)
  //       let auth = await bcrypt.compare(password, user.pass)
         
  // console.log(auth);
  //   if(auth == false)res.status(401).send('wrong inputs')
  
  //  // if (err) return res.status(500).json({ message: "Internal Server Error" });
  
  //   // jwt.sign({ username, email, id }, process.env.SECRETKEY, (err, token) => {
  //   //   if (err) return res.status(500).json({ message: "Internal Server Error" });
  //   //   return res.status(200).json({ token, message: "User registered successfully" });
  //   // });
  //   jwt.sign({ email: user.email, username: user.username, password: user.password }, process.env.SECRETKEY, (err, token) => {
  //     return res.status(200).json({
  //       message: "login sucessful",
  //       token
  //     });
  //   });
  
  
  // }
  // }catch(error){
  //     res.status(500).send('jo');
  //   }
  // });
  

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);

    connection.connect((err)=>{

        if(err) throw err;
        console.log('connected');
})

  });