import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req,res,next) => {
    // console.log(req.body);
    const {username,email,password} =req.body

    if (!username || !email || !password || username ==='' || email==='' || password === '' ) {
        // return res.status(400).json({message:'All fields are required'})
        next(errorHandler(400,'All fields are required'))
    }

    const hashedPassword = bcryptjs.hashSync(password,10)
    const newUser = new User({
        username,
        email,
        password:hashedPassword
    })

    try {
        await newUser.save()
        res.json('Signup successfull')
    } catch (error) {
        next(error)
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password || email === '' || password === '') {
      next(errorHandler(400, 'All fields are required'));
    }
  
    try {
      const validUser = await User.findOne({ email });
      if (!validUser) {
        return next(errorHandler(404, 'User not found'));
      }
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) {
        return next(errorHandler(400, 'Invalid password'));
      }
      const token = jwt.sign(
        { id: validUser._id, isAdmin: validUser.isAdmin },
        process.env.JWT_SECRET
      );
  
      const { password: pass, ...rest } = validUser._doc;
  
      res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .json(rest);
    } catch (error) {
      next(error);
    }
  };

  export const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl } = req.body;
    try {
      const { userToken } = req.body;
      console.log(userToken);
    
      // res.send("google login")
    
      const ticket = await client.verifyIdToken({
        idToken: userToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    
      const payload = ticket.getPayload();
      // console.log(payload);
      // res.send("Google")
      const { name, email, picture, sub } = payload;
      const password = Date.now() + sub;
    
      // Get UserAgent
      const ua = parser(req.headers["user-agent"]);
      const userAgent = [ua.ua];
    
      // Check if user exists
      const user = await User.findOne({ email });
      if (user) {
        const token = generateToken(user._id);
        // Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        });
        const { _id, name, email, phone, bio, photo, role, isVerified } = user;

        res.status(201).json({
          _id,
          name,
          email,
          phone,
          bio,
          photo,
          role,
          isVerified,
          token,
        });

      } else {
        
        // const generatedPassword =
        //   Math.random().toString(36).slice(-8) +
        //   Math.random().toString(36).slice(-8);
        // const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
        // const newUser = new User({
        //   username:
        //     name.toLowerCase().split(' ').join('') +
        //     Math.random().toString(9).slice(-4),
        //   email,
        //   name,
        //   password: hashedPassword,
        //   profilePicture: googlePhotoUrl,
        //   photo: picture,
        //   isVerified: true,
        // });
        // await newUser.save();
        // const token = jwt.sign(
        //   { id: newUser._id, isAdmin: newUser.isAdmin },
        //   process.env.JWT_SECRET
        // );
        // const { password, ...rest } = newUser._doc;
        // res
        //   .status(200)
        //   .cookie('access_token', token, {
        //     httpOnly: true,
        //   })
        //   .json(rest);
        //   Create new user
    const newUser = await User.create({
        name,
        email,
        password,
        photo: picture,
        isVerified: true,
        userAgent,
      });
  
      if (newUser) {
        // Generate Token
        const token = generateToken(newUser._id);
  
        // Send HTTP-only cookie
        res.cookie("token", token, {
          path: "/",
          httpOnly: true,
          expires: new Date(Date.now() + 1000 * 86400), // 1 day
          sameSite: "none",
          secure: true,
        });
  
        const { _id, name, email, phone, bio, photo, role, isVerified } = newUser;
  
        res.status(201).json({
          _id,
          name,
          email,
          phone,
          bio,
          photo,
          role,
          isVerified,
          token,
        });
      }
      }
    } catch (error) {
      next(error);
    }
  };