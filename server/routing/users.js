const express = require('express');
const router = express.Router();
//mongodb user model
const User = require('./../models/user');
const UserVerification = require('./../models/UserVerification')

//password handler
const bcrypt = require ('bcrypt');

//path for static verified page
const path = require('path');

//email handler
const nodemailer = require('nodemailer')

//unique string
const {v4: uuidv4} = require('uuid');

//env variables
require('dotenv').config()


//nodemailer stuff
let transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})


//testing sucess
transporter.verify((error,success)=> {
    if(error) {
        console.log(error);

    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})

router.post('/signUp', (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty Input Fields"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)) { // Allowing space for full names
        res.json({
            status: "FAILED",
            message: "Invalid Entry Please Try Again (name)"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid Entry Please Try Again (email)"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password not long enough"
        });
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                // A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with the given email already exists"
                });
            } else {
                // Try to create new user

                // password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    
                    const newUser = new User({
                        name,
                        email,
                        password : hashedPassword,
                        verified: false,
                
                    })
                    
                    newUser.save().then(result => {
                        //handle account verification
                        sendVerificationEmail(result, res);
                    })
                    .catch (err => {
                        res.json ({
                            status : "FAILED",
                            message : "Error occured while saving user account"
                        })

                    })
                    
                })  
                .catch(err => {
                    res.json ({
                        status : "FAILED",
                        message : "Error occured while hashing password!"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            });
        });
    }
});
router.get('/users', async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({}, 'name _id email isAdmin isDisabled');

        // Map the result to get an array of objects with name, ID, email, isAdmin, and isDisabled
        const userList = users.map(user => {
            return {
                name: user.name, 
                id: user._id, 
                email: user.email, 
                isAdmin: user.isAdmin, 
                isDisabled: user.isDisabled
            };
        });

        // Send the response
        res.json({
            status: "SUCCESS",
            message: "User list retrieved successfully",
            data: userList
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Server error" });
    }
});



const adminCheck = async (req, res, next) => {
    const adminUserId = req.body.userId; // Get the admin's user ID from the request body

    try {
        const adminUser = await User.findById(adminUserId);
        if (adminUser && adminUser.isAdmin) {
            next(); // User is an admin, proceed to the next middleware
        } else {
            res.status(403).send('Access denied. Admins only.');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};


//send verification email
const sendVerificationEmail = ({_id, email}, res) => {
    //url to be used in email 
    const currentURL = "http://localhost:5000/";

    const uniqueString = uuidv4() + _id;
    
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete signup and log into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href="${currentURL + "api/users/verify/" +_id+ "/"  + uniqueString}>here</a> to proceed.</p>`,



    };

    //hash the uniqueString 
    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
        // set values in userVerification collection
        const newVerificaiton = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000,
        });

        newVerificaiton
        .save()
        .then(() => {
            transporter
            .sendMail(mailOptions)
            .then(()=> {
                //email send and verified
                res.json ({
                    status: "PENDING",
                    message: "Verification Email Sent"
                });

            })
            .catch((error) => {
                console.log(error);
                res.json({
                    status: "FAILED",
                    message: "Verification Email Failed!"
                })
            })
        })
        .catch((error) => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Couldn't save verificaiton email data!",
            });

        })
        
    })
    .catch(()=>{
        res.json({
            status: "FAILED",
            message: "An error occured while hashing email data!",
        })
    })

}

//verify email
router.get('/verify/:userId/:uniqueString', (req,res) => {
    let{userId, uniqueString} = req.params;

    UserVerification
    .find({userId})
    .then(result => {
        if(result.length > 0){
            //user verification record exists so we proceed
            

            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString;
            //checking for expired unique string
            if(expiresAt< Date.now()){
                // record has expired so we delete it
                UserVerification
                    .deleteOne({userId})
                    .then(result => {
                        User
                            .deleteOne({_id: userId})
                            .then(() => {
                                let message = "Link has expired. Please sign up again";
                                res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                            .catch(error => {
                                let message = "Clearing user with expired unique string failed";
                                res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                    })
                    .catch((error) => {
                        console.log(error)
                        let message = "An error occured while clearing expired user verification record";
                        res.redirect( `/users/verified/error=true&message=${message}`)
                    })
            } else {
                //valid record exists so we validate the user string 
                //First compare the hashed unique string

                bcrypt
                .compare(uniqueString, hashedUniqueString)
                .then(result => {
                    if(result){
                        //string match

                        User
                        .updateOne({_id: userId}, {verified: true})
                        .then(()=> {
                            UserVerification.deleteOne({userId})
                            .then(() =>{
                                res.sendFile(path.join(__dirname, './../../client/verified.html'))
                            })
                            .catch(error =>{
                                let message = "An error occured while finalizing successful verificaiton.";
                            res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                        })
                        .catch(error => {
                            console.log(error);
                            let message = "An error occured while updating user record to show verified.";
                            res.redirect( `/users/verified/error=true&message=${message}`)
                        })

                    } else {
                        // existing record but incorrect verification details passed
                        let message = "Invalid verification details passed check your inbox";
                        res.redirect( `/users/verified/error=true&message=${message}`)

                     }
                    
                })
                .catch(error => {
                    let message = "An error occured while comparing unique strings";
                    res.redirect( `/users/verified/error=true&message=${message}`)



                })
            }
        } else {
            //user verification record doesn't exist
            let message = "Account record doesn't exist or has been verified already. Please sign up or login.";
            res.redirect( `/users/verified/error=true&message=${message}`)
            

        }
    })
    .catch((error) =>{
       console.log(error);
       let message = "An error occured while checking for existing user verification record";
       res.redirect( `/users/verified/error=true&message=${message}`)
        })
});

    //Verified page route
    router.get("/verified",(req,res) =>{
        res.sendFile(path.join(__dirname, './../../client/verified.html'))


    })

// Route to change password
router.post('/changePassword', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: "Password successfully updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.put('/grantadmin/:userId', adminCheck, async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Set isAdmin to true
        user.isAdmin = true;

        await user.save();
        res.status(200).send('User granted admin privileges.');
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).send('Server error');
    }
});




router.put('/toggle-user-disabled/:userId', adminCheck, async (req, res) => {
    const { userId } = req.params;
    const adminUserId = req.body.userId; // Admin user ID from the request body

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        user.isDisabled = !user.isDisabled;
        await user.save();

        // Optional: Log the admin user action
        console.log(`Admin User ${adminUserId} toggled disabled status for User ${userId}`);

        res.status(200).send('User disabled/enabled status updated.');
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).send('Server error');
    }
});

router.post('/signIn', (req, res) => {
    // Implement sign-in logic here
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email == "" || password == ""){
        res.json({
            status: "FAIL",
            message: "Empty Field"
        })
    } else {
        // check is user exists 
        User.find({email})
        .then (data => {
            if(data) {
                //User exists 

                // check if user is verified
                if(!data[0].verified){
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox."
                    });
                } else {

                    const hashedPassword = data[0].password
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if(result){

                            // Backend: After verifying the user and before sending the response
                            console.log("User ID:", data[0]._id);
                            console.log("Name:", data[0].name);
                            console.log("isAdmin",data[0].isAdmin );
                            console.log("isDisabled", data[0].isDisabled);
                            console.log("email:", data[0].email);

                            //password match
                            res.json({
                                status: "SUCCESS",
                                message: "Signin Successful",
                                data: {
                                  _id: data[0]._id,
                                  name: data[0].name,
                                  isAdmin : data[0].isAdmin,
                                  isDisabled : data[0].isDisabled,
                                  email: data[0].email
                                  
                                }
                              });
                        } else {
                            res.json({
                                status: "FAILED",
                                message: "Invalid Password Entered"
                            })
                        }
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while comparing passwords "
                        });
                    });
                }

            } else {
                res.json({            
                status: "FAILED",
                message: "invalid credentials"
            })
            }
        })
        .catch(err =>{
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })

    }
});

module.exports = router;
